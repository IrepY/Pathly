# Pathly Adatbázis

Ez a mappa a PostgreSQL adatbázis sémákat és migráció scripteket tartalmazza.

## Fájlok

- `init.sql` - Teljes adatbázis inicializáció (táblákat, index-eket, trigger-eket)

## Adatbázis Séma

### Felhasználók és Autentikáció
- `users` - Felhasználói fiókok
- `user_preferences` - Felhasználói beállítások

### Közlekedési Adatok (GTFS)
- `stops` - Megállók
- `transit_routes` - Járatok útvonalai
- `trips` - Konkrét járatok
- `stop_times` - Megállók az egyes járatokhoz

### Felhasználói Adatok
- `saved_routes` - Felhasználók által mentett útvonalak
- `audit_logs` - Naplózás (GDPR nyomköveteéshez)

### Valós Idejű Adatok
- `vehicle_positions` - Járatok aktuális pozíciói
- `service_alerts` - Szervizfigyelmeztetések

## Inicializáció

### PostgreSQL-lel

```bash
# Adatbázis létrehozása
psql -U postgres -c "CREATE DATABASE pathly;"

# Séma inicializálása
psql -U postgres -d pathly -f init.sql
```

### Docker-rel

```bash
docker-compose up
# Az init.sql automatikusan futtatódik
```

## Backup és Restore

### Backup
```bash
pg_dump -U postgres -d pathly > pathly_backup.sql
```

### Restore
```bash
psql -U postgres -d pathly < pathly_backup.sql
```

## Adatbázis Diagram

```
┌─────────────────────────────────────────────────────────┐
│                       USERS                             │
├─────────────────────────────────────────────────────────┤
│ id (PK)   │ email   │ password_hash   │ created_at │... │
└─────────────────────────────────────────────────────────┘
       ↓                                          ↓
┌──────────────────┐                  ┌──────────────────┐
│ USER_PREFERENCES │                  │  SAVED_ROUTES    │
├──────────────────┤                  ├──────────────────┤
│ id (PK)          │                  │ id (PK)          │
│ user_id (FK)     │                  │ user_id (FK)     │
│ ...preferences...│                  │ route_data (JSON)│
└──────────────────┘                  └──────────────────┘

┌────────────────────────────────────────────────────────────┐
│                     TRANSIT_ROUTES                         │
├────────────────────────────────────────────────────────────┤
│ id (PK)   │ gtfs_route_id   │ route_short_name   │ ...     │
└────────────────────────────────────────────────────────────┘
       ↓
┌────────────────────────────────────────────────────────────┐
│                         TRIPS                              │
├────────────────────────────────────────────────────────────┤
│ id (PK)   │ route_id (FK)   │ gtfs_trip_id   │ ...         │
└────────────────────────────────────────────────────────────┘
       ↓
┌────────────────────────────────────────────────────────────┐
│                      STOP_TIMES                            │
├────────────────────────────────────────────────────────────┤
│ id (PK)   │ trip_id (FK)   │ stop_id (FK)   │ ...          │
└────────────────────────────────────────────────────────────┘
       ↑
       │
┌────────────────────────────────────────────────────────────┐
│                        STOPS                               │
├────────────────────────────────────────────────────────────┤
│ id (PK)   │ gtfs_stop_id   │ name   │ latitude   │ longitude│
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                 VEHICLE_POSITIONS                          │
├────────────────────────────────────────────────────────────┤
│ id (PK)   │ trip_id (FK)   │ latitude   │ longitude │ ...   │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                   SERVICE_ALERTS                           │
├────────────────────────────────────────────────────────────┤
│ id (PK)   │ affected_routes[]   │ affected_stops[]   │ ...  │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    AUDIT_LOGS                              │
├────────────────────────────────────────────────────────────┤
│ id (PK)   │ user_id (FK)   │ action   │ created_at │ ...   │
└────────────────────────────────────────────────────────────┘
```

## Indexek

Teljesítmény-optimizálás céljából az alábbi indexek készültek:

- `idx_stops_location` - Helyadatok gyors keresése
- `idx_users_email` - E-mail alapú felhasználó keresés
- `idx_saved_routes_user` - Felhasználó útvonalainak gyors lekérése
- `idx_stop_times_trip` - Megállók egy járat alatt
- `idx_stop_times_stop` - Járatok egy megálló alatt
- `idx_vehicle_positions_trip` - Járat aktuális pozíciója
- `idx_service_alerts_time` - Aktív figyelmeztetések keresése

## Maintenance

### Adatbázis Optimization
```bash
psql -U postgres -d pathly -c "VACUUM ANALYZE;"
```

### Régi adatok törlése
```bash
-- Audit logok tisztítása (90 nap feletti)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Járatpozíciók tisztítása (24 óránál régebbi)
DELETE FROM vehicle_positions WHERE updated_at < NOW() - INTERVAL '1 day';
```

## Biztonsági Megjegyzések

- Jelszavak bcrypt titkosítással tárolódnak
- Személyes adatok szenzitívek (GDPR)
- Audit logok minden módosítást rögzítenek
- Tranzakciók az adatintegritás biztosítására
