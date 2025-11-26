# Pathly - Telepítési és Futtatási Útmutató

## Gyors Kezdés (5 perc)

### 1. Előfeltételek
- Node.js 18+ ([letöltés](https://nodejs.org/))
- PostgreSQL 16+ ([letöltés](https://www.postgresql.org/download/))
- Git

### 2. Repository klónozása
```bash
git clone https://github.com/IrepY/Pathly.git
cd Pathly
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Szerkeszd a `.env` fájlt:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pathly
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-here
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

### 5. Adatbázis inicializálása

```bash
# PostgreSQL psql shell-ben
psql -U postgres

# Majd ezeket a parancsokat futtasd:
CREATE DATABASE pathly;
\q

# Ezután az init.sql-t:
psql -U postgres -d pathly -f ../database/init.sql
```

### 6. Szerver indítása

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Ellenőrzés: `curl http://localhost:5000/health`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Nyisd meg a böngészőt: `http://localhost:3000`

## Docker-el (Ajánlott Termeléshez)

### Előfeltételek
- Docker
- Docker Compose

### Futtatás
```bash
docker-compose up --build
```

Backend: `http://localhost:5000`
Frontend: `http://localhost:3000`

## Teszt Felhasználó

### Regisztráció
1. Menj a `http://localhost:3000/register` oldalra
2. Töltsd ki az e-mail és jelszó mezőket
3. Kattints a "Regisztráció" gombra

### Bejelentkezés
1. Menj a `http://localhost:3000/login` oldalra
2. Használd az imént regisztrált adataidat

## Projekt Szerkezet

```
Pathly/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Szerver belépési pont
│   │   ├── routes/           # Route definíciók
│   │   ├── controllers/      # Üzleti logika
│   │   ├── services/         # Függő szolgáltatások
│   │   ├── middleware/       # Middleware-ek
│   │   └── utils/            # Segédfunkciók
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx          # React belépési pont
│   │   ├── App.tsx           # Fő komponens
│   │   ├── pages/            # Oldalak
│   │   ├── components/       # Komponensek
│   │   ├── stores/           # Zustand stores
│   │   ├── api/              # API kliens
│   │   └── utils/            # Segédfunkciók
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── database/
│   └── init.sql              # Adatbázis sémá
│
├── docs/
│   ├── API.md                # API dokumentáció
│   └── DEVELOPMENT.md        # Fejlesztési útmutató
│
├── docker-compose.yml        # Docker compose konfig
└── README.md
```

## Hasznos Parancsok

### Backend
```bash
cd backend

# Fejlesztési szerver
npm run dev

# Build
npm run build

# Production futtatás
npm start

# Linting
npm run lint

# Tesztek
npm test
```

### Frontend
```bash
cd frontend

# Fejlesztési szerver
npm run dev

# Build
npm run build

# Preview
npm run preview

# Linting
npm run lint
```

### Adatbázis
```bash
# Kapcsolódás az adatbázishoz
psql -U postgres -d pathly

# Adatbázis reinitializálása
psql -U postgres -d pathly -f database/init.sql

# Adatbázis törlése
psql -U postgres
DROP DATABASE pathly;
```

## Troubleshooting

### "Cannot find module 'express'" hiba
```bash
cd backend
npm install
```

### "Connection refused" adatbázis hiba
- Ellenőrizd, hogy a PostgreSQL fut: `pg_isready`
- Ellenőrizd az `.env` fájlt az adatbázis beállításokkal

### "Port 5000 already in use" hiba
```bash
# Windows PowerShell-ben:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process

# Linux/Mac-ben:
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "npm install" lassú
```bash
npm cache clean --force
npm install
```

## Fejlesztés

Lásd a `/docs/DEVELOPMENT.md` fájlt további részletekhez.

## API Dokumentáció

Lásd a `/docs/API.md` fájlt.

## Contributing

1. Fork a projekt
2. Hozz létre egy feature branch: `git checkout -b feature/new-feature`
3. Commit a változásokat: `git commit -m 'Add new feature'`
4. Push a branch-re: `git push origin feature/new-feature`
5. Nyiss egy Pull Request-et

## Licencia

MIT

## Szerzők

- Dely Dániel
- Málnás Péter
- Tanner Renátó

## Támogatás

Ha kérdéseid vannak, nyiss egy GitHub Issue-t vagy vedd fel a szerzőkkel a kapcsolatot.
