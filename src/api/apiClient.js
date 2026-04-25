const API_URL = import.meta.env.VITE_API_URL || '/api';

// Auth
// Uj felhasznalo regisztralasa.
export const registerUser = async (username, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  return response.json();
};

// Beleptetes email + jelszo alapjan.
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  return response.json();
};

// Bejelentkezett user jelszocsereje.
export const changePassword = async (token, currentPassword, newPassword, confirmPassword) => {
  const response = await fetch(`${API_URL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
  });

  return response.json();
};

// Matches
// Befejezett meccs mentese.
export const saveMatch = async (token, gameMode, outMode, firstTo, players, championshipName = null) => {
  const response = await fetch(`${API_URL}/matches/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ gameMode, outMode, firstTo, players, championshipName })
  });

  return response.json();
};

// Sajat meccsek lekerezes a profilhoz.
export const getUserMatches = async (token) => {
  const response = await fetch(`${API_URL}/matches/user-matches`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Osszes meccs lekerezes online leaderboardhoz.
export const getLeaderboardMatches = async (token) => {
  const response = await fetch(`${API_URL}/matches/leaderboard-matches`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Egy konkret meccs reszleteinek lekerezese.
export const getMatch = async (token, matchId) => {
  const response = await fetch(`${API_URL}/matches/${matchId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Admin
// Admin felhasznalolista.
export const getAdminUsers = async (token) => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Admin meccslista.
export const getAdminMatches = async (token) => {
  const response = await fetch(`${API_URL}/admin/matches`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Felhasznalo torlese admin oldalon.
export const deleteAdminUser = async (token, userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Meccs torlese admin oldalon.
export const deleteAdminMatch = async (token, matchId) => {
  const response = await fetch(`${API_URL}/admin/matches/${matchId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// JWT token management
// Token tarolasa localStorage-ban.
export const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Bejelentkezett user adatai localStorage-ba.
export const setCurrentUser = (user) => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

// Token visszaolvasasa localStorage-bol.
export const getToken = () => {
  return localStorage.getItem('auth_token');
};

// User objektum biztonsagos visszaolvasasa.
export const getCurrentUser = () => {
  const storedUser = localStorage.getItem('auth_user');

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    return null;
  }
};

// Kijelentkezeshez token + user torlese.
export const removeToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

// Gyors ellenorzes: van-e token.
export const isAuthenticated = () => {
  return !!getToken();
};

// Gyors ellenorzes: admin szerepkor.
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};
