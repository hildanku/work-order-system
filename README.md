# 🎟️ Project Setup Guide

## 🚀 Setup with Docker (Recommended)

1. **Copy** file `.env.example` lalu **rename** menjadi `.env`.
2. **Jalankan perintah berikut:**  
   ```sh
   docker compose up -d
   ```
3. **Selesai!** Aplikasi sekarang berjalan di latar belakang.

---

## ⚙️ Manual Setup

### 📌 Requirements:
Sebelum memulai, pastikan sistem kamu sudah terinstall:
1. **Docker CLI/Desktop**  
2. **JavaScript Runtime** seperti:
   - **Node.js & npm** atau  
   - **Bun** (opsional, jika ingin menggunakan runtime alternatif)

---

### 🛠️ Setup MySQL Container

#### **1️⃣ Persiapan Awal**
- Copy file `.env.example` lalu rename menjadi `.env`.

#### **2️⃣ Jalankan MySQL Container**
```sh
docker compose -f docker-manual/compose.yml up -d
```

#### **3️⃣ Install Dependencies (Backend)**
```sh
npm install
```

#### **4️⃣ Jalankan Migrasi Database**
```sh
npx drizzle-kit migrate
```

#### **5️⃣ Jalankan Backend**
```sh
npm run dev
```

#### **6️⃣ Setup Frontend**
Buka terminal baru, lalu jalankan:
```sh
cd web
npm install
```

#### **7️⃣ Jalankan Frontend**
```sh
npm run dev
```

#### **8️⃣ Buka Aplikasi di Browser**
Akses aplikasi melalui:  
[http://localhost:5173/](http://localhost:5173/)

## Postman Docs
- Sementara fitur Registrasi belum tersedia secara UI, untuk membuat akun bisa melalui Rest API dibawah
- https://www.postman.com/happifycode-5780/hildanku/collection/tv1ayvd/work-order-system?action=share&creator=25016670

## 🛠️ Stack Teknologi

### **Backend (API & Database)**
- **Runtime:** Bun & Node.js
- **Framework:** Hono
- **ORM:** Drizzle ORM
- **Database:** MySQL (mysql2)
- **Keamanan:**
  - JWT Authentication (jsonwebtoken, jose)
  - Password Hashing (argon2)
- **Validasi Data:** Zod
- **Konfigurasi Environment:** dotenv

### **Frontend (Web App)**
- **Framework:** SvelteKit
- **Bundler:** Vite
- **State Management:** @tanstack/svelte-query
- **UI & Styling:**
  - TailwindCSS
  - Bits UI
  - Lucide Svelte (ikon)
- **Form Handling:** Superforms & Formsnap
- **Linting & Formatting:**
  - ESLint
  - Prettier

### **Development & Tools**
- **Database Migration:** Drizzle Kit
- **Linting & Formatting:** ESLint, Prettier
- **Type Checking:** TypeScript, Svelte Check
- **Server Adapter:** @sveltejs/adapter-node (untuk deployment backend)

## Screenshot
- https://drive.google.com/drive/folders/13ZBXQnZ0y0-u1BFZ81MbgNWvX-9Lx6rr?usp=sharing