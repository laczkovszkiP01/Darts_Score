import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a meccsmentes, meccslekero es hozzáférési szabalyokat ellenorzi.

const verifyTokenMock = vi.hoisted(() =>
  vi.fn((req, res, next) => {
    req.userId = 12;
    next();
  })
);

const matchCreateMock = vi.hoisted(() => vi.fn());
const matchFindAllMock = vi.hoisted(() => vi.fn());
const matchFindByPkMock = vi.hoisted(() => vi.fn());
const sequelizeQueryMock = vi.hoisted(() => vi.fn());

vi.mock('../../middleware/auth.js', () => ({
  verifyToken: verifyTokenMock
}));

vi.mock('../../models/Match.js', () => ({
  default: {
    create: matchCreateMock,
    findAll: matchFindAllMock,
    findByPk: matchFindByPkMock
  }
}));

vi.mock('../../db/database.js', () => ({
  default: {
    query: sequelizeQueryMock
  }
}));

import matchesRouter from '../../routes/matches.js';

describe('matches routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/matches', matchesRouter);

    verifyTokenMock.mockClear();
    matchCreateMock.mockReset();
    matchFindAllMock.mockReset();
    matchFindByPkMock.mockReset();
    sequelizeQueryMock.mockReset();
  });

  // Hibás adatok: nem ment el a meccs
  it('POST /api/matches/save returns 400 for invalid payload', async () => {
    // A firstTo=0 legyen hibás, ne mentse.
    const res = await request(app).post('/api/matches/save').send({
      gameMode: '501',
      outMode: 'double_out',
      firstTo: 0,
      players: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Hibás mérkőzés adat' });
    expect(matchCreateMock).not.toHaveBeenCalled();
  });

  // Meccs mentése: first_to és létrehozó ID kerül el
  it('POST /api/matches/save stores first_to and creator id', async () => {
    
    const created = { id: 99, first_to: 3 };
    matchCreateMock.mockResolvedValue(created);

    const res = await request(app).post('/api/matches/save').send({
      gameMode: '501',
      outMode: 'double_out',
      firstTo: 3,
      players: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: 'Mérkőzés mentve', match: created });
    expect(matchCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        created_by: 12,
        game_mode: '501',
        out_mode: 'double_out',
        first_to: 3,
        status: 'finished'
      })
    );
  });

  // Bajnokság név opcionális mezzőjének mentése
  it('POST /api/matches/save stores championship_name when provided', async () => {
    const created = { id: 100, championship_name: 'Magyar Bajnokság' };
    matchCreateMock.mockResolvedValue(created);

    const res = await request(app).post('/api/matches/save').send({
      gameMode: '301',
      outMode: 'single_out',
      firstTo: 1,
      players: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
      championshipName: 'Magyar Bajnokság'
    });

    expect(res.status).toBe(201);
    expect(matchCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        championship_name: 'Magyar Bajnokság'
      })
    );
  });

  // Bajnokság név null értékkel (opcionális)
  it('POST /api/matches/save handles missing championship_name as null', async () => {
    const created = { id: 101, championship_name: null };
    matchCreateMock.mockResolvedValue(created);

    const res = await request(app).post('/api/matches/save').send({
      gameMode: '501',
      outMode: 'double_out',
      firstTo: 2,
      players: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
    });

    expect(res.status).toBe(201);
    expect(matchCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        championship_name: null
      })
    );
  });

  // Felhasználó meccseit: csak az ö sajátának lehet látnia
  it('GET /api/matches/user-matches returns only user matches ordered by date', async () => {
    const matches = [{ id: 1 }, { id: 2 }];
    matchFindAllMock.mockResolvedValue(matches);

    const res = await request(app).get('/api/matches/user-matches');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(matches);
    expect(matchFindAllMock).toHaveBeenCalledWith({
      where: { created_by: 12 },
      order: [['created_at', 'DESC']]
    });
  });

  it('GET /api/matches/leaderboard-matches returns all matches ordered by date', async () => {
    // Online leaderboardhez minden mentett meccs kell, nem csak a saját.
    const matches = [{ id: 11 }, { id: 10 }];
    matchFindAllMock.mockResolvedValue(matches);

    const res = await request(app).get('/api/matches/leaderboard-matches');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(matches);
    expect(matchFindAllMock).toHaveBeenCalledWith({
      order: [['created_at', 'DESC']]
    });
  });

  it('GET /api/matches/leaderboard-matches falls back to SQL when model query fails', async () => {
    // Ha a model lekérés hibázik, fallback SQL-ből még legyen válasz.
    matchFindAllMock.mockRejectedValue(new Error('model failed'));
    sequelizeQueryMock.mockResolvedValue([
      [
        { id: 20, players: '[{"name":"A"},{"name":"B"}]', championship_name: 'Magyar Bajnokság' },
        { id: 21, players: 'not-json', championship_name: null }
      ]
    ]);

    const res = await request(app).get('/api/matches/leaderboard-matches');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 20, players: [{ name: 'A' }, { name: 'B' }], championship_name: 'Magyar Bajnokság' },
      { id: 21, players: [], championship_name: null }
    ]);
    expect(sequelizeQueryMock).toHaveBeenCalled();
  });

  // Meccs hozzáférés: más felhasználó meccse nem látható
  it('GET /api/matches/:id returns 403 for non-owner access', async () => {
    // Más meccsét ne lehessen lekérni tokennel sem.
    matchFindByPkMock.mockResolvedValue({ id: 4, created_by: 999 });

    const res = await request(app).get('/api/matches/4');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ message: 'Nincs hozzáférés' });
  });

  // Nem található meccs: 404
  it('GET /api/matches/:id returns 404 when match does not exist', async () => {
    matchFindByPkMock.mockResolvedValue(null);

    const res = await request(app).get('/api/matches/404');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Mérkőzés nem található' });
  });

  // Meccs szerzője láthatja a részleteket
  it('GET /api/matches/:id returns 200 for owner access', async () => {
    const match = { id: 4, created_by: 12 };
    matchFindByPkMock.mockResolvedValue(match);

    const res = await request(app).get('/api/matches/4');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(match);
  });
});
