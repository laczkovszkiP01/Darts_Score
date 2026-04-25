import {
  registerUser,
  loginUser,
  changePassword,
  saveMatch,
  getUserMatches,
  getLeaderboardMatches,
  getMatch,
  getAdminUsers,
  getAdminMatches,
  deleteAdminUser,
  deleteAdminMatch,
  setToken,
  setCurrentUser,
  getToken,
  getCurrentUser,
  removeToken,
  isAuthenticated,
  isAdmin
} from './apiClient';

// Ez a tesztfajl azt ellenorzi, hogy az API kliens jo endpointokra es helyes adatokkal kuld-e kérést.

describe('apiClient network calls', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: vi.fn().mockResolvedValue({ ok: true })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Regisztráció: helyes végpontra és formátummal küldi az adatokat
  it('registerUser sends POST to register endpoint', async () => {
    await registerUser('john', 'john@example.com', 'pass123');

    expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'john', email: 'john@example.com', password: 'pass123' })
    });
  });

  // Bejelentkezés: email és jelszó küldése a helyes végpontra
  it('loginUser sends POST to login endpoint', async () => {
    await loginUser('john@example.com', 'pass123');

    expect(fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'john@example.com', password: 'pass123' })
    });
  });

  // Jelszócsere: régi és új jelszó szükséges, token a fejlécben
  it('changePassword sends PUT with auth header and body', async () => {
    await changePassword('token-1', 'old123', 'new1234', 'new1234');

    expect(fetch).toHaveBeenCalledWith('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-1'
      },
      body: JSON.stringify({
        currentPassword: 'old123',
        newPassword: 'new1234',
        confirmPassword: 'new1234'
      })
    });
  });

  // A meccs mentés alapértelmezésben null bajnokság nevet küld
  it('saveMatch sends auth header and payload', async () => {
    const players = [{ name: 'A' }, { name: 'B' }];

    await saveMatch('token-1', '301', 'double-out', 3, players);

    expect(fetch).toHaveBeenCalledWith('/api/matches/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-1'
      },
      body: JSON.stringify({ gameMode: '301', outMode: 'double-out', firstTo: 3, players, championshipName: null })
    });
  });

  // Bajnokság név hozzáadása a saveMatch-hez
  it('saveMatch includes championship_name when provided', async () => {
    const players = [{ name: 'A' }, { name: 'B' }];

    await saveMatch('token-1', '501', 'single_out', 2, players, 'Magyar Bajnokság');

    expect(fetch).toHaveBeenCalledWith('/api/matches/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-1'
      },
      body: JSON.stringify({ gameMode: '501', outMode: 'single_out', firstTo: 2, players, championshipName: 'Magyar Bajnokság' })
    });
  });

  // Felhasználó meccsek: auth token szükséges
  it('getUserMatches calls the user matches endpoint with token', async () => {
    await getUserMatches('token-2');

    expect(fetch).toHaveBeenCalledWith('/api/matches/user-matches', {
      headers: { Authorization: 'Bearer token-2' }
    });
  });

  // Leaderboard meccsek: összes publikus meccs lekérése
  it('getLeaderboardMatches calls the all matches leaderboard endpoint with token', async () => {
    await getLeaderboardMatches('token-2');

    expect(fetch).toHaveBeenCalledWith('/api/matches/leaderboard-matches', {
      headers: { Authorization: 'Bearer token-2' }
    });
  });

  // Meccs részletek: egy konkrét meccs lekérése ID alapján
  it('getMatch calls match details endpoint with token', async () => {
    await getMatch('token-3', 42);

    expect(fetch).toHaveBeenCalledWith('/api/matches/42', {
      headers: { Authorization: 'Bearer token-3' }
    });
  });

  // Admin műveletek: felhasználók és meccsek listázása, törlése
  it('admin endpoints use expected URLs and methods', async () => {
    await getAdminUsers('token-a');
    await getAdminMatches('token-a');
    await deleteAdminUser('token-a', 7);
    await deleteAdminMatch('token-a', 8);

    expect(fetch).toHaveBeenNthCalledWith(1, '/api/admin/users', {
      headers: { Authorization: 'Bearer token-a' }
    });

    expect(fetch).toHaveBeenNthCalledWith(2, '/api/admin/matches', {
      headers: { Authorization: 'Bearer token-a' }
    });

    expect(fetch).toHaveBeenNthCalledWith(3, '/api/admin/users/7', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token-a' }
    });

    expect(fetch).toHaveBeenNthCalledWith(4, '/api/admin/matches/8', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token-a' }
    });
  });
});

describe('apiClient token and user helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // Token tárolás: setToken() és getToken() működése
  it('stores and returns token', () => {
    expect(isAuthenticated()).toBe(false);

    setToken('abc123');

    expect(getToken()).toBe('abc123');
    expect(isAuthenticated()).toBe(true);
  });

  // Felhasználó tárolás: admin role detektálása
  it('stores and returns current user', () => {
    const user = { id: 1, username: 'admin', role: 'admin' };

    setCurrentUser(user);

    expect(getCurrentUser()).toEqual(user);
    expect(isAdmin()).toBe(true);
  });

  // Sérült JSON kezelése: hibás user adat esetén null
  it('returns null if user JSON in localStorage is invalid', () => {
    localStorage.setItem('auth_user', '{broken-json');

    expect(getCurrentUser()).toBeNull();
    expect(isAdmin()).toBe(false);
  });

  // Kijelentkezés: token és user adat törlése
  it('removeToken clears token and user', () => {
    setToken('token-x');
    setCurrentUser({ id: 2, role: 'user' });

    removeToken();

    expect(getToken()).toBeNull();
    expect(getCurrentUser()).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });
});
