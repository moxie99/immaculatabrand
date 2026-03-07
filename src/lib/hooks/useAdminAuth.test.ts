/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAdminAuth } from './useAdminAuth';

describe('useAdminAuth', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with unauthenticated state', async () => {
    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.username).toBe(null);
  });

  it('successfully logs in with valid credentials', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let loginSuccess = false;
    await act(async () => {
      loginSuccess = await result.current.login('admin', 'password');
    });

    expect(loginSuccess).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.username).toBe('admin');
  });

  it('fails to login with invalid credentials', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let loginSuccess = false;
    await act(async () => {
      loginSuccess = await result.current.login('wrong', 'credentials');
    });

    expect(loginSuccess).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs out successfully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login('admin', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.username).toBe(null);
  });

  it('restores session from localStorage', async () => {
    const session = {
      username: 'admin',
      authenticated: true,
      timestamp: Date.now(),
    };

    localStorage.setItem('admin_session', JSON.stringify(session));
    localStorage.setItem('admin_last_activity', Date.now().toString());

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.username).toBe('admin');
  });

  it('clears expired session', async () => {
    const expiredTime = Date.now() - (3 * 60 * 1000); // 3 minutes ago
    const session = {
      username: 'admin',
      authenticated: true,
      timestamp: expiredTime,
    };

    localStorage.setItem('admin_session', JSON.stringify(session));
    localStorage.setItem('admin_last_activity', expiredTime.toString());

    const { result } = renderHook(() => useAdminAuth());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('admin_session')).toBe(null);
  });
});
