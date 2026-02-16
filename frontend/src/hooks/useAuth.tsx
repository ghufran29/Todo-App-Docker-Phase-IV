'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { UserPublic } from '../types/user';
import { apiClient } from '../services/api_client';
import { useRouter } from 'next/navigation';


interface AuthContextType {
  currentUser: UserPublic | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();


  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthStatus();
    };

    checkAuth();
  }, []);


  const checkAuthStatus = async () => {
    try {
      setLoading(true);

      // Get token from storage
      const token = localStorage.getItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token');

      if (!token) {
        setCurrentUser(null);
        setIsAuthenticated(false);
        return;
      }

      // Try to get user profile to validate token
      const response = await apiClient.get('/api/users/me');
      setCurrentUser(response.data);
      setIsAuthenticated(true);
    } catch (err: any) {
      console.error('Auth status check error:', err);
      // Token is invalid or expired, clear it
      localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token');
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      console.log('Token validation failed, user logged out');
    } finally {
      setLoading(false);
    }
  };


  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/auth/signin', {
        email,
        password
      });

      const token = response.data.access_token || response.data.token;

      if (token) {
        // Save tokens to local storage
        localStorage.setItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token', token);
        if (response.data.refresh_token) {
          localStorage.setItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token', response.data.refresh_token);
        }

        // Update user state
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);

        // Redirect to tasks dashboard
        router.push('/tasks');
      } else {
        setError('Invalid response from server');
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.detail || 'An error occurred during login. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const register = async (email: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/api/auth/signup', {
        email,
        password,
        confirm_password: confirmPassword
      });

      const token = response.data.access_token || response.data.token;

      if (token) {
        // Save tokens to local storage
        localStorage.setItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token', token);
        if (response.data.refresh_token) {
          localStorage.setItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token', response.data.refresh_token);
        }

        // Update user state
        setCurrentUser(response.data.user);
        setIsAuthenticated(true);

        // Redirect to tasks dashboard
        router.push('/tasks');
      } else {
        setError('Invalid response from server');
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.detail || 'An error occurred during registration. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    try {
      // Call logout endpoint to invalidate session on backend (optional in JWT systems)
      await apiClient.post('/api/auth/signout');
    } catch (err) {
      console.error('Logout API error:', err);
      // Continue with local logout even if API call fails
    } finally {
      // Clear tokens from storage
      localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'access_token');
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token');

      // Clear token from API client
      apiClient.clearToken();

      // Update state
      setCurrentUser(null);
      setIsAuthenticated(false);

      // Redirect to home
      router.push('/');
    }
  };


  const value: AuthContextType = {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    checkAuthStatus
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};