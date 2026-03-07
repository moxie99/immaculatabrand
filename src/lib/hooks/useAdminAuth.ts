'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const SESSION_TIMEOUT = 2 * 60 * 1000; // 2 minutes in milliseconds
const SESSION_KEY = 'admin_session';
const LAST_ACTIVITY_KEY = 'admin_last_activity';

interface AdminSession {
  username: string;
  authenticated: boolean;
  timestamp: number;
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activityCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Check if session is valid
  const checkSession = useCallback(() => {
    if (typeof window === 'undefined') return false;

    const sessionData = localStorage.getItem(SESSION_KEY);
    const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

    if (!sessionData || !lastActivity) {
      return false;
    }

    try {
      const session: AdminSession = JSON.parse(sessionData);
      const lastActivityTime = parseInt(lastActivity, 10);
      const now = Date.now();

      // Check if session has expired
      if (now - lastActivityTime > SESSION_TIMEOUT) {
        logout();
        return false;
      }

      return session.authenticated;
    } catch {
      return false;
    }
  }, []);

  // Update last activity timestamp
  const updateActivity = useCallback(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  }, []);

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      // Create Basic Auth header
      const credentials = btoa(`${username}:${password}`);
      
      // Test authentication by making a request to an admin API endpoint
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      if (response.ok || response.status === 200) {
        // Store session
        const session: AdminSession = {
          username,
          authenticated: true,
          timestamp: Date.now(),
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        
        setIsAuthenticated(true);
        setUsername(username);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    setIsAuthenticated(false);
    setUsername(null);

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (activityCheckRef.current) {
      clearInterval(activityCheckRef.current);
    }
  }, []);

  // Setup activity monitoring
  const setupActivityMonitoring = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Update activity on user interactions
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Check session validity every 10 seconds
    activityCheckRef.current = setInterval(() => {
      if (!checkSession()) {
        logout();
      }
    }, 10000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (activityCheckRef.current) {
        clearInterval(activityCheckRef.current);
      }
    };
  }, [checkSession, logout, updateActivity]);

  // Initialize authentication state
  useEffect(() => {
    const isValid = checkSession();
    
    if (isValid) {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        try {
          const session: AdminSession = JSON.parse(sessionData);
          setUsername(session.username);
          setIsAuthenticated(true);
        } catch {
          logout();
        }
      }
    }

    setIsLoading(false);
  }, [checkSession, logout]);

  // Setup activity monitoring when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const cleanup = setupActivityMonitoring();
      return cleanup;
    }
  }, [isAuthenticated, setupActivityMonitoring]);

  return {
    isAuthenticated,
    isLoading,
    username,
    login,
    logout,
  };
}
