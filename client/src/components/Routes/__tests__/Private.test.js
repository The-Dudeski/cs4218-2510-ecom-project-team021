import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../Private';
import axios from 'axios';
import { useAuth } from '../../../context/auth';

jest.mock('axios'); 
jest.mock('../../../context/auth', () => ({
  useAuth: jest.fn(),
}));
jest.mock('../../Spinner', () => () => <div>spinner</div>);

describe('PrivateRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders outlet content when auth token is present and auth check passes', async () => {
    useAuth.mockReturnValue([{ token: 'tok' }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { ok: true } });

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/private" element={<div>private-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('private-content')).toBeInTheDocument();
    });
  });

  it('renders spinner when auth token is present but auth check fails', async () => {
    useAuth.mockReturnValue([{ token: 'tok' }, jest.fn()]);
    axios.get.mockResolvedValueOnce({ data: { ok: false } });

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/private" element={<div>private-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('spinner')).toBeInTheDocument();
    });
  });

  it('renders spinner when auth token is missing', () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);

    render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/private" element={<div>private-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('spinner')).toBeInTheDocument();
  });
});
