# Global Agent Rules

Sebelum melakukan perubahan apa pun pada project ini, ikuti seluruh aturan berikut.

---

# Workflow

Selalu ikuti urutan berikut:

1. Analisis codebase terlebih dahulu.
2. Jelaskan apa yang dipahami.
3. Jelaskan rencana implementasi.
4. Sebutkan file yang akan diubah.
5. Tunggu konfirmasi jika perubahan bersifat besar.
6. Baru mulai menulis kode.

Jangan langsung menulis kode tanpa memahami konteks.

---

# Architecture

- Ikuti arsitektur yang sudah ada.
- Jangan mengganti stack.
- Jangan menambahkan dependency tanpa alasan kuat.
- Jangan mengubah pola folder tanpa kebutuhan nyata.
- Jangan melakukan refactor besar tanpa diminta.

Jika ada beberapa solusi:

- jelaskan trade-off;
- pilih solusi paling sederhana;
- prioritaskan maintainability.

---

# Coding Standards

Prioritaskan:

1. Readability.
2. Maintainability.
3. Consistency.
4. Performance.

Hindari:

- overengineering;
- abstraction berlebihan;
- magic string;
- duplicated code;
- utility yang terlalu generik.

---

# File Rules

Jangan:

- membuat file lebih dari 500 baris;
- membuat function lebih dari 50 baris;
- membuat component yang memiliki terlalu banyak tanggung jawab.

Jika file menjadi besar:

- pecah menjadi module;
- ekstrak logic;
- gunakan helper atau composable.

---

# Database Rules

Sebelum membuat migration:

- jelaskan alasan bisnis;
- jelaskan relasi tabel;
- jelaskan dampak performa.

Wajib:

- foreign key;
- index;
- timestamps.

Jangan:

- menyimpan data yang bisa dihitung ulang;
- menggunakan JSON tanpa alasan kuat;
- menduplikasi data.

---

# Frontend Rules

Prioritaskan:

- mobile first;
- keyboard friendly;
- dark mode;
- akses cepat;
- loading state;
- empty state;
- error state.

Jangan:

- membuat nested modal;
- menambahkan animasi berlebihan;
- membuat UI yang memperlambat input transaksi.

---

# Backend Rules

Gunakan:

- validation;
- authorization;
- policy;
- service jika memang diperlukan.

Jangan membuat:

- repository pattern tanpa alasan;
- service layer untuk CRUD sederhana;
- helper global berlebihan.

---

# API Rules

Gunakan:

- pagination;
- filtering;
- sorting;
- searching.

Response API:

```json
{
    "data": {},
    "meta": {},
    "message": ""
}
```

Jangan mengekspos data internal.

---

# Security Rules

Wajib:

- validasi semua input;
- sanitasi data;
- cek authorization;
- hindari N+1 query;
- hindari mass assignment.

Jangan:

- menyimpan secret di frontend;
- hardcode token;
- hardcode URL.

---

# Financial Rules

Data keuangan sangat sensitif.

Jangan:

- menghapus transaksi permanen;
- mengubah histori transaksi tanpa audit;
- menghitung saldo secara manual.

Selalu:

- simpan histori;
- catat perubahan saldo;
- jelaskan dampak perubahan data.

---

# Testing Rules

Untuk fitur penting:

- buat unit test;
- buat feature test;
- uji edge case;
- uji validasi.

Prioritas testing:

1. Transaction.
2. Wallet.
3. Budget.
4. Debt.
5. Goal.

---

# Before Finishing

Sebelum menyelesaikan tugas:

- pastikan tidak ada duplikasi;
- pastikan type aman;
- pastikan konsisten dengan codebase;
- jelaskan keputusan teknis;
- sebutkan potensi masalah.

---

# Golden Rule

Aplikasi ini akan digunakan setiap hari selama bertahun-tahun.

Selalu pilih solusi yang:

- sederhana;
- mudah dipahami;
- mudah dirawat;
- mudah dikembangkan.