"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode, Dispatch, SetStateAction } from 'react';
import api from '../services/api';
import { useRouter } from 'next/navigation';

// Define a type for the user object from your backend
export interface User {
  _id: string;
  name: string;
  email: string;
  walletBalance: number;
  token?: string;
  // Add other user properties your backend returns
}

// Define the type for the context value
export interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  authError: string | null;
  setAuthError: Dispatch<SetStateAction<string | null>>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, '_id' | 'walletBalance' | 'token'> & { password?: string }) => Promise<boolean>;
  logout: () => void;
  walletBalance: number;
  fetchWalletBalance: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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
    if (!localStorage.getItem('token')) return;
    try {
      const { data } = await api.get<{ walletBalance: number }>('/users/wallet');
      setWalletBalance(data.walletBalance);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('AuthContext: Error fetching wallet balance:', msg);
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
            await fetchWalletBalance();
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : JSON.stringify(err);
          console.error('AuthContext: Session restore failed', msg);
          logout();
        }
      }
      setLoading(false);
    };
    checkUserStatus();
  }, [logout, fetchWalletBalance]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setAuthError(null);
    try {
      const { data } = await api.post<User>('/users/login', { email, password });
      if (!data.token) {
        setAuthError('Login failed: Authentication details not received.');
        setLoading(false);
        return false;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      setWalletBalance(data.walletBalance || 0);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Login failed. Please check credentials.';
      if (err instanceof Error) errorMessage = err.message;
      setAuthError(errorMessage);
      console.error('Login error:', errorMessage);
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
      const { data } = await api.post<User>('/users/register', userData);
      if (!data.token) {
        setAuthError('Registration failed: Authentication details not received.');
        setLoading(false);
        return false;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data);
      setWalletBalance(data.walletBalance || 0);
      setLoading(false);
      return true;
    } catch (err: unknown) {
      let errorMessage = 'Registration failed. Please try again.';
      if (err instanceof Error) errorMessage = err.message;
      setAuthError(errorMessage);
      console.error('Registration error:', errorMessage);
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
