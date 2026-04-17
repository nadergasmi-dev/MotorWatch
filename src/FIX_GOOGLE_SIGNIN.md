# 🔧 Résolution du Problème Google Sign In

## ❌ Problème

Lorsque vous essayez de vous connecter avec Google, vous rencontrez une erreur ou la redirection ne fonctionne pas correctement après avoir configuré motorwatch.tech.

---

## ✅ Solution Complète

### Étape 1 : Vérifier la Configuration Google OAuth dans Supabase

1. **Allez dans Supabase Dashboard** → **Authentication** → **Providers**
2. **Activez Google** si ce n'est pas déjà fait
3. **Notez le Callback URL** fourni par Supabase :
   ```
   https://[VOTRE-PROJECT-ID].supabase.co/auth/v1/callback
   ```

### Étape 2 : Configurer Google Cloud Console

1. **Allez sur https://console.cloud.google.com**
2. Sélectionnez votre projet ou créez-en un nouveau
3. Allez dans **APIs & Services** → **Credentials**
4. Cliquez sur votre **OAuth 2.0 Client ID** (ou créez-en un)

#### A. Ajouter les URIs de Redirection Autorisées

Dans la section **"Authorized redirect URIs"**, ajoutez :

```
https://[VOTRE-PROJECT-ID].supabase.co/auth/v1/callback
```

**Remplacez `[VOTRE-PROJECT-ID]` par votre vrai Project ID Supabase !**

#### B. Ajouter les Origines JavaScript Autorisées

Dans la section **"Authorized JavaScript origins"**, ajoutez :

```
http://localhost:5173
https://motorwatch.tech
https://www.motorwatch.tech
https://[VOTRE-PROJECT-ID].supabase.co
```

### Étape 3 : Vérifier les Redirect URLs dans Supabase

1. **Allez dans Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Vérifiez que ces URLs sont présentes** :

```
https://motorwatch.tech
https://motorwatch.tech/machine-setup
https://motorwatch.tech/dashboard
http://localhost:5173
http://localhost:5173/machine-setup
```

### Étape 4 : Mettre à Jour le Code de l'Application

Le code dans `/components/LoginScreen.tsx` devrait déjà utiliser `getRedirectUrl()`, ce qui est correct :

```typescript
const handleGoogleLogin = async () => {
  setError('');
  setLoading(true);

  try {
    const supabase = createClient();
    
    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getRedirectUrl()}/machine-setup`,
      }
    });

    if (signInError) {
      console.error('Google login error:', signInError);
      setError(signInError.message);
      setLoading(false);
      return;
    }
  } catch (err) {
    console.error('Google login error:', err);
    setError('An error occurred during Google login');
    setLoading(false);
  }
};
```

### Étape 5 : Gérer le Callback OAuth dans App.tsx

Ajoutons une logique pour gérer automatiquement l'authentification OAuth au chargement de l'application.

Le code actuel dans `/App.tsx` gère déjà cela correctement avec :

```typescript
useEffect(() => {
  const supabase = createClient();

  // Check active session on mount
  supabase.auth.getSession().then(({ data: { session } }) => {
    setIsAuthenticated(!!session);
    setLoading(false);
  });

  // Listen for auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setIsAuthenticated(!!session);
  });

  return () => subscription.unsubscribe();
}, []);
```

---

## 🧪 Tester la Connexion Google

### En Développement (localhost)

1. Lancez votre application : `npm run dev`
2. Allez sur `http://localhost:5173/login`
3. Cliquez sur **"Sign in with Google"**
4. Sélectionnez votre compte Google
5. Vous devriez être redirigé vers `http://localhost:5173/machine-setup`

### En Production (motorwatch.tech)

1. Déployez votre application sur motorwatch.tech
2. Allez sur `https://motorwatch.tech/login`
3. Cliquez sur **"Sign in with Google"**
4. Sélectionnez votre compte Google
5. Vous devriez être redirigé vers `https://motorwatch.tech/machine-setup`

---

## 🔍 Debugging - Problèmes Courants

### ❌ "redirect_uri_mismatch"

**Cause** : L'URI de redirection n'est pas autorisée dans Google Cloud Console.

**Solution** :
1. Vérifiez que vous avez bien ajouté l'URI de callback Supabase dans Google Console
2. Format exact : `https://[PROJECT-ID].supabase.co/auth/v1/callback`
3. **Attention** : Pas d'espace, pas de slash à la fin

### ❌ "Invalid redirect URL"

**Cause** : L'URL de redirection n'est pas dans la liste des Redirect URLs de Supabase.

**Solution** :
1. Allez dans **Supabase** → **Authentication** → **URL Configuration**
2. Ajoutez `https://motorwatch.tech/machine-setup`
3. Sauvegardez et réessayez

### ❌ La page reste bloquée sur "Loading..."

**Cause** : Le callback OAuth ne redirige pas correctement.

**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs dans l'onglet Console
3. Vérifiez que `getSession()` retourne bien une session
4. Vérifiez que `isAuthenticated` passe bien à `true`

### ❌ "Access blocked: This app's request is invalid"

**Cause** : Configuration OAuth incomplète dans Google Cloud Console.

**Solution** :
1. Vérifiez que votre **OAuth consent screen** est configuré
2. Ajoutez votre email comme **Test User** si l'app est en mode "Testing"
3. Si besoin, passez l'app en mode "Production" (après vérification Google)

---

## 📋 Checklist Complète

Avant de tester, vérifiez que vous avez bien :

- [ ] ✅ Activé Google OAuth dans Supabase Dashboard
- [ ] ✅ Ajouté le Callback URI dans Google Cloud Console
- [ ] ✅ Ajouté les origines JavaScript dans Google Cloud Console
- [ ] ✅ Ajouté motorwatch.tech dans les Redirect URLs Supabase
- [ ] ✅ Ajouté motorwatch.tech/machine-setup dans les Redirect URLs Supabase
- [ ] ✅ Configuré le Site URL à https://motorwatch.tech dans Supabase
- [ ] ✅ Déployé l'application sur motorwatch.tech
- [ ] ✅ Testé sur un navigateur en mode incognito (pour éviter les caches)

---

## 🚀 Configuration Complète - Exemple Réel

### Google Cloud Console

**Authorized redirect URIs** :
```
https://abcdefghij.supabase.co/auth/v1/callback
```

**Authorized JavaScript origins** :
```
http://localhost:5173
https://motorwatch.tech
https://www.motorwatch.tech
https://abcdefghij.supabase.co
```

### Supabase Dashboard → Authentication → URL Configuration

**Site URL** :
```
https://motorwatch.tech
```

**Redirect URLs** :
```
http://localhost:5173
http://localhost:5173/machine-setup
https://motorwatch.tech
https://motorwatch.tech/machine-setup
https://motorwatch.tech/dashboard
```

---

## 🎉 Résultat Attendu

Une fois configuré correctement :

1. ✅ Clic sur "Sign in with Google"
2. ✅ Popup/redirection Google pour sélectionner un compte
3. ✅ Autorisation de l'application
4. ✅ Redirection automatique vers motorwatch.tech/machine-setup
5. ✅ Utilisateur authentifié et session créée
6. ✅ Navigation dans l'application fonctionnelle

**Votre Google Sign In devrait maintenant fonctionner parfaitement !** 🔐
