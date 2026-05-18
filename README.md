# 🗺️ Lootopia — Frontend Mobile

Application React Native (Expo Router) pour la plateforme de chasses au trésor numériques **Lootopia**.

---

## 🧱 Stack technique

| Package | Usage |
|---------|-------|
| React Native 0.81 + Expo 54 | Application mobile cross-platform |
| Expo Router 6 | Navigation file-based (style Next.js) |
| TypeScript | Typage strict |
| `expo-location` | GPS temps réel + géocodage inverse |
| `react-native-maps` | Carte interactive |
| `expo-camera` + `expo-sensors` | Réalité augmentée |
| `lottie-react-native` | Animations (victoire, succès) |
| `expo-image-picker` | Upload images vers Cloudinary |
| Zustand | Store global (session de jeu) |

---

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer l'IP du backend
Ouvrir `constants/api.ts` et remplacer l'IP :
```ts
export const API_URL = 'http://TON_IP_LOCALE:3000';
```

Trouver son IP locale :
- macOS/Linux : `ifconfig | grep "inet "`
- Windows : `ipconfig` → "Adresse IPv4"

> `localhost` ne fonctionne **pas** sur un vrai téléphone avec Expo Go.

### 3. Lancer
```bash
npm start          # Expo dev server (scan QR avec Expo Go)
npm run android    # Build Android
npm run ios        # Build iOS
```

---

## 📁 Structure du projet

```
app/
├── index.tsx                ← Redirection par rôle
├── (auth)/                  ← Écrans non authentifiés
│   ├── welcome.tsx
│   ├── login.tsx
│   ├── register.tsx
│   └── register-partner.tsx
├── (app)/                   ← Zone JOUEUR
│   ├── chasses.tsx          ← Liste + filtres + détail modal
│   ├── map.tsx              ← Carte GPS + détection proximité + panel Creuser
│   ├── ar-view.tsx          ← Réalité augmentée (boussole + coffre)
│   └── profil.tsx
├── (partner)/               ← Zone PARTENAIRE
│   ├── dashboard.tsx        ← Stats + CRUD chasses
│   ├── create-chasse.tsx
│   ├── edit-etape.tsx       ← Placement étape sur carte + géocodage
│   └── profil.tsx
└── (admin)/                 ← Zone ADMIN
    ├── dashboard.tsx
    ├── users.tsx
    ├── hunts.tsx
    └── profil.tsx

components/         ← UI réutilisable (Btn, Input, ChasseCard, EtapeCard…)
constants/
├── api.ts          ← URL de base + toutes les routes API
├── types.ts        ← Interfaces TypeScript partagées
└── theme.ts        ← Tokens de design (Colors, Sp, R)
context/
└── AuthContext.tsx ← Session utilisateur globale (login/logout/me)
hooks/
└── useHuntTracker.ts ← GPS tracking + détection de zone (haversine)
services/
└── api.ts          ← Tous les appels HTTP (cookies credentials:include)
store/
└── huntStore.ts    ← État de session de jeu (score, pendingValidation)
```

---

## 🔐 Gestion des rôles

`app/index.tsx` lit le rôle de l'utilisateur connecté et redirige :

| Rôle | Zone | Accès |
|------|------|-------|
| Non connecté | `/(auth)/` | Consulter les chasses, pas de participation |
| **JOUEUR** | `/(app)/` | Participer, carte GPS, validation étapes, AR |
| **PARTENAIRE** | `/(partner)/` | Créer et gérer ses chasses + étapes |
| **ADMIN** | `/(admin)/` | Valider les partenaires, gérer les utilisateurs |

---

## 🗺️ Fonctionnalités carte (map.tsx)

- Position GPS en temps réel (`expo-location`, précision maximale, mise à jour toutes les 500ms)
- Marqueurs numérotés par rang (étape actuelle mise en avant en or)
- Cercle de rayon de détection autour de l'étape courante
- Polyline pointillée reliant toutes les étapes
- Détection automatique de proximité via formule **haversine**
- Panel **"Creuser"** animé (spring) qui remonte depuis le bas quand la zone est atteinte
- Animations de validation (Lottie + score flottant +100 pts)
- Écran de victoire avec confettis en fin de chasse

---

## 📡 Hook `useHuntTracker`

Centralise toute la logique de suivi GPS :

```ts
const tracker = useHuntTracker(chasseId, completedEtapeIds);

tracker.currentEtape   // étape en cours
tracker.isInRadius     // true si le joueur est dans la zone de détection
tracker.distance       // distance en mètres jusqu'à l'étape
tracker.advanceOnly()  // avance à l'étape suivante (après validation AR)
tracker.completed      // true si toutes les étapes sont validées
```

GPS configuré : mise à jour toutes les **500ms** sans filtre de distance pour une détection réactive dès l'entrée en zone.

---

## 🕶️ Réalité Augmentée (ar-view.tsx)

Déclenché depuis le panel "Creuser" quand le joueur est dans la zone :

1. Caméra activée en temps réel
2. Calcul du **bearing** (cap GPS) entre joueur et étape cible
3. Boussole via `DeviceMotion` (cap magnétique de l'appareil)
4. Un **coffre animé** apparaît quand le joueur pointe dans la bonne direction (±30°)
5. Le joueur tape sur le coffre pour valider → `pendingValidation` déclenche la validation API au retour sur la carte

---

## 🏪 Store global `huntStore`

Zustand store pour la session de jeu :

| State | Description |
|-------|-------------|
| `pendingValidation` | Flag posé par l'AR pour déclencher la validation API côté carte |
| `sessionScore` | Score accumulé sur la session en cours |

---

## 🔧 Configuration backend requise

Dans `main.ts` du backend NestJS :
```ts
app.enableCors({ origin: true, credentials: true });
```

---

## 🐛 Problèmes courants

| Problème | Solution |
|----------|----------|
| `Network request failed` | Vérifier `API_URL` dans `constants/api.ts` (IP locale, pas localhost) |
| Carte vide sur iOS Simulator | Utiliser un vrai appareil ou définir une position simulée |
| Cookies non envoyés | Vérifier `credentials: true` dans le CORS backend |
| GPS lent à démarrer | Accepter la permission de localisation au premier lancement |
| AR ne détecte pas la direction | Calibrer la boussole (faire un 8 avec le téléphone) |
