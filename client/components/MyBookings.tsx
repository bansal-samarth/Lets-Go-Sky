// client/components/MyBookings.tsx
"use client";

import React, { useContext, useState, useEffect } from 'react';
import { BookingContext, BookingContextType } from '../src/context/BookingContext';
import { AuthContext, AuthContextType as AuthContextValueType } from '../src/context/AuthContext';
import { formatPrice, calculateDuration } from '../lib/utils';
import {
  FaPlane, FaUsers, FaCalendarCheck, FaCalendarTimes, FaBan, FaTicketAlt,
  FaChevronDown, FaChevronUp, FaSpinner, FaExclamationCircle, FaDownload, FaTimesCircle,
  FaClock, FaCalendarAlt, FaIdCard, FaInfoCircle, FaCreditCard
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Helper to format date for display
const displayFullDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    } catch { return "Invalid Date"; }
};

const displayShortDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    } catch { return "Invalid Date"; }
};

const displayTime = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch { return "Invalid Time"; }
};

const MyBookings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  
  const bookingContext = useContext<BookingContextType | null>(BookingContext);
  const authContext = useContext<AuthContextValueType | null>(AuthContext);

  useEffect(() => {
    if (authContext?.user) {
      bookingContext?.fetchBookings();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authContext?.user]);

  if (!bookingContext || !authContext) {
    return (
      <div className="flex items-center justify-center p-8 bg-blue-50 rounded-lg text-blue-700 shadow-lg">
        <FaExclamationCircle className="mr-3 text-blue-500" />
        <p className="text-lg font-medium">Context not available. Please ensure providers are properly set up.</p>
      </div>
    );
  }

  const { bookings, loading, error, fetchBookings, cancelBooking, generateTicket, setError } = bookingContext;
  const { user, loading: authLoading } = authContext;

  const currentDate = new Date();
  const filteredBookings = bookings
    .filter(booking => {
      if (!booking?.flight?.departureTime) return false;
      if (booking.status === 'cancelled') return activeTab === 'cancelled';
      const departureDate = new Date(booking.flight.departureTime);
      return departureDate < currentDate ? activeTab === 'past' : activeTab === 'upcoming';
    })
    .sort((a, b) => {
        if (!a?.flight?.departureTime || !b?.flight?.departureTime) return 0;
        if (activeTab === 'upcoming') return new Date(a.flight.departureTime).getTime() - new Date(b.flight.departureTime).getTime();
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const toggleBookingDetails = (bookingId: string) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId);
  };

  const handleAction = async (bookingId: string, action: 'cancel' | 'download') => {
    setActionLoading(prev => ({ ...prev, [`${bookingId}-${action}`]: true }));
    setError(null);
    let success = false;
    
    if (action === 'cancel') {
      if (window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
        success = await cancelBooking(bookingId);
        if(success) {
            // Could use a toast notification here
        } else if(bookingContext.error) {
            alert(`Failed to cancel booking: ${bookingContext.error}`);
        } else {
            alert("Failed to cancel booking.");
        }
      }
    } else if (action === 'download') {
      success = await generateTicket(bookingId);
      if(!success && bookingContext.error) {
        alert(`Ticket download failed: ${bookingContext.error}`);
      } else if (!success) {
        alert("Ticket download failed. Please try again.");
      }
    }
    
    setActionLoading(prev => ({ ...prev, [`${bookingId}-${action}`]: false }));
  };

  const getStatusStyles = (status: string): string => {
    if (status === 'cancelled') return 'bg-red-50 text-red-600 ring-red-500/20';
    if (status === 'confirmed') return 'bg-emerald-50 text-emerald-600 ring-emerald-500/20';
    return 'bg-amber-50 text-amber-600 ring-amber-500/20';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'cancelled') return <FaBan className="mr-1.5 h-3 w-3" />;
    if (status === 'confirmed') return <FaCalendarCheck className="mr-1.5 h-3 w-3" />;
    return <FaClock className="mr-1.5 h-3 w-3" />;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  const detailsVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeInOut" } },
    exit: { opacity: 0, height: 0, transition: { duration: 0.2, ease: "easeInOut" } }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
          </div>
          <div className="absolute inset-0 border-t-4 border-blue-200 rounded-full opacity-25"></div>
          <div className="absolute inset-0 border-t-4 border-blue-600 rounded-full animate-spin"></div>
        </div>
        <p className="text-lg font-medium text-blue-900 mt-6">Loading your bookings...</p>
        <p className="text-sm text-blue-600 mt-2">Please wait while we fetch your travel information</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 bg-gradient-to-br from-red-50 to-blue-50 rounded-xl shadow-lg border border-red-200">
        <div className="bg-white p-4 rounded-full shadow-md mb-6">
          <FaExclamationCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-700">Unable to Load Your Bookings</h3>
        <p className="text-red-600 max-w-md mx-auto mt-2">{error}</p>
        <button 
          onClick={fetchBookings} 
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-bookings-container bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-2xl">
      <div className="flex border-b border-blue-100 mb-8 sticky top-0 backdrop-blur-lg z-10 -mx-6 px-6 py-2 bg-white/70">
        {[
          { key: 'upcoming', label: 'Upcoming', icon: <FaCalendarCheck /> },
          { key: 'past', label: 'Past Trips', icon: <FaCalendarTimes /> },
          { key: 'cancelled', label: 'Cancelled', icon: <FaBan /> },
        ].map(tabInfo => (
          <button
            key={tabInfo.key}
            onClick={() => { 
              setActiveTab(tabInfo.key as 'upcoming' | 'past' | 'cancelled'); 
              setExpandedBookingId(null); 
              setError(null); 
            }}
            className={`flex items-center py-4 px-5 -mb-px text-sm font-medium focus:outline-none transition-all duration-200 ease-in-out
                        ${activeTab === tabInfo.key
                          ? 'border-b-2 border-blue-600 text-blue-700'
                          : 'border-b-2 border-transparent text-gray-500 hover:text-blue-700 hover:border-blue-300'
                        }`}
          >
            <span className="mr-2 text-base">{tabInfo.icon}</span> {tabInfo.label}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-xl border border-blue-100">
          <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTicketAlt className="h-10 w-10 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-blue-900">No {activeTab} bookings</h3>
          <p className="text-blue-700 mt-3 max-w-md mx-auto">
            {activeTab === 'upcoming' 
              ? "You have no upcoming trips. Ready to embark on your next adventure?" 
              : `You have no ${activeTab} trips in your travel history.`}
          </p>
          {activeTab === 'upcoming' && (
            <Link href="/" className="mt-8 inline-flex items-center px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <FaPlane className="mr-2" />
                Discover Flights
            </Link>
          )}
        </div>
      ) : (
        <motion.div className="space-y-8" layout>
          <AnimatePresence>
            {filteredBookings.map((booking) => (
              <motion.div
                key={booking._id}
                layout
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-blue-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-5 pb-4 border-b border-blue-50">
                    <div>
                      <div className="flex items-center">
                        <FaIdCard className="text-blue-500 mr-2" />
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">Booking Reference</span>
                      </div>
                      <p className="text-xl font-bold text-blue-900 font-mono mt-1">{booking.pnrNumber}</p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ring-1 ${getStatusStyles(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-stretch md:space-x-8">
                    <div className="flex-grow mb-6 md:mb-0">
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className="w-2/5">
                            <p className="text-3xl font-bold text-blue-900">{booking.flight.departureAirportCode}</p>
                            <p className="text-sm text-blue-700 truncate" title={booking.flight.departureCity}>{booking.flight.departureCity}</p>
                            <p className="text-base font-semibold text-blue-800 mt-1">{displayTime(booking.flight.departureTime)}</p>
                          </div>
                          
                          <div className="w-1/5 flex flex-col items-center px-2 relative">
                            <div className="w-full border-t-2 border-dashed border-blue-300 absolute top-6"></div>
                            <div className="bg-blue-50 rounded-full p-2 z-10 mb-1">
                              <FaPlane className="h-6 w-6 text-blue-600 transform rotate-90" />
                            </div>
                            <p className="text-xs font-medium text-blue-600 mt-1">{calculateDuration(booking.flight.departureTime, booking.flight.arrivalTime)}</p>
                          </div>
                          
                          <div className="w-2/5 text-right">
                            <p className="text-3xl font-bold text-blue-900">{booking.flight.arrivalAirportCode}</p>
                            <p className="text-sm text-blue-700 truncate" title={booking.flight.arrivalCity}>{booking.flight.arrivalCity}</p>
                            <p className="text-base font-semibold text-blue-800 mt-1">{displayTime(booking.flight.arrivalTime)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-center mt-4 space-x-2 text-blue-700">
                          <FaCalendarAlt className="h-4 w-4" />
                          <p className="text-sm">{displayShortDate(booking.flight.departureTime)}</p>
                          <span className="text-blue-300">•</span>
                          <p className="text-sm">{booking.flight.airline} {booking.flight.flightNumber}</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:w-1/4 md:border-l border-blue-100 md:pl-8 flex flex-col justify-center">
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs font-medium text-blue-600 uppercase">Total Fare</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{formatPrice(booking.totalPrice)}</p>
                        <div className="flex items-center text-blue-700 mt-2">
                          <FaUsers className="h-3.5 w-3.5 mr-2" />
                          <p className="text-sm">{booking.passengers.length} Passenger{booking.passengers.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100/30 p-4 border-t border-blue-100 flex flex-wrap gap-3 justify-end items-center">
                  <button
                    onClick={() => toggleBookingDetails(booking._id)}
                    className="flex items-center text-sm px-4 py-2 bg-white border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
                  >
                    {expandedBookingId === booking._id ? 
                      <FaChevronUp className="mr-2" /> : 
                      <FaChevronDown className="mr-2" />
                    }
                    Details
                  </button>
                  
                  {booking.status === 'confirmed' && activeTab === 'upcoming' && (
                    <button
                      onClick={() => handleAction(booking._id, 'cancel')}
                      disabled={actionLoading[`${booking._id}-cancel`]}
                      className="text-sm px-4 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {actionLoading[`${booking._id}-cancel`] ? 
                        <FaSpinner className="animate-spin mr-2"/> : 
                        <FaTimesCircle className="mr-2"/>
                      }
                      Cancel Booking
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleAction(booking._id, 'download')}
                    disabled={actionLoading[`${booking._id}-download`]}
                    className="text-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {actionLoading[`${booking._id}-download`] ? 
                      <FaSpinner className="animate-spin mr-2"/> : 
                      <FaDownload className="mr-2"/>
                    }
                    Download Ticket
                  </button>
                </div>

                <AnimatePresence>
                {expandedBookingId === booking._id && (
                  <motion.div
                    key="details"
                    variants={detailsVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="border-t border-blue-100 bg-gradient-to-br from-blue-50/50 to-slate-50/50 overflow-hidden"
                  >
                    <div className="p-6 grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center text-blue-800 mb-3">
                          <FaUsers className="mr-2" />
                          <h4 className="font-semibold">Passenger Details</h4>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                          {booking.passengers.map((p, index) => (
                            <div 
                              key={index} 
                              className={`p-3 ${index !== booking.passengers.length - 1 ? 'border-b border-blue-50' : ''}`}
                            >
                              <p className="font-medium text-blue-900">{p.name}</p>
                              <div className="flex flex-wrap gap-x-4 text-xs text-blue-700 mt-1">
                                <span>Age: {p.age}</span>
                                <span>Gender: {p.gender.charAt(0).toUpperCase() + p.gender.slice(1)}</span>
                                {p.seatNumber && <span>Seat: <strong>{p.seatNumber}</strong></span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center text-blue-800 mb-3">
                          <FaInfoCircle className="mr-2" />
                          <h4 className="font-semibold">Booking Information</h4>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-blue-600">Booking Date</p>
                              <p className="text-sm font-medium text-blue-900 mt-1">{displayFullDate(booking.bookingDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-600">Payment Method</p>
                              <div className="flex items-center mt-1">
                                <FaCreditCard className="text-blue-700 mr-1.5 h-3.5 w-3.5" />
                                <p className="text-sm font-medium text-blue-900">
                                  {booking.paymentInfo.method.charAt(0).toUpperCase() + booking.paymentInfo.method.slice(1)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-blue-600">Payment Status</p>
                              <p className={`inline-flex items-center mt-1 text-sm font-medium ${
                                booking.paymentInfo.status === 'confirmed' ? 'text-emerald-600' : 'text-amber-600'
                              }`}>
                                {booking.paymentInfo.status === 'confirmed' ? 
                                  <FaCalendarCheck className="mr-1.5 h-3 w-3" /> : 
                                  <FaClock className="mr-1.5 h-3 w-3" />
                                }
                                {booking.paymentInfo.status.charAt(0).toUpperCase() + booking.paymentInfo.status.slice(1)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-600">Booking Status</p>
                              <div className={`inline-flex items-center mt-1 text-sm font-medium ${
                                booking.status === 'confirmed' ? 'text-emerald-600' : 
                                booking.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'
                              }`}>
                                {getStatusIcon(booking.status)}
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default MyBookings;