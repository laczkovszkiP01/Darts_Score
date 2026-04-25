# Tesztelés és Dokumentáció (Szakmai Vizsga Darts)

Ez a dokumentum összefoglalja a projekt tesztjeit, azok célját és futtatásukat.

## 1) Automata Tesztek Futtatása

### Frontend (55 teszt)

```bash
npm test
```

Figyeld módban:

```bash
npm run test:watch
```

### Backend (47 teszt)

```bash
cd backend
npm test
```

Figyeld módban:

```bash
npm run test:watch
```

**Teljes lefedettség: 102 teszt, 100% siker**

## 2) Milyen Tesztek Vannak a Projektben?

### Frontend Tesztek (55)

#### API és Adatok
- [src/api/apiClient.test.js](src/api/apiClient.test.js) - API kliens URL-ek, adatküldés, championship field validálása

#### Játékmechanika
- [src/pages/Game/gameLogic.test.js](src/pages/Game/gameLogic.test.js) - Darts szabályok: bust, single/double out, pontszámítás

#### Autentikáció
- [src/pages/Login/Login.test.jsx](src/pages/Login/Login.test.jsx) - Bejelentkezés: sikeres és sikertelen esetek
- [src/pages/Register/Register.test.jsx](src/pages/Register/Register.test.jsx) - Regisztráció: validáció, jelszócsere

#### Meccskezelés
- [src/pages/GameMenu/GameMenu.test.jsx](src/pages/GameMenu/GameMenu.test.jsx) - Meccsbeállítások, bajnokság mező, duplikált nevek
- [src/pages/Game/Game.test.jsx](src/pages/Game/Game.test.jsx) - Aktív játék, adatok mentése championship_name-vel
- [src/pages/MatchDetails/MatchDetails.test.jsx](src/pages/MatchDetails/MatchDetails.test.jsx) - Meccsrészletek betöltése, hiba-kezelés

#### Profil és Leaderboard
- [src/pages/Profile/Profile.test.jsx](src/pages/Profile/Profile.test.jsx) - **55 teszt** a bajnokság szűrésről:
  - Checkbox alapú szűrések engedélyezése
  - Bajnokság szűrés (csak konkrét nevek, nincs "Nem bajnokság")
  - Leaderboard 3 módja: Helyi, Online, Helyi bajnokság
  - Bajnokság alapú szűrés a leaderboard-ban
  - Match card layout bajnokság megjelöléssel
  - Reszponzív dizájn validálása
  - Dátumszűrés több formátummal

#### Oldal és Komponensek
- [src/components/Navbar/Navbar.test.jsx](src/components/Navbar/Navbar.test.jsx) - Navigáció, kijelentkezés
- [src/pages/Admin/Admin.test.jsx](src/pages/Admin/Admin.test.jsx) - Admin panel: felhasználók, meccsek
- [src/pages/NotFound/NotFound.test.jsx](src/pages/NotFound/NotFound.test.jsx) - 404 oldal

### Backend Tesztek (47)

#### Middleware és Autentikáció
- [backend/tests/middleware/auth.test.js](backend/tests/middleware/auth.test.js) - JWT token validáció, hibakezelés
- [backend/tests/routes/auth.test.js](backend/tests/routes/auth.test.js) - Regisztráció, bejelentkezés, jelszócsere

#### Meccskezelés és Adatok
- [backend/tests/routes/matches.test.js](backend/tests/routes/matches.test.js) - **Meccs mentés championship_name-nel**: 
  - POST /save - championship_name opcionális mező
  - GET /user-matches - felhasználó összes mérkőzése
  - GET /leaderboard-matches - összes publikus mérkőzés championship_name mezővel
  - Fallback raw SQL query JSON parse-ral

#### Admin és Adatbázis
- [backend/tests/routes/admin.test.js](backend/tests/routes/admin.test.js) - Admin operációk: felhasználók, meccsek listázása, törlése
- [backend/tests/db/database.test.js](backend/tests/db/database.test.js) - Adatbázis kapcsolat, konfigráció

#### Modellek
- [backend/tests/models/User.test.js](backend/tests/models/User.test.js) - Felhasználó modell: jelszó-hash, comparePassword
- [backend/tests/models/Match.test.js](backend/tests/models/Match.test.js) - Meccs modell: championship_name mező, User kapcsolat

## 3) Postman API Tesztek

Importáld ezeket a fájlokat Postmanbe:

- [backend/postman/DartsAPI.postman_collection.json](backend/postman/DartsAPI.postman_collection.json) - API végpont kollekcióval championship_name támogatás
- [backend/postman/local.postman_environment.json](backend/postman/local.postman_environment.json) - Helyi fejlesztői environment

### Futtatás Postman Collection Runnerrel:

1. Indítsd a backend szervert: `cd backend && npm run dev`
2. Válaszd ki a "Local Backend" environmentet
3. Futtasd a teljes "SzakmaiVizsgaDarts API" collectiont sorrendben

### Végpontok Tesztelésére:

#### Meccsmentés Championship-pel
```
POST /api/matches/save
Body: {
  "gameMode": "301",
  "outMode": "Dupla",
  "firstTo": 1,
  "players": [...],
  "championshipName": "Magyar Bajnokság"  // OPCIONÁLIS
}
```

#### Leaderboard Lekérése
```
GET /api/matches/leaderboard-matches
// Válasz tartalmazza: championship_name mezőt az összes meccsben
```

## 4) Manuális Tesztelési Forgatókönyv

### Bajnokság Funkció Tesztelése:

1. **Regisztráció és Bejelentkezés**
   - Regisztrálj egy felhasználóval
   - Jelentkezz be

2. **Meccs Bajnoksággal**
   - Válassz játékmódot
   - A "Bajnokság név" mezőbe írj: "Magyar Bajnokság"
   - Játssz és mentsd a meccset

3. **Profil Leaderboard Ellenőrzése**
   - Kattints a "Helyi bajnokság" gombra
   - Válassz a legördülő menüből: "Magyar Bajnokság"
   - Ellenőrizd, hogy csak az adott bajnokság meccsai jelennek meg

4. **Match Card Megjelenítés**
   - A mentett meccsek kartyáin látnod kell: "🏆 Magyar Bajnokság"
   - Szűrés engedélyezésével szűrhetsz bajnokság szerint

5. **Reszponzív Dizájn**
   - Nyisd meg F12-vel a dev tools-t
   - Válassz mobil nézetet
   - Ellenőrizd, hogy a szűrések, leaderboard gombok és match cardok helyesen jelennek meg








