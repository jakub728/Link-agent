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

## 🛠️ Pełny Tech Stack & Architektura Systemu

### 🗄️ Backend (API & Serwer)
* **Node.js (v22+) & Express** – Środowisko uruchomieniowe oraz lekki framework HTTP do budowania skalowalnych i szybkich architektur REST API.
* **TypeScript** – Ścisłe typowanie na poziomie kompilacji, minimalizujące błędy typu `runtime` i ułatwiające refaktoryzację kodu.
* **tsx (TypeScript Execute)** – Nowoczesny, superszybki runner (oparty na esbuild), służący do automatycznego przeładowywania serwera (`watch mode`) podczas dewelopmentu bez narzutu czasowego ts-node.

### 🧠 Sztuczna Inteligencja & Prompt Engineering
* **LLM Engine (Zintegrowane API OpenAI / Anthropic)** – Silnik generatywny odpowiedzialny za transformację wpisów użytkownika w gotowe posty social media.
* **Dynamic Prompt Component** – Architektura backendowa wstrzykująca dedykowane parametry konfiguracyjne (`systemPrompt`, wytyczne dla platform) przed wysłaniem zapytania do AI.

### 💾 Baza Danych & Persystencja
* **MongoDB (NoSQL)** – Elastyczna, dokumentowa baza danych, idealna do przechowywania dynamicznych struktur danych (takich jak spersonalizowane zestawy promptów o zmiennych polach).
* **Mongoose (ODM)** – Warstwa modelowania danych dla MongoDB, zapewniająca rygorystyczną walidację (`runValidators`), rzutowanie typów oraz relacyjne powiązania dokumentów za pomocą mechanizmu `.populate()`.

### 🔐 Bezpieczeństwo & Autoryzacja
* **JSON Web Tokens (JWT)** – Szyfrowane tokeny sesyjne, zawierające bezpieczny payload z tożsamością użytkownika (`userId`, `login`, `role`, `promptsId`).
* **HTTP-Only Cookies** – Przesyłanie tokenów w zabezpieczonych ciasteczkach z flagami chroniącymi przed atakami typu XSS (Cross-Site Scripting) oraz CSRF.
* **bcryptjs** – Zoptymalizowana, niezależna od platformy implementacja algorytmu haszowania haseł (zapobiega problemom z kompilacją natywnych bibliotek C++ na systemach Windows).

### 💻 Frontend (Interfejs Użytkownika)
* **React 19 & Vite** – Ekstremalnie szybki bundler oraz biblioteka komponentów realizująca architekturę SPA (Single Page Application).
* **React Router Dom** – Deklaratywne zarządzanie trasami w aplikacji z wbudowanymi strażnikami dostępu (`Protected Routes`) na bazie roli użytkownika.
* **Axios (z obsługą State Lifecycle)** – Klient HTTP skonfigurowany pod kątem automatycznego dołączania ciasteczek (`withCredentials: true`) oraz globalnej obsługi błędów sieciowych.
* **Tailwind CSS** – Narzędzie utility-first do błyskawicznego tworzenia responsywnego i nowoczesnego interfejsu panelu administracyjnego.
* **Lucide React** – Zoptymalizowany zestaw wektorowych ikon (SVG) dostosowany do paneli typu dashboard.

---

## 🔄 Przepływ Danych w Aplikacji (Data Flow)

Aplikacja działa w oparciu o bezpieczny, scentralizowany obieg informacji. Użytkownik końcowy nie ma bezpośredniego wpływu na kluczowe parametry bazy danych:

1. **Uwierzytelnienie:** Użytkownik loguje się, a serwer umieszcza zaszyfrowany token w ciasteczku `auth_token`.
2. **Autoryzacja (Middleware):** Każde zapytanie (np. o generowanie treści lub zmianę promptu) przechodzi przez `checkToken`. Middleware dekoduje ciasteczko, pobiera pełny profil ustawień z MongoDB i wstrzykuje go do obiektu żądania jako `req.user` oraz `req.userConfig`.
3. **Generowanie i Zapis:** Podczas tworzenia treści, system automatycznie pobiera ID autora z sesji (`req.user.userId`), wiąże je relacją z nowym dokumentem i zapisuje historię w kolekcji `Generated`.
```
