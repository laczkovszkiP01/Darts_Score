import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl az admin listazasokat es torleseket ellenorzi.

const transactionMock = vi.hoisted(() => ({
  commit: vi.fn(),
  rollback: vi.fn()
}));

const verifyTokenMock = vi.hoisted(() =>
  vi.fn((req, res, next) => {
    req.userId = 1;
    req.userRole = 'admin';
    next();
  })
);

const requireAdminMock = vi.hoisted(() => vi.fn((req, res, next) => next()));

const sequelizeTransactionMock = vi.hoisted(() => vi.fn().mockResolvedValue(transactionMock));

const userFindAllMock = vi.hoisted(() => vi.fn());
const userFindByPkMock = vi.hoisted(() => vi.fn());
const userDestroyMock = vi.hoisted(() => vi.fn());

const matchFindAllMock = vi.hoisted(() => vi.fn());
const matchDestroyMock = vi.hoisted(() => vi.fn());

vi.mock('../../middleware/auth.js', () => ({
  verifyToken: verifyTokenMock,
  requireAdmin: requireAdminMock
}));

vi.mock('../../db/database.js', () => ({
  default: {
    transaction: sequelizeTransactionMock
  }
}));

vi.mock('../../models/User.js', () => ({
  default: {
    findAll: userFindAllMock,
    findByPk: userFindByPkMock,
    destroy: userDestroyMock
  }
}));

vi.mock('../../models/Match.js', () => ({
  default: {
    findAll: matchFindAllMock,
    destroy: matchDestroyMock
  }
}));

import adminRouter from '../../routes/admin.js';

describe('admin routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/admin', adminRouter);

    verifyTokenMock.mockClear();
    requireAdminMock.mockClear();
    sequelizeTransactionMock.mockClear();

    transactionMock.commit.mockClear();
    transactionMock.rollback.mockClear();

    userFindAllMock.mockReset();
    userFindByPkMock.mockReset();
    userDestroyMock.mockReset();

    matchFindAllMock.mockReset();
    matchDestroyMock.mockReset();
  });

  it('GET /api/admin/users returns user list', async () => {
    const users = [{ id: 2, username: 'john' }];
    userFindAllMock.mockResolvedValue(users);

    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(users);
    expect(userFindAllMock).toHaveBeenCalled();
  });

  it('GET /api/admin/matches returns match list', async () => {
    const matches = [{ id: 5, game_mode: '501' }];
    matchFindAllMock.mockResolvedValue(matches);

    const res = await request(app).get('/api/admin/matches');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(matches);
    expect(matchFindAllMock).toHaveBeenCalled();
  });

  it('DELETE /api/admin/users/:id returns 400 for invalid user id', async () => {
    const res = await request(app).delete('/api/admin/users/abc');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Érvénytelen felhasználó azonosító' });
  });

  it('DELETE /api/admin/users/:id blocks self deletion', async () => {
    // Admin ne tudja véletlenül saját magát törölni.
    const res = await request(app).delete('/api/admin/users/1');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Saját admin felhasználó nem törölhető' });
  });

  it('DELETE /api/admin/users/:id returns 404 when user is missing', async () => {
    // Ha nincs ilyen user, legyen hiba.
    userFindByPkMock.mockResolvedValue(null);

    const res = await request(app).delete('/api/admin/users/4');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Felhasználó nem található' });
    expect(sequelizeTransactionMock).toHaveBeenCalled();
    expect(transactionMock.rollback).toHaveBeenCalled();
    expect(transactionMock.commit).not.toHaveBeenCalled();
  });

  it('DELETE /api/admin/users/:id deletes user and related matches', async () => {
    // Sikeres törlésnél a meccsek is törlődjenek.
    userFindByPkMock.mockResolvedValue({ id: 4 });
    matchDestroyMock.mockResolvedValue(3);
    userDestroyMock.mockResolvedValue(1);

    const res = await request(app).delete('/api/admin/users/4');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Felhasználó és mérkőzései törölve' });
    expect(matchDestroyMock).toHaveBeenCalledWith({ where: { created_by: 4 }, transaction: transactionMock });
    expect(userDestroyMock).toHaveBeenCalledWith({ where: { id: 4 }, transaction: transactionMock });
    expect(transactionMock.commit).toHaveBeenCalled();
    expect(transactionMock.rollback).not.toHaveBeenCalled();
  });

  it('DELETE /api/admin/matches/:id returns 400 for invalid match id', async () => {
    const res = await request(app).delete('/api/admin/matches/not-a-number');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Érvénytelen mérkőzés azonosító' });
  });

  it('DELETE /api/admin/matches/:id returns 404 when nothing deleted', async () => {
    // Ne adjon vissza sikert, ha valójában nem törölt semmit.
    matchDestroyMock.mockResolvedValue(0);

    const res = await request(app).delete('/api/admin/matches/6');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Mérkőzés nem található' });
  });

  it('DELETE /api/admin/matches/:id deletes match', async () => {
    matchDestroyMock.mockResolvedValue(1);

    const res = await request(app).delete('/api/admin/matches/6');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Mérkőzés törölve' });
    expect(matchDestroyMock).toHaveBeenCalledWith({ where: { id: 6 } });
  });
});
