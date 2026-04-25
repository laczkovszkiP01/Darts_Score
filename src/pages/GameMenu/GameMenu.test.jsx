import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a meccsbeallitasok kitolteset es a hibaeseteket ellenorzi.

const navigateMock = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock
}));

vi.mock('../../components/Navbar/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

vi.mock('../../components/Footer/Footer', () => ({
  default: () => <div>Footer</div>
}));

vi.mock('../../components/ScrollToTop/ScrollToTop', () => ({
  default: () => null
}));

import GameMenu from './GameMenu';

describe('GameMenu page', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
    vi.stubGlobal('alert', vi.fn());
  });

  it('alerts when required fields are missing', () => {
    render(<GameMenu />);

    fireEvent.click(screen.getByRole('button', { name: 'Beállítás' }));

    expect(alert).toHaveBeenCalledWith('Kérlek töltsd ki az összes mezőt!');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('alerts when player names are duplicated', () => {
    render(<GameMenu />);

    fireEvent.change(screen.getByLabelText('1. játékos neve:'), {
      target: { value: 'Adam' }
    });
    fireEvent.change(screen.getByLabelText('2. játékos neve:'), {
      target: { value: ' adam ' }
    });
    fireEvent.change(screen.getByLabelText('Játék hossz:'), {
      target: { value: '301' }
    });
    fireEvent.change(screen.getByLabelText('Játék típusa:'), {
      target: { value: 'straight' }
    });
    fireEvent.change(screen.getByLabelText('Leg-ek száma (First to):'), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Beállítás' }));

    expect(alert).toHaveBeenCalledWith('A játékosok neve nem lehet azonos!');
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('navigates to game with normalized settings on valid submit', () => {
    render(<GameMenu />);

    fireEvent.change(screen.getByLabelText('1. játékos neve:'), {
      target: { value: ' Adam ' }
    });
    fireEvent.change(screen.getByLabelText('2. játékos neve:'), {
      target: { value: 'Bella' }
    });
    fireEvent.change(screen.getByLabelText('Játék hossz:'), {
      target: { value: '501' }
    });
    fireEvent.change(screen.getByLabelText('Játék típusa:'), {
      target: { value: 'double' }
    });
    fireEvent.change(screen.getByLabelText('Leg-ek száma (First to):'), {
      target: { value: '3' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Beállítás' }));

    expect(localStorage.removeItem).toHaveBeenCalledWith('darts_game_state');
    expect(localStorage.removeItem).toHaveBeenCalledWith('darts_game_result');
    expect(navigateMock).toHaveBeenCalledWith(
      '/game',
      expect.objectContaining({
        state: expect.objectContaining({
          gameMode: '501',
          outMode: 'double_out',
          firstTo: 3,
          players: [
            { id: 1, name: 'Adam' },
            { id: 2, name: 'Bella' }
          ]
        })
      })
    );
  });

  // Bajnokság név hozzáadása az optional mezőhöz
  it('passes championship_name when provided', () => {
    render(<GameMenu />);

    fireEvent.change(screen.getByLabelText('1. játékos neve:'), {
      target: { value: 'Adam' }
    });
    fireEvent.change(screen.getByLabelText('2. játékos neve:'), {
      target: { value: 'Bella' }
    });
    fireEvent.change(screen.getByLabelText('Játék hossz:'), {
      target: { value: '301' }
    });
    fireEvent.change(screen.getByLabelText('Játék típusa:'), {
      target: { value: 'straight' }
    });
    fireEvent.change(screen.getByLabelText('Leg-ek száma (First to):'), {
      target: { value: '1' }
    });
    fireEvent.change(screen.getByLabelText('Bajnokság név (opcionális):'), {
      target: { value: 'Magyar Bajnokság' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Beállítás' }));

    expect(navigateMock).toHaveBeenCalledWith(
      '/game',
      expect.objectContaining({
        state: expect.objectContaining({
          championshipName: 'Magyar Bajnokság'
        })
      })
    );
  });

  // Üres bajnokság mező (optional) kezelése
  it('handles missing championship_name as null', () => {
    render(<GameMenu />);

    fireEvent.change(screen.getByLabelText('1. játékos neve:'), {
      target: { value: 'Adam' }
    });
    fireEvent.change(screen.getByLabelText('2. játékos neve:'), {
      target: { value: 'Bella' }
    });
    fireEvent.change(screen.getByLabelText('Játék hossz:'), {
      target: { value: '501' }
    });
    fireEvent.change(screen.getByLabelText('Játék típusa:'), {
      target: { value: 'double' }
    });
    fireEvent.change(screen.getByLabelText('Leg-ek száma (First to):'), {
      target: { value: '1' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Beállítás' }));

    expect(navigateMock).toHaveBeenCalledWith(
      '/game',
      expect.objectContaining({
        state: expect.objectContaining({
          championshipName: null
        })
      })
    );
  });
});
