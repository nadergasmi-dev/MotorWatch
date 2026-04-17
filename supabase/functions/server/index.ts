import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const EMAIL_CONFIG = {
  mode: Deno.env.get('EMAIL_MODE') || 'development',
  development: { from: 'Onboarding <onboarding@resend.dev>' },
  production: { from: 'MotorWatch <noreply@motorwatch.tech>' }
};

const getEmailFrom = () =>
  EMAIL_CONFIG.mode === 'production'
    ? EMAIL_CONFIG.production.from
    : EMAIL_CONFIG.development.from;

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const json = (data: any, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // ✅ Get last segment of URL path - works regardless of Supabase prefix
  const url = new URL(req.url);
  const route = url.pathname.split('/').filter(Boolean).pop() ?? '';

  console.log(`[${req.method}] ${url.pathname} → route: "${route}"`);

  // ─── GET /health ───────────────────────────────────────────────
  if (req.method === 'GET' && route === 'health') {
    return json({ status: 'ok', version: '3.0.0', emailMode: EMAIL_CONFIG.mode, time: new Date().toISOString() });
  }

  // ─── POST /signup ──────────────────────────────────────────────
  if (req.method === 'POST' && route === 'signup') {
    try {
      const { email, password, name, userId } = await req.json();
      if (!email || !password || !name || !userId)
        return json({ error: 'Missing required fields' }, 400);

      const existing = await kv.get(`user_id:${userId}`);
      if (existing) return json({ error: 'User ID already taken' }, 400);

      const { data, error } = await supabase.auth.admin.createUser({
        email, password,
        user_metadata: { name, userId },
        email_confirm: true,
      });
      if (error) return json({ error: error.message }, 400);

      await kv.set(`user_id:${userId}`, email);
      await kv.set(`user_profile:${data.user.id}`, {
        email, name, userId, createdAt: new Date().toISOString(),
      });

      return json({ success: true, user: { id: data.user.id, email: data.user.email, name, userId } });
    } catch (err) {
      return json({ error: `Signup error: ${err}` }, 500);
    }
  }

  // ─── POST /get-email-from-userid ───────────────────────────────
  if (req.method === 'POST' && route === 'get-email-from-userid') {
    try {
      const { userId } = await req.json();
      if (!userId) return json({ error: 'Missing userId' }, 400);
      const email = await kv.get(`user_id:${userId}`);
      if (!email) return json({ error: 'User ID not found' }, 404);
      return json({ email });
    } catch (err) {
      return json({ error: `Error: ${err}` }, 500);
    }
  }

  // ─── POST /forgot-password ─────────────────────────────────────
  if (req.method === 'POST' && route === 'forgot-password') {
    try {
      const { email } = await req.json();
      if (!email) return json({ error: 'Missing email' }, 400);

      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) return json({ error: `Failed to fetch users: ${userError.message}` }, 500);

      const user = users.users.find((u: any) => u.email === email);
      if (!user) return json({ success: true, message: 'If the email exists, a code has been sent' });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeKey = `reset_code:${email}`;

      await kv.set(codeKey, {
        code,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      });

      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (!resendApiKey) {
        await kv.del(codeKey);
        return json({ error: 'Email service not configured. Add RESEND_API_KEY in Supabase secrets.' }, 500);
      }

      const emailHtml = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <div style="background:#262525;padding:20px;text-align:center;">
            <h1 style="color:#FFB84E;margin:0;">MotorWatch</h1>
          </div>
          <div style="padding:40px 20px;background:#f5f5f5;">
            <h2 style="color:#262525;margin-top:0;">Password Reset Code</h2>
            <p style="color:#666;font-size:16px;">Use the code below to reset your password:</p>
            <div style="background:white;padding:20px;text-align:center;border-radius:8px;margin:20px 0;">
              <span style="font-size:32px;font-weight:bold;color:#FFB84E;letter-spacing:5px;">${code}</span>
            </div>
            <p style="color:#666;font-size:14px;">This code expires in 10 minutes.</p>
            <p style="color:#666;font-size:14px;">If you didn't request this, ignore this email.</p>
          </div>
          <div style="background:#262525;padding:20px;text-align:center;">
            <p style="color:#999;font-size:12px;margin:0;">© 2026 MotorWatch. All rights reserved.</p>
          </div>
        </div>`;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: getEmailFrom(),
          to: [email],
          subject: 'MotorWatch - Password Reset Code',
          html: emailHtml,
        }),
      });

      const emailResult = await emailResponse.text();
      if (!emailResponse.ok) {
        await kv.del(codeKey);
        return json({ error: `Failed to send email: ${emailResult}` }, 500);
      }

      return json({ success: true, message: 'Reset code sent to your email' });
    } catch (err) {
      return json({ error: `Error: ${err}` }, 500);
    }
  }

  // ─── POST /verify-reset-code ───────────────────────────────────
  if (req.method === 'POST' && route === 'verify-reset-code') {
    try {
      const { email, code } = await req.json();
      if (!email || !code) return json({ error: 'Missing email or code' }, 400);

      const storedData = await kv.get(`reset_code:${email}`);
      if (!storedData) return json({ error: 'Invalid or expired code' }, 400);
      if (storedData.code !== code) return json({ error: 'Invalid code' }, 400);
      if (new Date() > new Date(storedData.expiresAt)) {
        await kv.del(`reset_code:${email}`);
        return json({ error: 'Code has expired' }, 400);
      }

      return json({ success: true, message: 'Code verified' });
    } catch (err) {
      return json({ error: `Error: ${err}` }, 500);
    }
  }

  // ─── POST /reset-password ──────────────────────────────────────
  if (req.method === 'POST' && route === 'reset-password') {
    try {
      const { email, code, newPassword } = await req.json();
      if (!email || !code || !newPassword) return json({ error: 'Missing required fields' }, 400);

      const codeKey = `reset_code:${email}`;
      const storedData = await kv.get(codeKey);

      if (!storedData || storedData.code !== code)
        return json({ error: 'Invalid or expired code' }, 400);
      if (new Date() > new Date(storedData.expiresAt)) {
        await kv.del(codeKey);
        return json({ error: 'Code has expired' }, 400);
      }

      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      if (userError) return json({ error: `Error: ${userError.message}` }, 500);

      const user = users.users.find((u: any) => u.email === email);
      if (!user) return json({ error: 'User not found' }, 404);

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id, { password: newPassword }
      );
      if (updateError) return json({ error: updateError.message }, 400);

      await kv.del(codeKey);
      return json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      return json({ error: `Error: ${err}` }, 500);
    }
  }

  // ─── Route not found ───────────────────────────────────────────
  return json({ error: `Route not found: ${route}` }, 404);
});
