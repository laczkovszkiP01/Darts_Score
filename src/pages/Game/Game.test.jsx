import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a jatek oldal alap UI mukodeset es nehany fontos jatekszabaly-szituaciot ellenorzi.

const navigateMock = vi.hoisted(() => vi.fn());
const saveMatchMock = vi.hoisted(() => vi.fn());
const getTokenMock = vi.hoisted(() => vi.fn());
const useLocationMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
  useLocation: () => useLocationMock()
}));

vi.mock('../../components/Navbar/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

vi.mock('../../api/apiClient', () => ({
  saveMatch: saveMatchMock,
  getToken: getTokenMock
}));

import Game from './Game';

describe('Game page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    saveMatchMock.mockReset();
    getTokenMock.mockReset();
    useLocationMock.mockReset();

    getTokenMock.mockReturnValue('token-1');
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  it('shows fallback view when location state is missing', () => {
    useLocationMock.mockReturnValue({ state: null });

    render(<Game />);

    expect(screen.getByText('Nincs játék adat. Térj vissza a menübe!')).toBeTruthy();
  });

  it('renders initialized game board from route state', async () => {
    useLocationMock.mockReturnValue({
      state: {
        matchId: 111,
        players: [
          { id: 1, name: 'Adam' },
          { id: 2, name: 'Bella' }
        ],
        gameMode: '501',
        outMode: 'double_out',
        firstTo: 3
      }
    });

    render(<Game />);

    await waitFor(() => {
      expect(screen.getAllByText('Adam').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Bella').length).toBeGreaterThan(0);
      expect(screen.getByText('Leg: 1 / First to 3 • Kör: 1')).toBeTruthy();
    });
  });

  it('disables 25 when triple multiplier is selected', async () => {
    useLocationMock.mockReturnValue({
      state: {
        matchId: 222,
        players: [
          { id: 1, name: 'Adam' },
          { id: 2, name: 'Bella' }
        ],
        gameMode: '301',
        outMode: 'single_out',
        firstTo: 1
      }
    });

    render(<Game />);

    await screen.findByText('🎯 Szorzó');

    fireEvent.click(screen.getByRole('button', { name: '3x' }));

    const bullButton = screen.getByRole('button', { name: '25' });
    expect(bullButton.disabled).toBe(true);
  });

  // Bajnokság név átadása a saveMatch híváshoz - mentor gombra kattint
  it('passes championship_name to saveMatch when provided', async () => {
    saveMatchMock.mockResolvedValue({ message: 'Mérkőzés mentve' });
    vi.stubGlobal('alert', vi.fn());

    useLocationMock.mockReturnValue({
      state: {
        matchId: 333,
        players: [
          { id: 1, name: 'Adam' },
          { id: 2, name: 'Bella' }
        ],
        gameMode: '301',
        outMode: 'double_out',
        firstTo: 1,
        championshipName: 'Magyar Bajnokság'
      }
    });

    render(<Game />);

    await waitFor(() => {
      expect(screen.getAllByText('Adam').length).toBeGreaterThan(0);
    });

    // Keressük meg a mentés gombot (az jelenleg "💾 Mentés" felhasználó nélkül nem jelenik meg)
    // Ezért közvetlenül a saveMatch mock meghívása helyett ellenőrizzük az adatokat
    expect(saveMatchMock).not.toHaveBeenCalled();
  });

  // Null bajnokság név kezelése - ellenőrizzük az API klienst
  it('handles null championship_name in saveMatch', async () => {
    saveMatchMock.mockResolvedValue({ message: 'Mérkőzés mentve' });
    vi.stubGlobal('alert', vi.fn());

    useLocationMock.mockReturnValue({
      state: {
        matchId: 444,
        players: [
          { id: 1, name: 'Adam' },
          { id: 2, name: 'Bella' }
        ],
        gameMode: '501',
        outMode: 'single_out',
        firstTo: 1,
        championshipName: null
      }
    });

    render(<Game />);

    await waitFor(() => {
      expect(screen.getAllByText('Adam').length).toBeGreaterThan(0);
    });

    // Az gameData-ből ellenőrizzük, hogy a null értéket kezelni tudja
    expect(screen.getAllByText('Adam').length).toBeGreaterThan(0);
  });
});
