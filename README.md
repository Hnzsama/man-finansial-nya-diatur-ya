# Personal Finance Application (Manajemen Finansial)

Aplikasi manajemen keuangan pribadi yang dibangun untuk penggunaan harian jangka panjang. Membantu Anda mencatat pemasukan dan pengeluaran, mengelola anggaran, melacak utang piutang, dan merencanakan target keuangan.

## 📚 Dokumentasi Proyek

Spesifikasi teknis, arsitektur, dan alur sistem didokumentasikan secara lengkap dan terpisah untuk memudahkan pengembangan. Silakan merujuk ke dokumen berikut:

### Core Architecture & Database
1. [01. Application Architecture](docs/01_architecture.md) - Rangkuman stack teknologi (Laravel 13, React 19, Inertia) dan pola desain sistem.
2. [02. Wallet Entity](docs/02_wallet.md) - Skema dan model dompet (Cash, Bank, e-Wallet).
3. [03. Category Entity](docs/03_category.md) - Skema dan model kategori transaksi berhierarki.
4. [04. Transaction Entity](docs/04_transaction.md) - Skema dan model tabel inti pencatatan arus kas dan riwayat (audit trail).
5. [05. Advanced Entities](docs/05_advanced_entities.md) - Skema entitas kompleks seperti Utang/Piutang, Tagihan Rutin, Anggaran, Target, dan Aset.

### System Visualization & Logic
6. [06. Entity Relationship Diagram (ERD)](docs/06_erd_visual.md) - Peta relasi antartabel database (Mermaid Diagram).
7. [07. Data Flow Diagram (DFD)](docs/07_dfd.md) - Diagram aliran data sistem dari hulu ke hilir.
8. [08. Business Process Flowcharts](docs/08_flowcharts.md) - Alur logika sistem untuk transaksi, pelunasan utang, dan *cron job* tagihan otomatis.
9. [09. Routing and Endpoints](docs/09_routing_and_endpoints.md) - Standar penamaan rute untuk *frontend* React dan *backend* Laravel menggunakan Wayfinder.
10. [10. Domain-Driven Folder Structure](docs/10_domain_folder_structure.md) - Pedoman struktur direktori agar kode rapi dan terukur di backend maupun frontend.

## 🚀 Tech Stack

*   **Backend**: Laravel 13, PHP 8.5
*   **Frontend**: React 19, Inertia.js v3
*   **Styling**: Tailwind CSS v4, Radix UI
*   **Database**: SQLite / MySQL
*   **Testing**: Pest PHP
# personal-finance
