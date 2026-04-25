import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a regisztracio, bejelentkezes es jelszocsere endpointjait ellenorzi.

const comparePasswordMock = vi.hoisted(() => vi.fn());
const saveMock = vi.hoisted(() => vi.fn());
const findByPkMock = vi.hoisted(() => vi.fn());
const findOneMock = vi.hoisted(() => vi.fn());
const createMock = vi.hoisted(() => vi.fn());

const verifyTokenMock = vi.hoisted(() =>
  vi.fn((req, res, next) => {
    req.userId = 10;
    next();
  })
);

vi.mock('../../middleware/auth.js', () => ({
  verifyToken: verifyTokenMock
}));

vi.mock('../../models/User.js', () => ({
  default: {
    findByPk: findByPkMock,
    findOne: findOneMock,
    create: createMock
  }
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(() => 'token-123')
  }
}));

import authRouter from '../../routes/auth.js';

describe('auth routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);

    verifyTokenMock.mockClear();
    findByPkMock.mockReset();
    findOneMock.mockReset();
    createMock.mockReset();
    comparePasswordMock.mockReset();
    saveMock.mockReset();
  });

  describe('register', () => {
    // Regisztráció: hiányzó mezőknél 400 hibaüzenet
    it('POST /api/auth/register returns 400 when fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'only-name'
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Összes mező kitöltése szükséges' });
      expect(findOneMock).not.toHaveBeenCalled();
      expect(createMock).not.toHaveBeenCalled();
    });

    // Regisztráció: 6 karakternél rövidebb jelszónál 400 hibaüzenet
    it('POST /api/auth/register returns 400 when password is too short', async () => {
      // Rövid jelszóval ne induljon el a regisztráció.
      const res = await request(app).post('/api/auth/register').send({
        username: 'shortpassuser',
        email: 'short@example.com',
        password: '12345'
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        message: 'A jelszónak legalább 6 karakter hosszúnak kell lennie'
      });
      expect(findOneMock).not.toHaveBeenCalled();
      expect(createMock).not.toHaveBeenCalled();
    });

    // Regisztráció: már létező felhasználónál 400 hibaüzenet
    it('POST /api/auth/register returns 400 when user already exists', async () => {
      findOneMock.mockResolvedValue({ id: 99, username: 'validuser' });

      const res = await request(app).post('/api/auth/register').send({
        username: 'validuser',
        email: 'valid@example.com',
        password: '123456'
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Felhasználó vagy email már létezik' });
      expect(createMock).not.toHaveBeenCalled();
    });

    // Regisztráció: pontosan 6 karakteres jelszó elfogadott legyen
    it('POST /api/auth/register accepts password with 6 characters', async () => {
      // A minimumhossz pontosan 6 karakterrel legyen elfogadott.
      findOneMock.mockResolvedValue(null);
      createMock.mockResolvedValue({
        id: 5,
        username: 'validuser',
        email: 'valid@example.com',
        role: 'user'
      });

      const res = await request(app).post('/api/auth/register').send({
        username: 'validuser',
        email: 'valid@example.com',
        password: '123456'
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: 'Sikeres regisztráció',
        token: 'token-123',
        user: {
          id: 5,
          username: 'validuser',
          email: 'valid@example.com',
          role: 'user'
        }
      });
      expect(createMock).toHaveBeenCalledWith({
        username: 'validuser',
        email: 'valid@example.com',
        password_hash: '123456'
      });
    });
  });

  describe('login', () => {
    // Bejelentkezés: hiányzó mezőknél 400 hibaüzenet
    it('POST /api/auth/login returns 400 when fields are missing', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com'
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Email és jelszó szükséges' });
      expect(findOneMock).not.toHaveBeenCalled();
    });

    // Bejelentkezés: nem létező felhasználónál 401 hiba
    it('POST /api/auth/login returns 401 when user is not found', async () => {
      findOneMock.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'missing@example.com',
        password: 'abc123'
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Hibás email vagy jelszó' });
    });

    // Bejelentkezés: hibás jelszónál 401 hiba
    it('POST /api/auth/login returns 401 when password is invalid', async () => {
      findOneMock.mockResolvedValue({
        comparePassword: comparePasswordMock
      });
      comparePasswordMock.mockResolvedValue(false);

      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'wrong-pass'
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Hibás email vagy jelszó' });
    });

    // Bejelentkezés: helyes adatokkal 200 és token
    it('POST /api/auth/login returns 200 on success', async () => {
      findOneMock.mockResolvedValue({
        id: 7,
        username: 'john',
        email: 'john@example.com',
        role: 'user',
        comparePassword: comparePasswordMock
      });
      comparePasswordMock.mockResolvedValue(true);

      const res = await request(app).post('/api/auth/login').send({
        email: 'john@example.com',
        password: 'ok-pass'
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Sikeres bejelentkezés',
        token: 'token-123',
        user: {
          id: 7,
          username: 'john',
          email: 'john@example.com',
          role: 'user'
        }
      });
    });
  });

  describe('change password', () => {

  // Jelszócsere: hiányzó mezőknél 400 hibaüzenet
  it('PUT /api/auth/change-password returns 400 when fields are missing', async () => {
    const res = await request(app).put('/api/auth/change-password').send({
      currentPassword: 'old123',
      newPassword: 'new123'
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Minden jelszó mező kitöltése kötelező' });
  });

  // Jelszócsere: új jelszó 6 karakternél rövidebb 400 hibaüzenet
  it('PUT /api/auth/change-password returns 400 when new password is too short', async () => {
    const res = await request(app).put('/api/auth/change-password').send({
      currentPassword: 'old123',
      newPassword: '123',
      confirmPassword: '123'
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Az új jelszónak legalább 6 karakterből kell állnia' });
  });

  // Jelszócsere: nem egyező megerősítésnél 400 hibaüzenet
  it('PUT /api/auth/change-password returns 400 on confirmation mismatch', async () => {
    // Ne lehessen eltérő jelszóval jelszót cserélni.
    const res = await request(app).put('/api/auth/change-password').send({
      currentPassword: 'old123',
      newPassword: 'new1234',
      confirmPassword: 'new9999'
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Az új jelszó és a megerősítés nem egyezik' });
  });

  // Jelszócsere: nem létező felhasználónál 404 hiba
  it('PUT /api/auth/change-password returns 404 when user is missing', async () => {
    findByPkMock.mockResolvedValue(null);

    const res = await request(app).put('/api/auth/change-password').send({
      currentPassword: 'old123',
      newPassword: 'new1234',
      confirmPassword: 'new1234'
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: 'Felhasználó nem található' });
  });

  // Jelszócsere: hibás jelenlegi jelszónál 400 hibaüzenet
  it('PUT /api/auth/change-password returns 400 when current password is invalid', async () => {
    // Rossz jelenlegi jelszónál ne történjen mentés.
    findByPkMock.mockResolvedValue({
      comparePassword: comparePasswordMock,
      save: saveMock
    });
    comparePasswordMock.mockResolvedValue(false);

    const res = await request(app).put('/api/auth/change-password').send({
      currentPassword: 'bad-old',
      newPassword: 'new1234',
      confirmPassword: 'new1234'
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'A jelenlegi jelszó hibás' });
    expect(saveMock).not.toHaveBeenCalled();
  });

  // Jelszócsere: sikeres csere esetén új hash kerül mentésre
  it('PUT /api/auth/change-password updates password on success', async () => {
    // Sikeres csere esetén tényleg új hash kerüljön mentésre.
    const userMock = {
      password_hash: 'oldHash',
      comparePassword: comparePasswordMock,
      save: saveMock
    };

    findByPkMock.mockResolvedValue(userMock);
    comparePasswordMock.mockResolvedValue(true);
    saveMock.mockResolvedValue(true);

    const res = await request(app).put('/api/auth/change-password').send({
      currentPassword: 'old1234',
      newPassword: 'new1234',
      confirmPassword: 'new1234'
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Jelszó sikeresen módosítva' });
    expect(userMock.password_hash).toBe('new1234');
    expect(saveMock).toHaveBeenCalled();
  });
  });
});
