import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

jest.mock('../../../components/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../../components/UserMenu', () => () => <div data-testid="user-menu" />);
jest.mock('../../../context/auth', () => ({
  useAuth: () => ([{ user: { name: 'Alice', email: 'a@example.com', address: '123 St' } }]),
}));

describe('User Dashboard', () => {
  it('renders user details and menu', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.getByText('123 St')).toBeInTheDocument();
  });
});


