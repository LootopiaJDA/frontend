# 🗺️ Lootopia — Frontend Mobile

Application React Native (Expo Router) pour la plateforme de chasses au trésor numériques.

---

## 🚀 Démarrage rapide

### 1. Installer les dépendances
```bash
npm install
```

### 2. ⚠️ Configurer l'IP du backend
Ouvrir `constants/api.ts` et remplacer l'IP :
```ts
export const API_URL = 'http://TON_IP_LOCALE:3000';
// Exemple : http://192.168.1.42:3000
```

**Trouver son IP locale :**
- macOS/Linux : `ifconfig | grep "inet " | grep -v 127`
- Windows : `ipconfig` → chercher "IPv4"

> ⚠️ `localhost` ne fonctionne PAS sur un téléphone réel avec Expo Go !

### 3. Lancer l'app
```bash
npm start
```
Scanner le QR code avec **Expo Go** (iOS ou Android).

---

## 🔧 Configuration backend NestJS requise

Dans `main.ts`, activer CORS avec credentials :
```ts
app.enableCors({
  origin: true,
  credentials: true,
});
```

---

## 📱 Écrans et navigation

```
/(auth)/
  welcome.tsx          ← Page d'accueil avec animations
  login.tsx            ← Connexion email/password
  register.tsx         ← Inscription joueur
  register-partner.tsx ← Inscription partenaire (avec SIRET)

/(app)/                ← Zone joueur (tab bar : Chasses / Carte / Profil)
  chasses/index.tsx    ← Liste chasses + filtres + modal détail + étapes
  map/index.tsx        ← Carte interactive GPS + détection proximité + creuser
  profil/index.tsx     ← Profil joueur / CTA connexion si invité

/(partner)/            ← Zone partenaire (tab bar : Dashboard / Créer / Étape / Profil)
  dashboard.tsx        ← Stats + liste chasses + edit/delete + modal étapes
  create-chasse.tsx    ← Formulaire création avec image picker Cloudinary
  add-etape.tsx        ← Formulaire étape + carte interactive + géocodage inverse
  profil.tsx           ← Profil partenaire + infos entreprise
```

---

## 🔐 Gestion des rôles

| Rôle | Accès |
|------|-------|
| **Invité** (non connecté) | Voir toutes les chasses, pas de participation |
| **JOUEUR** | Voir + participer aux chasses ACTIVE sur la carte |
| **PARTENAIRE** | Dashboard, CRUD chasses, gestion étapes |
| **ADMIN** | Redirigé sur dashboard partenaire |

---

## 🗺️ Fonctionnalités carte

- Position GPS en temps réel (expo-location)
- Marqueurs numérotés par rang
- Cercles de rayon de détection
- Polyline pointillée reliant les étapes
- Détection automatique de proximité (haversine)
- Panel "Creuser" glissant du bas
- Écran de victoire animé

---

## 📦 Dépendances clés

| Package | Usage |
|---------|-------|
| `expo-router` | Navigation file-based |
| `react-native-maps` | Carte iOS/Android |
| `expo-location` | GPS + géocodage inverse |
| `expo-image-picker` | Upload images |
| `@expo/vector-icons` | Ionicons |

---

## 🐛 Problèmes courants

**"Network request failed"**
→ Vérifier que `API_URL` dans `constants/api.ts` pointe bien sur votre IP locale

**La carte ne s'affiche pas sur iOS Simulator**
→ Utiliser un vrai appareil ou définir une localisation simulée

**Cookies non envoyés**
→ Vérifier que le backend a bien `credentials: true` dans CORS
