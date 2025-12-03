# Útvonal Összekapcsolódás Frissítés (Route Connectivity Update)

## Összefoglalás (Summary)

Az alkalmazás most támogatja, hogy **minden megálló összekapcsolódjon minden más megállóval** átszállások (transfer) révén. Ez azt jelenti, hogy ha nem létezik direkt útvonal két megálló között, a rendszer automatikusan keresi a szállítóhálózaton belüli lehetséges átszállási útvonalakat.

## Megvalósított Funkciók (Implemented Features)

### 1. **Gráf-alapú Keresési Algoritmus (Graph-based Search Algorithm)**
   - `getConnectedStops()` funkció: BFS (Breadth-First Search) algoritmus használatával
   - Felderíti az összes elérhető megállót egy adott megállóból
   - Támogatja a többszörös átszállásokat (beállítható maximális átszállásszám)
   - Nyomon követi az útvonalat és az átszállásokat

### 2. **Direkt Útvonalak Keresése (Direct Route Search)**
   - Első lépésben az alkalmazás a direkt útvonalakat keresi
   - Ha van direkt busz/tram/metró legalább a két megálló között
   - Időalapú rendezéssel: a leggyorsabb utazások kerülnek előre

### 3. **Átszállási Útvonalak Keresése (Transfer Routes Search)**
   - Ha nincs direkt útvonal, az algoritmus automatikusan átszállási útvonalakat keres
   - Maximum 3 átszállás támogatott (beállítható)
   - Intelligens rendezés: legrövidebb útvonal előre
   - Útvonal-információk: mely megállókon keresztül halad az utazó

### 4. **Továbbfejlesztett API (Enhanced API)**
   - `/routes/search` endpoint bővítve a `maxTransfers` paraméterrel
   - Alapértelmezett: 3 átszállás
   - A válasz tartalmazza az átszállások számát (`transfers` mező)

## Technikai Implementáció (Technical Implementation)

### Backend (`backend/src/services/routeSearchService.ts`)

#### Új Funkciók:
1. **`getConnectedStops(stopId, maxTransfers)`**
   - BFS algoritmus az összekapcsolt megállók felderítéséhez
   - Paraméterek:
     - `stopId`: kiinduló megálló ID
     - `maxTransfers`: maximális átszállásszám
   - Visszatér: `Map<stopId, {distance, path, routeName, routeType}>`

2. **`getPathStops(stopIds)`**
   - Az útvonal megállóit lekérdezi az adatbázisból
   - Felhasználható a teljes útvonal megjelenítésére

3. **`searchRoutesByStopNames(originName, destinationName, maxTransfers)`**
   - Komplett keresési logika
   - Lépések:
     1. Megálló nevek azonosítása
     2. Direkt útvonalak keresése
     3. Ha nincs direkt: átszállási útvonalak keresése
     4. Az eredmények rendezése

#### Módosított Funkciók:
1. **`findRoutes()`** - támogatja az `maxTransfers` paramétert
2. **Controller** - továbbadja a `maxTransfers` paramétert

## Adatbázis Lekérdezések (Database Queries)

### Direkt Útvonalak:
```sql
SELECT DISTINCT tr.id, tr.route_short_name, tr.route_type, t.id, st1.departure_time, st2.arrival_time
FROM trips t
JOIN transit_routes tr ON t.route_id = tr.id
JOIN stop_times st1 ON t.id = st1.trip_id AND st1.stop_id = ?
JOIN stop_times st2 ON t.id = st2.trip_id AND st2.stop_id = ? 
WHERE st1.stop_sequence < st2.stop_sequence
```

### Összekapcsolt Megállók (BFS):
```sql
SELECT DISTINCT st2.stop_id, tr.route_short_name, tr.route_type, 
       ABS(st2.stop_sequence - st1.stop_sequence) as distance
FROM stop_times st1
JOIN stop_times st2 ON st1.trip_id = st2.trip_id AND st2.stop_sequence > st1.stop_sequence
JOIN trips t ON st1.trip_id = t.id
JOIN transit_routes tr ON t.route_id = tr.id
WHERE st1.stop_id = ?
```

## Felhasználói Élmény (User Experience)

### Frontend Megjelenítése:
1. **Útvonal Típusa**: Metro 🚇, Tram 🚊, Bus 🚌, Rail 🚆
2. **Átszállások Kijelzése**:
   - Direkt: "0 átszállás"
   - Átszállási útvonal: "2 átszállás"
3. **Megállók Lista**: az útvonal összes megállója látható
4. **Becsült Utazási Idő**: percekben kijelezve

### API Válasz Formátuma:
```json
{
  "success": true,
  "routes": [
    {
      "id": "transfer_1_45",
      "name": "M1 + transfer",
      "type": "metro",
      "stops": [
        {"id": 1, "name": "Deák Ferenc tér", "latitude": 47.50, "longitude": 19.04},
        {"id": 20, "name": "Blaha Lujza tér", "latitude": 47.49, "longitude": 19.04},
        {"id": 45, "name": "Keleti pályaudvar", "latitude": 47.50, "longitude": 19.08}
      ],
      "duration": 25,
      "transfers": 1,
      "notes": "Deák Ferenc tér → (1 transfer) → Keleti pályaudvar"
    }
  ],
  "count": 1,
  "dataSource": "Local SQLite Database",
  "timestamp": "2025-12-02T19:30:00.000Z"
}
```

## Beállítások (Configuration)

### Maximális Átszállások:
- Alapértelmezett: **3 átszállás**
- Módosítható a keresési kérésben:
  ```json
  {
    "originName": "Deák Ferenc tér",
    "destinationName": "Keleti pályaudvar",
    "maxTransfers": 5
  }
  ```

### Preferált Szállítási Típusok:
```json
{
  "preferredTypes": ["metro", "tram", "bus"]
}
```

## Teljesítmény Megjegyzések (Performance Notes)

1. **BFS Algoritmus**: O(V + E) időbonyolultság
   - V = megállók száma
   - E = szállítási kapcsolatok száma
   
2. **Korlátozások**:
   - Maximum 20 következő megálló per BFS lépésben
   - Maximum 3 átszállás alapértelmezetten
   - LIMIT 10 az eredményekben

3. **Adatbázis Indexelés**: Javasolt:
   - `stop_times(stop_id, trip_id)`
   - `stop_times(trip_id, stop_sequence)`
   - `stops(name)`

## Teszt Esetek (Test Cases)

### Teszt 1: Direkt Útvonal
```bash
curl -X POST http://localhost:5000/routes/search \
  -H "Content-Type: application/json" \
  -d '{
    "originName": "Deák Ferenc tér",
    "destinationName": "Keleti pályaudvar"
  }'
```

### Teszt 2: Távolabb Lévő Megállók
```bash
curl -X POST http://localhost:5000/routes/search \
  -H "Content-Type: application/json" \
  -d '{
    "originName": "Deák Ferenc tér",
    "destinationName": "Moszkva tér",
    "maxTransfers": 5
  }'
```

## Jövőbeli Fejlesztések (Future Enhancements)

1. **Dijkstra Algoritmusa**: Súlyozottak (például utazási idő alapú) optimális útvonal kereséshez
2. **Real-time Forgalom**: Aktuális késések és forgalmi információk integrálása
3. **Gyaloglási Távolság**: A megállók közötti gyaloglási távolság figyelembevétele
4. **Útmutatás Térképen**: Lépésről-lépésre útmutatás a navigációban
5. **Környezeti Hatás**: CO2 kibocsátás alapján optimalizált útvonalak

## Hibaelhárítás (Troubleshooting)

### Nincs Eredmény
- Ellenőrizze a megálló neveit az adatbázisban
- Próbáljon nagyobb `maxTransfers` értéket

### Lassú Keresés
- Ellenőrizze az adatbázis indexelést
- Csökkentse a `maxTransfers` értéket

### Hibás Útvonalak
- Vizsgálja meg a `stop_times` táblát az adatbázisban
- Ellenőrizze a `stop_sequence` értékeket

## Fájlok Módosítva (Modified Files)

1. **`backend/src/services/routeSearchService.ts`**
   - Hozzáadva: `getConnectedStops()`
   - Hozzáadva: `getPathStops()`
   - Módosítva: `searchRoutesByStopNames()`
   - Módosítva: `findRoutes()`

2. **`backend/src/controllers/routeController.ts`**
   - Módosítva: `searchRoutes()` controller

---

**Készült**: 2025. december 2.
**Verzió**: 1.0
