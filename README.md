<h1 align="center">
  <img src="frontend/public/logo_cropped.png" width="100" alt="ScholarPath Logo"/><br/>
  ScholarPath – AI Scholarship Finder
</h1>

<p align="center">
  <b>Platform rekomendasi beasiswa berbasis AI yang membantu mahasiswa menemukan beasiswa paling relevan berdasarkan CV mereka.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-0.111+-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white"/>
</p>

---

## 📖 About the Project

**ScholarPath** adalah aplikasi web full-stack yang menggunakan teknik *Machine Learning* untuk merekomendasikan beasiswa yang paling cocok dengan profil dan CV pengguna. Sistem ini menggabungkan **Semantic Search** (Bi-Encoder) dan **BM25 keyword matching** dalam sebuah pipeline *Hybrid Retrieval* untuk menghasilkan rekomendasi yang akurat dan relevan.

Proyek ini dibuat sebagai **Final Project Mata Kuliah Machine Learning** Semester 6.

### ✨ Key Features

- 🤖 **AI-Powered Recommendations** — Hybrid matching antara BM25 (keyword) + Bi-Encoder Semantic Search
- 📄 **CV Upload & Parsing** — Upload CV dalam format PDF, teks diekstrak otomatis menggunakan PyMuPDF
- 🔍 **Browse & Search Scholarships** — Jelajahi ratusan beasiswa dengan filter dan pencarian
- 👤 **User Authentication** — Register, login, JWT-based auth, dan manajemen profil lengkap
- 💾 **Save Scholarships** — Simpan beasiswa favorit ke dashboard pribadi
- 📱 **Responsive Design** — Tampilan optimal di desktop maupun mobile
- 🖼️ **Avatar Upload** — Kustomisasi foto profil pengguna

---

## 🏗️ Architecture

```
scholarship-recom/
├── backend/                   # FastAPI Python backend
│   ├── main.py                # Entry point & middleware
│   ├── database.py            # SQLAlchemy DB setup (SQLite)
│   ├── models.py              # ORM models (User, Scholarship, etc.)
│   ├── ml_engine.py           # Hybrid ML recommendation engine
│   ├── init_db.py             # DB initialization & data seeding
│   ├── requirements.txt       # Python dependencies
│   ├── cache/                 # Pre-computed embeddings & BM25 index
│   ├── static/                # Uploaded avatars
│   └── routers/
│       ├── auth.py            # /api/auth — Register, Login, Profile
│       ├── scholarships.py    # /api/scholarships — CRUD & Browse
│       ├── cv.py              # /api/cv — PDF upload & text extraction
│       └── recommendations.py # /api/recommendations — ML inference
│
├── frontend/                  # React + Vite frontend
│   ├── index.html
│   ├── public/                # Static assets (logo, favicon)
│   └── src/
│       ├── App.jsx            # Root component & routing
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ScholarshipCard.jsx
│       └── pages/
│           ├── Landing.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Browse.jsx
│           ├── Dashboard.jsx
│           ├── UploadCV.jsx
│           ├── RecommendationResults.jsx
│           ├── ScholarshipDetail.jsx
│           ├── Profile.jsx
│           └── EditProfile.jsx
│
├── beasiswa_data.csv          # Dataset beasiswa (source data)
├── docker-compose.yml         # Optional: PostgreSQL via Docker
└── README.md
```

---

## 🤖 ML Pipeline

ScholarPath menggunakan pendekatan **Hybrid Retrieval** yang menggabungkan dua metode:

| Komponen | Model / Library | Peran |
|----------|----------------|-------|
| **Semantic Search** | `all-MiniLM-L6-v2` (Sentence Transformers) | Memahami makna kontekstual CV |
| **Keyword Matching** | BM25 (`rank-bm25`) | Mencocokkan kata kunci eksak |
| **PDF Parsing** | PyMuPDF (`fitz`) | Mengekstrak teks dari CV PDF |
| **Score Fusion** | Weighted combination | Menggabungkan skor BM25 + Semantic |

### Bobot Field Matching

```python
FIELD_WEIGHTS = {
    'konten' : 0.60,  # Isi/deskripsi beasiswa
    'nama'   : 0.25,  # Nama beasiswa
    'jenjang': 0.10,  # Jenjang pendidikan
    'negara' : 0.05,  # Negara tujuan
}
```

### Formula Hybrid Score

```
score      = α × BM25_normalized + (1-α) × Semantic_normalized
final_score = Σ (field_weight × field_score)
```

> Default: `α = 0.3` (lebih menekankan semantic similarity)

---

## 🛠️ Tech Stack

### Backend

| Library | Fungsi |
|---------|--------|
| **FastAPI** | REST API framework |
| **Uvicorn** | ASGI server |
| **SQLAlchemy** | ORM & database management |
| **SQLite** | Database (development) |
| **sentence-transformers** | Bi-Encoder semantic model (`all-MiniLM-L6-v2`) |
| **rank-bm25** | BM25 keyword retrieval |
| **PyMuPDF** | PDF text extraction |
| **PyJWT** | JSON Web Token auth |
| **passlib + bcrypt** | Password hashing |
| **pandas** | Data processing & CSV loading |
| **python-multipart** | File upload handling |

### Frontend

| Library | Fungsi |
|---------|--------|
| **React 18** | UI framework |
| **Vite 5** | Build tool & dev server |
| **React Router DOM v6** | Client-side routing |
| **Axios** | HTTP client |
| **Tailwind CSS 3** | Utility-first styling |
| **Lucide React** | Icon library |

---

## 🚀 Getting Started

### Prerequisites

- Python **3.11+**
- Node.js **18+** & npm
- Git

### 1. Clone Repository

```bash
git clone https://github.com/venndiagphragm/scholarship-recom.git
cd scholarship-recom
```

### 2. Setup Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database & seed scholarship data
python init_db.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

Backend berjalan di: **http://localhost:8000**  
Swagger API Docs: **http://localhost:8000/docs**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend berjalan di: **http://localhost:5173**

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/auth/register` | Registrasi pengguna baru | ❌ |
| `POST` | `/api/auth/login` | Login & mendapatkan JWT token | ❌ |
| `GET` | `/api/auth/me` | Data profil pengguna saat ini | ✅ |
| `PUT` | `/api/auth/me` | Update profil pengguna | ✅ |
| `POST` | `/api/auth/avatar` | Upload foto avatar | ✅ |
| `GET` | `/api/scholarships` | List semua beasiswa (dengan filter) | ❌ |
| `GET` | `/api/scholarships/{id}` | Detail beasiswa | ❌ |
| `POST` | `/api/scholarships/save/{id}` | Simpan beasiswa ke dashboard | ✅ |
| `GET` | `/api/scholarships/saved` | Beasiswa yang disimpan | ✅ |
| `POST` | `/api/cv/upload` | Upload CV PDF & ekstrak teks | ✅ |
| `POST` | `/api/recommendations` | Rekomendasi beasiswa dari CV | ✅ |

---

## 📁 Dataset

Dataset beasiswa (`beasiswa_data.csv`) berisi ratusan data beasiswa dengan field:

| Field | Deskripsi |
|-------|-----------|
| `nama` | Nama beasiswa |
| `konten` | Deskripsi lengkap & persyaratan |
| `jenjang` | Jenjang pendidikan (S1/S2/S3) |
| `negara` | Negara penyelenggara |
| `deadline` | Batas waktu pendaftaran |
| `link` | URL sumber resmi |

---

## 🔐 Authentication

Sistem menggunakan **JWT (JSON Web Token)** untuk autentikasi:

1. User melakukan login → server mengembalikan JWT token
2. Token disimpan di `localStorage` browser
3. Setiap request ke endpoint terproteksi menyertakan header: `Authorization: Bearer <token>`
4. Password di-hash menggunakan **bcrypt** sebelum disimpan ke database

---

## 🐳 Docker (Optional)

Untuk menjalankan PostgreSQL menggunakan Docker:

```bash
docker-compose up -d
```

> **Catatan:** Secara default aplikasi menggunakan **SQLite** untuk kemudahan development. Konfigurasi PostgreSQL tersedia di `docker-compose.yml` untuk production.

---

## 📄 License

This project is for academic purposes only.
   
 