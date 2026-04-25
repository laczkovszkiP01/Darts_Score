import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a regisztracio validaciojat es a sikeres regisztraciot nezI.

const navigateMock = vi.hoisted(() => vi.fn());
const registerUserMock = vi.hoisted(() => vi.fn());
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
  registerUser: registerUserMock,
  setToken: setTokenMock,
  setCurrentUser: setCurrentUserMock
}));

import Register from './Register';

describe('Register page', () => {
  beforeEach(() => {
    registerUserMock.mockReset();
    setTokenMock.mockReset();
    setCurrentUserMock.mockReset();
    navigateMock.mockReset();
    vi.stubGlobal('alert', vi.fn());
  });

  it('shows validation error when passwords do not match', () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText('Felhasználónév:'), {
      target: { value: 'john' }
    });
    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó:'), {
      target: { value: 'abcdef' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó megerősítés:'), {
      target: { value: 'zzz' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

    expect(screen.getByText('A jelszavak nem egyeznek!')).toBeTruthy();
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it('shows validation error when password is shorter than 6 chars', () => {
    render(<Register />);

    fireEvent.change(screen.getByLabelText('Felhasználónév:'), {
      target: { value: 'john' }
    });
    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó:'), {
      target: { value: '12345' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó megerősítés:'), {
      target: { value: '12345' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

    expect(screen.getByText('A jelszó legalább 6 karakter hosszú kell legyen!')).toBeTruthy();
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it('stores token and navigates on successful register', async () => {
    registerUserMock.mockResolvedValue({
      token: 'token-2',
      user: { id: 8, role: 'user' }
    });

    render(<Register />);

    fireEvent.change(screen.getByLabelText('Felhasználónév:'), {
      target: { value: 'john' }
    });
    fireEvent.change(screen.getByLabelText('Email:'), {
      target: { value: 'john@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó:'), {
      target: { value: 'abcdef' }
    });
    fireEvent.change(screen.getByLabelText('Jelszó megerősítés:'), {
      target: { value: 'abcdef' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Regisztráció' }));

    await waitFor(() => {
      expect(registerUserMock).toHaveBeenCalledWith('john', 'john@example.com', 'abcdef');
      expect(setTokenMock).toHaveBeenCalledWith('token-2');
      expect(setCurrentUserMock).toHaveBeenCalledWith({ id: 8, role: 'user' });
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });
});
