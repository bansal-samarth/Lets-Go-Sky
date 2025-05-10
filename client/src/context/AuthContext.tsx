// src/context/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode, Dispatch, SetStateAction } from 'react';
import api from '../services/api'; // Corrected path, as context is in src/context and services is in client/services
import { useRouter } from 'next/navigation';

// Define a type for the user object from your backend
export interface User {
  _id: string;
  name: string;
  email: string;
  walletBalance: number; // Assuming backend provides this
  token?: string; // Token might be part of the user object response or separate
  // Add other user properties your backend returns
  [key: string]: any; // Allow other dynamic properties
}

// Define the type for the context value
export interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean; // True during initial auth check AND during login/register operations
  authError: string | null;
  setAuthError: Dispatch<SetStateAction<string | null>>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, '_id' | 'walletBalance' | 'token'> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  walletBalance: number;
  fetchWalletBalance: () // Add this function if you need to refresh wallet separately
    => Promise<void>;
  // updateWalletBalance: (newTotalAmount: number) => Promise<void>; // Add later if needed
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Initial loading for session check
  const [authError, setAuthError] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const router = useRouter();

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setWalletBalance(0);
    setAuthError(null);
    router.push('/login');
  }, [router]);

  const fetchWalletBalance = useCallback(async () => {
    if (!localStorage.getItem('token')) return; // Only if logged in
    try {
      const { data } = await api.get<{ walletBalance: number }>('/users/wallet');
      setWalletBalance(data.walletBalance);
    } catch (err: any) {
      console.error('AuthContext: Error fetching wallet balance:', err.response?.data?.message || err.message);
    }
  }, []);

  useEffect(() => {
    const checkUserStatus = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const { data: userData } = await api.get<User>('/users/profile');
          setUser(userData);
          if (userData.walletBalance !== undefined) {
            setWalletBalance(userData.walletBalance);
          } else {
            await fetchWalletBalance(); // Fallback if profile doesn't include it
          }
        } catch (error) {
          console.error('AuthContext: Session restore failed', error);
          logout();
        }
      }
      setLoading(false);
    };
    checkUserStatus();
  }, [logout, fetchWalletBalance]);


  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true); // Indicate auth operation is in progress
    setAuthError(null);
    try {
      // Backend should return user object including the token, or token separately
      const { data } = await api.post<User>('/users/login', { email, password });
      
      if (!data.token) {
        console.error("Login response missing token:", data);
        setAuthError("Login failed: Authentication details not received.");
        setLoading(false);
        return false;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data)); // Store full user object if needed
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      setWalletBalance(data.walletBalance || 0);
      setLoading(false);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check credentials.';
      setAuthError(errorMessage);
      console.error('Login error:', err);
      setLoading(false);
      return false;
    }
  };

  const register = async (
    userData: Omit<User, '_id' | 'walletBalance' | 'token'> & { password?: string }
  ): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);
    try {
      // Backend should return user object including the token upon successful registration
      const { data } = await api.post<User>('/users/register', userData);

      if (!data.token) {
        console.error("Register response missing token:", data);
        setAuthError("Registration failed: Authentication details not received.");
        setLoading(false);
        return false;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      setWalletBalance(data.walletBalance || 50000); // Set initial wallet balance
      setLoading(false);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setAuthError(errorMessage);
      console.error('Registration error:', err);
      setLoading(false);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    setUser,
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    walletBalance,
    fetchWalletBalance,
  };

  // This loading state is for the initial checkUserStatus.
  // The individual login/register functions handle their own "authOpLoading" (renamed to just `loading` in context)
  if (loading && !user && typeof window !== 'undefined' && !localStorage.getItem('token')) {
     return (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-[100]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-primary"></div>
        </div>
      );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};