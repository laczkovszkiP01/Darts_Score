import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a navbar linkjeit es a kijelentkezes viselkedeset nezI.

const isAuthenticatedMock = vi.hoisted(() => vi.fn());
const isAdminMock = vi.hoisted(() => vi.fn());
const removeTokenMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>
}));

vi.mock('../../api/apiClient', () => ({
  isAuthenticated: isAuthenticatedMock,
  isAdmin: isAdminMock,
  removeToken: removeTokenMock
}));

import Navbar from './Navbar';

describe('Navbar', () => {
  beforeEach(() => {
    isAuthenticatedMock.mockReset();
    isAdminMock.mockReset();
    removeTokenMock.mockReset();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });
  });

  it('shows login and register links for guests', async () => {
    isAuthenticatedMock.mockReturnValue(false);
    isAdminMock.mockReturnValue(false);

    render(<Navbar />);

    expect(await screen.findByText('Bejelentkezés')).toBeTruthy();
    expect(screen.getByText('Regisztráció')).toBeTruthy();
    expect(screen.queryByText('Profil')).toBeNull();
    expect(screen.queryByText('Admin')).toBeNull();
  });

  it('shows profile and admin links for authenticated admins', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    isAdminMock.mockReturnValue(true);

    render(<Navbar />);

    expect(await screen.findByText('Profil')).toBeTruthy();
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Kijelentkezés')).toBeTruthy();
  });

  it('clears auth state on logout click', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    isAdminMock.mockReturnValue(false);

    render(<Navbar />);

    fireEvent.click(await screen.findByText('Kijelentkezés'));

    expect(removeTokenMock).toHaveBeenCalled();
    expect(window.location.href).toBe('/');
  });
});
