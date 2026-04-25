import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a bejelentkezes sikeres es hibas eseteit ellenorzi.

const navigateMock = vi.hoisted(() => vi.fn());
const loginUserMock = vi.hoisted(() => vi.fn());
const setTokenMock = vi.hoisted(() => vi.fn());
const setCurrentUserMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  Link: ({ children }) => <a href="#">{children}</a>
}));

vi.mock('../../components/Navbar/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

vi.mock('../../api/apiClient', () => ({
  loginUser: loginUserMock,
  setToken: setTokenMock,
  setCurrentUser: setCurrentUserMock
}));

import Login from './Login';

describe('Login page', () => {
  beforeEach(() => {
    loginUserMock.mockReset();
    setTokenMock.mockReset();
    setCurrentUserMock.mockReset();
    navigateMock.mockReset();
    vi.stubGlobal('alert', vi.fn());
  });

  it('shows API message when login fails', async () => {
    loginUserMock.mockResolvedValue({ message: 'Hibás email vagy jelszó' });

    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó:'), {
      target: { value: 'wrongpass' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Bejelentkezés' }));

    await screen.findByText('Hibás email vagy jelszó');
    expect(setTokenMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('stores token and navigates on successful login', async () => {
    loginUserMock.mockResolvedValue({
      token: 'token-1',
      user: { id: 5, role: 'user' }
    });

    render(<Login />);

    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó:'), {
      target: { value: 'goodpass' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Bejelentkezés' }));

    await waitFor(() => {
      expect(setTokenMock).toHaveBeenCalledWith('token-1');
      expect(setCurrentUserMock).toHaveBeenCalledWith({ id: 5, role: 'user' });
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });
});
