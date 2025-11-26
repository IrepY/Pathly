# Pathly - Gyors Indítási Útmutató

## ✅ Jelenlegi Státusz

### Szererek
- ✅ **Backend** fut: http://localhost:5000
- ✅ **Frontend** fut: http://localhost:3000
- ⏳ **Adatbázis** - Beállítás szükséges

## 🚀 Szerver Indítása

### Backend (Port 5000)
```bash
cd backend
npm run dev
```

### Frontend (Port 3000)
```bash
cd frontend  
npm run dev
```

## 📊 Adatbázis Beállítása

### Lehetőség 1: PostgreSQL Lokálisan (Ajánlott Fejlesztéshez)

#### Telepítés Windows-on

1. **PostgreSQL letöltése**: https://www.postgresql.org/download/windows/
2. **Installer futtatása** (jelöld meg `psql` és `pgAdmin` komponenseket)
3. **Adatbázis létrehozása**:
   ```bash
   psql -U postgres
   ```
   Majd a psql shell-ben:
   ```sql
   CREATE DATABASE pathly;
   ```

4. **Séma inicializálása**:
   ```bash
   psql -U postgres -d pathly -f database/init.sql
   ```

5. **.env beállítása** (`backend/.env`):
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=pathly
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

### Lehetőség 2: Docker (Ajánlott Termeléshez)

```bash
docker-compose up --build
```

Ez automatikusan elindul:
- PostgreSQL (Port 5432)
- Backend API (Port 5000)
- Frontend (Port 3000)

### Lehetőség 3: Cloud Database

- **Railway**: https://railway.app
- **Heroku Postgres**: https://www.heroku.com/postgres
- **AWS RDS**: https://aws.amazon.com/rds/
- **Google Cloud SQL**: https://cloud.google.com/sql

## 🌐 Böngészőben Megnyitás

Nyisd meg a böngészőt:
```
http://localhost:3000
```

## 🧪 Teszt Felhasználó

1. **Kattints a "Regisztráció" gombra**
2. **Töltsd ki az adatokat**:
   - Email: `test@example.com`
   - Jelszó: `Test123456`
   - Teljes név: `Test Felhasználó`
3. **Kattints "Regisztráció"**

## 🔧 Fejlesztői Üzemmód Parancsok

### Backend
```bash
cd backend

# Dev szerver (hot reload)
npm run dev

# Build
npm run build

# Linting
npm run lint

# Tesztek
npm test
```

### Frontend
```bash
cd frontend

# Dev szerver
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linting
npm run lint
```

## 📱 API Elérés

### Teszt Endpoint

```bash
# Backend health check
curl http://localhost:5000/health
```

Válasz:
```json
{
  "status": "OK",
  "timestamp": "2024-11-26T...",
  "environment": "development"
}
```

## 🛠️ Troubleshooting

### "Backend szerver nem indul"
```bash
cd backend
npm install
npm run dev
```

### "Frontend betöltési hiba"
```bash
cd frontend
npm install
npm run dev
```

### "Port már használatban"
```powershell
# Port felszabadítása (pl. 5000)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### "npm módulok hibája"
```bash
npm cache clean --force
npm install
```

## 📚 Dokumentáció

- **API Dokumentáció**: `/docs/API.md`
- **Fejlesztői Útmutató**: `/docs/DEVELOPMENT.md`
- **SRS Implementáció**: `/docs/SRS_IMPLEMENTATION.md`
- **Teljes Setup**: `/SETUP.md`

## 🎯 Következő Lépések

1. ✅ Backend & Frontend futása
2. ⏳ **Adatbázis beállítása** (fentebb lásd)
3. Regisztrálj és teszteld az alkalmazást
4. Olvasd el a `/docs/` mappában lévő dokumentációkat

---

**Gratulálunk!** Az alkalmazás futása megkezdődött! 🚀
