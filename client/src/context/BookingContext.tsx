// client/context/BookingContext.tsx
"use client";

import React, { createContext, useState, useContext, useCallback, ReactNode, Dispatch, SetStateAction } from 'react';
import api from '../services/api'; // OR Path Alias: import api from '@/services/api';
import { AuthContext, AuthContextType as AuthContextValueType } from './AuthContext'; // OR Path Alias
import { Flight } from '../../components/FlightCard'; // OR Path Alias

// Exporting these interfaces so they can be used for typing elsewhere (e.g., in components)
export interface PassengerInput {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
}

export interface PassengerData extends Omit<PassengerInput, 'age'> {
  age: number;
  seatNumber?: string;
}

export interface BookingData {
  flightId: string;
  passengers: PassengerData[];
}

export interface Booking {
  _id: string;
  user: string;
  flight: Flight; // Assuming Flight interface is imported from FlightCard or defined globally
  passengers: PassengerData[];
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

// EXPORT THE TYPE for the context value
export interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>; // For setting/clearing errors from context
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext); // Can be AuthContextValueType | null

  const fetchBookings = useCallback(async () => {
    if (!authContext?.user) {
        // console.log("User not available for fetching bookings.");
        // setError("Please log in to see your bookings."); // Optionally set an error
        setBookings([]); // Clear bookings if user logs out or isn't available
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Booking[]>('/bookings');
      setBookings(data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [authContext?.user]);

  const createBooking = async (bookingData: BookingData): Promise<Booking | null> => {
    if (!authContext?.user) {
        setError('You must be logged in to make a booking.');
        return null;
    }
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post<Booking>('/bookings', bookingData);
      setBookings(prev => {
        const updatedBookings = [...prev, data];
        // Sort bookings (e.g., by creation date descending) if desired after adding
        return updatedBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      if (authContext?.fetchWalletBalance) {
         await authContext.fetchWalletBalance();
      }
      return data;
    } catch (err: any) {
      const apiError = err.response?.data?.message || 'Failed to create booking.';
      setError(apiError);
      console.error("Create Booking Error:", err.response || err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    if (!authContext?.user) {
        setError('You must be logged in to cancel a booking.');
        return false;
    }
    setLoading(true);
    setError(null);
    try {
        await api.put(`/bookings/${bookingId}/cancel`);
        // Instead of re-fetching all, update local state for better UX
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b ));
        if (authContext?.fetchWalletBalance) {
            await authContext.fetchWalletBalance();
        }
        return true;
    } catch (err:any) {
        setError(err.response?.data?.message || 'Failed to cancel booking.');
        return false;
    } finally {
        setLoading(false);
    }
  };

  const generateTicket = async (bookingId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/bookings/${bookingId}/ticket`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = `ticket-${bookingId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
        if (filenameMatch && filenameMatch.length > 1) {
          filename = filenameMatch[1];
        }
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download ticket.');
      console.error("Generate Ticket Error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const contextValue: BookingContextType = {
    bookings,
    loading,
    error,
    setError, // Expose setError
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