# 🔧 Configuration Supabase pour motorwatch.tech

## ⚙️ Configuration requise dans Supabase Dashboard

Pour que votre application fonctionne correctement avec le domaine **motorwatch.tech**, vous devez configurer les URLs autorisées dans votre projet Supabase.

### 📍 Étapes à suivre :

1. **Accédez à votre Dashboard Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet : `gujvmxzekesjxqloffce`

2. **Configurez les URLs de redirection**
   - Allez dans **Authentication** → **URL Configuration**
   - Ajoutez les URLs suivantes dans **Redirect URLs** :

   ```
   https://motorwatch.tech/*
   https://motorwatch.tech/machine-setup
   http://localhost:5173/*
   http://localhost:5173/machine-setup
   ```

3. **Configurez le Site URL**
   - Dans la même section, configurez **Site URL** :
   ```
   https://motorwatch.tech
   ```

4. **Configuration OAuth Google (si utilisé)**
   - Allez dans **Authentication** → **Providers** → **Google**
   - Assurez-vous que les **Authorized redirect URIs** dans Google Cloud Console incluent :
   ```
   https://gujvmxzekesjxqloffce.supabase.co/auth/v1/callback
   ```

5. **Configuration des emails**
   - Allez dans **Authentication** → **Email Templates**
   - Pour chaque template (Confirmation, Reset Password, etc.), assurez-vous que les liens utilisent :
   ```
   {{ .ConfirmationURL }}
   ```
   - Supabase remplacera automatiquement avec votre Site URL configuré

### 🌐 Configuration DNS

Assurez-vous que votre DNS pour **motorwatch.tech** pointe vers votre hébergement :

```
Type A : motorwatch.tech → [Votre IP serveur]
Type CNAME : www.motorwatch.tech → motorwatch.tech
```

### 🔐 HTTPS

Assurez-vous d'avoir un certificat SSL valide pour motorwatch.tech (Let's Encrypt, Cloudflare, etc.)

### ✅ Vérification

Après configuration, testez :
1. Connexion avec email/password
2. Connexion avec Google OAuth
3. Réinitialisation de mot de passe
4. Inscription de nouveaux utilisateurs

---

**Note** : Les configurations sont déjà implémentées dans le code (`/config/domain.tsx`). Il ne reste qu'à configurer Supabase Dashboard.
