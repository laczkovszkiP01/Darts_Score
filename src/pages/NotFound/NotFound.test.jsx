import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Ez a tesztfajl a 404-es oldal egyszeru megjeleneset ellenorzi.

vi.mock('react-router-dom', () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>
}));

vi.mock('../../components/Navbar/Navbar', () => ({
  default: () => <div>Navbar</div>
}));

import NotFound from './NotFound';

describe('NotFound page', () => {
  it('renders 404 message and home link', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeTruthy();
    expect(screen.getByText('Az oldal nem található')).toBeTruthy();
    expect(screen.getByText('Vissza a főoldalra')).toBeTruthy();
  });
});
