import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { apiClient } from '../services/api_client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check authentication status on initial load
  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthStatus();
      setLoading(false);
    };

    checkAuth();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Get the token from storage
      const token = localStorage.getItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'auth_token');

      if (!token) {
        setCurrentUser(null);
        return;
      }

      // Try to fetch user profile to validate token
      const response = await apiClient.get('/users/me');
      setCurrentUser(response.data);
    } catch (error) {
      // If token is invalid or expired, clear it
      localStorage.removeItem(process.env.NEXT_PUBLIC_JWT_TOKEN_KEY || 'auth_token');
      localStorage.removeItem(process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'refresh_token');
      setCurrentUser(null);
      console.log('Token validation failed, user logged out');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const response = await apiClient.post('/auth/signin', {
        email,
        password
      });

      if (response.data.token) {
        // Save tokens to storage
        apiClient.saveTokens(
          response.data.token,
          response.data.refresh_token
        );

        // Set current user
        setCurrentUser(response.data.user);

        // Redirect to dashboard after successful login
        router.push('/tasks');
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, confirmPassword: string) => {
    try {
      setLoading(true);

      const response = await apiClient.post('/auth/signup', {
        email,
        password,
        confirmPassword
      });

      if (response.data.token) {
        // Save tokens to storage
        apiClient.saveTokens(
          response.data.token,
          response.data.refresh_token
        );

        // Set current user
        setCurrentUser(response.data.user);

        // Redirect to dashboard after successful registration
        router.push('/tasks');
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the API to invalidate session (optional in JWT systems)
      await apiClient.post('/auth/signout');
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear tokens from storage
      apiClient.clearTokens();

      // Reset user state
      setCurrentUser(null);

      // Redirect to home page
      router.push('/');
    }
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading,
    login,
    register,
    logout,
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