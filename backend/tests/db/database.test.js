import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl az adatbazis kapcsolat alap konfiguraciojat ellenorzi.

const sequelizeCtorMock = vi.hoisted(() => vi.fn(() => ({ kind: 'sequelize-instance' })));
const dotenvConfigMock = vi.hoisted(() => vi.fn());

vi.mock('sequelize', () => ({
  Sequelize: sequelizeCtorMock
}));

vi.mock('dotenv', () => ({
  default: {
    config: dotenvConfigMock
  }
}));

describe('database config', () => {
  beforeEach(() => {
    vi.resetModules();
    sequelizeCtorMock.mockClear();
    dotenvConfigMock.mockClear();

    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    process.env.DB_NAME = 'darts_db';
    process.env.DB_USER = 'postgres';
    process.env.DB_PASSWORD = 'secret';
  });

  // Adatbázis: alapértelmezett host és port
  it('uses defaults for host and port when env is missing', async () => {
    const { default: sequelize } = await import('../../db/database.js');

    expect(dotenvConfigMock).toHaveBeenCalled();
    expect(sequelizeCtorMock).toHaveBeenCalledWith(
      'darts_db',
      'postgres',
      'secret',
      expect.objectContaining({
        host: '127.0.0.1',
        port: 5432,
        dialect: 'postgres',
        logging: false
      })
    );
    expect(sequelize).toEqual({ kind: 'sequelize-instance' });
  });

  // Adatbázis: környezeti változókból olvasott host és port
  it('uses DB_HOST and DB_PORT from environment when provided', async () => {
    process.env.DB_HOST = 'db.internal';
    process.env.DB_PORT = '6543';

    await import('../../db/database.js');

    expect(sequelizeCtorMock).toHaveBeenCalledWith(
      'darts_db',
      'postgres',
      'secret',
      expect.objectContaining({
        host: 'db.internal',
        port: 6543
      })
    );
  });
});
