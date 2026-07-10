# 07. Data Flow Diagram (DFD)

Dokumen ini memetakan bagaimana data mengalir di dalam sistem keuangan pribadi.

## Context Diagram (Level 0)

Diagram ini menunjukkan interaksi sistem dengan entitas eksternal (dalam hal ini, hanya Pengguna).

```mermaid
graph TD
    User([Pengguna])
    
    System((Sistem Keuangan Pribadi))
    
    User -- Input Transaksi, Konfigurasi Dompet, Anggaran --> System
    System -- Laporan Arus Kas, Notifikasi Anggaran, Sisa Saldo --> User
```

## DFD Level 1: Modul Utama

```mermaid
graph TD
    User([Pengguna])
    
    %% Proses Utama
    P1((1. Manajemen Dompet & Kategori))
    P2((2. Pencatatan Transaksi))
    P3((3. Pengawasan Anggaran))
    P4((4. Pelacakan Kekayaan & Utang))
    P5((5. Automasi Tagihan))

    %% Data Stores
    D1[(D1. Wallets & Categories)]
    D2[(D2. Transactions)]
    D3[(D3. Budgets & Goals)]
    D4[(D4. Assets & Debts)]
    D5[(D5. Subscriptions)]

    %% Aliran Manajemen Dompet
    User -- Buat Dompet/Kategori --> P1
    P1 -- Simpan --> D1
    D1 -- Info Dompet --> User

    %% Aliran Transaksi
    User -- Input Pemasukan/Pengeluaran --> P2
    D1 -- Validasi Dompet & Kategori --> P2
    P2 -- Update Saldo --> D1
    P2 -- Simpan Histori --> D2
    D2 -- Laporan Transaksi --> User

    %% Aliran Anggaran
    User -- Tetapkan Anggaran & Goal --> P3
    P3 -- Simpan --> D3
    D2 -- Akumulasi Pengeluaran --> P3
    P3 -- Peringatan Anggaran --> User

    %% Aliran Kekayaan
    User -- Input Aset / Catat Utang --> P4
    P4 -- Simpan --> D4
    D4 -- Laporan Net Worth --> User
    P2 -- Bayar Cicilan --> P4

    %% Aliran Tagihan
    User -- Set Tagihan Rutin --> P5
    P5 -- Simpan --> D5
    D5 -- Generate Transaksi Otomatis (Cron) --> P2
```

### Penjelasan:
1. **Manajemen Dompet**: Pintu masuk awal, mengatur saldo dan klasifikasi kategori.
2. **Pencatatan Transaksi**: Mengalirkan data nominal ke dompet (mengubah saldo) dan mencatatkan bukti historis di tabel transaksi.
3. **Pengawasan Anggaran**: Membaca agregasi dari tabel transaksi untuk membandingkan dengan batas *budget* yang ditetapkan.
4. **Automasi Tagihan**: Proses latar belakang (Cron job) yang membaca data *Subscriptions* dan memicu *Pencatatan Transaksi* secara otomatis di tanggal penagihan.
