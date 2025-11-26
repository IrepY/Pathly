# SQLite Adatbázis Megtekintése

Az adatbázis fájl helye:
```
backend/data/pathly.db
```

---

## 1️⃣ **SQLite CLI (Parancssor) - Leggyorsabb**

### Windows PowerShell-ben:

```powershell
# SQLite telepítve van? Próbáld ki:
sqlite3 backend/data/pathly.db

# Ha működik, írj SQLite parancsokat:
.tables                    # Összes tábla listázása
SELECT * FROM users;       # Felhasználók megtekintése
.schema users             # Tábla szerkezete
.quit                     # Kilépés
```

**Ha "sqlite3 nem ismert" hibát kapsz:**
- Telepítsd: https://www.sqlite.org/download.html
- Vagy használd a 2-5. lehetőségek valamelyikét

---

## 2️⃣ **SQLiteStudio (Grafikus UI) - Ajánlott**

### Lépések:

1. **Letöltés**: https://www.sqlitestudio.pl/
2. **Telepítés** és nyitás
3. **Add Database** → `backend/data/pathly.db` kiválasztása
4. Kattints az adatbázison
5. Táblák megtekintése bal oldali menüben
6. Double-click a táblára = adatok megtekintése

✨ **Legkönnyebb módszer vizuálisan**

---

## 3️⃣ **VS Code SQLite Extension**

### Telepítés VS Code-ban:

1. Extensions → Keressen: "SQLite"
2. "SQLite" (alexcvzz által) → Install
3. Nyisd meg a parancskatalógust: `Ctrl+Shift+P`
4. Keress: `SQLite: Open Database`
5. Válaszd: `backend/data/pathly.db`
6. Az Explorer-ben megjelenik egy SQLite ikon
7. Kattints a táblákra = automatikus SELECT

✨ **Integrált VS Code-ban**

---

## 4️⃣ **Node.js CLI (Gyors tesztelés)**

Backend mappában:

```bash
cd backend
node
```

Majd Node REPL-ben:

```javascript
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./data/pathly.db');

// Felhasználók megtekintése
db.all('SELECT * FROM users', (err, rows) => {
  console.log(rows);
  db.close();
});
```

---

## 5️⃣ **Online SQLite Viewer**

### Webből:

1. https://sqliteonline.com/
2. "Open Database" → `backend/data/pathly.db` feltöltése
3. Táblák láthatók bal oldalt

⚠️ **Figyelem**: Jelszavak/titkos adatok az internetre mennek

---

## 🎯 Legpraktikusabb Megoldás

### Javasolt workflow:

```bash
# 1. Terminal megnyitása a Pathly gyökérből
cd backend

# 2. SQLite CLI használata
sqlite3 data/pathly.db

# Útile parancsok:
.tables                                # Összes tábla
.schema users                          # Tábla szerkezete
SELECT COUNT(*) FROM users;            # Felhasználók száma
SELECT * FROM users;                   # Összes felhasználó
SELECT * FROM saved_routes;            # Mentett útvonalak
.quit                                  # Kilépés
```

---

## 📋 Fontos Táblák

| Tábla | Leírás |
|-------|--------|
| **users** | Felhasználói fiókok |
| **user_preferences** | Felhasználói beállítások |
| **stops** | Megálló pontok (GPS) |
| **transit_routes** | Járműútvonalak |
| **trips** | Járatások |
| **stop_times** | Menetrend |
| **saved_routes** | Mentett útvonalak |
| **audit_logs** | Audit naplók (GDPR) |

---

## ⚡ Gyors SQL Lekérdezések

```sql
-- Összes tábla:
.tables

-- Tábla szerkezete:
.schema

-- Felhasználók száma:
SELECT COUNT(*) as user_count FROM users;

-- Összes felhasználó:
SELECT id, email, first_name, last_name, created_at FROM users;

-- Mentett útvonalak:
SELECT * FROM saved_routes;

-- Audit naplók (ki csinált mit):
SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;

-- Adott felhasználó adatai:
SELECT * FROM users WHERE email = 'test@pathly.com';
```

---

## 🔧 Tábla Törlése (Teszteléshez)

```sql
-- Összes adat törlése egy táblából:
DELETE FROM users;

-- Teljes tábla drop:
DROP TABLE users;

-- Adatbázis fájl teljes törlése:
-- Windows: rm backend\data\pathly.db (majd Backend indítása újra)
```

⚠️ **Vigyázat**: Ez véglegesen törlődik!

---

## 💡 Tipp

Ha Backend újraindul, az adatbázis **automatikusan** inicializálódik a `init.sqlite.sql` alapján.

Jó szórakozást az adatbázis-felfedezéshez! 🎉
