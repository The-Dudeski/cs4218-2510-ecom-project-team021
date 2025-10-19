import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import toast from 'react-hot-toast';
import { within } from '@testing-library/react';

const mockUseAuth = jest.fn();
const mockUseCart = jest.fn();

jest.mock('../../context/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../context/cart', () => ({
  useCart: () => mockUseCart(),
}));

jest.mock('../../hooks/useCategory', () => ({
  __esModule: true,
  default: () => [
    { name: 'Cat A', slug: 'cat-a' },
    { name: 'Cat B', slug: 'cat-b' },
  ],
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  success: jest.fn(),
  default: {
    success: jest.fn(),
  },
}));

jest.mock('../Form/SearchInput', () => () => <div data-testid="search-input" />);

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders brand, nav links and categories for logged-out user', () => {
    mockUseAuth.mockReturnValue([{ user: null }, jest.fn()]);
    mockUseCart.mockReturnValue([[]]);

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
  
  it('renders dashboard link with admin role', () => {
    mockUseAuth.mockReturnValue([{ user: { name: 'Leyli', role: 1 }, token: 'abc' }, jest.fn()]);
    mockUseCart.mockReturnValue([[{}]]);
  
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
  
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard/admin');
  });
  
  it('handles logout correctly', () => {
    const setAuth = jest.fn();
    mockUseAuth.mockReturnValue([{ user: { name: 'Leyli', role: 0 }, token: 'abc' }, setAuth]);
    mockUseCart.mockReturnValue([[{}]]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('link', { name: /logout/i }));

    expect(setAuth).toHaveBeenCalledWith({ user: null, token: '' });
    expect(toast.success).toHaveBeenCalledWith('Logout Successfully');
  });

  it('shows cart badge with zero when cart is empty', () => {
    mockUseAuth.mockReturnValue([{ user: null }, jest.fn()]);
    mockUseCart.mockReturnValue([[]]);

    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('Cart')).toBeInTheDocument();
    expect(container.querySelector('.ant-badge-count')).toHaveTextContent('0');
  });
});
