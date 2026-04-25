import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a meccsreszletek betolteset, hibas valaszait es a megjelenest ellenorzi.

const navigateMock = vi.hoisted(() => vi.fn());
const getMatchMock = vi.hoisted(() => vi.fn());
const getTokenMock = vi.hoisted(() => vi.fn());
const isAuthenticatedMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: '12' }),
  useNavigate: () => navigateMock
}));

vi.mock('../../components/Navbar/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

vi.mock('../../api/apiClient', () => ({
  getMatch: getMatchMock,
  getToken: getTokenMock,
  isAuthenticated: isAuthenticatedMock
}));

import MatchDetails from './MatchDetails';

describe('MatchDetails page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getMatchMock.mockReset();
    getTokenMock.mockReset();
    isAuthenticatedMock.mockReset();

    getTokenMock.mockReturnValue('token-1');
  });

  it('redirects guest users to login', async () => {
    isAuthenticatedMock.mockReturnValue(false);

    render(<MatchDetails />);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('shows error view when API returns a message', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getMatchMock.mockResolvedValue({ message: 'Nincs hozzáférés' });

    render(<MatchDetails />);

    expect(await screen.findByText('❌ Nincs hozzáférés')).toBeTruthy();
    fireEvent.click(screen.getByText('← Vissza a profilhoz'));
    expect(navigateMock).toHaveBeenCalledWith('/profile');
  });

  it('renders match details for valid match data', async () => {
    isAuthenticatedMock.mockReturnValue(true);
    getMatchMock.mockResolvedValue({
      id: 12,
      game_mode: '501',
      out_mode: 'double_out',
      first_to: 3,
      created_at: '2026-04-23T10:00:00.000Z',
      status: 'finished',
      players: [
        {
          id: 1,
          name: 'Adam',
          starting_score: 501,
          final_score: 0,
          legs_won: 3,
          is_winner: true,
          rounds: [
            {
              round_number: 1,
              throws: { throw1: 60, throw2: 60, throw3: 60 },
              round_score: 180
            }
          ]
        }
      ]
    });

    render(<MatchDetails />);

    expect(await screen.findByText('🎯 Mérkőzés Részletei')).toBeTruthy();
    expect(screen.getByText('Végeredmény és Statisztikák')).toBeTruthy();
    expect(screen.getByText('Adam')).toBeTruthy();
  });
});
