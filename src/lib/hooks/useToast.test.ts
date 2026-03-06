import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toast as shadcnToast } from './use-toast';

// Mock the Shadcn toast module
vi.mock('./use-toast', () => ({
  useToast: vi.fn(() => ({
    toasts: [],
    toast: vi.fn(),
    dismiss: vi.fn(),
  })),
  toast: vi.fn((options) => ({
    id: '1',
    dismiss: vi.fn(),
    update: vi.fn(),
  })),
}));

describe('useToast helper functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call toast with correct parameters for success', async () => {
    // Import after mocking
    const { useToast } = await import('./useToast');
    const hook = useToast();
    
    hook.success('Success!', 'Operation completed');

    expect(shadcnToast).toHaveBeenCalledWith({
      title: 'Success!',
      description: 'Operation completed',
      variant: 'default',
      duration: 3000,
    });
  });

  it('should call toast with correct parameters for error', async () => {
    const { useToast } = await import('./useToast');
    const hook = useToast();
    
    hook.error('Error!', 'Something went wrong');

    expect(shadcnToast).toHaveBeenCalledWith({
      title: 'Error!',
      description: 'Something went wrong',
      variant: 'destructive',
      duration: 5000,
    });
  });

  it('should call toast with correct parameters for warning', async () => {
    const { useToast } = await import('./useToast');
    const hook = useToast();
    
    hook.warning('Warning!', 'Please be careful');

    expect(shadcnToast).toHaveBeenCalledWith({
      title: 'Warning!',
      description: 'Please be careful',
      variant: 'default',
      duration: 4000,
    });
  });

  it('should call toast with correct parameters for info', async () => {
    const { useToast } = await import('./useToast');
    const hook = useToast();
    
    hook.info('Info', 'Here is some information');

    expect(shadcnToast).toHaveBeenCalledWith({
      title: 'Info',
      description: 'Here is some information',
      variant: 'default',
      duration: 3000,
    });
  });

  it('should work without description', async () => {
    const { useToast } = await import('./useToast');
    const hook = useToast();
    
    hook.success('Success!');

    expect(shadcnToast).toHaveBeenCalledWith({
      title: 'Success!',
      description: undefined,
      variant: 'default',
      duration: 3000,
    });
  });

  it('should preserve original Shadcn toast functionality', async () => {
    const { useToast } = await import('./useToast');
    const hook = useToast();
    
    expect(hook.toast).toBeDefined();
    expect(hook.dismiss).toBeDefined();
    expect(hook.toasts).toBeDefined();
  });
});
