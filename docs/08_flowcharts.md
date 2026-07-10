# 08. Business Process Flowcharts

Flowchart ini memetakan logika operasional di balik layar untuk proses-proses penting.

## 1. Alur Pembuatan Transaksi (Income/Expense)
Proses standar saat pengguna memasukkan pengeluaran atau pemasukan baru.

```mermaid
flowchart TD
    Start([Mulai: Input Form Transaksi]) --> Validasi[Validasi Request Data]
    Validasi -- Gagal --> ReturnError([Tampilkan Pesan Error di UI])
    Validasi -- Sukses --> DB_Tx_Start[(Mulai Database Transaction)]
    DB_Tx_Start --> InsertTx[Insert ke Tabel transactions]
    
    InsertTx --> CekType{Tipe Transaksi?}
    CekType -- Expense --> KurangiSaldo[Kurangi current_balance Dompet]
    CekType -- Income --> TambahSaldo[Tambah current_balance Dompet]
    
    KurangiSaldo --> CekBudget{Ada Budget Aktif?}
    TambahSaldo --> SimpanHistory
    
    CekBudget -- Ya --> HitungProgress[Kalkulasi Progress Anggaran]
    HitungProgress --> CekLimit{Melebihi Limit?}
    CekLimit -- Ya --> Peringatan[Trigger Notifikasi/Event Limit Tercapai]
    CekLimit -- Tidak --> SimpanHistory
    CekBudget -- Tidak --> SimpanHistory
    
    Peringatan --> SimpanHistory
    
    SimpanHistory[Insert ke transaction_histories] --> DB_Tx_Commit[(Commit Database Transaction)]
    DB_Tx_Commit --> End([Selesai: Redirect & Sukses])
```

## 2. Alur Pembayaran Utang / Cicilan
Mencatat pengeluaran yang secara spesifik mengurangi sisa hutang.

```mermaid
flowchart TD
    Start([Mulai: Bayar Utang]) --> PilihUtang[Pilih Record Utang]
    PilihUtang --> Validasi[Validasi Nominal & Saldo Dompet]
    Validasi --> DB_Tx_Start[(Mulai DB Transaction)]
    
    DB_Tx_Start --> InsertTx[Buat Transaksi Pengeluaran & link ke debt_id]
    InsertTx --> KurangiDompet[Kurangi Saldo Dompet]
    KurangiDompet --> KurangiUtang[Kurangi remaining_amount pada Utang]
    
    KurangiUtang --> CekLunas{Sisa = 0?}
    CekLunas -- Ya --> SetLunas[Set status = paid_off]
    CekLunas -- Tidak --> DB_Tx_Commit
    
    SetLunas --> DB_Tx_Commit[(Commit DB Transaction)]
    DB_Tx_Commit --> End([Selesai])
```

## 3. Alur Automasi Subscriptions (Cron Job)
Cron job berjalan setiap hari di tengah malam untuk memproses tagihan berulang.

```mermaid
flowchart TD
    Start([Cron: Schedule Run Daily]) --> CariData[Query: Subscriptions where next_billing_date <= Hari Ini & is_active = true]
    CariData --> Loop[Loop Setiap Data Tagihan]
    
    Loop --> CreateTx[Buat Transaksi Pengeluaran Otomatis (via Action Class)]
    CreateTx --> UpdateWallet[Kurangi Saldo Dompet]
    
    UpdateWallet --> UpdateNextDate[Hitung & Set next_billing_date (Bulan/Tahun Depan)]
    UpdateNextDate --> Notifikasi[Kirim Notifikasi 'Tagihan Terpotong']
    Notifikasi --> CekSisaData{Masih ada data?}
    
    CekSisaData -- Ya --> Loop
    CekSisaData -- Tidak --> End([Selesai])
```
