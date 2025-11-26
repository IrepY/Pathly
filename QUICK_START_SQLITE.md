# Pathly - Gyors Kezdés Útmutató

## 📋 Áttekintés

A Pathly egy Közösségi Útvonaltervező webalkalmazás, amely a felhasználókat segíti a közösségi közlekedés útvonalainak megtervezésében.

---

## ✅ Előfeltételek

- **Node.js**: v18+ (https://nodejs.org/)
- **npm**: v9+ (Node.js-sel együtt)
- **Git**: v2.30+
- ✅ **SQLite3**: Automatikus, nem szükséges telepítés!

---

## 🚀 Gyors Indítás (3 Lépés)

### 1. Projekt Beállítása

```bash
git clone <repo-url>
cd Pathly

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Adatbázis (Automatikus!)

Az adatbázis **automatikusan** létrehozódik az első Backend indításkor:
- Fájl: `backend/data/pathly.db`
- Schema: automatikusan inicializálódik
- Nincs extra beállítás szükséges!

### 3. Szervereink Indítása

**Terminal 1 - Backend (Port 5000):**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```

Nyisd meg: **http://localhost:3000**

---

## 🎯 Szervereink Státusza

| Komponens | URL | Status |
|-----------|-----|--------|
| Frontend | http://localhost:3000 | ✅ Futó |
| Backend API | http://localhost:5000 | ✅ Futó |
| Health Check | http://localhost:5000/health | ✅ Futó |
| SQLite DB | `backend/data/pathly.db` | ✅ Automatikus |

---

## 📦 SQLite Adatbázis

### Miért SQLite?
- ✅ Nincs külső szerver szükséges
- ✅ Automatikus inicializálás
- ✅ Egyetlen `.db` fájl az adatbázis
- ✅ Tökéletes fejlesztéshez
- ✅ Könnyedén upgradhető később

### Adatbázis Schema

Tábláink:
- **users** - Felhasználói fiókok
- **user_preferences** - Beállítások
- **stops** - Megálló pontok
- **transit_routes** - Járművek útvonalai
- **trips** - Járatások
- **stop_times** - Menetrend
- **saved_routes** - Mentett útvonalak
- **vehicle_positions** - Valós idő
- **service_alerts** - Figyelmeztetések
- **audit_logs** - GDPR naplók

### Adatbázis Megtekintése

SQLite Studio (GUI):
https://www.sqlitestudio.pl/

Vagy SQLite CLI:
```bash
sqlite3 backend/data/pathly.db
```

---

## 🔐 Konfigurálás

### Backend `.env` Fájl

`backend` mappában - automatikus alapértelmezésekkel:

```
PORT=5000
NODE_ENV=development
DATABASE_PATH=data/pathly.db
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Frontend Konfigurálása

`frontend` mappában - `.env.local`:

```
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
```

---

## 🧪 API Tesztelés

### Health Check

```bash
curl http://localhost:5000/health
```

**Válasz:**
```json
{
  "status": "OK",
  "timestamp": "2024-11-26T16:45:00.000Z",
  "environment": "development"
}
```

### Regisztráció

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@pathly.com",
    "password": "SecurePass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 🛠️ Fejlesztői Parancsok

### Backend

```bash
cd backend

npm run dev      # Fejlesztői szerver (hot-reload)
npm build        # Build
npm test         # Tesztek
npm run lint     # ESLint
```

### Frontend

```bash
cd frontend

npm run dev      # Fejlesztői szerver
npm run build    # Build
npm run preview  # Preview
npm run lint     # ESLint
```

---

## 📂 Projekt Szerkezete

```
Pathly/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfiguráció
│   │   ├── controllers/     # Üzleti logika
│   │   ├── middleware/      # Middleware-ek
│   │   ├── routes/          # API végpontok
│   │   ├── services/        # Szervízek
│   │   └── utils/           # Segédfüggvények
│   ├── data/
│   │   └── pathly.db        # SQLite DB (auto)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Oldalak
│   │   ├── components/      # Komponensek
│   │   ├── stores/          # Zustand
│   │   ├── api/             # API kliens
│   │   └── utils/           # Segédfüggvények
│   └── package.json
├── database/
│   └── init.sqlite.sql      # SQLite schema
├── docs/                     # Dokumentáció
└── README.md
```

---

## 🐛 Hibaelhárítás

### Backend nem indul

```bash
cd backend
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Frontend nem indul

```bash
cd frontend
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Port foglalt

```bash
# Windows - Port keresése
netstat -ano | findstr :5000

# Folyamat leállítása
taskkill /PID <PID> /F

# Vagy másik port
PORT=5001 npm run dev
```

### SQLite adatbázis hibák

```bash
# Adatbázis fájl törlése (új inicializáláshoz)
rm backend/data/pathly.db

# Backend indítása (újra létrehozza)
cd backend && npm run dev
```

---

## 📚 Dokumentáció

- **API Reference**: `docs/API.md`
- **Fejlesztői Útmutató**: `docs/DEVELOPMENT.md`
- **SRS Implementáció**: `docs/SRS_IMPLEMENTATION.md`

---

## 🎯 Következő Lépések

1. ✅ Projekt beállítása
2. ✅ Szervereik indítása
3. 📝 Regisztráció tesztelése: http://localhost:3000/register
4. 🔍 API végpontok tesztelése
5. 💻 Fejlesztés!

---

## ✨ Szószerint Futó Szervereink

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **SQLite DB**: `backend/data/pathly.db`

Jó fejlesztést! 🚀
