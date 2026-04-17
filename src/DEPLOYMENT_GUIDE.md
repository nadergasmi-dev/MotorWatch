# 🚀 Guide de Déploiement - motorwatch.tech

## Option 1 : Déploiement sur Vercel (Recommandé) ⭐

### 📦 Étape 1 : Préparer votre projet

1. **Assurez-vous que votre code est sur GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MotorWatch"
   git remote add origin https://github.com/votre-username/motorwatch.git
   git push -u origin main
   ```

### 🌐 Étape 2 : Déployer sur Vercel

1. **Allez sur https://vercel.com**
2. **Créez un compte** ou connectez-vous (utilisez GitHub pour faciliter)
3. Cliquez sur **"Add New Project"**
4. **Importez votre repository** GitHub
5. Vercel détectera automatiquement qu'il s'agit d'un projet React/Vite
6. **Configuration du build** (normalement auto-détecté) :
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
7. Cliquez sur **"Deploy"**

### 🔗 Étape 3 : Configurer le domaine personnalisé

1. Une fois déployé, allez dans **Settings** de votre projet sur Vercel
2. Cliquez sur **"Domains"**
3. Ajoutez votre domaine : `motorwatch.tech`
4. Vercel vous donnera des **enregistrements DNS** à configurer

### 🌍 Étape 4 : Configuration DNS

Vous allez recevoir des instructions comme celles-ci de Vercel :

**Option A - Nameservers Vercel (Recommandé)** :
```
Changez les nameservers de votre domaine chez votre registrar (Namecheap, GoDaddy, etc.) :

ns1.vercel-dns.com
ns2.vercel-dns.com
```

**Option B - Enregistrements A/CNAME** :
```
Type A :
motorwatch.tech → 76.76.21.21

Type CNAME :
www.motorwatch.tech → cname.vercel-dns.com
```

### 🔐 Étape 5 : HTTPS (Automatique)

✅ Vercel active **automatiquement HTTPS** avec Let's Encrypt
- Certificat SSL gratuit et renouvelé automatiquement
- Redirection HTTP → HTTPS automatique
- Aucune configuration manuelle requise

**Attendez 24-48h** pour la propagation DNS complète.

---

## Option 2 : Déploiement sur Netlify 🎯

### 📦 Étape 1 : Déployer sur Netlify

1. **Allez sur https://netlify.com**
2. Créez un compte et connectez-vous
3. Cliquez sur **"Add new site"** → **"Import an existing project"**
4. Connectez votre repository GitHub/GitLab
5. **Configuration du build** :
   ```
   Build command: npm run build
   Publish directory: dist
   ```
6. Cliquez sur **"Deploy site"**

### 🔗 Étape 2 : Configurer le domaine

1. Allez dans **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Entrez `motorwatch.tech`
4. Netlify vous donnera les **enregistrements DNS** à configurer

### 🌍 Étape 3 : Configuration DNS

**Netlify DNS (Recommandé)** :
```
Changez les nameservers chez votre registrar :

dns1.p05.nsone.net
dns2.p05.nsone.net
dns3.p05.nsone.net
dns4.p05.nsone.net
```

**OU via enregistrements A** :
```
Type A :
motorwatch.tech → 75.2.60.5

Type CNAME :
www.motorwatch.tech → votre-site.netlify.app
```

### 🔐 Étape 4 : HTTPS (Automatique)

1. Dans **Domain settings** → **HTTPS**
2. Cliquez sur **"Verify DNS configuration"**
3. Netlify activera automatiquement le certificat SSL Let's Encrypt
4. Activez **"Force HTTPS"**

---

## 🏢 Configuration chez votre Registrar de Domaine

### Si vous avez acheté motorwatch.tech chez :

#### **Namecheap** :
1. Connectez-vous à Namecheap
2. Allez dans **Domain List** → Cliquez sur **"Manage"** pour motorwatch.tech
3. Allez dans l'onglet **"Advanced DNS"**
4. Ajoutez les enregistrements DNS fournis par Vercel/Netlify
5. **TTL** : Automatique ou 300 secondes

#### **GoDaddy** :
1. Connectez-vous à GoDaddy
2. Allez dans **My Products** → **Domains**
3. Cliquez sur votre domaine motorwatch.tech
4. Cliquez sur **"Manage DNS"**
5. Ajoutez les enregistrements DNS

#### **Cloudflare** :
1. Connectez-vous à Cloudflare
2. Sélectionnez motorwatch.tech
3. Allez dans **DNS** → **Records**
4. Ajoutez les enregistrements
5. ⚠️ **Désactivez le proxy orange** pour l'enregistrement A (cliquez sur le nuage orange pour qu'il devienne gris)
6. Ou laissez activé si vous voulez utiliser les fonctionnalités CDN de Cloudflare

#### **Google Domains** :
1. Connectez-vous à Google Domains
2. Sélectionnez motorwatch.tech
3. Allez dans **DNS**
4. Faites défiler jusqu'à **"Custom resource records"**
5. Ajoutez les enregistrements DNS

---

## ✅ Vérification du Déploiement

### 1. Testez votre site :
```
https://motorwatch.tech
```

### 2. Vérifiez le SSL :
- Cliquez sur le cadenas 🔒 dans la barre d'adresse
- Vérifiez que le certificat est valide

### 3. Testez l'application :
- Inscription
- Connexion
- Réinitialisation de mot de passe
- OAuth Google

### 4. Vérifiez DNS (en ligne de commande) :
```bash
# Vérifier les enregistrements A
nslookup motorwatch.tech

# Vérifier les enregistrements CNAME
nslookup www.motorwatch.tech

# Ou utilisez un outil en ligne
https://dnschecker.org
```

---

## 🔧 Configuration supplémentaire (si nécessaire)

### Créer un fichier `vercel.json` (pour Vercel)

Si vous utilisez React Router, créez ce fichier à la racine :

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Créer un fichier `netlify.toml` (pour Netlify)

Si vous utilisez React Router, créez ce fichier à la racine :

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📱 Pour l'application mobile (React Native + Capacitor)

Quand vous serez prêt à déployer sur mobile :

### Android :
```bash
npx cap add android
npm run build
npx cap sync
npx cap open android
```

### iOS :
```bash
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

---

## 🆘 Problèmes courants

### ❌ "Site can't be reached"
- Attendez 24-48h pour la propagation DNS
- Vérifiez les enregistrements DNS avec `nslookup`

### ❌ "Certificate error"
- Attendez que Vercel/Netlify génère le certificat SSL (peut prendre 1h)
- Vérifiez que le DNS pointe bien vers Vercel/Netlify

### ❌ "404 on page refresh"
- Ajoutez le fichier `vercel.json` ou `netlify.toml` (voir ci-dessus)

### ❌ "Supabase errors"
- Vérifiez que vous avez bien ajouté `https://motorwatch.tech` dans les Redirect URLs Supabase

---

## 🎉 C'est tout !

Une fois déployé, votre application sera accessible sur :
- **https://motorwatch.tech** (production)
- **https://www.motorwatch.tech** (avec www)
- Avec **HTTPS automatique et sécurisé** 🔒

**Temps estimé** : 15-30 minutes + 24-48h pour la propagation DNS complète
