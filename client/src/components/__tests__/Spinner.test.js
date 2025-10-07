import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Spinner from '../Spinner';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/current' }),
  };
});

jest.useFakeTimers();

describe('Spinner', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders countdown text', () => {
    render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>
    );
    expect(screen.getByText(/redirecting to you in/i)).toBeInTheDocument();
    expect(screen.getByText(/3 second/i)).toBeInTheDocument();
  });

  it('counts down and navigates when reaching zero (default path)', () => {
    render(
      <MemoryRouter>
        <Spinner />
      </MemoryRouter>
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/2 second/i)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: '/current' });
  });

  it('navigates to custom path when provided', () => {
    render(
      <MemoryRouter>
        <Spinner path="dashboard" />
      </MemoryRouter>
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { state: '/current' });
  });
});