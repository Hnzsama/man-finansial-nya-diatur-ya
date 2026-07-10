# 10. Domain-Driven Folder Structure

Seiring berkembangnya proyek manajemen keuangan ini, struktur bawaan Laravel dan React bisa menjadi *messy* (berantakan) jika logika bisnis hanya ditumpuk di Controller dan komponen React hanya ditaruh di 1 folder besar.

Dokumen ini merekomendasikan adaptasi *Domain-Driven Design (DDD)* ringan untuk Backend dan pola *Feature-Sliced* untuk Frontend.

## 1. Backend (Laravel: `app/`)
Pindahkan fokus dari arsitektur MVC murni ke arsitektur berbasis Domain.

```text
/app
  /Domains
    /Transactions
      /Actions       -> CreateTransaction, UpdateTransaction, TransferBalance
      /DTOs          -> TransactionData (untuk Data Transfer Object dari Request)
      /Models        -> Transaction, TransactionHistory, Transfer
      /Observers     -> TransactionObserver (trigger kalkulasi budget)
    /Wallets
      /Actions       -> AdjustBalance
      /Models        -> Wallet
    /Budgets
      ...
    /Goals
      ...
  
  /Http
    /Controllers
      /Api           -> (Kosong jika pure Inertia)
      /Web
        TransactionController.php -> Hanya validasi dan memanggil \App\Domains\Transactions\Actions\...
        WalletController.php
    /Requests        -> StoreTransactionRequest, dll.
```

### Keuntungan:
- **Separation of Concerns**: Logika transaksi tidak bercampur dengan logika dompet.
- Mudah di-test secara terisolasi (Unit Testing dengan Pest sangat terbantu oleh DTOs dan Action classes).

## 2. Frontend (React + Inertia: `resources/js/`)
Menerapkan pendekatan *Feature-Sliced Design* yang digabungkan dengan Radix UI.

```text
/resources/js
  /Components
    /ui              -> Komponen murni/dumb (Button, Input, Dropdown, Table dari shadcn/radix)
    /shared          -> Komponen lintas fitur (Navbar, Sidebar, PageHeader)

  /Features          -> Pengelompokan berdasarkan kapabilitas bisnis
    /Transactions
      /components    -> TransactionForm, TransactionList, TransactionFilter
      /hooks         -> useTransactionForm, useTransactions (fetching/filtering jika butuh query eksternal)
      /types         -> Definisi TypeScript untuk Transaksi
    /Wallets
      /components    -> WalletCard, WalletSelector
    /Analytics
      /components    -> CashFlowChart, ExpensePieChart

  /Layouts           -> AuthenticatedLayout, GuestLayout

  /Pages             -> Komponen root yang dipanggil oleh Inertia::render()
    /Dashboard
      Index.tsx      -> Mengimpor komponen dari /Features/Analytics dan /Features/Wallets
    /Transactions
      Index.tsx      -> Mengimpor <TransactionList /> dan <TransactionFilter />
    /Wallets
      Index.tsx

  /lib               -> Utility (formatCurrency, formatDate, cn / tailwind-merge)
  app.tsx            -> Setup Inertia & Wayfinder
```

### Keuntungan:
- **Keterbacaan Tinggi**: Sangat jelas di mana mencari komponen *Form Transaksi* (pasti di `Features/Transactions/components`).
- **Skalabilitas**: Jika fitur *Budgeting* ditambahkan, cukup buat folder `/Features/Budgets` tanpa mengotori folder fitur lain.
