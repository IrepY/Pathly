# Pathly - Fejlesztési Útmutató

## Projekt Felépítése

### Backend (Node.js + Express + TypeScript)
- `/backend/src/index.ts` - Szerver belépési pont
- `/backend/src/routes/` - Route definíciók
- `/backend/src/controllers/` - Üzleti logika
- `/backend/src/services/` - Függő szolgáltatások
- `/backend/src/middleware/` - Express middleware-ek
- `/backend/src/utils/` - Segédfunkciók (JWT, titkosítás, stb.)
- `/backend/src/config/` - Konfigurációs fájlok

### Frontend (React + TypeScript + Vite)
- `/frontend/src/main.tsx` - React belépési pont
- `/frontend/src/App.tsx` - Fő komponens + routing
- `/frontend/src/pages/` - Oldalak (HomePage, LoginPage, stb.)
- `/frontend/src/components/` - Újrafelhasználható komponensek
- `/frontend/src/stores/` - Zustand state management
- `/frontend/src/api/` - API kliens funkciók
- `/frontend/src/utils/` - Segédfunkciók

### Adatbázis (PostgreSQL)
- `/database/init.sql` - Adatbázis inicializáció

## Fejlesztési Lépések

### 1. Környezet Beállítása

#### Backend

```bash
cd backend
npm install
```

Hozz létre egy `.env` fájlt a `.env.example` alapján:
```bash
cp .env.example .env
```

Szerkeszd a `.env` fájlt az adatbázis adataival:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pathly
DB_USER=postgres
DB_PASSWORD=your_password
```

#### Frontend

```bash
cd frontend
npm install
```

#### Adatbázis

PostgreSQL-t kell telepíteni:
```bash
# Windows-on a PostgreSQL installer-t futtasd
# Majd hozz létre egy adatbázist:
psql -U postgres
CREATE DATABASE pathly;
\q

# Majd inicializáld az adatbázist:
psql -U postgres -d pathly -f database/init.sql
```

### 2. Fejlesztési Szerver Indítása

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Backend fut: `http://localhost:5000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend fut: `http://localhost:3000`

### 3. Fejlesztési Munkafolyamat

#### Backend fejlesztés

1. **Új API endpoint hozzáadása**:
   - Hozz létre egy kontroller metódust: `/backend/src/controllers/`
   - Hozz létre egy route-ot: `/backend/src/routes/`
   - Importáld a route-ot az `index.ts`-be

2. **Új adatbázis séma**:
   - Frissítsd az `init.sql` fájlt
   - Futtasd az `init.sql`-t az adatbázison
   - Hozz létre egy service-t az adatbázis операciókhoz

3. **Testing**:
   ```bash
   npm test
   npm run test:watch
   ```

#### Frontend fejlesztés

1. **Új oldal hozzáadása**:
   - Hozz létre egy React komponenst: `/frontend/src/pages/`
   - Hozz létre az útvonalat az `App.tsx`-ben

2. **Új komponens hozzáadása**:
   - Hozz létre egy komponenst: `/frontend/src/components/`
   - Importáld és használd az oldalakan

3. **Adatok kezelése**:
   - API funkciókat használ az `/frontend/src/api/` mappában
   - Zustand store-okat használ az `/frontend/src/stores/` mappában

## Telepítés és Üzemeltetés

### Production Build

#### Backend

```bash
cd backend
npm run build
npm start
```

#### Frontend

```bash
cd frontend
npm run build
```

Az `frontend/dist/` mappábantalálható az elkészült production build.

### Docker (Opcionális)

#### Backend Dockerfile

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## GIT Workflow

```bash
# Feature branch
git checkout -b feature/new-feature

# Munkavégzés és commit
git add .
git commit -m "Add new feature"

# Push
git push origin feature/new-feature

# Pull Request az main-hez
```

## Debugging

### Backend

TypeScript fordítási hibák:
```bash
npm run lint
```

### Frontend

React DevTools és Redux DevTools:
- https://chrome.google.com/webstore/detail/react-developer-tools/

## Hasznos Linkek

- [Express.js dokumentáció](https://expressjs.com/)
- [React dokumentáció](https://react.dev/)
- [TypeScript dokumentáció](https://www.typescriptlang.org/docs/)
- [Zustand dokumentáció](https://github.com/pmndrs/zustand)
- [Tailwind CSS dokumentáció](https://tailwindcss.com/docs)
- [PostgreSQL dokumentáció](https://www.postgresql.org/docs/)

## Kontakt

Fejlesztői team:
- Dely Dániel
- Málnás Péter
- Tanner Renátó
