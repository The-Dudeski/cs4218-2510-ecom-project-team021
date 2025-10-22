import React from 'react';
import { render, screen } from '@testing-library/react';
import Search from './Search';

jest.mock('../context/search', () => ({
  useSearch: jest.fn(),
}));

jest.mock('../components/Layout', () => ({ children }) => <div>{children}</div>);

describe('Search Page', () => {
  const mockUseSearch = require('../context/search').useSearch;

  it('shows fallback when no products found', () => {
    mockUseSearch.mockReturnValue([{ results: [] }, jest.fn()]);

    render(<Search />);
    expect(screen.getByText('No Products Found')).toBeInTheDocument();
  });

  it('shows product cards when results are present', () => {
    mockUseSearch.mockReturnValue([
      {
        results: [
          {
            _id: 'p1',
            name: 'Test Product',
            description: 'A great item',
            price: 99.99,
          },
        ],
      },
      jest.fn(),
    ]);

    render(<Search />);
    expect(screen.getByText('Found 1')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$ 99.99')).toBeInTheDocument();
  });
});
