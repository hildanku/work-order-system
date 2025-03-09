# 🎟️ Project Setup Guide  

## 🚀 Setup with Docker (Recommended)  

1. **Copy** the `.env.example` file and **rename** it to `.env`.  
2. **Run the following command:**  
   ```sh
   docker compose up -d
   ```  
3. **Done!** The application is now running in the background.  

---

## ⚙️ Manual Setup  

### 📌 Requirements:  
Before starting, make sure your system has:  
1. **Docker CLI/Desktop**  
2. **JavaScript Runtime** such as:  
   - **Node.js & npm**, or  
   - **Bun** (optional, if you want to use an alternative runtime)  

---

### 🛠️ Setup MySQL Container  

#### **1️⃣ Initial Preparation**  
- Copy the `.env.example` file and rename it to `.env`.  

#### **2️⃣ Run the MySQL Container**  
```sh
docker compose -f docker-manual/compose.yml up -d
```

#### **3️⃣ Install Dependencies (Backend)**  
```sh
npm install
```

#### **4️⃣ Run Database Migration**  
```sh
npx drizzle-kit migrate
```

#### **5️⃣ Start the Backend**  
```sh
npm run dev
```

#### **6️⃣ Setup Frontend**  
Open a new terminal and run:  
```sh
cd web
npm install
```

#### **7️⃣ Start the Frontend**  
```sh
npm run dev
```

#### **8️⃣ Open the Application in Browser**  
Access the application at:  
[http://localhost:5173/](http://localhost:5173/)

## Postman Docs  
- Since the Registration feature is not yet available via UI, you can create an account using the following API:  
- [https://www.postman.com/happifycode-5780/hildanku/collection/tv1ayvd/work-order-system?action=share&creator=25016670](https://www.postman.com/happifycode-5780/hildanku/collection/tv1ayvd/work-order-system?action=share&creator=25016670)

## 🛠️ Tech Stack  

### **Backend (API & Database)**  
- **Runtime:** Bun & Node.js  
- **Framework:** Hono  
- **ORM:** Drizzle ORM  
- **Database:** MySQL (mysql2)  
- **Security:**  
  - JWT Authentication (jsonwebtoken, jose)  
  - Password Hashing (argon2)  
- **Data Validation:** Zod  
- **Environment Configuration:** dotenv  

### **Frontend (Web App)**  
- **Framework:** SvelteKit  
- **Bundler:** Vite  
- **State Management:** @tanstack/svelte-query  
- **UI & Styling:**  
  - TailwindCSS  
  - Bits UI  
  - Lucide Svelte (icons)  
- **Form Handling:** Superforms & Formsnap  
- **Linting & Formatting:**  
  - ESLint  
  - Prettier  

### **Development & Tools**  
- **Database Migration:** Drizzle Kit  
- **Linting & Formatting:** ESLint, Prettier  
- **Type Checking:** TypeScript, Svelte Check  
- **Server Adapter:** @sveltejs/adapter-node (for backend deployment)  

## Screenshot  
- [Google Drive Folder](https://drive.google.com/drive/folders/13ZBXQnZ0y0-u1BFZ81MbgNWvX-9Lx6rr?usp=sharing)

