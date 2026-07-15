# Application Architecture

## Stack
- **Backend:** Laravel 13 (PHP 8.5+)
- **Database:** SQLite (or MySQL/PostgreSQL)
- **Frontend:** Laravel Inertia v3 with React 19 + Radix UI / Tailwind CSS v4
- **Routing:** Laravel Wayfinder untuk Type-Safe Routing
- **Testing:** Pest

## Core Entities
1. **Wallet (Dompet)**
   - Stores current balance (`current_balance`) and initial balance.
   - Types: Cash, Bank, E-Wallet, Digital.
2. **Category (Kategori)**
   - Grouping of transactions (e.g., Food, Salary, Utilities).
   - Supports parent-child hierarchy (`parent_id`) and archiving (`is_archived`).
3. **Transaction (Transaksi)**
   - The core ledger. Records money in/out.
   - Includes `TransactionHistory` to maintain an audit trail if a transaction is edited.
   - Links to Goals and Debts.
4. **Transfer**
   - Links two `Transaction` records (one expense from the source wallet, one income to the destination wallet).
5. **Debt (Hutang / Piutang)**
   - Tracks money owed by the user (debt) or owed to the user (receivable).
   - Linked to transactions when payments/installments are made.
6. **Subscription (Tagihan Berulang)**
   - Tracks recurring expenses like Netflix, Spotify, or Rent.
7. **Budget (Anggaran)**
   - Sets limits on spending globally or per category over a specific period (monthly, yearly).
8. **Goal (Target Keuangan)**
   - Tracks savings goals (e.g., Emergency Fund, New Laptop) with deadlines and progress.
9. **Asset (Aset)**
   - Tracks investments and properties (e.g., Stock, Crypto, Gold) to calculate total Net Worth.

## Design Patterns & Logic
- **Action Classes (Business Logic):**
  - We use `App\Actions\Transactions\*` to encapsulate complex operations.
  - `CreateTransaction`: Handles simple single-entry inserts.
  - `UpdateTransaction`: Handles edits while creating an audit log in `transaction_histories`.
  - `CreateTransfer`: Wraps two inserts (expense & income) and a transfer record in a single Database Transaction to ensure atomicity.
- **Fat Model / Thin Controller:**
  - Controllers only handle validation (via FormRequest) and calling Action classes or Inertia renders.

## Frontend Architecture Note
- The project utilizes Inertia.js with React. 
- API endpoints are not needed for internal UI navigation; data is passed via Inertia props.
- Use Wayfinder (`@laravel/vite-plugin-wayfinder`) for generating frontend route helpers instead of hardcoding URLs.
