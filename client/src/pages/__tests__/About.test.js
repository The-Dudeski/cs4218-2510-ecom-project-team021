import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import About from '../About';

jest.mock('../../components/Layout', () => ({ children }) => <div>{children}</div>);

describe('About page', () => {
  it('renders image and text', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );

    expect(screen.getByAltText(/contactus/i)).toBeInTheDocument();
    expect(screen.getByText(/Add text/i)).toBeInTheDocument();
  });
});


