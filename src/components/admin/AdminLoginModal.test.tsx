/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AdminLoginModal } from './AdminLoginModal';

describe('AdminLoginModal', () => {
  it('renders login form', () => {
    const mockOnLogin = vi.fn();
    render(<AdminLoginModal onLogin={mockOnLogin} />);

    expect(screen.getByText('Admin Portal')).toBeTruthy();
    expect(screen.getByText('Sign in to access the dashboard')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('displays session timeout message', () => {
    const mockOnLogin = vi.fn();
    render(<AdminLoginModal onLogin={mockOnLogin} />);

    expect(screen.getByText(/session will expire after 2 minutes/i)).toBeTruthy();
  });

  it('calls onLogin with credentials when form is submitted', async () => {
    const mockOnLogin = vi.fn().mockResolvedValue(true);
    render(<AdminLoginModal onLogin={mockOnLogin} />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalledWith('admin', 'password123');
    });
  });

  it('displays error message on failed login', async () => {
    const mockOnLogin = vi.fn().mockResolvedValue(false);
    render(<AdminLoginModal onLogin={mockOnLogin} />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'credentials' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeTruthy();
    });
  });

  it('shows loading state during submission', async () => {
    const mockOnLogin = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
    render(<AdminLoginModal onLogin={mockOnLogin} />);

    const usernameInput = screen.getByPlaceholderText('Enter your username');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Signing in...')).toBeTruthy();
    });
  });

  it('validates required fields', async () => {
    const mockOnLogin = vi.fn();
    render(<AdminLoginModal onLogin={mockOnLogin} />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeTruthy();
      expect(screen.getByText('Password is required')).toBeTruthy();
    });

    expect(mockOnLogin).not.toHaveBeenCalled();
  });
});
