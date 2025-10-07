import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UserMenu from '../UserMenu';

describe('UserMenu', () => {
  it('renders links to profile and orders', () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute('href', '/dashboard/user/profile');
    expect(screen.getByRole('link', { name: /orders/i })).toHaveAttribute('href', '/dashboard/user/orders');
  });
});


