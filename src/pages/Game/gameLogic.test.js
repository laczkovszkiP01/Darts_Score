import { describe, expect, it } from 'vitest';

// Ez a tesztfajl a darts szabalylikogika legfontosabb eseteit ellenorzi.
import { evaluateRound } from './gameLogic';

describe('evaluateRound', () => {
  // Nem szállt ki: a maradék pont 0 fölött
  it('returns ongoing state when round does not finish game', () => {
    const result = evaluateRound({
      initialScore: 301,
      outMode: 'single_out',
      throwsList: [
        { total: 60, multiplier: 3 },
        { total: 60, multiplier: 3 },
        { total: 20, multiplier: 1 }
      ]
    });

    expect(result).toEqual({
      bust: false,
      win: false,
      remaining: 161
    });
  });

  // Minuszba megy a pont, vissza az eredeti értékre
  it('returns bust when score goes below zero', () => {
    const result = evaluateRound({
      initialScore: 40,
      outMode: 'single_out',
      throwsList: [
        { total: 60, multiplier: 3 },
        { total: 0, multiplier: 1 },
        { total: 0, multiplier: 1 }
      ]
    });

    expect(result).toEqual({
      bust: true,
      win: false,
      remaining: 40
    });
  });

  // Egyenes kiszállás: bármilyen érték (nem kell dupla)
  it('allows single_out finish on non-double final throw', () => {
    const result = evaluateRound({
      initialScore: 10,
      outMode: 'single_out',
      throwsList: [
        { total: 10, multiplier: 1 },
        { total: 0, multiplier: 1 },
        { total: 0, multiplier: 1 }
      ]
    });

    expect(result).toEqual({
      bust: false,
      win: true,
      remaining: 0
    });
  });

  // Dupla kiszállás: egyszerű pont nem elég, dupla kell
  it('requires double on final throw for double_out', () => {
    const result = evaluateRound({
      initialScore: 20,
      outMode: 'double_out',
      throwsList: [
        { total: 20, multiplier: 1 },
        { total: 0, multiplier: 1 },
        { total: 0, multiplier: 1 }
      ]
    });

    expect(result).toEqual({
      bust: true,
      win: false,
      remaining: 20
    });
  });

  // Dupla kiszállás siker: pont=0, utolsó dupla
  it('accepts valid double_out finish on double throw', () => {
    const result = evaluateRound({
      initialScore: 40,
      outMode: 'double_out',
      throwsList: [
        { total: 40, multiplier: 2 },
        { total: 0, multiplier: 1 },
        { total: 0, multiplier: 1 }
      ]
    });

    expect(result).toEqual({
      bust: false,
      win: true,
      remaining: 0
    });
  });

  it('supports single_out checkout with a single dart', () => {
    // ne kelljen 3 nyíl, ha már az elsővel kiszállt.
    const result = evaluateRound({
      initialScore: 50,
      outMode: 'single_out',
      throwsList: [
        { total: 50, multiplier: 2 }
      ]
    });

    expect(result).toEqual({
      bust: false,
      win: true,
      remaining: 0
    });
  });

  it('supports double_out checkout with second dart in the round', () => {
    // Dupla kiszállónál is elég a 2. nyíl, ha ott lesz 0 a maradék.
    const result = evaluateRound({
      initialScore: 32,
      outMode: 'double_out',
      throwsList: [
        { total: 0, multiplier: 1 },
        { total: 32, multiplier: 2 }
      ]
    });

    expect(result).toEqual({
      bust: false,
      win: true,
      remaining: 0
    });
  });
});
