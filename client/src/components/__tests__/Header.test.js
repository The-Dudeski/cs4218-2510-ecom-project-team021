import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
jest.mock('../../context/auth', () => ({
  useAuth: () => ([{ user: null }, jest.fn()]),
}));

jest.mock('../../context/cart', () => ({
  useCart: () => ([[]]),
}));

jest.mock('../../hooks/useCategory', () => ({ __esModule: true, default: () => ([
  { name: 'Cat A', slug: 'cat-a' },
  { name: 'Cat B', slug: 'cat-b' },
]) }));

jest.mock('react-hot-toast', () => ({ __esModule: true, default: {}, success: jest.fn() }));
jest.mock('../Form/SearchInput', () => () => <div data-testid="search-input" />);

import Header from '../Header';

describe('Header', () => {
  it('renders brand, nav links and categories', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  
    expect(screen.getByText('🛒 Virtual Vault')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /cart/i })).toHaveAttribute('href', '/cart');

    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', '/register');
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute('href', '/login');

    expect(screen.getByRole('link', { name: /all categories/i })).toHaveAttribute('href', '/categories');
    expect(screen.getByRole('link', { name: /cat a/i })).toHaveAttribute('href', '/category/cat-a');
    expect(screen.getByRole('link', { name: /cat b/i })).toHaveAttribute('href', '/category/cat-b');
  });
});


