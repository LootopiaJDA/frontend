# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm start          # Launch Expo dev server (scan QR with Expo Go)
npm run android    # Start Android dev build
npm run ios        # Start iOS dev build
npm run web        # Start web dev server
npm run lint       # Run ESLint (expo-lint)
```

There is no test runner configured. Testing is done manually via Expo Go on a real device.

## Backend Setup

The backend is a NestJS server expected at `http://<LOCAL_IP>:3000`. Before running:

1. Edit `constants/api.ts` and set `API_URL` to your local machine's IP (not `localhost` — it doesn't work on physical devices with Expo Go).
2. The backend must have CORS enabled with `credentials: true`.

## Architecture

### Stack
- **React Native 0.81 + Expo 54** — cross-platform mobile (iOS, Android, web)
- **Expo Router 6** — file-based routing (similar to Next.js `app/` directory)
- **TypeScript** — strict typing throughout
- **React Context** — global auth state (Zustand is installed but unused)

### Route Groups & Role-Based Navigation

`app/index.tsx` reads the authenticated user's role and redirects:

| Route group | Who sees it |
|---|---|
| `/(auth)/` | Unauthenticated users (welcome, login, register) |
| `/(app)/` | JOUEUR — tabs: Chasses, Map, Profile |
| `/(partner)/` | PARTENAIRE — tabs: Dashboard, Profile; modal routes in `(components)/` |
| `/(admin)/` | ADMIN — tabs: Dashboard, Users, Hunts, Profile |

### Key Directories

- `app/` — all screens via Expo Router (each file = a route)
- `components/` — reusable UI (Btn, Input, ChasseCard, EtapeCard, map components)
- `constants/api.ts` — API base URL + all endpoint strings
- `constants/types.ts` — shared TypeScript interfaces (User, Chasse, Etape, Role enum, etc.)
- `constants/theme.ts` — design tokens: `Colors`, `Sp` (spacing), `R` (border radius)
- `context/AuthContext.tsx` — auth state provider (user, login, logout, refresh)
- `services/api.ts` — all REST calls; base `req()` sends cookies via `credentials: 'include'`

### Auth Flow

`AuthContext` calls `authService.me()` on app boot to restore session from server cookie. Components read `{ user, loading, login, logout }` from `useAuth()`. The root `_layout.tsx` wraps the whole app in `<AuthProvider>`.

### API Layer

All HTTP calls go through `services/api.ts`. The base `req()` function:
- Sets `Content-Type: application/json` (unless FormData)
- Uses `credentials: 'include'` for session cookies
- Parses error messages from JSON response body

Image uploads (chasse creation, etape) use `multipart/FormData` — do not set `Content-Type` manually for those requests.

### Design System

Dark theme with gold accent. Always use tokens from `constants/theme.ts`:
- `Colors.bg`, `Colors.gold` (`#C9933A`), `Colors.accent` (`#5B4BDB`)
- `Sp.xs/sm/md/lg/xl/xxl` for spacing
- `R.xs/md/lg/xl/full` for border radius

### Map Features

The player map (`/(app)/map.tsx`) uses `react-native-maps` + `expo-location` for:
- Real-time GPS tracking
- Proximity detection via haversine formula
- Numbered markers with detection radius circles
- Sliding "Dig" panel and animated victory screen

`EtapeMapPicker` (used in partner flow) lets partners place step coordinates interactively with reverse geocoding via `expo-location`.