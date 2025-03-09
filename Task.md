📆 Planning Task: Web Dev 2025
🚀 Goal:
Fitur Operator harus selesai dulu.
Fitur Opsional yang penting harus ada.
Terakhir, Refactoring biar kode lebih rapi.
📌 Hari 1: Fokus Fitur Operator (Wajib)
1. Backend
✅ Buat endpoint GET /work-orders/assigned → Fetch work order yang ditugaskan ke operator. (DONE + FRONTEND)
✅ Buat endpoint PATCH /work-orders/:id/status → Update status (Pending → In Progress → Completed). (DONE)
✅ Tambahkan validasi jumlah quantity saat update status ke Completed. (Done)

2. Frontend (Svelte)
✅ Buat halaman Operator untuk melihat work order yang ditugaskan. (DONE)
✅ Buat fitur update status:

Tombol Mulai (Pending → In Progress).
Tombol Selesaikan (In Progress → Completed) dengan input quantity. (DONE-FUTURE IMPROVE WITH INPUT QTY)
✅ Test & debug fitur Operator.

📌 Hari 2: Fix Bug & Tambah Fitur Opsional
1. Fix Bug Utama
🔲 Avatar tidak muncul → Cek path avatar & API response.
🔲 Delete work order tidak bisa → Cek API call & permission.
🔲 Perbaiki UI/UX jika ada yang aneh.

2. Fitur Opsional yang Paling Penting
🔲 Tracking Progres Work Order (Penting 🚀)

Buat field log tahapan produksi di backend.
Tambahkan fitur di frontend untuk mencatat tahapan produksi saat status In Progress.
🔲 Laporan Ringkas Work Order

Endpoint GET /reports/work-orders → Hitung total quantity per status.
Buat halaman laporan sederhana untuk admin.
Test semua fitur setelah ditambah.

📌 Hari 3: Refactoring & Finalisasi
1. Refactoring & Code Cleanup
🔲 Rapikan struktur folder & modul di backend (misal, pisah logic handler & service).
🔲 Refactor komponen di frontend (misal, buat ulang bagian yang duplikatif atau kurang clean).
🔲 Tambahkan komentar pada bagian kode yang rumit.
🔲 Pastikan semua API response konsisten formatnya.

2. Testing Akhir
🔲 Cek semua fitur dengan akun Admin & Operator.
🔲 Pastikan tidak ada bug fatal yang menghambat user.
🔲 Review UI/UX agar lebih nyaman digunakan.

🚀 Done & Siap Submit!

