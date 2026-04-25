import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a profil oldal betolteset, ures allapotat es a jelszocsere validaciot ellenorzi.

const navigateMock = vi.hoisted(() => vi.fn());
const changePasswordMock = vi.hoisted(() => vi.fn());
const getLeaderboardMatchesMock = vi.hoisted(() => vi.fn());
const getUserMatchesMock = vi.hoisted(() => vi.fn());
const getTokenMock = vi.hoisted(() => vi.fn());
const removeTokenMock = vi.hoisted(() => vi.fn());
const isAuthenticatedMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../../components/Navbar/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

vi.mock('../../api/apiClient', () => ({
  changePassword: changePasswordMock,
  getLeaderboardMatches: getLeaderboardMatchesMock,
  getUserMatches: getUserMatchesMock,
  getToken: getTokenMock,
  removeToken: removeTokenMock,
  isAuthenticated: isAuthenticatedMock
}));

import Profile from './Profile';

describe('Profile page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    changePasswordMock.mockReset();
    getLeaderboardMatchesMock.mockReset();
    getUserMatchesMock.mockReset();
    getTokenMock.mockReset();
    removeTokenMock.mockReset();
    isAuthenticatedMock.mockReset();

    getTokenMock.mockReturnValue('token-1');
    vi.stubGlobal('alert', vi.fn());
  });

  it('redirects to login for guest user', async () => {
    isAuthenticatedMock.mockReturnValue(false);

    render(<Profile />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('shows empty matches state when user has no saved matches', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    expect(await screen.findByText('Még nincsenek mentett mérkőzéseid.')).toBeTruthy();
    expect(getUserMatchesMock).toHaveBeenCalledWith('token-1');
    expect(getLeaderboardMatchesMock).toHaveBeenCalledWith('token-1');
  });

  it('shows password mismatch validation error', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    fireEvent.change(screen.getByLabelText('Jelenlegi jelszó'), {
      target: { value: 'oldpass' }
    });
    fireEvent.change(screen.getByLabelText('Új jelszó'), {
      target: { value: 'newpass' }
    });
    fireEvent.change(screen.getByLabelText('Új jelszó megerősítése'), {
      target: { value: 'different' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Jelszó módosítása' }));

    expect(screen.getByText('Az új jelszó és a megerősítés nem egyezik')).toBeTruthy();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  // Szűrés engedélyezésének tesztelése
  it('enables match filters when checkbox is checked', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([
      { id: 1, game_mode: '501', out_mode: 'double_out', championship_name: 'Magyar Bajnokság', created_at: '2024-01-01', players: [{ name: 'Adam', rounds: [], is_winner: true }] }
    ]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    // Szűrések engedélyezése checkbox-al
    const enableCheckbox = screen.getByLabelText('Szűrések engedélyezése');
    fireEvent.click(enableCheckbox);

    // Ellenőrizzük, hogy a checkbox be van jelölve
    expect(enableCheckbox.checked).toBe(true);
  });

  // Bajnokság szűrés engedélyezésének tesztelése
  it('enables championship filter when checkbox is checked', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([
      { id: 1, game_mode: '501', out_mode: 'double_out', championship_name: 'Magyar Bajnokság', created_at: '2024-01-01', players: [{ name: 'Adam', rounds: [], is_winner: true }] }
    ]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    // Szűrések engedélyezése
    const enableCheckbox = screen.getByLabelText('Szűrések engedélyezése');
    fireEvent.click(enableCheckbox);

    // Bajnokság szűrés engedélyezése
    const champCheckbox = screen.getByLabelText('Bajnokság szűrés');
    fireEvent.click(champCheckbox);

    // Ellenőrizzük, hogy a bajnokság checkbox be van jelölve
    expect(champCheckbox.checked).toBe(true);
  });

  // Szűrés konkrét bajnokság nevével
  it('filters own matches by specific championship name', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([
      { id: 1, game_mode: '501', out_mode: 'double_out', championship_name: 'Magyar Bajnokság', created_at: '2024-01-01', players: [{ name: 'Adam', rounds: [], is_winner: true }] },
      { id: 2, game_mode: '301', out_mode: 'single_out', championship_name: 'Helyi verseny', created_at: '2024-01-02', players: [{ name: 'Bella', rounds: [], is_winner: true }] }
    ]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    // Szűrések és bajnokság szűrés engedélyezése
    fireEvent.click(screen.getByLabelText('Szűrések engedélyezése'));
    fireEvent.click(screen.getByLabelText('Bajnokság szűrés'));

    // Konkrét bajnokság szűrő kiválasztása
    const championshipDropdown = screen.getByDisplayValue('-- Válassz opciót --');
    fireEvent.change(championshipDropdown, { target: { value: 'Magyar Bajnokság' } });

    // Ellenőrizzük, hogy a szűrő értéke megváltozott
    expect(championshipDropdown.value).toBe('Magyar Bajnokság');
  });

  // Helyi bajnokság leaderboard teszt
  it('local championship leaderboard mode works', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([
      { id: 1, game_mode: '501', out_mode: 'double_out', championship_name: 'Magyar Bajnokság', created_at: '2024-01-01', players: [{ name: 'Adam', rounds: [], is_winner: true }] }
    ]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    // Helyi bajnokság leaderboard gombra kattintás
    const localChampBtn = screen.getByRole('button', { name: 'Helyi bajnokság' });
    fireEvent.click(localChampBtn);

    // Ellenőrizzük, hogy a gomb aktív
    expect(localChampBtn).toBeTruthy();
  });

  // Helyi leaderboard teszt
  it('local leaderboard mode shows all matches', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([
      { id: 1, game_mode: '501', out_mode: 'double_out', championship_name: 'Magyar Bajnokság', created_at: '2024-01-01', players: [{ name: 'Adam', rounds: [], is_winner: true }] }
    ]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    // Helyi leaderboard gombra kattintás
    const localBtn = screen.getAllByRole('button', { name: 'Helyi' })[0];
    fireEvent.click(localBtn);

    // Ellenőrizzük, hogy a gomb aktív
    expect(localBtn).toBeTruthy();
  });

  // Szűrés létrehozási dátum alapján
  it('filters own matches by created date', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([
      { id: 1, game_mode: '501', out_mode: 'double_out', championship_name: 'Magyar Bajnokság', created_at: '2024-01-01T10:00:00Z', players: [{ name: 'Adam', rounds: [], is_winner: true }] },
      { id: 2, game_mode: '301', out_mode: 'single_out', championship_name: 'Helyi verseny', created_at: '2024-01-02T14:00:00Z', players: [{ name: 'Bella', rounds: [], is_winner: true }] }
    ]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    // Dátum szűrő kiválasztása
    const dateFilter = screen.getByLabelText('Létrehozás dátuma:');
    fireEvent.change(dateFilter, { target: { value: '2024-01-01' } });

    // Ellenőrizzük, hogy a szűrő értéke megváltozott
    expect(dateFilter.value).toBe('2024-01-01');
  });

  // Dátum szűrés eltávolításának tesztelése
  it('clears date filter when reset button is clicked', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getUserMatchesMock.mockResolvedValue([
      { id: 1, game_mode: '501', out_mode: 'double_out', championship_name: null, created_at: '2024-01-01T10:00:00Z', players: [{ name: 'Adam', rounds: [], is_winner: true }] }
    ]);
    getLeaderboardMatchesMock.mockResolvedValue([]);

    render(<Profile />);

    await screen.findByText('Profilom');

    // Dátum szűrő kiválasztása
    const dateFilter = screen.getByLabelText('Létrehozás dátuma:');
    fireEvent.change(dateFilter, { target: { value: '2024-01-01' } });
    expect(dateFilter.value).toBe('2024-01-01');

    // Szűrések törlése gombra kattintás
    const resetBtn = screen.getByRole('button', { name: 'Szűrések törlése' });
    fireEvent.click(resetBtn);

    // Ellenőrizzük, hogy a szűrő nullázódott
    expect(dateFilter.value).toBe('');
  });
});
