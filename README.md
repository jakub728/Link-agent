# 🚀 Multi-Platform AI Content Generator (Full-Stack Base)

Uniwersalny panel menedżerski zintegrowany z AI, służący do automatycznego generowania oraz archiwizowania spersonalizowanych treści marketingowych na wiele platform społecznościowych jednocześnie. Architektura oparta jest na dwóch osobnych katalogach (`backend` i `frontend`) zarządzanych w jednym repozytorium.

---

## 📂 Struktura Projektu

```text
Full-Stack-Base/
├── backend/                  # REST API (Express + MongoDB + TypeScript)
│   ├── src/
│   │   ├── middleware/      # authMiddleware (weryfikacja JWT, wstrzykiwanie sesji i promptów)
│   │   ├── model/           # Schematy Mongoose (userSchema, prompt, generatedSchema)
│   │   ├── public/uploads   # Zdjęcia przekonwertowane z webpna jpg
│   │   ├── routes/          # Definicje ścieżek API (user.ts, prompt.ts, generate.ts)
│   │   ├── utils/           # Zmienne środowiskowe, połączenie z MongoDB
│   │   └── server.ts        # Punkt wejścia aplikacji backendowej
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Interfejs użytkownika (React + Vite + TS)
│   ├── src/
│   │   ├── components/      # Reużywalne komponenty UI (Formularze, historia generacji)
│   │   ├── context/         # Stan globalny sesji (AuthContext)
│   │   ├── pages/           # Widoki aplikacji (Dashboard, Ustawienia Promptów, Panel Admina)
│   │   ├── services/        # Komunikacja z API przez Axios
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
├── package.json              # Główny package.json do zarządzania całym repozytorium
└── README.md                 # Dokumentacja projektu