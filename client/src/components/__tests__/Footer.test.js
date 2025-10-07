import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Footer from '../Footer';

describe('Footer', () => {
  it('renders rights text', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );
    expect(screen.getByText(/All Rights Reserved/i)).toBeInTheDocument();
    expect(screen.getByText(/TestingComp/i)).toBeInTheDocument();
  });

  it('renders About, Contact and Privacy links with correct hrefs', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const aboutLink = screen.getByRole('link', { name: /about/i });
    const contactLink = screen.getByRole('link', { name: /contact/i });
    const policyLink = screen.getByRole('link', { name: /privacy policy/i });

    expect(aboutLink).toHaveAttribute('href', '/about');
    expect(contactLink).toHaveAttribute('href', '/contact');
    expect(policyLink).toHaveAttribute('href', '/policy');
  });
});


