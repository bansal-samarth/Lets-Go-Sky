"use client"; // Since MyBookings uses client hooks

import React, { useContext, useEffect } from 'react';
import MyBookings from '../../../components/MyBookings'; // Adjust path or use alias @/components/MyBookings
import { AuthContext, AuthContextType } from '../../context/AuthContext'; // Adjust path or use alias @/context/AuthContext
import { useRouter } from 'next/navigation';
import { FaHistory, FaSpinner, FaExclamationTriangle, FaPlaneDeparture } from 'react-icons/fa';
import Link from 'next/link';

export default function BookingHistoryPage() {
  const authContext = useContext(AuthContext);
  const router = useRouter();

  // This check handles the case where AuthContext might still be loading or user is not logged in
  useEffect(() => {
    if (!authContext?.loading && !authContext?.user) {
      router.replace('/login?from=/bookings'); // Redirect if not logged in after auth check
    }
  }, [authContext?.loading, authContext?.user, router]);

  if (authContext?.loading || !authContext?.user) {
    // Show a loading state while AuthContext determines user status
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-center py-12">
        <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mb-4" />
        <p className="text-lg text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-6 sm:mb-0">
              <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 flex items-center">
                <span className="bg-blue-100 p-3 rounded-full mr-4">
                  <FaHistory className="text-blue-600" />
                </span>
                My Bookings
              </h1>
              <p className="mt-2 text-md text-blue-700">
                Review and manage your flight reservations
              </p>
            </div>
            <Link 
              href="/" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <FaPlaneDeparture className="mr-2" />
              Book New Flight
            </Link>
          </div>
        </div>

        <div className="bg-white p-0 md:p-6 rounded-xl shadow-lg border border-blue-100">
          <MyBookings />
        </div>
      </div>
    </div>
  );
}