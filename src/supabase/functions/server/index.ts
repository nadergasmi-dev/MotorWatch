import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";

const app = new Hono();

// Supabase client with service role key
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Email configuration based on environment
const EMAIL_CONFIG = {
  // Set to 'production' when motorwatch.tech domain is verified in Resend
  mode: Deno.env.get('EMAIL_MODE') || 'development',
  development: {
    from: 'Onboarding <onboarding@resend.dev>',
    note: 'Test mode - only sends to verified email addresses'
  },
  production: {
    from: 'MotorWatch <noreply@motorwatch.tech>',
    note: 'Production mode - requires domain verification in Resend'
  }
};

const getEmailFrom = () => {
  return EMAIL_CONFIG.mode === 'production' 
    ? EMAIL_CONFIG.production.from 
    : EMAIL_CONFIG.development.from;
};

console.log(`📧 Email Mode: ${EMAIL_CONFIG.mode}`);
console.log(`📧 From Address: ${getEmailFrom()}`);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ status: "ok", version: "2.3.0", emailMode: EMAIL_CONFIG.mode, redeployed: new Date().toISOString() });
});

// Sign up endpoint
app.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, userId } = body;

    if (!email || !password || !name || !userId) {
      return c.json({ error: "Missing required fields: email, password, name, userId" }, 400);
    }

    // Check if userId already exists
    const existingUserId = await kv.get(`user_id:${userId}`);
    if (existingUserId) {
      return c.json({ error: "User ID already taken" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userId },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error from Supabase:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store userId -> email mapping for login
    await kv.set(`user_id:${userId}`, email);
    
    // Store user profile data
    await kv.set(`user_profile:${data.user.id}`, {
      email,
      name,
      userId,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        userId
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return c.json({ error: 'An error occurred during signup' }, 500);
  }
});

// Get email from userId endpoint (for login)
app.post("/get-email-from-userid", async (c) => {
  try {
    const body = await c.req.json();
    const { userId } = body;

    if (!userId) {
      return c.json({ error: "Missing userId" }, 400);
    }

    const email = await kv.get(`user_id:${userId}`);
    
    if (!email) {
      return c.json({ error: "User ID not found" }, 404);
    }

    return c.json({ email });
  } catch (err) {
    console.error('Get email from userId error:', err);
    return c.json({ error: 'An error occurred' }, 500);
  }
});

// Generate and send password reset code
app.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ error: "Missing email" }, 400);
    }

    // Check if user exists
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return c.json({ error: `Failed to fetch users: ${userError.message}` }, 500);
    }

    const user = users.users.find((u: any) => u.email === email);
    
    if (!user) {
      // For security, don't reveal if email exists or not
      return c.json({ success: true, message: "If the email exists, a code has been sent" });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with 10 minutes expiration
    const codeKey = `reset_code:${email}`;
    await kv.set(codeKey, {
      code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    // Send email with code using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      await kv.del(codeKey);
      return c.json({ error: 'Email service not configured' }, 500);
    }

    const emailHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background-color:#262525;padding:20px;text-align:center;">
        <h1 style="color:#FFB84E;margin:0;">MotorWatch</h1>
      </div>
      <div style="padding:40px 20px;background-color:#f5f5f5;">
        <h2 style="color:#262525;margin-top:0;">Password Reset Code</h2>
        <p style="color:#666;font-size:16px;">Use the code below to reset your password:</p>
        <div style="background-color:white;padding:20px;text-align:center;border-radius:8px;margin:20px 0;">
          <span style="font-size:32px;font-weight:bold;color:#FFB84E;letter-spacing:5px;">${code}</span>
        </div>
        <p style="color:#666;font-size:14px;">This code expires in 10 minutes.</p>
        <p style="color:#666;font-size:14px;">If you didn't request this, ignore this email.</p>
      </div>
      <div style="background-color:#262525;padding:20px;text-align:center;">
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
    console.log(`Resend response [${emailResponse.status}]:`, emailResult);

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailResult);
      await kv.del(codeKey);
      return c.json({ error: `Failed to send email: ${emailResult}` }, 500);
    }

    return c.json({ success: true, message: "Reset code sent to your email" });
  } catch (err) {
    console.error('Forgot password error:', err);
    return c.json({ error: `An error occurred: ${err}` }, 500);
  }
});

// Verify reset code
app.post("/verify-reset-code", async (c) => {
  try {
    const body = await c.req.json();
    const { email, code } = body;

    if (!email || !code) {
      return c.json({ error: "Missing email or code" }, 400);
    }

    const codeKey = `reset_code:${email}`;
    const storedData = await kv.get(codeKey);

    if (!storedData) {
      return c.json({ error: "Invalid or expired code" }, 400);
    }

    if (storedData.code !== code) {
      return c.json({ error: "Invalid code" }, 400);
    }

    if (new Date() > new Date(storedData.expiresAt)) {
      await kv.del(codeKey);
      return c.json({ error: "Code has expired" }, 400);
    }

    return c.json({ success: true, message: "Code verified" });
  } catch (err) {
    console.error('Verify code error:', err);
    return c.json({ error: `An error occurred: ${err}` }, 500);
  }
});

// Reset password with verified code
app.post("/reset-password", async (c) => {
  try {
    const body = await c.req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const codeKey = `reset_code:${email}`;
    const storedData = await kv.get(codeKey);

    if (!storedData || storedData.code !== code) {
      return c.json({ error: "Invalid or expired code" }, 400);
    }

    if (new Date() > new Date(storedData.expiresAt)) {
      await kv.del(codeKey);
      return c.json({ error: "Code has expired" }, 400);
    }

    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error fetching users:', userError);
      return c.json({ error: `An error occurred: ${userError.message}` }, 500);
    }

    const user = users.users.find((u: any) => u.email === email);
    
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return c.json({ error: updateError.message }, 400);
    }

    await kv.del(codeKey);

    return c.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error('Reset password error:', err);
    return c.json({ error: `An error occurred: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);