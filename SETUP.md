# 🎯 Darts Game - Beállítási Útmutató

## Projekt Áttekintés

```
SzakmaiVizsgaDarts/
├── backend/                    # Node.js + Express + Sequelize backend (~1,245 sor)
│   ├── db/                     # PostgreSQL adatbázis kapcsolat
│   ├── middleware/             # JWT autentikáció middleware
│   ├── models/                 # Sequelize ORM modellek (User, Match)
│   │   ├── User.js             # Felhasználó: email, username, role (admin/user)
│   │   └── Match.js            # Meccs: players, gameMode, championship_name
│   ├── routes/                 # RESTful API végpontok
│   │   ├── auth.js             # Regisztráció, bejelentkezés
│   │   ├── matches.js          # Meccsmentés, lekérés, leaderboard
│   │   └── admin.js            # Admin operációk
│   ├── tests/                  # 47 backend teszt
│   ├── postman/                # API tesztgyűjtemény
│   ├── server.js               # Express app inicializálása
│   └── package.json
├── src/                        # React + Vite frontend (~2,850 sor)
│   ├── api/                    # API kliens wrapper (apiClient.js)
│   ├── components/             # Újrahasználható komponensek
│   │   ├── Navbar/             # Navigáció, kijelentkezés
│   │   ├── ContentBox/         # Általános tartalom doboz
│   │   ├── GameTypesSection/   # Játékmódok bemutatása
│   │   └── ...
│   ├── pages/                  # Fő oldalak
│   │   ├── Home/               # Kezdőoldal
│   │   ├── Login/              # Bejelentkezés
│   │   ├── Register/           # Regisztráció (nincs alert)
│   │   ├── GameMenu/           # Meccsbeállítások + bajnokság input
│   │   ├── Game/               # Aktív játék (championship_name támogatás)
│   │   ├── Profile/            # Profil, leaderboard (3 mód), szűrések
│   │   ├── MatchDetails/       # Meccsrészletek
│   │   ├── Admin/              # Admin kezelőfelület
│   │   └── NotFound/           # 404 oldal
│   ├── tests/                  # 55 frontend teszt
│   ├── App.jsx                 # React root komponens
│   ├── main.jsx                # Vite entry point
│   └── index.css               # Globális stílusok
├── README.md                   # Projekt áttekintés
├── SETUP.md                    # Ez a fájl
├── TESTING.md                  # Tesztelési útmutató
├── vite.config.js              # Vite konfigráció
├── eslint.config.js            # ESLint szabályok
└── package.json                # Frontend függőségek
```

## Gyors indítás

### 1. Backend indítása

```bash
cd backend
npm install
npm run dev
```

### 2. Frontend indítása

Egy másik terminálban:

```bash
cd ..
npm install
npm run dev
```

Frontend: http://localhost:5173

A backend API címe a `backend/.env` fájlban megadott porttól függ.

## Tesztek futtatása

### Frontend

```bash
npm test
```

### Backend

```bash
cd backend
npm test
```

## Tesztleírás

A részletes tesztelési útmutató a [TESTING.md](TESTING.md) fájlban található.

Abban ezek szerepelnek:

- automata tesztek futtatása
- manuális játékteszt lépések
- Postman API tesztek használata

## Játék és adatkezelés röviden

- Regisztráció vagy bejelentkezés után JWT token kerül a böngészőbe.
- A játék végén a meccs menthető, ha a felhasználó be van jelentkezve.
- A mentett meccsek a profil oldalon jelennek meg.
- Az admin felületen felhasználók és mérkőzések kezelhetők.

## Elő feltételek

- **Node.js** 16+ verzió
- **PostgreSQL** 12+ verzió (futó szolgáltatás)
- **.env fájlok** helyesen konfigurálva

### Adatbázis Előkészítése

Előzőleg hozz létre egy PostgreSQL adatbázist:

```sql
CREATE DATABASE darts_db;
```

## Backend Beállítás

Backend indítása:

```bash
cd backend
npm install
```

**Backend .env fájl** (`backend/.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=darts_db
DB_USER=postgres
DB_PASSWORD=jelszó
JWT_SECRET=titkos_jelkulcs_12345
PORT=5000
ADMIN_EMAIL=admin@darts.local
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
```

Indítás:

```bash
npm run dev
```

Backend válaszol: `http://localhost:5000`

## Frontend Beállítás

Egy másik terminálban:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Adatbázis Szinkronizálása

Az első indításkor a backend automatikusan:
1. Létrehozza a táblákat (User, Match)
2. Beállítja az admin felhasználót
3. Szinkronizálja a Sequelize modelleket


## Fejlesztői Megjegyzések

### Bajnokság Mező
- Opcionális, NULL értéket engedélyez
- Adatbázisban: Match tábla `championship_name` VARCHAR(255)
- Frontend: GameMenu-ben opcionális input
- Leaderboard: Csak konkrét bajnokságok jelennek meg (nincs "Nem bajnokság" opció)
- Match card: "🏆 Bajnokság" ikonnal jelenik meg

### Leaderboard Módok
1. **Helyi (Local)** - Csak az aktuális felhasználó meccseit számolja
2. **Online** - Összes felhasználó összes meccsét mutatja
3. **Helyi bajnokság** - Helyi meccsek egy konkrét bajnokság alapján szűrve

### Reszponzív Dizájn
- Mobile-first megközelítés
- Breakpoint: 768px (tablet), 1024px (desktop)
- Flexbox és CSS Grid használata
- Checkbox-ok és szűrések teljes szélességben mobilon

### Performance Optimizálás
- Lazy loading komponensek
- Memoization szükség szerint
- Sequelize query optimizálás
- SQL fallback raw query-vel

## API Végpontok Leírása

| Módszer | Végpont | Leírás |
|---------|---------|--------|
| POST | `/api/auth/register` | Regisztráció |
| POST | `/api/auth/login` | Bejelentkezés |
| PUT | `/api/auth/change-password` | Jelszócsere |
| POST | `/api/matches/save` | Meccs mentése championship_name-nel |
| GET | `/api/matches/user-matches` | Felhasználó meccsei |
| GET | `/api/matches/leaderboard-matches` | Leaderboard adatok |
| GET | `/api/matches/:id` | Egy meccs részletei |
| GET | `/api/admin/users` | Admin: összes felhasználó |
| GET | `/api/admin/matches` | Admin: összes meccs |
| DELETE | `/api/admin/users/:id` | Admin: felhasználó törlése |
| DELETE | `/api/admin/matches/:id` | Admin: meccs törlése |

## Ajánlott Tesztelési Sorrend

1. ✅ Backend indítása és működésének ellenőrzése
   ```bash
   curl http://localhost:5000/api/health
   ```

2. ✅ Frontend indítása (http://localhost:5173)

3. ✅ Regisztráció új felhasználóval

4. ✅ Bejelentkezés

5. ✅ Új meccs indítása
   - Játékmód, out mód kiválasztása
   - **Bajnokság név megadása** (opcionális)
   - Játékosok hozzáadása

6. ✅ Meccs lejátszása és mentése

7. ✅ Profil oldalon ellenőrzése
   - Mentett meccs megjelenik
   - "🏆 Bajnokság neve" látható
   - Szűrések működnek
   - Leaderboard 3 módja működik

8. ✅ Admin felület kipróbálása (admin@darts.local / Admin123!)

9. ✅ Tesztek futtatása
   ```bash
   npm test              # Frontend
   cd backend && npm test # Backend
   ```

## Hibaelhárítás

### PostgreSQL Kapcsolati Hiba

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Megoldás**:
- PostgreSQL szolgáltatás futása szükséges
- Backend `.env` adatbázis beállítások ellenőrzése

### Token Hiba Frontend-en

```
Unauthorized: Invalid token
```

**Megoldás**:
- Backend `JWT_SECRET` megegyezik-e a `.env`-ben?
- Böngészőben töröld a localStorage-t: `F12 → Storage → Clear All`

### Tesztek Buknak

```bash
npm test -- --watchAll=false  # Frontend
cd backend && npm test         # Backend
```

Ha 102/102 teszt sikeres: ✅ 




