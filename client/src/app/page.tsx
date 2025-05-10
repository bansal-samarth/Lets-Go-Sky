"use client";

import React, { useContext, useEffect } from 'react';
import Link from 'next/link';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function HomePage() {
  const authContext = useContext(AuthContext);

  // Handle initial loading state from AuthContext
  if (authContext?.loading && !authContext?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-500 text-xs font-medium">Loading</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <p className="text-red-500 font-medium">Auth context not available. Check RootLayout.</p>
      </div>
    );
  }

  const { user, logout } = authContext;

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-40 right-40 w-60 h-60 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Main content */}
      <motion.div 
        className="z-10 w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        <div className="backdrop-blur-sm bg-white/80 p-8 md:p-10 rounded-3xl shadow-xl border border-white/20">
          <div className="text-center mb-8">
            <motion.div 
              className="flex items-center justify-center mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent ml-3">SkyBooker</h1>
            </motion.div>

            {user ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Welcome back, <span className="text-blue-600">{user.name}</span>
                </h2>
                <p className="text-gray-500 mb-8">
                  Your passport to extraordinary journeys awaits
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Discover New Horizons
                </h2>
                <p className="text-gray-500 mb-8">
                  Your journey begins with a single click
                </p>
              </motion.div>
            )}
          </div>

          {user ? (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/search" legacyBehavior>
                <a className="flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  Search Flights
                </a>
              </Link>
              <Link href="/bookings" legacyBehavior>
                <a className="flex items-center justify-center w-full py-3 px-6 bg-white text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  My Bookings
                </a>
              </Link>
              <button
                onClick={logout}
                className="flex items-center justify-center w-full py-3 px-6 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/login" legacyBehavior>
                <a className="flex items-center justify-center w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </a>
              </Link>
              <Link href="/register" legacyBehavior>
                <a className="flex items-center justify-center w-full py-3 px-6 bg-white text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 border border-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Create Account
                </a>
              </Link>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-center text-gray-500 text-sm">
                  Experience the journey without an account
                </p>
                <Link href="/explore" legacyBehavior>
                  <a className="mt-3 flex items-center justify-center w-full py-2 px-4 text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="10 8 16 12 10 16 10 8" />
                    </svg>
                    Explore Destinations
                  </a>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="absolute bottom-4 text-center w-full text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1 }}
      >
        <p className="flex items-center justify-center">
          <span>© {new Date().getFullYear()} SkyBooker</span>
          <span className="mx-2">•</span>
          <span>Elevate Your Journey</span>
        </p>
      </motion.footer>
    </div>
  );
}