import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a token ellenorzo es admin jogosultsag middleware mukodeset teszteli.

const verifyMock = vi.hoisted(() => vi.fn());

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: verifyMock
  }
}));

import { requireAdmin, verifyToken } from '../../middleware/auth.js';

describe('auth middleware', () => {
  beforeEach(() => {
    verifyMock.mockReset();
    process.env.JWT_SECRET = 'test-secret';
  });

  // Token hiányzik: 401 hiba
  it('verifyToken returns 401 if token is missing', () => {
    const req = { headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token szükséges' });
    expect(next).not.toHaveBeenCalled();
  });

  it('verifyToken sets user info and calls next for a valid token', () => {
    // Jó tokennél a middleware tegye rá a user adatokat a kérésre.
    verifyMock.mockReturnValue({ id: 33, role: 'admin' });

    const req = { headers: { authorization: 'Bearer valid-token' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(verifyMock).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.userId).toBe(33);
    expect(req.userRole).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  it('verifyToken returns 401 for invalid token', () => {
    // Hibás tokennél álljon meg a kérés 401-gyel.
    verifyMock.mockImplementation(() => {
      throw new Error('invalid');
    });

    const req = { headers: { authorization: 'Bearer bad-token' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Érvénytelen token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requireAdmin blocks non-admin users', () => {
    // sima user ne érjen el admin végpontot.
    const req = { userRole: 'user' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Admin jogosultság szükséges' });
    expect(next).not.toHaveBeenCalled();
  });

  it('requireAdmin allows admin users', () => {
    const req = { userRole: 'admin' };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
