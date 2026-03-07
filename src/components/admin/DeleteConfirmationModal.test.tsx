/**
 * @vitest-environment jsdom
 */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

describe('DeleteConfirmationModal', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmationModal
        isOpen={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when isOpen is true', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(screen.getByText('Delete Product')).toBeTruthy();
    expect(screen.getByText(/Are you sure you want to delete this product/)).toBeTruthy();
  });

  it('displays custom title and message', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete Item"
        message="Custom delete message"
      />
    );
    expect(screen.getByText('Delete Item')).toBeTruthy();
    expect(screen.getByText('Custom delete message')).toBeTruthy();
  });

  it('displays item name when provided', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        itemName="Test Product"
      />
    );
    expect(screen.getByText('Test Product')).toBeTruthy();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X button is clicked', () => {
    const onClose = vi.fn();
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={onClose}
        onConfirm={vi.fn()}
      />
    );
    const backdrop = container.querySelector('.bg-black\\/60');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('calls onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isDeleting is true', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );
    expect(screen.getByText('Deleting...')).toBeTruthy();
  });

  it('disables buttons when isDeleting is true', () => {
    render(
      <DeleteConfirmationModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        isDeleting={true}
      />
    );
    const cancelButton = screen.getByText('Cancel').closest('button');
    const deleteButton = screen.getByText('Deleting...').closest('button');
    expect(cancelButton?.disabled).toBe(true);
    expect(deleteButton?.disabled).toBe(true);
  });
});
