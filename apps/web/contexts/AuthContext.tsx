'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { User, authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication only once on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already authenticated via cookies
        const response = await authAPI.getProfile();
        if (response) {
          setUser(response);
        }
      } catch (error) {
        // User is not authenticated, which is fine - no need to log this
        // This is expected behavior on first load
        // Ensure user state is null when not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Always run initAuth to check current authentication status
    initAuth();
  }, []); // Empty dependency array - only run once

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AUTH: Starting login request...');
      setIsLoading(true);
      const response = await authAPI.login(email, password);
      console.log('AUTH: Login API response:', response);
      
      // Handle both old token-based and new cookie-based responses
      if (response.access_token) {
        // Legacy token-based response
        console.log('AUTH: Token-based response detected');
        localStorage.setItem('authToken', response.access_token);
        setUser(response.user);
        setIsLoading(false);
        toast.success('Login successful!');
        console.log('AUTH: Returning true for token-based login');
        return true;
      } else if (response.user) {
        // New cookie-based response
        console.log('AUTH: Cookie-based response detected');
        setUser(response.user);
        setIsLoading(false);
        toast.success('Login successful!');
        console.log('AUTH: Returning true for cookie-based login');
        return true;
      } else {
        console.log('AUTH: Invalid response - no token or user found');
        setIsLoading(false);
        toast.error('Login failed: Invalid response');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('AUTH: Login error:', error);
      setIsLoading(false);
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call backend logout endpoint to invalidate the session
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Include cookies in the request
      });
    } catch (error) {
      // Continue with logout even if backend call fails
      console.log('Backend logout call failed, continuing with local logout');
    }
    
    // Clear localStorage token
    localStorage.removeItem('authToken');
    
    // Clear the auth_token cookie by setting it to expire in the past
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear user state
    setUser(null);
    
    // Show logout message
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoading,
    login,
    logout,
    updateUser,
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 