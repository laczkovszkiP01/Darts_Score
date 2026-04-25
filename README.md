# Szakmai Vizsga Darts 🎯

Ez egy teljes körű darts pontszámoló és meccskezelő alkalmazás, mely leaderboard funkcionalitást és bajnokság-szűrést biztosít.

## Mit használunk

- **Frontend**: React + Vite
- **Backend**: Node.js + Express + Sequelize
- **Adatbázis**: PostgreSQL
- **Tesztelés**: Vitest (frontend + backend), Postman (API)

## Új Funkciók

### 🏆 Bajnokság Kezelés
- Opcionális "Bajnokság név" mező meccsmenüben
- Bajnokság alapú szűrés a profiloldalon
- Mentett meccseken megjelenik a bajnokság név 🏆 ikonnal

### 📊 Leaderboard Rendszer
- **Helyi** - Összes helyi mérkőzés
- **Online** - Az összes felhasználó mérkőzése
- **Helyi bajnokság** - Helyi meccsek bajnokság szerint szűrve

### 🔍 Fejlett Szűrés
- Meccslista szűrése: játékmód, out mód, játékos neve, bajnokság, dátum
- Checkbox alapú szűrések engedélyezése/letiltása
- Reszponzív filtersávek minden eszközön

## Futtatás

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd ..
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend API: A backend `.env` fájlban konfigurálható (alapértelmezett: 5000-es port)

## Tesztek

### Frontend (55 teszt)

```bash
npm test
```

### Backend (47 teszt)

```bash
cd backend
npm test
```

**Teljes teszt lefedettség: 102 teszt**

## Dokumentáció

- Részletes tesztelési útmutató: [TESTING.md](TESTING.md)
- Beállítási útmutató: [SETUP.md](SETUP.md)

## A Projekt Fő Elemei

- **Játékmenü**: Meccsbeállítások, bajnokság megadás (opcionális)
- **Játék**: Darts pontszámítás, win/lose feltételek, szétszálló kezelés
- **Profil**: Mentett meccsek listája, szűrések, leaderboard 3 módban
- **Admin**: Felhasználók és meccsek kezelése
- **Autentikáció**: JWT token alapú, jelszócsere támogatott

