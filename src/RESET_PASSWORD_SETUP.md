# Configuration de la Réinitialisation de Mot de Passe

## ✅ Modifications appliquées

1. **Routes du serveur** : Tous les préfixes ont été mis à jour de `make-server-c9c0572a` → `make-server-3f7a73b0`
2. **Composants frontend** : LoginScreen, SignUpScreen, ForgotPasswordScreen et VerifyResetCodeScreen utilisent maintenant le bon préfixe
3. **Intégration Resend** : Le code d'envoi d'email est configuré avec l'API Resend

## ⚠️ Étapes critiques à vérifier

### 1. Configuration du secret RESEND_API_KEY dans Supabase

Le secret `RESEND_API_KEY` devrait déjà être configuré selon le système, mais vérifiez qu'il est bien présent :

```bash
# Valeur à configurer (si ce n'est pas déjà fait)
RESEND_API_KEY=re_LX7w5fz3_EHnUMwa7NXRPCBstFtYMgV94
```

### 2. Limitation du plan gratuit Resend ⚠️

**IMPORTANT** : Avec le plan gratuit de Resend, vous ne pouvez envoyer des emails QU'À l'adresse email que vous avez utilisée pour créer votre compte Resend.

**Action requise** :
- Vérifiez quel email vous avez utilisé pour créer votre compte Resend
- Testez la réinitialisation de mot de passe UNIQUEMENT avec cet email
- Si vous testez avec un autre email, vous recevrez une erreur 403/404

### 3. Adresse email d'envoi

Le code utilise actuellement :
```typescript
from: 'MotorWatch <onboarding@resend.dev>'
```

Cette adresse fonctionne en mode test. Pour un usage en production, vous devrez :
- Configurer un domaine vérifié dans Resend
- Mettre à jour l'adresse `from` dans `/supabase/functions/server/index.ts`

## 🧪 Test de la fonctionnalité

1. **Créer un compte de test** avec l'email utilisé pour votre compte Resend
2. **Se déconnecter** et aller sur l'écran de connexion
3. **Cliquer sur "Forgot password?"**
4. **Entrer votre email Resend**
5. **Vérifier votre boîte mail** pour le code à 6 chiffres
6. **Entrer le code** et définir un nouveau mot de passe

## 📝 Structure des fichiers

- `/supabase/functions/server/index.ts` - Serveur avec routes :
  - POST `/make-server-3f7a73b0/forgot-password` - Génère et envoie le code
  - POST `/make-server-3f7a73b0/verify-reset-code` - Vérifie le code
  - POST `/make-server-3f7a73b0/reset-password` - Réinitialise le mot de passe

- `/components/ForgotPasswordScreen.tsx` - Écran de demande de code
- `/components/VerifyResetCodeScreen.tsx` - Écran de vérification et réinitialisation

## 🔍 Débogage

Si vous rencontrez toujours des erreurs :

1. **Vérifiez les logs du serveur** dans la console Supabase
2. **Vérifiez la console du navigateur** pour les erreurs réseau
3. **Testez l'endpoint health** : `https://{projectId}.supabase.co/functions/v1/make-server-3f7a73b0/health`
4. **Vérifiez que le secret existe** dans Supabase Dashboard → Project Settings → Edge Functions → Secrets

## 🔄 Redéploiement

La fonction Edge a été redéployée automatiquement. Le serveur devrait maintenant utiliser le bon préfixe `make-server-3f7a73b0`.
