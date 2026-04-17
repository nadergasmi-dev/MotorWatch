# 📧 Configuration Email de Réinitialisation avec motorwatch.tech

## ✅ Problème Résolu : Envoi de Code de Réinitialisation

Maintenant que vous avez configuré **motorwatch.tech** dans Supabase, voici comment faire fonctionner l'envoi de codes de réinitialisation de mot de passe :

---

## 🔑 Option 1 : Utilisation de Resend (Recommandé)

### Étape 1 : Vérifier votre compte Resend

1. **Allez sur https://resend.com/login**
2. Connectez-vous avec votre compte
3. **Important** : Avec le plan gratuit Resend, vous **ne pouvez envoyer d'emails qu'à l'adresse email utilisée pour créer votre compte Resend**

### Étape 2 : Vérifier le Secret RESEND_API_KEY dans Supabase

1. Allez dans **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Vérifiez que le secret `RESEND_API_KEY` existe bien avec votre clé API Resend
3. Si ce n'est pas le cas, ajoutez-le :
   ```
   Name: RESEND_API_KEY
   Value: re_VotreClé...
   ```

### Étape 3 : Configuration du domaine d'envoi (Production)

Pour envoyer des emails depuis **noreply@motorwatch.tech** au lieu de **onboarding@resend.dev** :

#### A. Vérifier votre domaine dans Resend

1. Allez sur **Resend Dashboard** → **Domains**
2. Cliquez sur **"Add Domain"**
3. Entrez `motorwatch.tech`
4. **Copiez les enregistrements DNS** fournis par Resend

#### B. Configurer les DNS chez votre Registrar

Ajoutez les enregistrements DNS suivants (valeurs exemples, utilisez celles de Resend) :

```
Type: TXT
Name: @
Value: resend-verify=xxxxxxxxxxxxx

Type: MX
Name: @
Priority: 10
Value: feedback-smtp.resend.com

Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; pct=100; rua=mailto:dmarc@motorwatch.tech

Type: TXT
Name: resend._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0G...
```

#### C. Attendre la vérification (24-48h)

Une fois les DNS propagés, Resend vérifiera automatiquement votre domaine.

#### D. Mettre à jour l'adresse d'envoi

Une fois le domaine vérifié, mettez à jour le fichier `/supabase/functions/server/index.ts` :

```typescript
// Remplacer
from: 'MotorWatch <onboarding@resend.dev>'

// Par
from: 'MotorWatch <noreply@motorwatch.tech>'
```

---

## 🧪 Option 2 : Utilisation de Supabase Auth Email (Alternative)

Si vous préférez utiliser le système d'email natif de Supabase au lieu de Resend :

### Étape 1 : Configurer SMTP dans Supabase

1. Allez dans **Supabase Dashboard** → **Authentication** → **Email Templates**
2. Activez **"Enable Custom SMTP"**
3. Configurez avec votre fournisseur SMTP :

**Exemple avec SendGrid** :
```
SMTP Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: SG.VotreAPIKey
Sender Email: noreply@motorwatch.tech
Sender Name: MotorWatch
```

**Exemple avec Gmail** (pour tests uniquement) :
```
SMTP Host: smtp.gmail.com
Port: 587
Username: votre.email@gmail.com
Password: Mot de passe d'application (pas votre mot de passe Gmail)
Sender Email: votre.email@gmail.com
Sender Name: MotorWatch
```

### Étape 2 : Activer l'envoi d'emails dans Supabase Auth

1. Allez dans **Authentication** → **Email Templates**
2. Éditez le template **"Reset Password"**
3. Personnalisez le template si nécessaire

### Étape 3 : Modifier votre code pour utiliser Supabase Auth

Au lieu d'utiliser Resend + codes à 6 chiffres, utilisez le système natif de Supabase :

```typescript
// Dans ForgotPasswordScreen.tsx
const handleSendCode = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const supabase = createClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `https://motorwatch.tech/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Success
    alert('Un email de réinitialisation a été envoyé à votre adresse email !');
    navigate('/login');
  } catch (err) {
    console.error('Error:', err);
    setError('Une erreur est survenue');
    setLoading(false);
  }
};
```

---

## 🔍 Tester la Fonctionnalité

### Test avec Resend (Plan Gratuit)

1. **Créez un compte** avec l'email utilisé pour votre compte Resend
2. **Allez sur** `https://motorwatch.tech/forgot-password` (ou localhost)
3. **Entrez cet email**
4. **Vérifiez votre boîte mail** (peut prendre 1-2 minutes)
5. **Entrez le code à 6 chiffres**
6. **Définissez un nouveau mot de passe**

### Test avec Supabase Auth

1. **Créez un compte** avec n'importe quel email
2. **Allez sur** `https://motorwatch.tech/forgot-password`
3. **Entrez votre email**
4. **Vérifiez votre boîte mail** (vérifiez aussi les spams)
5. **Cliquez sur le lien** dans l'email
6. **Définissez un nouveau mot de passe**

---

## ⚠️ Limitations à Connaître

### Resend Plan Gratuit
- ✅ 100 emails/jour
- ✅ 1 domaine vérifié
- ❌ **Emails uniquement vers l'adresse du compte Resend** (en dev)
- ❌ Pas d'emails vers des adresses tierces sans domaine vérifié

### Resend Plan Payant (9$/mois)
- ✅ 50,000 emails/mois
- ✅ Emails vers n'importe quelle adresse
- ✅ Support de domaines personnalisés
- ✅ Analytics avancés

---

## 🚀 Recommandation pour Production

**Pour motorwatch.tech en production** :

1. ✅ **Passez à Resend Plan Payant** (9$/mois) ou utilisez un autre service SMTP
2. ✅ **Vérifiez le domaine motorwatch.tech** dans Resend
3. ✅ **Utilisez noreply@motorwatch.tech** comme adresse d'envoi
4. ✅ **Testez avec plusieurs adresses email** différentes
5. ✅ **Configurez SPF, DKIM, DMARC** pour éviter les spams

---

## 📝 Résumé des URLs importantes

### Développement (localhost)
```
Site URL: http://localhost:5173
Redirect URLs: 
  - http://localhost:5173
  - http://localhost:5173/machine-setup
```

### Production (motorwatch.tech)
```
Site URL: https://motorwatch.tech
Redirect URLs:
  - https://motorwatch.tech
  - https://motorwatch.tech/machine-setup
  - https://motorwatch.tech/reset-password
```

---

## 🆘 Problèmes Courants

### ❌ "Failed to send email"
- Vérifiez que `RESEND_API_KEY` est bien configuré dans Supabase
- Vérifiez que l'email destinataire est bien celui de votre compte Resend (plan gratuit)

### ❌ Email non reçu
- Vérifiez les **spams/courriers indésirables**
- Attendez 2-3 minutes (délai de traitement)
- Vérifiez que l'email est bien celui de votre compte Resend

### ❌ "Invalid code"
- Le code expire après 10 minutes
- Demandez un nouveau code
- Vérifiez que vous entrez bien les 6 chiffres

---

## 🎉 C'est Prêt !

Une fois configuré, vos utilisateurs pourront :
1. ✅ **Demander un code de réinitialisation** via email
2. ✅ **Recevoir un code à 6 chiffres** dans leur boîte mail
3. ✅ **Réinitialiser leur mot de passe** de manière sécurisée
4. ✅ **Se reconnecter** avec leur nouveau mot de passe

**Tout cela avec votre domaine professionnel motorwatch.tech !** 🔧
