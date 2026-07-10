# Personal Finance Application — AI Agent Brief

## Context

Saya sedang membangun aplikasi manajemen keuangan pribadi untuk penggunaan jangka panjang. Proyek ini sudah memiliki codebase dan konfigurasi sendiri. Jangan mengubah stack atau menambahkan teknologi baru sebelum melakukan analisis terhadap struktur proyek yang sudah ada.

Tugas pertama Anda adalah memahami arsitektur yang telah digunakan, pola penulisan kode, dependency, struktur folder, dan konvensi proyek.

Jangan membuat asumsi.

---

# Objective

Bangun aplikasi keuangan pribadi yang dapat digunakan setiap hari untuk:

* Mencatat pemasukan dan pengeluaran.
* Mengelola berbagai dompet dan rekening.
* Menganalisis kebiasaan finansial.
* Membuat anggaran bulanan.
* Melacak utang dan piutang.
* Mengelola target keuangan.
* Menghitung kekayaan bersih.
* Menyimpan histori keuangan dalam jangka panjang.

Fokus utama aplikasi ini adalah kegunaan nyata, bukan sekadar demo.

---

# Your First Task

Sebelum menulis kode apa pun:

1. Analisis seluruh struktur proyek.
2. Identifikasi framework frontend dan backend yang digunakan.
3. Identifikasi sistem routing.
4. Identifikasi ORM atau database layer.
5. Identifikasi sistem autentikasi.
6. Identifikasi pola state management.
7. Identifikasi library UI yang digunakan.
8. Identifikasi sistem build dan deployment.

Buat laporan singkat mengenai:

* Teknologi yang digunakan.
* Kelebihan dan kekurangan arsitektur saat ini.
* Potensi technical debt.
* Rekomendasi perbaikan.

Jangan mengubah arsitektur tanpa alasan yang kuat.

---

# Product Philosophy

Aplikasi harus memenuhi prinsip berikut:

* Cepat digunakan.
* Input transaksi tidak boleh rumit.
* Seluruh data harus mudah dicari.
* Dashboard harus memberikan insight.
* Riwayat data harus tersimpan permanen.
* UI harus bersih dan minim distraksi.
* Fokus pada penggunaan pribadi jangka panjang.

---

# Core Features

## Wallets & Accounts

Pengguna dapat memiliki banyak dompet atau rekening:

* Cash
* Bank
* E-wallet
* Rekening digital

Setiap dompet memiliki:

* Nama
* Jenis
* Saldo awal
* Saldo saat ini
* Warna
* Ikon
* Catatan

---

## Transactions

Jenis transaksi:

* Income
* Expense
* Transfer
* Adjustment

Setiap transaksi memiliki:

* Nominal
* Tanggal
* Dompet
* Kategori
* Catatan
* Tag
* Lampiran
* Metadata tambahan

Kemampuan:

* Filter.
* Pencarian.
* Sorting.
* Pagination.
* Undo transaksi.

---

## Categories

Kategori harus mendukung:

* Parent-child relationship.
* Ikon.
* Warna.
* Arsip kategori.
* Statistik per kategori.

Contoh:

Pengeluaran:

* Makanan
* Transportasi
* Belanja
* Hiburan
* Pendidikan

Pemasukan:

* Gaji
* Freelance
* Bonus

---

## Budgeting

Fitur budgeting:

* Budget bulanan.
* Budget tahunan.
* Budget per kategori.
* Progress penggunaan.
* Notifikasi batas.

Harus fleksibel dan mudah diperluas.

---

## Financial Goals

Contoh:

* Dana darurat.
* Laptop baru.
* Liburan.
* Kendaraan.

Fitur:

* Target nominal.
* Deadline.
* Progress.
* Riwayat kontribusi.

---

## Debt & Receivable

Mendukung:

* Utang.
* Piutang.
* Cicilan.
* Riwayat pembayaran.
* Pengingat jatuh tempo.

---

## Assets

Mendukung:

* Tabungan.
* Deposito.
* Emas.
* Saham.
* Crypto.
* Properti.

Harus dapat menghitung total net worth.

---

## Subscriptions & Bills

Contoh:

* Netflix.
* Spotify.
* Hosting.
* Domain.
* Internet.
* Listrik.

Fitur:

* Nominal.
* Siklus pembayaran.
* Pengingat.

---

## Analytics Dashboard

Dashboard harus menampilkan:

* Cash flow.
* Pemasukan bulan ini.
* Pengeluaran bulan ini.
* Tren bulanan.
* Kategori terbesar.
* Kalender transaksi.
* Perbandingan bulan sebelumnya.
* Distribusi pengeluaran.

Dashboard harus menjawab:

* Ke mana uang saya pergi?
* Apakah saya boros bulan ini?
* Apa kategori terbesar saya?
* Apakah saya mencapai target keuangan?

---

# Technical Requirements

AI agent harus:

* Mengikuti style code yang sudah ada.
* Menghindari duplikasi kode.
* Mengutamakan maintainability.
* Mengutamakan performa.
* Membuat struktur modular.
* Menambahkan dokumentasi.
* Menulis migration yang aman.
* Menambahkan validasi.
* Menghindari overengineering.

---

# Deliverables

Buat dokumen berikut:

1. Analisis arsitektur proyek saat ini.
2. ERD lengkap.
3. Struktur database.
4. Roadmap pengembangan.
5. Struktur folder yang direkomendasikan.
6. Daftar endpoint API.
7. Rencana pengujian.
8. Potensi masalah performa.
9. Daftar technical debt.
10. Prioritas fitur MVP.

---

# MVP Priority

Urutan pengerjaan:

Phase 1:

* Authentication
* Wallets
* Categories
* Transactions

Phase 2:

* Dashboard
* Budgeting
* Goals

Phase 3:

* Debt
* Assets
* Subscriptions

Phase 4:

* Analytics
* Automation
* Recommendation system

---

# Important Rules

* Jangan mengganti stack tanpa alasan kuat.
* Jangan menambahkan dependency yang tidak diperlukan.
* Jangan membuat solusi kompleks untuk masalah sederhana.
* Selalu jelaskan alasan teknis sebelum membuat perubahan besar.
* Prioritaskan pengalaman pengguna dibanding fitur tambahan.

Anggap proyek ini akan digunakan setiap hari selama bertahun-tahun.
