# 🚀 TypeScript Full-Stack Base Template

Your universal starter template for rapidly building Full-Stack applications. This architecture is based on separate directories for Frontend and Backend within a single repository (Monorepo-style), fully typed using TypeScript.

---

## 📂 Project Structure

```text
my-base-fullstack/
├── backend/                  # REST API (Express + TypeScript)
│   ├── src/
│   │   ├── config/          # Environment variables, database configs
│   │   ├── middleware/      # Auth, error handling, validation (Zod)
│   │   ├── models/          # Database schemas / Models
│   │   ├── routes/          # API route definitions
│   │   ├── types/           # Custom TS types for backend
│   │   └── app.ts           # Application entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # User Interface (React + Vite + TS)
│   ├── src/
│   │   ├── assets/          # Images, static assets, icons
│   │   ├── components/      # Global, reusable UI components
│   │   ├── context/         # Global state (e.g., AuthContext)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components / Views
│   │   ├── types/           # TS type declarations for frontend
│   │   ├── utils/           # Helper functions and utilities
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                # Global Git ignore file
├── package.json              # Root package.json for managing the entire repo
└── README.md                 # This documentation

---

## 🛠️ Tech Stack & Main Packages

### Backend
* **Express** – HTTP server[cite: 1].
* **TypeScript** – Static typing[cite: 1].
* **tsx** – Tool for running `.ts` files on the fly in watch mode (`node` for TypeScript)[cite: 1].
* **Zod** – Schema validation (reliable request validation at both runtime and compilation levels)[cite: 1].
* **Cors** & **Dotenv** – Security and environment variable configuration[cite: 1].

### Frontend
* **React + Vite** – Fast, modern development environment[cite: 1].
* **React Router Dom** – Frontend routing management[cite: 1].
* **Axios** / **React Query** – Robust API communication[cite: 1].
* **Lucide React** – Lightweight icon set[cite: 1].

---

## ⚡ Quick Start (Running the App)

Everything is configured and run from the **root directory**.

### 1. Project Setup (One-Step Installation)
To install all dependencies (root, backend, frontend) and automatically generate your backend `.env` file, run the following command in the root folder:

```bash
npm run dev:install

### 2. Development Mode (Both servers simultaneously)

```bash
npm run dev
```[cite: 1]
Thanks to `concurrently`, this command will launch in parallel:
* Backend API on `http://localhost:5000` (or your chosen port)[cite: 1]
* React Application on `http://localhost:5173`[cite: 1]

---

## 📝 Useful Scripts (Root `package.json`)

* `npm run dev` – Installs dependencies and maked .env files in both /frontend and/backend[cite: 1].
* `npm run dev` – Runs both backend and frontend simultaneously in watch mode[cite: 1].
* `npm run dev:backend` – Runs only the Express server[cite: 1].
* `npm run dev:frontend` – Runs only the React application (Vite)[cite: 1].

---

## 💡 Snippets for Future Reference

### Example Controller with Zod Validation (`backend/src/routes/user.router.ts`)
```typescript
import { Request, Response } from 'express';
import { z } from 'zod';

// Define the validation schema
const UserRegisterSchema = z.object({
  email: z.string().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    // Safely parse and type-check data from request body
    const validatedData = UserRegisterSchema.parse(req.body);

    // Business logic (e.g., saving to database)
    res.status(201).json({ success: true, data: { email: validatedData.email } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
       res.status(400).json({ success: false, errors: error.errors });
       return;
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};
```[cite: 1]

### Example Axios Instance (`frontend/src/services/api.ts`)
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach JWT token (optional)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```[cite: 1]
````
