# Finance App — Mobile Features Documentation

> This document describes all features the Expo mobile app must implement.
> Each section includes the data model, required UI screens, and key interactions.

---

## 1. Authentication

### Screens
- **Login Screen** — email + password fields, "Login" button, error state

### Behavior
- On submit: `POST /api/login` → receive `{ token, user }`
- Store token in `expo-secure-store`
- On 401: clear token, show login screen
- No registration from mobile (web-only)
- Logout: `POST /api/logout` → clear token

### Data
```typescript
interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}
```

---

## 2. Dashboard (Home Tab)

### Purpose
The first thing users see. Must answer: *"How am I doing financially right now?"*

### Screens
- **Home Screen** (main dashboard)

### UI Components Required
1. **Header** — greeting ("Good morning, Akuma"), current date
2. **Total Balance Card** — sum of all wallet balances (large, prominent)
3. **Income / Expense Summary** — current month income and expense side by side
4. **Wallet Cards Carousel** — horizontal scroll of all wallets with individual balances
5. **Recent Transactions** — last 5 transactions with category icon, name, amount, date
6. **Budget Progress** — top 3 categories with budget bar progress
7. **Quick Add FAB** — floating action button "+" to open transaction form

### Data Sources
- `GET /api/dashboard` — all summary data in one call
- `GET /api/wallets` — wallet list for carousel

### Key Interactions
- Tap wallet card → navigate to Wallet Detail
- Tap transaction → navigate to Transaction Detail
- Tap "+" FAB → open AddTransaction bottom sheet
- Pull to refresh

---

## 3. Wallets

### Purpose
Manage all money accounts (cash, bank, e-wallet, digital accounts).

### Screens
- **Wallets List** (tab) — all wallets as cards
- **Wallet Detail** — transactions for this wallet, balance chart
- **Add/Edit Wallet** — form sheet

### UI Components Required
1. **Wallet Card** — colored card with icon, name, type, balance
2. **Total Net Worth Banner** — sum of all wallet balances at top
3. **Transaction Mini List** — recent transactions per wallet
4. **Balance History Chart** — simple line chart

### Data Model
```typescript
interface Wallet {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'digital';
  opening_balance: number;
  current_balance: number;
  icon: string;
  color: string;
  notes: string | null;
}
```

### Wallet Types & Icons
| Type | Label | Icon |
|---|---|---|
| cash | Cash | cash-outline |
| bank | Bank | business-outline |
| ewallet | E-Wallet | phone-portrait-outline |
| digital | Digital | globe-outline |

### Add/Edit Form Fields
- Name (required)
- Type (required, picker)
- Opening Balance (required, numeric)
- Color (color picker)
- Icon (icon picker)
- Notes (optional)

---

## 4. Transactions

### Purpose
Record and browse all income and expense transactions.

### Screens
- **Transactions List** (tab) — paginated/infinite scroll list with filters
- **Transaction Detail** — read-only view with edit/delete actions
- **Add Transaction** (bottom sheet / modal) — the most important screen
- **Edit Transaction** — same form as Add

### UI Components Required
1. **Stats Bar** — income, expense, net for current filter period
2. **Filter Bar** — date range, wallet, type, category chips
3. **Transaction List** — grouped by date, each item shows:
   - Category icon + color
   - Description/notes or category name
   - Wallet name
   - Amount (green for income, red for expense)
   - Date
4. **Quick Add Form** (most critical):
   - Amount input (large, numeric keyboard, first focus)
   - Type toggle (Income / Expense)
   - Category picker
   - Wallet picker
   - Date picker (default today)
   - Notes (optional)
   - Submit button

### Data Model
```typescript
interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number | null;
  goal_id: number | null;
  debt_id: number | null;
  type: 'income' | 'expense';
  amount: string; // decimal
  date: string;   // YYYY-MM-DD
  notes: string | null;
  attachment_path: string | null;
  wallet?: Wallet;
  category?: Category;
}

interface TransactionPayload {
  wallet_id: number;
  category_id?: number;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  notes?: string;
}
```

### Filters
- `start_date` / `end_date` — date range (default: current month)
- `wallet_id` — specific wallet or "all"
- `type` — income / expense / all
- `category_id` — specific category or "all"
- `search` — text search on notes/amount/category

---

## 5. Categories

### Purpose
Organize transactions into meaningful spending groups.

### Screens
- **Categories List** — accessible from More tab
- **Category Detail** — transactions in this category, spending stats
- **Add/Edit Category** — form

### Data Model
```typescript
interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  parent_id: number | null;
  budget_amount: number | null;
  budget_period: 'monthly' | 'yearly' | null;
  is_active: boolean;
  children?: Category[];
}
```

### Add/Edit Form Fields
- Name (required)
- Type (income/expense, required)
- Icon (icon picker)
- Color (color picker)
- Parent Category (optional, picker)
- Budget Amount (optional)
- Budget Period (monthly/yearly, if budget set)

---

## 6. Budgets

### Purpose
Track spending limits per category.

### Screens
- **Budgets Screen** (accessible from More tab or tab) — all categories with budget
- Budget is part of Category model (not separate entity)

### UI Components Required
1. **Budget Card** — category name, icon, spent/budget progress bar, percentage
2. **Color coding**: Green (<70%), Yellow (70-90%), Red (>90%)
3. **Period toggle** — Monthly / Yearly

### Data
Budget data comes from `GET /api/categories` (each category has `budget_amount` and `budget_period`).
Current spending comes from `GET /api/dashboard` or `GET /api/transactions` filtered by category.

---

## 7. Goals

### Purpose
Save towards a specific financial target (vacation, emergency fund, laptop, etc.)

### Screens
- **Goals List** — all active goals
- **Goal Detail** — progress, contribution history, edit
- **Add/Edit Goal** — form
- **Add Contribution** — quick add amount to goal

### UI Components Required
1. **Goal Card** — name, target amount, current amount, progress ring/bar, deadline
2. **Progress Ring** — circular progress showing percentage
3. **Days Remaining Badge**
4. **Contribution History List**

### Data Model
```typescript
interface Goal {
  id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  deadline: string | null; // YYYY-MM-DD
  notes: string | null;
  icon: string | null;
  color: string | null;
  is_achieved: boolean;
}
```

### Add/Edit Form Fields
- Name (required)
- Target Amount (required)
- Deadline (optional, date picker)
- Icon (optional)
- Color (optional)
- Notes (optional)

---

## 8. Debts & Receivables

### Purpose
Track money you owe (debt) or money others owe you (receivable/piutang).

### Screens
- **Debts List** — split into "I Owe" and "They Owe Me" tabs
- **Debt Detail** — payment history, remaining amount
- **Add/Edit Debt** — form
- **Record Payment** — quick payment form

### UI Components Required
1. **Debt Card** — creditor/debtor name, type badge, total/remaining, due date
2. **Payment History List**
3. **Record Payment Sheet** — amount, date, notes
4. **Overdue badge** — red highlight if past due date

### Data Model
```typescript
interface Debt {
  id: number;
  name: string;
  type: 'debt' | 'receivable';
  amount: string;        // original amount
  paid_amount: string;   // total paid
  remaining_amount: string;
  due_date: string | null;
  notes: string | null;
  is_settled: boolean;
}
```

---

## 9. Assets

### Purpose
Track assets that contribute to net worth.

### Screens
- **Assets List** — all assets grouped by type
- **Add/Edit Asset** — form

### Asset Types
| Type | Examples |
|---|---|
| savings | Tabungan bank |
| deposit | Deposito |
| gold | Emas fisik, logam mulia |
| stocks | Saham |
| crypto | Bitcoin, Ethereum |
| property | Rumah, tanah |
| other | Lainnya |

### Data Model
```typescript
interface Asset {
  id: number;
  name: string;
  type: 'savings' | 'deposit' | 'gold' | 'stocks' | 'crypto' | 'property' | 'other';
  value: string;
  notes: string | null;
}
```

### Net Worth Calculation
Total Wallets + Total Assets = **Net Worth**

---

## 10. Subscriptions & Bills

### Purpose
Never forget recurring payments.

### Screens
- **Subscriptions List** — all active subscriptions with next due date
- **Add/Edit Subscription** — form
- **Process Payment** — mark as paid

### UI Components Required
1. **Subscription Card** — logo/icon, name, amount, cycle badge, next due date
2. **Due Soon Highlight** — subscriptions due within 7 days
3. **Overdue badge**

### Data Model
```typescript
interface Subscription {
  id: number;
  name: string;
  amount: string;
  cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_billing_date: string;
  notes: string | null;
  is_active: boolean;
  wallet_id: number | null;
  category_id: number | null;
}
```

---

## 11. Reports & Analytics

### Purpose
Deep-dive into spending patterns.

### Screens
- **Reports Screen** — period selector + chart views

### UI Components Required
1. **Period Selector** — This Week / This Month / Last Month / Custom
2. **Income vs Expense Bar Chart** — monthly comparison (last 6 months)
3. **Expense by Category Pie/Donut Chart**
4. **Top Spending Categories List** — ranked by amount
5. **Daily Spending Line Chart**
6. **Net Worth Over Time** (if historical data available)

---

## 12. Home Screen Widgets (Expo Widgets)

### Widget 1: Balance Summary (small/medium)
- Shows total balance across all wallets
- Last updated timestamp

### Widget 2: Quick Add Transaction (medium)
- Button to open the app directly on the Add Transaction screen

### Widget 3: Budget Status (medium/large)
- Top 3 budgets with progress bars
- Color coded by usage

### Widget 4: Today's Spending (small)
- Total spent today vs yesterday

---

## 13. Notifications

### Notification Types
| Trigger | Message |
|---|---|
| Subscription due in 3 days | "Netflix due in 3 days — Rp 54,000" |
| Budget exceeded 90% | "Food budget at 92% — Rp 270,000 left" |
| Debt due date approaching | "Loan payment due in 5 days" |
| Goal milestone | "You're 50% towards your Vacation goal!" |

### Implementation
Use `expo-notifications` with local scheduling.
Server can push reminders via a webhook or the app schedules locally based on fetched data.
