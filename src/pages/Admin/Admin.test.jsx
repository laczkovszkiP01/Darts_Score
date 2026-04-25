import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl az admin oldal jogosultsagait, listait es alap actionjeit nezI.

const navigateMock = vi.hoisted(() => vi.fn());
const getTokenMock = vi.hoisted(() => vi.fn());
const isAuthenticatedMock = vi.hoisted(() => vi.fn());
const isAdminMock = vi.hoisted(() => vi.fn());
const getAdminUsersMock = vi.hoisted(() => vi.fn());
const getAdminMatchesMock = vi.hoisted(() => vi.fn());
const deleteAdminUserMock = vi.hoisted(() => vi.fn());
const deleteAdminMatchMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../../components/Navbar/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

vi.mock('../../api/apiClient', () => ({
  getToken: getTokenMock,
  isAuthenticated: isAuthenticatedMock,
  isAdmin: isAdminMock,
  getAdminUsers: getAdminUsersMock,
  getAdminMatches: getAdminMatchesMock,
  deleteAdminUser: deleteAdminUserMock,
  deleteAdminMatch: deleteAdminMatchMock
}));

import Admin from './Admin';

describe('Admin page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getTokenMock.mockReset();
    isAuthenticatedMock.mockReset();
    isAdminMock.mockReset();
    getAdminUsersMock.mockReset();
    getAdminMatchesMock.mockReset();
    deleteAdminUserMock.mockReset();
    deleteAdminMatchMock.mockReset();

    getTokenMock.mockReturnValue('token-1');
  });

  it('redirects to login when user is not authenticated', async () => {
    isAuthenticatedMock.mockReturnValue(false);
    isAdminMock.mockReturnValue(false);

    render(<Admin />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to home when user is authenticated but not admin', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    isAdminMock.mockReturnValue(false);

    render(<Admin />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  it('loads and renders users and matches for admin', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    isAdminMock.mockReturnValue(true);
    getAdminUsersMock.mockResolvedValue([
      { id: 2, username: 'john', email: 'john@example.com', role: 'user' }
    ]);
    getAdminMatchesMock.mockResolvedValue([
      { id: 10, game_mode: '501', out_mode: 'double_out', creator: { username: 'john' } }
    ]);

    render(<Admin />);

    expect(await screen.findByText('Admin Felület')).toBeTruthy();
    expect(screen.getByText('john')).toBeTruthy();
    expect(screen.getByText('#10')).toBeTruthy();
    expect(getAdminUsersMock).toHaveBeenCalledWith('token-1');
    expect(getAdminMatchesMock).toHaveBeenCalledWith('token-1');
  });
});
