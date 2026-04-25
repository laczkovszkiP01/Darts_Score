import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a felhasznalo modell jelszohash es ellenorzo logikajat vizsgalja.

const defineMock = vi.hoisted(() =>
  vi.fn((name, attributes, options) => {
    function Model() {}
    Model.modelName = name;
    Model.rawAttributes = attributes;
    Model.options = options;
    return Model;
  })
);

const genSaltMock = vi.hoisted(() => vi.fn());
const hashMock = vi.hoisted(() => vi.fn());
const compareMock = vi.hoisted(() => vi.fn());

vi.mock('../../db/database.js', () => ({
  default: {
    define: defineMock
  }
}));

vi.mock('bcryptjs', () => ({
  default: {
    genSalt: genSaltMock,
    hash: hashMock,
    compare: compareMock
  }
}));

import User from '../../models/User.js';

describe('User model', () => {
  beforeEach(() => {
    genSaltMock.mockReset();
    hashMock.mockReset();
    compareMock.mockReset();
  });

  it('defines users model with expected table config', () => {
    expect(defineMock).toHaveBeenCalled();

    const [, , options] = defineMock.mock.calls[0];
    expect(options.tableName).toBe('users');
    expect(options.timestamps).toBe(false);
    expect(options.hooks).toBeTruthy();
  });

  it('hashes password before create', async () => {
    const [, , options] = defineMock.mock.calls[0];
    genSaltMock.mockResolvedValue('salt-10');
    hashMock.mockResolvedValue('hashed-pw');

    const user = { password_hash: 'plain' };
    await options.hooks.beforeCreate(user);

    expect(genSaltMock).toHaveBeenCalledWith(10);
    expect(hashMock).toHaveBeenCalledWith('plain', 'salt-10');
    expect(user.password_hash).toBe('hashed-pw');
  });

  it('hashes password before update only when password changed', async () => {
    const [, , options] = defineMock.mock.calls[0];
    genSaltMock.mockResolvedValue('salt-10');
    hashMock.mockResolvedValue('hashed-updated');

    const changedUser = {
      password_hash: 'new-plain',
      changed: vi.fn(() => true)
    };

    await options.hooks.beforeUpdate(changedUser);

    expect(changedUser.changed).toHaveBeenCalledWith('password_hash');
    expect(hashMock).toHaveBeenCalledWith('new-plain', 'salt-10');
    expect(changedUser.password_hash).toBe('hashed-updated');

    hashMock.mockClear();

    const unchangedUser = {
      password_hash: 'same',
      changed: vi.fn(() => false)
    };

    await options.hooks.beforeUpdate(unchangedUser);

    expect(hashMock).not.toHaveBeenCalled();
    expect(unchangedUser.password_hash).toBe('same');
  });

  it('comparePassword delegates to bcrypt.compare', async () => {
    compareMock.mockResolvedValue(true);

    const modelLikeUser = { password_hash: 'hashed-value' };
    const result = await User.prototype.comparePassword.call(modelLikeUser, 'plain-value');

    expect(compareMock).toHaveBeenCalledWith('plain-value', 'hashed-value');
    expect(result).toBe(true);
  });
});
