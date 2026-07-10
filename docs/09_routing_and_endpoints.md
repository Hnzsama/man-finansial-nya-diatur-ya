# 09. Routing and Endpoints Architecture

Dalam arsitektur *monolith modern* menggunakan Laravel + Inertia.js, API eksternal (REST) jarang digunakan. Semua permintaan diarahkan ke *controller* yang akan mengembalikan respons berupa tampilan Inertia (`Inertia::render`) untuk GET request, atau *Redirect* untuk POST/PUT/DELETE.

## Penggunaan Laravel Wayfinder
Proyek ini mengimplementasikan package `laravel/wayfinder` dan `@laravel/vite-plugin-wayfinder`. Tujuannya adalah agar *frontend* React (TypeScript) tidak pernah men-*hardcode* URL string.

Contoh buruk di React: `<form action="/transactions" method="POST">`
Contoh baik di React: `router.post(wayfinder('transactions.store'))`

## Arsitektur Named Routes

Berikut adalah daftar rute wajib beserta nama resminya (`name()`) yang harus konsisten digunakan oleh Frontend:

### 1. Wallets (Dompet)
| Method | Endpoint | Named Route | Controller Action | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/wallets` | `wallets.index` | `WalletController@index` | Menampilkan daftar dompet (Inertia View) |
| GET | `/wallets/create` | `wallets.create` | `WalletController@create` | (Opsional) Jika form tidak dalam modal |
| POST | `/wallets` | `wallets.store` | `WalletController@store` | Menyimpan dompet baru |
| PUT | `/wallets/{wallet}` | `wallets.update` | `WalletController@update` | Memperbarui dompet |
| DELETE | `/wallets/{wallet}` | `wallets.destroy` | `WalletController@destroy`| Menghapus dompet (Soft delete) |

### 2. Categories (Kategori)
| Method | Endpoint | Named Route | Controller Action | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/categories` | `categories.index` | `CategoryController@index` | Daftar kategori (Parent & child) |
| POST | `/categories` | `categories.store` | `CategoryController@store` | Simpan kategori |
| PUT | `/categories/{category}` | `categories.update`| `CategoryController@update`| Update kategori |

### 3. Transactions (Transaksi Inti)
| Method | Endpoint | Named Route | Controller Action | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/transactions` | `transactions.index` | `TransactionController@index`| Laporan/Tabel transaksi (Paginasi) |
| POST | `/transactions` | `transactions.store` | `TransactionController@store`| Create Income/Expense |
| PUT | `/transactions/{tx}` | `transactions.update` | `TransactionController@update`| Update transaksi + generate histori |
| DELETE| `/transactions/{tx}` | `transactions.destroy`| `TransactionController@destroy`| Hapus (revert saldo dompet) |

### 4. Transfers (Pemindahan Saldo)
| Method | Endpoint | Named Route | Controller Action | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/transfers` | `transfers.store` | `TransferController@store` | Trigger Action `CreateTransfer` |

### 5. Advanced & Analytics
| Method | Endpoint | Named Route | Controller Action | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/dashboard` | `dashboard` | `DashboardController@index`| Merangkum metric cashflow, budget |
| GET | `/budgets` | `budgets.index` | `BudgetController@index` | |
| POST | `/budgets` | `budgets.store` | `BudgetController@store` | |
| GET | `/goals` | `goals.index` | `GoalController@index` | |
| GET | `/assets` | `assets.index` | `AssetController@index` | |

## Pola Response Inertia
- **Sukses (Mutation)**: `return back()->with('success', 'Transaksi berhasil dicatat');`
- **Gagal (Validasi)**: Otomatis ditangani Laravel FormRequest, error dipassing ke `props.errors` di React.
- **Baca Data (Query)**: `return Inertia::render('Transactions/Index', ['transactions' => $data]);`
