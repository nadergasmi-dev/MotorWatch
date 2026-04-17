# 🔧 Fix Google OAuth sur Localhost

## 🎯 Problème Rencontré

Quand vous vous connectez avec Google OAuth sur localhost, vous êtes redirigé vers une URL avec le token dans le hash :
```
http://localhost:5173/machine-setup#access_token=ey...&refresh_token=...
```

Mais la session ne se charge pas correctement et vous restez bloqué.

---

## ✅ Solution Implémentée

### 1. **Nouvelle Route OAuth Callback**

Créé `/components/OAuthCallback.tsx` qui :
- ✅ Détecte le token dans l'URL (#access_token)
- ✅ Crée la session Supabase avec `setSession()`
- ✅ Nettoie le hash de l'URL
- ✅ Redirige vers `/machine-setup`

### 2. **Route Ajoutée dans App.tsx**

```typescript
<Route path="/oauth/callback" element={<OAuthCallback />} />
```

Cette route est dédiée au traitement des redirections OAuth.

### 3. **Mise à Jour LoginScreen.tsx**

Le Google OAuth redirige maintenant vers `/oauth/callback` :
```typescript
redirectTo: `${getRedirectUrl()}/oauth/callback`
```

### 4. **Support Multi-Port dans domain.tsx**

La fonction `getCurrentDomain()` détecte automatiquement le port :
- ✅ `localhost:5173` → `http://localhost:5173`
- ✅ `localhost:3000` → `http://localhost:3000`
- ✅ `motorwatch.tech` → `https://motorwatch.tech`

---

## 🛠️ Configuration Requise dans Supabase Dashboard

### **Étape 1 : Ajouter les URLs de Redirection**

1. ✅ Allez sur **Supabase Dashboard** → Votre projet
2. ✅ **Authentication** → **URL Configuration**
3. ✅ Dans **"Redirect URLs"**, ajoutez TOUTES ces URLs :

```
http://localhost:5173/oauth/callback
http://localhost:3000/oauth/callback
http://127.0.0.1:5173/oauth/callback
https://motorwatch.tech/oauth/callback
```

**Séparez chaque URL par une virgule ou nouvelle ligne**

### **Étape 2 : Configuration Site URL**

Dans **"Site URL"**, mettez :
```
https://motorwatch.tech
```

### **Étape 3 : Configuration Google OAuth**

1. ✅ **Authentication** → **Providers** → **Google**
2. ✅ Vérifiez que **"Enabled"** est coché
3. ✅ Copiez l'**"Authorized redirect URIs"** fourni par Supabase :
   ```
   https://gujvmxzekesjxqloffce.supabase.co/auth/v1/callback
   ```

### **Étape 4 : Google Cloud Console**

1. ✅ Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. ✅ **APIs & Services** → **Credentials**
3. ✅ Sélectionnez votre **OAuth 2.0 Client ID**
4. ✅ Dans **"Authorized JavaScript origins"**, ajoutez :
   ```
   http://localhost:5173
   http://localhost:3000
   https://motorwatch.tech
   ```
5. ✅ Dans **"Authorized redirect URIs"**, ajoutez :
   ```
   https://gujvmxzekesjxqloffce.supabase.co/auth/v1/callback
   ```
6. ✅ **Save**

---

## 🧪 Test de la Solution

### **Test 1 : Localhost:5173**

1. ✅ Ouvrir `http://localhost:5173/login`
2. ✅ Cliquer sur "Sign in with Google"
3. ✅ Sélectionner votre compte Google
4. ✅ Vous devriez être redirigé vers → `http://localhost:5173/oauth/callback`
5. ✅ Voir un loader "Authenticating..."
6. ✅ Être redirigé automatiquement vers → `http://localhost:5173/machine-setup`

### **Test 2 : Localhost:3000**

1. ✅ Ouvrir `http://localhost:3000/login`
2. ✅ Cliquer sur "Sign in with Google"
3. ✅ Suivre le même processus
4. ✅ Être redirigé vers → `http://localhost:3000/oauth/callback`
5. ✅ Puis vers → `http://localhost:3000/machine-setup`

### **Test 3 : Production (motorwatch.tech)**

1. ✅ Ouvrir `https://motorwatch.tech/login`
2. ✅ Cliquer sur "Sign in with Google"
3. ✅ Être redirigé vers → `https://motorwatch.tech/oauth/callback`
4. ✅ Puis vers → `https://motorwatch.tech/machine-setup`

---

## 🔍 Debugging : Si Ça Ne Marche Toujours Pas

### **Problème : "Invalid Redirect URL"**

**Cause** : L'URL de redirection n'est pas configurée dans Supabase

**Solution** :
1. Vérifiez que vous avez bien ajouté toutes les URLs dans Supabase Dashboard
2. Format exact : `http://localhost:5173/oauth/callback` (pas de slash final)
3. Attendez 1-2 minutes après modification (cache Supabase)

### **Problème : Session Non Créée**

**Cause** : Le token n'est pas traité correctement

**Solution** :
1. Ouvrez la console (F12) pendant l'OAuth
2. Regardez les logs dans `OAuthCallback.tsx`
3. Vérifiez qu'il y a bien un `access_token` dans l'URL
4. Si erreur "Session error", vérifiez vos credentials Supabase

### **Problème : Boucle Infinie de Redirections**

**Cause** : La détection de session ne fonctionne pas

**Solution** :
1. Videz le cache et cookies du navigateur
2. Supprimez le localStorage : `localStorage.clear()`
3. Vérifiez que `supabase.auth.getSession()` retourne bien une session
4. Ajoutez des `console.log()` dans App.tsx pour debug

### **Problème : Port 3000 vs 5173**

**Cause** : Vous utilisez un port différent

**Solution** :
1. La configuration détecte automatiquement le port
2. Assurez-vous d'avoir ajouté TOUS les ports dans Supabase
3. Si vous utilisez un autre port (ex: 8080), ajoutez-le aussi

---

## 📊 Flux OAuth Complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User clique "Sign in with Google"                       │
│    → LoginScreen.tsx                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. supabase.auth.signInWithOAuth({ provider: 'google' })  │
│    redirectTo: http://localhost:5173/oauth/callback        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Redirection vers Google Consent Screen                  │
│    → User sélectionne son compte Google                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Google redirige vers Supabase Callback                  │
│    → https://[project].supabase.co/auth/v1/callback        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Supabase génère tokens et redirige vers app             │
│    → http://localhost:5173/oauth/callback#access_token=... │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. OAuthCallback.tsx traite les tokens                     │
│    → Extrait access_token et refresh_token du hash         │
│    → Appelle supabase.auth.setSession()                    │
│    → Nettoie le hash de l'URL                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Session créée avec succès                               │
│    → Redirection vers /machine-setup                       │
│    → App.tsx détecte la session via onAuthStateChange      │
│    → isAuthenticated = true                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Écrans du Flux OAuth

### **1. Page Login**
```
┌──────────────────────────────────────┐
│         [MotorWatch Logo]            │
│                                      │
│       Welcome Back                   │
│   Sign in to monitor your equipment  │
│                                      │
│   [Email input]                      │
│   [Password input]                   │
│   [Sign In button]                   │
│                                      │
│   ──────── Or continue with ────────  │
│                                      │
│   [🔵 Sign in with Google]           │
└──────────────────────────────────────┘
```

### **2. Google Consent Screen** (géré par Google)
```
┌──────────────────────────────────────┐
│    Choose an account                 │
│                                      │
│   📧 nader.gasmi@enicar.ucar.tn     │
│   👤 NADER GASMI                     │
│                                      │
│   To continue to MotorWatch          │
└──────────────────────────────────────┘
```

### **3. OAuth Callback Processing**
```
┌──────────────────────────────────────┐
│     [MotorWatch Logo (pulsing)]      │
│                                      │
│          [⭕ Loading spinner]        │
│                                      │
│       Authenticating...              │
│   Please wait while we sign you in   │
└──────────────────────────────────────┘
```

### **4. Machine Setup (après succès)**
```
┌──────────────────────────────────────┐
│         [MotorWatch Logo]            │
│                                      │
│       Machine Configuration          │
│   Select your machine type           │
│                                      │
│   [🔧 Pump]  [🤖 Robotic Arm]        │
│   [💨 Compressor]  [⚙️ CNC]          │
│                                      │
│   Hours Since Last Maintenance:      │
│   [_____] hours                      │
│                                      │
│   [Continue to Dashboard]            │
└──────────────────────────────────────┘
```

---

## ✅ Checklist de Vérification

Avant de tester, assurez-vous que :

- [ ] Tous les fichiers ont été modifiés :
  - [ ] `/components/OAuthCallback.tsx` (créé)
  - [ ] `/App.tsx` (route callback ajoutée)
  - [ ] `/components/LoginScreen.tsx` (redirectTo modifié)
  - [ ] `/config/domain.tsx` (multi-port support)

- [ ] Configuration Supabase Dashboard :
  - [ ] Redirect URLs ajoutées (localhost:5173, 3000, production)
  - [ ] Site URL configurée (motorwatch.tech)
  - [ ] Google Provider activé

- [ ] Configuration Google Cloud Console :
  - [ ] Authorized JavaScript origins ajoutées
  - [ ] Authorized redirect URIs ajoutée (Supabase callback)

- [ ] Test local :
  - [ ] `npm run dev` démarre sur le bon port
  - [ ] Pas d'erreurs dans la console
  - [ ] OAuth callback accessible (`/oauth/callback`)

---

## 🚀 Déploiement

Une fois testé en local :

```bash
# Commitez les changements
git add .
git commit -m "Fix Google OAuth callback with dedicated route"
git push
```

Vercel/Netlify redéploiera automatiquement.

**N'oubliez pas** : Assurez-vous que `https://motorwatch.tech/oauth/callback` est bien dans les Redirect URLs de Supabase !

---

## 📱 Résultat Final

### **Avant (❌ Problème)** :
```
1. Clic sur Google Sign In
2. Consent Screen
3. Redirection vers /machine-setup#access_token=...
4. ❌ Token dans URL mais session pas créée
5. ❌ Reste sur la page avec URL bizarre
```

### **Après (✅ Solution)** :
```
1. Clic sur Google Sign In
2. Consent Screen
3. Redirection vers /oauth/callback#access_token=...
4. ✅ Page de callback traite le token
5. ✅ Session créée automatiquement
6. ✅ Redirection vers /machine-setup (URL propre)
7. ✅ Dashboard accessible
```

---

## 🎉 Avantages de Cette Solution

- ✅ **Une seule route dédiée** pour tous les OAuth providers
- ✅ **Support multi-port** automatique (5173, 3000, 8080...)
- ✅ **Gestion d'erreurs** avec messages clairs
- ✅ **UI cohérente** avec logo et loading spinner
- ✅ **URL propre** après authentification (hash retiré)
- ✅ **Compatible production** sans modifications

---

## 🆘 Support

Si vous rencontrez toujours des problèmes :

1. ✅ Vérifiez la console browser (F12)
2. ✅ Regardez les Network requests (onglet Network)
3. ✅ Vérifiez que le token est bien dans l'URL après Google redirect
4. ✅ Testez avec un compte Google différent
5. ✅ Videz cache et cookies
6. ✅ Redémarrez le serveur dev (`npm run dev`)

**Bonne chance !** 🚀
