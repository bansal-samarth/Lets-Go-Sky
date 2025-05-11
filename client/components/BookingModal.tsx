// client/components/BookingModal.tsx
"use client";

import React, { useState, useContext, FormEvent, useEffect } from 'react';
// Adjust these import paths based on your actual folder structure or path aliases
import { BookingContext, Booking } from '../src/context/BookingContext';
import { AuthContext } from '../src/context/AuthContext';
import { Flight } from './FlightCard'; // Assuming FlightCard is in the same components folder
import { formatPrice } from '../lib/utils'; // Assuming utils are in client/lib/
import {
  FaTimes, FaUserPlus, FaTrashAlt, FaCheckCircle, FaWallet, FaPlane,
  FaUsers, FaCreditCard, FaSpinner, FaTicketAlt,
  FaExclamationCircle, FaChevronRight, FaClock, FaMapMarkerAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface PassengerInputState {
  id: string;
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
}

interface BookingModalProps {
  flight: Flight;
  onClose: () => void;
  numPassengers: number;
}

const BookingModal: React.FC<BookingModalProps> = ({ flight, onClose, numPassengers }) => {
  // Initialize hooks at the top level, never conditionally
  const [passengers, setPassengers] = useState<PassengerInputState[]>([]);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  
  const bookingContext = useContext(BookingContext);
  const authContext = useContext(AuthContext);
  
  useEffect(() => {
    // Initialize passengers based on numPassengers
    const initialPassengers: PassengerInputState[] = Array.from({ length: Math.max(1, numPassengers) }, (_, i) => ({
      id: `passenger-${Date.now()}-${i}`,
      name: i === 0 && authContext?.user?.name ? authContext.user.name : '',
      age: '',
      gender: 'male',
    }));
    setPassengers(initialPassengers);
  }, [numPassengers, authContext?.user?.name]);

  useEffect(() => {
    if (bookingContext) {
      bookingContext.setError(null); // Clear context error
    }
    setModalError(null);   // Clear local error
  }, [flight, numPassengers, bookingContext]);

  if (!bookingContext || !authContext) {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white p-6 rounded-xl shadow-2xl text-red-600">
                Error: Context not found. Ensure BookingProvider and AuthProvider wrap your application.
            </div>
        </div>
    );
  }

  const { createBooking, loading: bookingOpLoading, error: bookingOpError, generateTicket, setError: setBookingError } = bookingContext;
  const { walletBalance } = authContext;

  const totalPrice = flight.currentPrice * passengers.length;

  const handlePassengerChange = (id: string, field: keyof Omit<PassengerInputState, 'id'>, value: string) => {
    setPassengers(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
    setModalError(null);
    setBookingError(null);
  };

  const addPassenger = () => {
    const maxPassengers = Math.min(9, flight.seatsAvailable);
    if (passengers.length < maxPassengers) {
      setPassengers(prev => [
        ...prev,
        { id: `passenger-${Date.now()}-${prev.length}`, name: '', age: '', gender: 'male' },
      ]);
       setModalError(null);
    } else {
      setModalError(`Cannot add more passengers. Maximum ${maxPassengers} allowed or available.`);
    }
  };

  const removePassenger = (id: string) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter(p => p.id !== id));
      setModalError(null);
    }
  };

  const handleSubmitBooking = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError(null);
    setBookingError(null);

    const invalidPassenger = passengers.find(
      p => !p.name.trim() || !p.age || parseInt(p.age, 10) <= 0 || parseInt(p.age, 10) > 120
    );
    if (invalidPassenger) {
      setModalError('Please fill all passenger names and provide valid ages (1-120).');
      return;
    }
    if (passengers.length > flight.seatsAvailable) {
      setModalError(`Not enough seats. Requested: ${passengers.length}, Available: ${flight.seatsAvailable}.`);
      return;
    }
    if (walletBalance < totalPrice) {
      setModalError('Insufficient wallet balance. Please add funds.');
      return;
    }

    const passengersDataForApi = passengers.map(({ name, age, gender }) => ({
      name,
      gender,
      age: parseInt(age, 10),
    }));

    const result = await createBooking({
      flightId: flight._id,
      passengers: passengersDataForApi,
    });

    if (result) {
      setIsSuccess(true);
      setConfirmedBooking(result);
    }
  };

  const handleDownloadTicket = async () => {
    if (confirmedBooking?._id) {
      setBookingError(null);
      const success = await generateTicket(confirmedBooking._id);
      if (!success) {
        alert(bookingOpError || "Failed to download ticket. Please try again from 'My Bookings'.")
      }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -20 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[95vh] flex flex-col border border-blue-100"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        >
          <div className="flex items-center justify-between p-6 border-b border-blue-50 bg-gradient-to-r from-blue-600 to-blue-500 rounded-t-2xl sticky top-0 z-10 text-white shadow-sm">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center">
              {isSuccess ? (
                <>
                  <FaCheckCircle className="h-6 w-6 mr-3 text-blue-100" />
                  Booking Confirmed!
                </>
              ) : (
                <>
                  <FaPlane className="h-5 w-5 mr-3 transform -rotate-45" />
                  {`Book Flight: ${flight.airline} ${flight.flightNumber}`}
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white p-2 rounded-full hover:bg-blue-700/30 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          {isSuccess && confirmedBooking ? (
            <div className="p-8 text-center flex-grow overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                className="mb-6"
              >
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <FaCheckCircle className="h-14 w-14 text-white" />
                </div>
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-bold text-blue-800 mb-3">Your Flight is Booked!</h3>

              <div className="flex items-center justify-center mb-6">
                <span className="text-gray-600 mr-2">PNR:</span>
                <span className="text-blue-600 font-mono tracking-wider text-xl font-bold bg-blue-50 px-4 py-1.5 rounded-lg border border-blue-100">
                  {confirmedBooking.pnrNumber}
                </span>
              </div>

              <div className="text-left bg-white p-6 rounded-xl border border-blue-100 space-y-3 mb-8 shadow-md">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-blue-50">
                  <div className="flex items-center text-blue-800 text-lg font-medium">
                    <span className="text-xl font-semibold">{flight.airline}</span>
                    <span className="mx-2 text-blue-300">|</span>
                    <span className="font-mono">{flight.flightNumber}</span>
                  </div>
                  <div className="mt-2 md:mt-0 text-blue-600 font-medium">
                    {new Date(flight.departureTime).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </div>
                </div>

                <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-4 py-3">
                  <div className="space-y-1 flex-1">
                    <div className="text-sm text-gray-500"><FaMapMarkerAlt className="inline mr-1 text-blue-500" /> From</div>
                    <div className="text-lg font-medium text-gray-800">{flight.departureCity}</div>
                    <div className="text-sm font-medium text-gray-500">{flight.departureAirportCode}</div>
                    <div className="text-sm text-gray-500"><FaClock className="inline mr-1" /> {new Date(flight.departureTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>

                  <div className="flex flex-col items-center justify-center pt-1">
                    <div className="w-full flex items-center justify-center">
                      <div className="h-0.5 w-8 bg-blue-200 rounded-full"></div>
                      <div className="mx-1 h-3 w-3 rounded-full bg-blue-500"></div>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full"></div>
                      <div className="transform rotate-45 text-blue-500"><FaPlane className="h-4 w-4" /></div>
                      <div className="w-16 h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full"></div>
                      <div className="mx-1 h-3 w-3 rounded-full bg-blue-500"></div>
                      <div className="h-0.5 w-8 bg-blue-200 rounded-full"></div>
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 text-right">
                    <div className="text-sm text-gray-500"><FaMapMarkerAlt className="inline mr-1 text-blue-500" /> To</div>
                    <div className="text-lg font-medium text-gray-800">{flight.arrivalCity}</div>
                    <div className="text-sm font-medium text-gray-500">{flight.arrivalAirportCode}</div>
                    <div className="text-sm text-gray-500"><FaClock className="inline mr-1" /> {new Date(flight.arrivalTime || '').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-blue-50">
                  <div>
                    <span className="text-gray-600">Passengers:</span>
                    <span className="ml-2 font-medium">{confirmedBooking.passengers.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Paid:</span>
                    <span className="ml-2 font-bold text-blue-600">{formatPrice(confirmedBooking.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleDownloadTicket}
                  disabled={bookingOpLoading} // Disable if ticket generation is in progress
                  className="flex items-center justify-center px-6 py-3.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-70"
                >
                  {bookingOpLoading && confirmedBooking ? // Show spinner only if this specific operation is loading
                    <FaSpinner className="animate-spin mr-2"/> :
                    <FaTicketAlt className="mr-2"/>
                  }
                  Download E-Ticket
                </button>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center px-6 py-3.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>

              {bookingOpError && ( // Display error related to booking/ticket operations if any
                <div className="mt-6 text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 flex items-center">
                  <FaExclamationCircle className="mr-2 flex-shrink-0" />
                  <span>{bookingOpError}</span>
                </div>
              )}
            </div>
          ) : (
            // Form for entering passenger details
            <form onSubmit={handleSubmitBooking} className="flex-grow contents"> {/* `contents` makes form part of flex layout */}
              <div className="p-6 md:p-8 space-y-6 flex-grow overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
                {/* Flight Summary (redesigned) */}
                <div className="bg-white rounded-xl border border-blue-100 shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <FaPlane className="mr-2 transform -rotate-45" /> Flight Details
                    </h3>
                    <div className="mt-1 text-blue-100 text-sm">
                      {new Date(flight.departureTime).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4">
                      <div className="flex items-center text-blue-800">
                        <span className="text-xl font-semibold">{flight.airline}</span>
                        <span className="mx-2 text-blue-300">|</span>
                        <span className="font-mono">{flight.flightNumber}</span>
                      </div>
                      <div className="mt-2 md:mt-0 text-blue-600 font-medium">
                        {formatPrice(flight.currentPrice)}<span className="text-gray-500 text-sm"> / seat</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="text-sm text-gray-500"><FaMapMarkerAlt className="inline mr-1 text-blue-500" /> From</div>
                        <div className="text-lg font-medium text-gray-800">{flight.departureCity}</div>
                        <div className="text-sm font-medium text-gray-500">{flight.departureAirportCode}</div>
                        <div className="text-sm text-gray-500"><FaClock className="inline mr-1" /> {new Date(flight.departureTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>

                      <div className="flex flex-col items-center justify-center min-w-[100px] pt-1">
                        <div className="w-full flex items-center justify-center">
                          <div className="h-0.5 w-6 bg-blue-200 rounded-full"></div>
                          <div className="mx-1 h-3 w-3 rounded-full bg-blue-500"></div>
                          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full"></div>
                          <div className="transform rotate-45 text-blue-500"><FaPlane className="h-4 w-4" /></div>
                          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-300 to-blue-400 rounded-full"></div>
                          <div className="mx-1 h-3 w-3 rounded-full bg-blue-500"></div>
                          <div className="h-0.5 w-6 bg-blue-200 rounded-full"></div>
                        </div>
                      </div>

                      <div className="space-y-1 flex-1 text-right">
                        <div className="text-sm text-gray-500"><FaMapMarkerAlt className="inline mr-1 text-blue-500" /> To</div>
                        <div className="text-lg font-medium text-gray-800">{flight.arrivalCity}</div>
                        <div className="text-sm font-medium text-gray-500">{flight.arrivalAirportCode}</div>
                        <div className="text-sm text-gray-500"><FaClock className="inline mr-1" /> {new Date(flight.arrivalTime || '').toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between pt-3 border-t border-blue-50">
                      <div className="text-sm">
                        <span className="text-gray-600">Passengers:</span>
                        <span className="ml-1 font-medium">{passengers.length}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Seats Available:</span>
                        <span className="ml-1 font-medium">{flight.seatsAvailable}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Details */}
                <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <FaUsers className="mr-2 text-blue-600" /> Passenger Information
                  </h3>
                  <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar"> {/* Add custom-scrollbar class if you have custom scrollbar styles */}
                    {passengers.map((pax, index) => (
                      <motion.div
                        key={pax.id}
                        className="p-5 border border-blue-100 rounded-xl bg-blue-50 space-y-3 shadow-sm transition-all hover:shadow-md"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }} // Faster stagger
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium text-blue-700 flex items-center">
                            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">{index + 1}</span>
                            Passenger Details
                          </h4>
                          {passengers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePassenger(pax.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
                              title="Remove passenger"
                            >
                              <FaTrashAlt className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-3 md:col-span-1">
                            <label htmlFor={`name-${pax.id}`} className="block text-xs font-medium text-blue-700 mb-1">Full Name</label>
                            <input
                              type="text"
                              id={`name-${pax.id}`}
                              value={pax.name}
                              onChange={(e) => handlePassengerChange(pax.id, 'name', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                              required
                              placeholder="Enter full name"
                            />
                          </div>
                          <div>
                            <label htmlFor={`age-${pax.id}`} className="block text-xs font-medium text-blue-700 mb-1">Age</label>
                            <input
                              type="number"
                              id={`age-${pax.id}`}
                              min="1"
                              max="120"
                              value={pax.age}
                              onChange={(e) => handlePassengerChange(pax.id, 'age', e.target.value)}
                              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                              required
                              placeholder="Age"
                            />
                          </div>
                          <div>
                            <label htmlFor={`gender-${pax.id}`} className="block text-xs font-medium text-blue-700 mb-1">Gender</label>
                            <select
                              id={`gender-${pax.id}`}
                              value={pax.gender}
                              onChange={(e) => handlePassengerChange(pax.id, 'gender', e.target.value as PassengerInputState['gender'])}
                              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
                              required
                              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233B82F6'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", backgroundSize: "1.25rem" }}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {passengers.length < Math.min(9, flight.seatsAvailable) && (
                    <button
                      type="button"
                      onClick={addPassenger}
                      className="mt-4 flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                    >
                      <FaUserPlus className="mr-2" /> Add Another Passenger
                    </button>
                  )}
                </div>

                {/* Payment Summary */}
                <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <FaCreditCard className="mr-2 text-blue-600" /> Payment Summary
                  </h3>
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-700">Base Fare ({passengers.length} {passengers.length === 1 ? "passenger" : "passengers"})</span>
                      <span className="font-medium text-gray-800">{formatPrice(flight.currentPrice * passengers.length)}</span>
                    </div>
                    {/* You can add taxes or other fees here if applicable */}
                    <div className="border-t border-blue-100 my-3"></div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-blue-800">Total Amount Payable</span>
                      <span className="font-bold text-xl text-blue-600">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-sm">
                      <span className="flex items-center text-green-600">
                        <FaWallet className="mr-1.5" /> Wallet Balance
                      </span>
                      <span className={`font-medium ${walletBalance < totalPrice ? 'text-red-600' : 'text-green-600'}`}>
                        {formatPrice(walletBalance)}
                      </span>
                    </div>
                    {walletBalance < totalPrice && (
                      <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-100 flex items-center">
                        <FaExclamationCircle className="mr-1.5" /> Insufficient balance! Please add funds to your wallet.
                      </div>
                    )}
                  </div>
                </div>

                {(modalError || bookingOpError) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-200 flex items-center"
                  >
                    <FaExclamationCircle className="flex-shrink-0 mr-2" />
                    <span>{modalError || bookingOpError}</span>
                  </motion.div>
                )}
              </div> {/* End of scrollable form content */}

              <div className="p-6 border-t border-blue-100 bg-white rounded-b-2xl flex flex-col sm:flex-row justify-end gap-4 sticky bottom-0 z-10 shadow-[0_-4px_12px_-1px_rgba(0,0,0,0.05)]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  disabled={bookingOpLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all ${bookingOpLoading || walletBalance < totalPrice || passengers.length > flight.seatsAvailable ? 'opacity-60 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-600'}`}
                  disabled={bookingOpLoading || walletBalance < totalPrice || passengers.length > flight.seatsAvailable}
                >
                  {bookingOpLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2"/>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>Confirm & Pay {formatPrice(totalPrice)}</span>
                      <FaChevronRight className="ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div> {/* End of main modal content div */}
      </motion.div> {/* End of overlay div */}
    </AnimatePresence>
  );
};

export default BookingModal;