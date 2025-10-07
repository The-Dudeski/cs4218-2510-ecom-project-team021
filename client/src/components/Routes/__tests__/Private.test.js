import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../Private';

jest.mock('../../../context/auth', () => ({
  useAuth: () => ([{ token: 'tok' }, jest.fn()]),
}));

jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { ok: true } }),
}));

jest.mock('../../Spinner', () => () => <div>spinner</div>);

describe('PrivateRoute', () => {
  it('renders outlet content when ok is true', async () => {
    render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route element={<PrivateRoute />}> 
            <Route path="/private" element={<div>private-content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText('private-content')).toBeInTheDocument());
  });
});


