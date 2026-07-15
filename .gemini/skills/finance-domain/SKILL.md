# Finance Domain Rules

Selalu perlakukan aplikasi ini sebagai aplikasi keuangan pribadi jangka panjang.

## Prinsip

- Seluruh transaksi bersifat immutable.
- Jangan pernah menghapus data transaksi secara permanen.
- Gunakan soft delete jika diperlukan.
- Selalu simpan histori perubahan saldo.
- Saldo dompet dihitung dari transaksi, bukan disimpan secara manual.

---

## Transaction Types

Gunakan empat jenis transaksi:

- income
- expense
- transfer
- adjustment

---

## Wallet Rules

Wallet dapat berupa:

- cash
- bank
- e-wallet
- investment

Wallet memiliki:

- name
- type
- color
- icon
- opening_balance
- archived_at

---

## Categories

Kategori mendukung:

- nested categories
- icon
- color
- archived state

---

## Financial Goals

Goals memiliki:

- target amount
- current amount
- deadline
- progress history

---

## Debt & Receivables

Setiap utang wajib memiliki:

- lender / borrower
- amount
- due date
- payment history

---

Jangan membuat logika keuangan tanpa menjelaskan konsekuensi bisnisnya.