const API_URL = import.meta.env.VITE_API_URL || '/api';

// Auth
export const registerUser = async (username, email, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });

  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  return response.json();
};

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
export const saveMatch = async (token, gameMode, outMode, players) => {
  const response = await fetch(`${API_URL}/matches/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ gameMode, outMode, players })
  });

  return response.json();
};

export const getUserMatches = async (token) => {
  const response = await fetch(`${API_URL}/matches/user-matches`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

export const getMatch = async (token, matchId) => {
  const response = await fetch(`${API_URL}/matches/${matchId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

// Admin
export const getAdminUsers = async (token) => {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

export const getAdminMatches = async (token) => {
  const response = await fetch(`${API_URL}/admin/matches`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

export const deleteAdminUser = async (token, userId) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};

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
export const setToken = (token) => {
  localStorage.setItem('auth_token', token);
};

export const setCurrentUser = (user) => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const getToken = () => {
  return localStorage.getItem('auth_token');
};

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

export const removeToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};