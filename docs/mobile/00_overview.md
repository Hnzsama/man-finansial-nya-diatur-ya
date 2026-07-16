# Finance App — Mobile (Expo) Overview

## Project Context

This is the **mobile companion** for the Personal Finance web application built with Laravel + Inertia.js + React.
The mobile app is built with **Expo (React Native)** and connects to the same Laravel backend via a **REST API using Bearer token authentication**.

---

## Goals of the Mobile App

- **Quick transaction entry** — the #1 use case. Open app, tap +, done in under 10 seconds.
- **At-a-glance financial health** — balance summary, recent transactions, budget status.
- **Home screen widgets** — balance widget, quick-add button, budget progress.
- **Notifications** — subscription reminders, budget alerts, debt due dates.
- **Offline-first** — cache recent data for fast reads when offline.

---

## Recommended Tech Stack (Expo)

| Layer | Technology |
|---|---|
| Framework | Expo SDK (latest stable) |
| Navigation | Expo Router (file-based) |
| State Management | Zustand + TanStack Query (React Query) |
| HTTP Client | Axios with interceptors |
| Token Storage | `expo-secure-store` (encrypted keychain) |
| UI Components | **Gluestack UI v2** (NativeWind-based, Tailwind tokens) |
| Charts | Victory Native XL or React Native Gifted Charts |
| Widgets | `expo-widgets` (iOS) / `react-native-android-widget` |
| Icons | `lucide-react-native` (Gluestack compatible) |
| Notifications | `expo-notifications` |
| Offline Cache | TanStack Query + `@react-native-async-storage/async-storage` |
| Date Picker | `@react-native-community/datetimepicker` |
| Bottom Sheet | `@gorhom/bottom-sheet` |

---

## Authentication Flow

```
User opens app
  → Not logged in?
    → Login screen (email + password)
    → POST /api/login
    → Receive { token, user }
    → Store token in expo-secure-store
    → Redirect to Home

  → Logged in (token in secure store)?
    → GET /api/user (verify token)
    → If 401: clear token → Login screen
    → If 200: proceed to Home
```

All API requests include:
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

---

## Navigation Structure

```
(tabs)
├── Home (Dashboard)
├── Transactions
├── Wallets
├── Budgets (Categories with budget)
└── More
    ├── Goals
    ├── Debts
    ├── Assets
    ├── Subscriptions
    ├── Reports
    └── Settings

(modals / sheets)
├── AddTransaction (quick-add, opened from FAB)
├── TransactionDetail
├── AddWallet
└── GoalDetail
```

---

## Design System

### Color Palette
```
Primary:     #6366F1 (Indigo 500)
Primary Dark:#4F46E5 (Indigo 600)
Success:     #10B981 (Emerald 500)  — income, positive
Danger:      #EF4444 (Red 500)      — expense, negative
Warning:     #F59E0B (Amber 500)    — budget alert
Background:  #0F0F11 (near black)   — dark mode default
Surface:     #1C1C1E (dark surface)
Surface2:    #2C2C2E (card background)
Text:        #FFFFFF
TextMuted:   #9CA3AF (Gray 400)
Border:      #374151 (Gray 700)
```

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Numbers/Money**: Roboto Mono (monospace for alignment)

### Spacing Scale
- `xs: 4px`, `sm: 8px`, `md: 16px`, `lg: 24px`, `xl: 32px`

---

## API Base URL

Configure in `.env` / `app.config.js`:
```
API_BASE_URL=https://your-domain.com/api
```

For local development:
```
API_BASE_URL=http://192.168.x.x:8000/api
```

---

## File Structure (Expo App)

```
finance-mobile/
├── app/
│   ├── (auth)/
│   │   └── login.tsx
│   ├── (tabs)/
│   │   ├── index.tsx          # Dashboard
│   │   ├── transactions.tsx
│   │   ├── wallets.tsx
│   │   ├── budgets.tsx
│   │   └── more.tsx
│   ├── goals/
│   ├── debts/
│   ├── assets/
│   ├── subscriptions/
│   └── _layout.tsx
├── components/
│   ├── ui/                    # Reusable UI primitives
│   ├── cards/                 # Summary cards
│   ├── charts/                # Chart wrappers
│   └── forms/                 # Form components
├── hooks/
│   ├── useAuth.ts
│   ├── useWallets.ts
│   ├── useTransactions.ts
│   └── ...
├── services/
│   ├── api.ts                 # Axios instance + interceptors
│   ├── auth.service.ts
│   ├── wallet.service.ts
│   ├── transaction.service.ts
│   └── ...
├── stores/
│   └── authStore.ts           # Zustand auth store
├── types/
│   └── api.types.ts           # TypeScript interfaces for API
└── constants/
    └── colors.ts
```
