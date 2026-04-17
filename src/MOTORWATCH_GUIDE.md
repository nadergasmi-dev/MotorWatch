# MotorWatch - Guide de l'Application

## 🎯 Vue d'ensemble

MotorWatch est une application professionnelle de surveillance prédictive pour moteurs industriels. Elle utilise 3 modèles de Machine Learning déployés sur des MCUs pour prédire :
- **RUL** (Remaining Useful Life) - Durée de vie restante en heures
- **Failure Probability** - Probabilité de défaillance (0-100%)
- **Failure Type** - Type de défaillance avec probabilités (si détectée)

## 🎨 Design

- **Logo** : Logo professionnel "M WATCH - LIVE MONITORING" en orange (#FFB84E)
- **Couleurs** : #FFB84E (Orange), #262525 (Noir foncé), #FFFFFF (Blanc)
- **Style** : Interface moderne, dynamique et professionnelle

## 📱 Flux de Navigation

### 1. **Écran de Démarrage** (`/`)
- Affiche le logo animé de MotorWatch
- Message de bienvenue
- Redirige automatiquement vers `/login` après 3 secondes

### 2. **Connexion** (`/login`)
- Connexion flexible : Email OU User ID
- Authentification Google disponible
- Lien "Forgot password?" → Système de réinitialisation par code à 6 chiffres
- Après connexion → `/machine-setup`

### 3. **Configuration Machine** (`/machine-setup`) ⭐ NOUVEAU
- **Sélection du type de machine** :
  - Pump (Centrifugal & Positive Displacement)
  - Robotic Arm (Industrial Robotics)
  - Compressor (Air & Gas Compression)
  - CNC Machine (Computer Numerical Control)
- **Heures depuis maintenance** : Entrée manuelle
- Ces données sont utilisées par les modèles ML comme features
- Après configuration → `/dashboard`

### 4. **Dashboard de Monitoring** (`/dashboard` ou `/monitoring`) ⭐ PRINCIPAL
Interface professionnelle en temps réel avec :

#### 🔴 Statut de Santé Global
- HEALTHY (vert) / WARNING (orange) / CRITICAL (rouge)
- Indicateur animé de connexion en temps réel

#### 🤖 Prédictions IA (3 Modèles)
1. **Remaining Useful Life (RUL)**
   - Affichage en heures avec conversion automatique en jours
   - Format : "2450 operating hours = 102 days"
   - Barre de progression visuelle
   - Icône : Horloge bleue

2. **Probabilité de Défaillance**
   - Pourcentage (0-100%)
   - Barre de progression colorée selon le niveau
   - Icône : Triangle d'alerte orange

3. **Types de Défaillances** (si détectée ou probabilité > 50%)
   - Types spécifiques : **bearing**, **motor_overheat**, **hydraulic**, **electrical**
   - Classés par probabilité décroissante avec %
   - Affichage si failure détectée OU si probabilité > 50%
   - Couleurs : Rouge (bearing), Orange (motor_overheat), Jaune (hydraulic), Ambre (electrical)

#### 📊 Données Temps Réel
- **Température** : Affichage en °C avec carte dégradée orange/rouge
- **Vibration RMS** : Affichage en mm/s avec carte dégradée bleu/violet

#### 📈 Graphiques Dynamiques
- **Temperature Trend (Last 24H)** : Courbe orange affichant les dernières 24 heures de données
- **Vibration Trend (Last 24H)** : Courbe bleue affichant les dernières 24 heures de données
- Points de données toutes les 30 minutes (48 points total)
- Mise à jour en temps réel toutes les 2 secondes

#### 🔄 Actions
- Bouton Settings : Reconfigurer la machine
- Bouton Logout : Déconnexion
- Navigation vers Historical Data et Events & Alerts

## 🔧 Communication avec MCUs

### Input (Features pour les modèles)
```javascript
{
  temperature: number,        // Depuis MCU (capteur)
  vibration: number,          // Depuis MCU (capteur)
  machineType: string,        // Depuis app (machine-setup)
  hoursSinceMaintenance: int, // Depuis app (machine-setup)
  // + autres features selon vos modèles
}
```

### Output (Prédictions des modèles)
```javascript
{
  rul: number,                    // Heures restantes
  failureProbability: number,     // 0-100%
  failureDetected: boolean,       // true/false
  failureTypes: [                 // Si failure détectée
    { type: string, probability: number }
  ]
}
```

## 🎛️ Écrans Existants (Non modifiés)

- **History** (`/history`) - Données historiques
- **Events** (`/events`) - Événements et alertes
- **Settings** (`/settings`) - Paramètres et profil

## 🔐 Authentification

- **Supabase Auth** avec :
  - Email/Password
  - User ID personnalisé
  - Google Sign-in (OAuth)
  - Reset password par code email (6 chiffres via Resend)

## 💾 Stockage

- **localStorage** :
  - `machineConfig` : Type de machine et heures depuis maintenance
  - Effacé à la déconnexion

## 🚀 Prochaines Étapes

1. **Intégrer vos MCUs** :
   - WebSocket ou HTTP pour streaming temps réel
   - Envoyer température et vibration toutes les 2 secondes
   - Recevoir les prédictions des 3 modèles

2. **Personnaliser les types de machines** :
   - Ajouter/modifier dans `MACHINE_TYPES` dans `/components/MachineSetupScreen.tsx`

3. **Ajuster les seuils d'alerte** :
   - Modifier la fonction `getHealthStatus()` dans `/components/MonitoringDashboard.tsx`

4. **Historique et Analytics** :
   - Stocker les données dans Supabase pour visualisation historique
   - Graphiques de tendance sur plusieurs jours/semaines

## 📝 Notes Techniques

- **Simulation** : Le dashboard actuel simule les données MCU pour démonstration
- **Temps Réel** : Mise à jour toutes les 2 secondes
- **Historique 24h** : Génération automatique de 24h de données historiques au démarrage
- **Responsive** : Optimisé pour mobile (Capacitor ready)
- **Performance** : 48 points de données (24h × 2 points/heure) réduits à 24 points affichés pour fluidité
- **Dark Mode** : Thème sombre professionnel par défaut
- **Types de machines** : Pump, Robotic Arm, Compressor, CNC
- **Types de défaillances** : bearing, motor_overheat, hydraulic, electrical

## 🎨 Composants Clés

- `MonitoringDashboard.tsx` - Dashboard principal avec prédictions ML
- `MachineSetupScreen.tsx` - Configuration machine
- `recharts` - Bibliothèque de graphiques
- Lucide React - Icônes modernes

---

**Bonne surveillance avec MotorWatch ! 🔧⚙️**