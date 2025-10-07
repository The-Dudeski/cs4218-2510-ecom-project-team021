import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';

jest.mock('../Header', () => () => <div data-testid="header-mock" />);
jest.mock('../Footer', () => () => <div data-testid="footer-mock" />);

describe('Layout', () => {
  it('renders head tags and children', () => {
    render(
      <MemoryRouter>
        <Layout title="T" description="D" keywords="K" author="A">
          <div>child-content</div>
        </Layout>
      </MemoryRouter>
    );

    expect(screen.getByTestId('header-mock')).toBeInTheDocument();
    expect(screen.getByTestId('footer-mock')).toBeInTheDocument();
    expect(screen.getByText('child-content')).toBeInTheDocument();
  });
});


