"use client";

import React, { createContext, useState, useContext, useCallback, ReactNode, Dispatch, SetStateAction } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';
import { Flight } from '../../components/FlightCard';

export interface PassengerInput {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  seatNumber?: string;
}

export interface BookingData {
  flightId: string;
  passengers: PassengerInput[];
}

export interface Booking {
  _id: string;
  user: string;
  flight: Flight;
  passengers: PassengerInput[];
  bookingDate: string;
  pnrNumber: string;
  status: 'confirmed' | 'cancelled';
  totalPrice: number;
  paymentInfo: {
    method: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  fetchBookings: () => Promise<void>;
  createBooking: (bookingData: BookingData) => Promise<Booking | null>;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  generateTicket: (bookingId: string) => Promise<boolean>;
}

export const BookingContext = createContext<BookingContextType | null>(null);

interface BookingProviderProps {
  children: ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  const fetchBookings = useCallback(async () => {
    if (!authContext?.user) {
      setBookings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Booking[]>('/bookings');
      setBookings(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError(msg);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [authContext?.user]);

  const createBooking = useCallback(async (bookingData: BookingData): Promise<Booking | null> => {
    if (!authContext?.user) {
      setError('You must be logged in to make a booking.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<Booking>('/bookings', bookingData);
      setBookings(prev => [data, ...prev]);
      authContext.fetchWalletBalance?.();
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError(msg);
      console.error('Create Booking Error:', msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, [authContext]);

  const cancelBooking = useCallback(async (bookingId: string): Promise<boolean> => {
    if (!authContext?.user) {
      setError('You must be logged in to cancel a booking.');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      authContext.fetchWalletBalance?.();
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError(msg);
      console.error('Cancel Booking Error:', msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [authContext]);

  const generateTicket = useCallback(async (bookingId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/bookings/${bookingId}/ticket`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const disposition = response.headers['content-disposition'];
      let filename = `ticket-${bookingId}.pdf`;
      if (disposition) {
        const match = disposition.match(/filename="?(.+?)"?;/);
        if (match) filename = match[1];
      }
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      setError(msg);
      console.error('Generate Ticket Error:', msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue: BookingContextType = {
    bookings,
    loading,
    error,
    setError,
    fetchBookings,
    createBooking,
    cancelBooking,
    generateTicket,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};
