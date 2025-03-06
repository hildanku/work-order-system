To install dependencies:
```sh
bun install
```

To run:
```sh
bun run dev
```

open http://localhost:3000

# Coding Test: Web Dev 2025

### **TES KODING**

Sistem Manajemen Work Order untuk Manufaktur.

### **TUJUAN**

Membuat **aplikasi web** untuk mengelola **work order** dalam proses manufaktur, termasuk **pembuatan, pelacakan, dan pembaruan work order** dengan **role-based access control (RBAC)**.

### **DETAIL TUGAS**

1. **Role-Based Access Control (RBAC)**
Buat **dua peran pengguna** dengan hak akses yang berbeda:
    - **Peran** **Hak Akses:**
        - **Production Manager:** membuat work order, menetapkan operator, memperbarui status, melihat laporan.
        - **Operator:** melihat work order yang ditugaskan, memperbarui status work order dari **Pending ke In Progress** atau **In Progress ke Completed** dan menyertakan jumlah quantity perubahan status tersebut.
    - Simpan peran pengguna dalam tersebut ke dalam database.
2. **Manajemen Work Order (Fitur Utama)**
    - **Production Manager** dapat:
        - **Membuat work order** dengan detail berikut:
            - Nomor Work Order (Otomatis, contoh: WO-20240226-001),
            - Nama Produk,
            - Jumlah,
            - Tenggat Waktu Produksi,
            - Status (Pending, In Progress, Completed, Canceled), dan
            - Operator yang ditugaskan.
        - **Memperbarui work order** (mengubah status, menetapkan ulang operator).
        - **Melihat daftar work order** dengan filter (misalnya berdasarkan status atau tanggal).
    - **Operator** dapat:
        - **Melihat work order yang ditugaskan** kepadanya.
        - **Memperbarui status** work order ****dari **Pending ke In Progress** atau **In Progress ke Completed** dan menyertakan jumlah quantity perubahan status tersebut.
3. **Pelacakan Progres Work Order (Opsional)**
    - Operator dapat **mencatat keterangan tahapan produksi** ketika status work order **In Progress** (misalnya: “Pemotongan Selesai”, “Perakitan Dimulai”, dll).
    - Sistem mencatat **waktu yang dihabiskan** pada setiap status work order.
4. **Laporan (Opsional)**
    - Laporan rekapitulasi work order, dengan kolom:
        - nama barang,
        - total quantity dari masing-masing status (Pending, In Progress, Completed, Canceled).
    - Laporan hasil tiap operator, dengan kolom:
        - nama barang,
        - total quantity status Completed.

### **PERSYARATAN TEKNIS**

1. **Backend dan Frontend**: gunakan stack teknologi yang dikuasai untuk mempercepat pembuatan.
2. **Coding Assist**: dipersilahkan menggunakan AI untuk membantu development.
3. **Database**: gunakan relational database (MySQL atau PostgreSQL) dan sertakan file database yang dibuat ke dalam project folder.
4. **Deployment & Dokumentasi:**
    - Berikan **instruksi instalasi & setup** (README.md).
    - (Opsional) Gunakan **Docker** untuk mempermudah setup.

### **KRITERIA PENILAIAN**

1. **Implementasi RBAC** – Hak akses diterapkan sesuai dengan peran pengguna.
2. **Fungsionalitas** – Fitur berjalan dengan minimum bug.
3. **Kualitas Kode** – Bersih, mudah dipelihara, dan terstruktur dengan baik.
4. **Performa** – Query & respons API yang efisien.
5. **Keamanan** – Validasi input & kontrol akses yang benar.
6. **Skalabilitas** – Sistem dapat menangani jumlah work order yang lebih besar.

### TATA CARA

Kirimkan email balasan ke ***programmer@tspfittings.com*** dengan subject “Coding Test: Web Dev 2025” setelah selesai mengerjakan, dengan email berisi:

- Berapa aktual waktu yang kalian butuhkan menyelesaikan task tsb.
- Apa saja stack teknologi yang dipakai.
- Sertakan alamat/link public git repository.
- Jika menggunakan AI sebagai coding assist, ceritakan secara singkat tool dan cara penggunaannya (opsional).

### **DISCLAIMER**

Jika ada sesuatu yang kurang dipahami dari detail tugas tes koding ini, maka peserta dipersilahkan untuk mengartikan dan mengembangkan sesuai dengan pemahaman.

<aside>
⏰

Waktu terakhir pengerjaan di hari Senin, 10 Maret 2025 pukul 07.00 WIB.

</aside>
