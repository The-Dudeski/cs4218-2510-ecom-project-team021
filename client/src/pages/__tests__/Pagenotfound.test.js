import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Pagenotfound from '../Pagenotfound';

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);

describe('Pagenotfound', () => {
  it('renders 404 and go back link', () => {
    render(
      <MemoryRouter>
        <Pagenotfound />
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/oops ! page not found/i)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /go back/i });
    expect(link).toHaveAttribute('href', '/');
  });
});


