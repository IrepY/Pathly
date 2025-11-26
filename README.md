# Pathly - Közösségi Útvonaltervező

A Pathly egy intelligens webalkalmazás, amely optimális útvonalakat számít ki a közösségi közlekedésben, figyelembe véve a menetrendeket, átszállási lehetőségeket, gyalogos szakaszokat és valós idejű járatadatokat.

## Projekt Szerkezet

```
Pathly/
├── backend/              # Node.js/Express API szerver
├── frontend/             # React webalkalmazás
├── database/             # SQL sémák és inicializálás
├── docs/                 # Dokumentáció
└── README.md
```

## Követelmények

### Funkcionális Követelmények
- ✅ Alap útvonalszámítás (SRS-FUNC-010)
- ✅ Optimalizálási stratégiák: leggyorsabb, legkevesebb átszállás, legkorábbi indulás (SRS-FUNC-011)
- ✅ Alternatív útvonallehetőségek (SRS-FUNC-012)
- ✅ Valós idejű járatadatok (SRS-FUNC-030, 031)
- ✅ Útvonalak mentése (SRS-FUNC-041)

### Nem-Funkcionális Követelmények
- ✅ Adattitkosítás (SRS-BIZT-010)
- ✅ Biztonságos API kommunikáció (SRS-BIZT-011)
- ✅ GDPR megfelelőség - adatok törlésének joga (SRS-ADAT-010)
- ✅ Reszponzív webes design (SRS-UI-010)
- ✅ Intuitív keresési munkafolyamat (SRS-UI-011)
- ✅ Offline adatgyorsítótár (SRS-BAD-010)

## Technológiai Stack

- **Backend**: Node.js + Express.js
- **Frontend**: React + TypeScript
- **Adatbázis**: PostgreSQL
- **Real-time**: WebSocket
- **Autentikáció**: JWT + bcrypt
- **Titkosítás**: bcryptjs, crypto

## Telepítés és Futtatás

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Adatbázis

```bash
psql -U postgres -f database/init.sql
```

## Fázisok

### 1. Fázis: Alapok (1-2 hét)
- Backend API szerkezet
- Adatbázis séma
- Frontend alapok
- Autentikáció

### 2. Fázis: Útvonaltervezés (2-3 hét)
- Route calculation engine
- Optimization strategies
- Alternative routes

### 3. Fázis: Valós idejű adatok (2 hét)
- Real-time transit integration
- WebSocket updates

### 4. Fázis: UI/UX fejlesztés (2 hét)
- Responsive design
- Map integration
- Advanced features

### 5. Fázis: Testing & Deployment (1-2 hét)
- Unit & integration tests
- Docker containerization
- Production deployment

## API Dokumentáció

A teljes API dokumentáció a `/docs` mappában található.

## Licencia

MIT

## Szerzők

- Dely Dániel
- Málnás Péter
- Tanner Renátó
