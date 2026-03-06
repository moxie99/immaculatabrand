import { toast as shadcnToast, useToast as useShadcnToast } from './use-toast';

/**
 * Enhanced toast hook that wraps Shadcn toast functionality
 * with convenient helper methods for common toast types.
 */
export function useToast() {
  const shadcnHook = useShadcnToast();

  return {
    ...shadcnHook,
    
    /**
     * Display a success toast notification
     */
    success: (title: string, description?: string) => {
      return shadcnToast({
        title,
        description,
        variant: 'default',
        duration: 3000,
      });
    },

    /**
     * Display an error toast notification
     */
    error: (title: string, description?: string) => {
      return shadcnToast({
        title,
        description,
        variant: 'destructive',
        duration: 5000,
      });
    },

    /**
     * Display a warning toast notification
     */
    warning: (title: string, description?: string) => {
      return shadcnToast({
        title,
        description,
        variant: 'default',
        duration: 4000,
      });
    },

    /**
     * Display an info toast notification
     */
    info: (title: string, description?: string) => {
      return shadcnToast({
        title,
        description,
        variant: 'default',
        duration: 3000,
      });
    },
  };
}

// Re-export the toast function for direct usage
export { toast } from './use-toast';
