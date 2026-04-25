import { describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a meccs modell mezosit es a User kapcsolatat ellenorzi.

const belongsToMock = vi.hoisted(() => vi.fn());
const defineMock = vi.hoisted(() =>
  vi.fn((name, attributes, options) => {
    function Model() {}
    Model.modelName = name;
    Model.rawAttributes = attributes;
    Model.options = options;
    Model.belongsTo = belongsToMock;
    return Model;
  })
);

vi.mock('../../db/database.js', () => ({
  default: {
    define: defineMock
  }
}));

vi.mock('../../models/User.js', () => ({
  default: { modelName: 'User' }
}));

import Match from '../../models/Match.js';
import User from '../../models/User.js';

describe('Match model', () => {
  it('defines matches model with expected metadata', () => {
    expect(defineMock).toHaveBeenCalled();

    const [name, attributes, options] = defineMock.mock.calls[0];

    expect(name).toBe('Match');
    expect(attributes.game_mode).toBeTruthy();
    expect(attributes.out_mode).toBeTruthy();
    expect(options.tableName).toBe('matches');
    expect(options.timestamps).toBe(false);
  });

  it('declares belongsTo relation to User on created_by', () => {
    expect(Match.belongsTo).toHaveBeenCalledWith(User, {
      foreignKey: 'created_by',
      as: 'creator'
    });
  });

  // A meccs modell tartalmazza az opcionális championship_name mezőt
  it('includes championship_name field in match model', () => {
    expect(defineMock).toHaveBeenCalled();

    const [, attributes] = defineMock.mock.calls[0];

    expect(attributes.championship_name).toBeTruthy();
    expect(attributes.championship_name.allowNull).toBe(true);
    expect(attributes.championship_name.defaultValue).toBe(null);
  });
});
