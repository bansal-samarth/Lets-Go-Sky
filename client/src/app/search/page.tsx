"use client";

import React, { useState, useEffect, useContext, FormEvent, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import FlightCard, { Flight as FlightCardType } from '../../../components/FlightCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaSpinner, FaExclamationCircle, FaArrowLeft, FaUser, FaExchangeAlt } from 'react-icons/fa';

interface FlightSearchResult extends FlightCardType {
  // This is a placeholder for potential additional fields
  searchRelevance?: number;
}

// List of Indian cities for dropdowns
const CITIES = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Kolkata",
  "Hyderabad",
  "Ahmedabad",
  "Goa",
  "Pune",
  "Jaipur"
];

function SearchPageContent() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  // Initialize state from URL search parameters
  const [from, setFrom] = useState(searchParamsHook.get('from') || '');
  const [to, setTo] = useState(searchParamsHook.get('to') || '');
  const [date, setDate] = useState(searchParamsHook.get('date') || new Date().toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(parseInt(searchParamsHook.get('passengers') || '1', 10));

  const [flights, setFlights] = useState<FlightSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchId, setLastSearchId] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);

  // Function to perform flight search
  const performSearch = useCallback(async (fromCity: string, toCity: string, travelDate: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    
    try {
      const payload: { from: string; to: string; date: string; userId?: string } = {
        from: fromCity,
        to: toCity,
        date: travelDate,
      };
      
      if (user?._id) {
        payload.userId = user._id;
      }
      
      const { data } = await api.post<FlightSearchResult[]>('/flights/search', payload);
      setFlights(data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? 
        err.message : 
        'Failed to load flight results.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Handle initial search based on URL params only if there are query parameters
  useEffect(() => {
    const fromParam = searchParamsHook.get('from');
    const toParam = searchParamsHook.get('to');
    const dateParam = searchParamsHook.get('date');
    const paxParam = searchParamsHook.get('passengers');

    // Update form fields if they are in URL
    if (fromParam) setFrom(fromParam);
    if (toParam) setTo(toParam);
    if (dateParam) setDate(dateParam);
    if (paxParam) setPassengers(parseInt(paxParam, 10));

    // Only perform search if URL contains valid search parameters AND has been submitted
    // Check if this is a real search from URL (all required params are present)
    const hasValidSearchParams = fromParam && toParam && dateParam;
    
    if (hasValidSearchParams) {
      // This is a search from URL parameters, do the actual search
      setInitialLoading(true);
      setHasSearched(true);
      
      const currentSearchId = `${fromParam}-${toParam}-${dateParam}-${paxParam}`;
      
      performSearch(fromParam, toParam, dateParam)
        .finally(() => {
          setInitialLoading(false);
          setLastSearchId(currentSearchId);
        });
    } else {
      // Just form initialization, no search yet
      setInitialLoading(false);
      setHasSearched(false);
    }
  }, [searchParamsHook, performSearch]);

  const handleSearchSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Create params and update URL
    const params = new URLSearchParams();
    params.set('from', from);
    params.set('to', to);
    params.set('date', date);
    params.set('passengers', passengers.toString());
    
    // Create a unique search identifier
    const currentSearchId = `${from}-${to}-${date}-${passengers}`;
    
    // Update URL
    router.push(`/search?${params.toString()}`);
    
    // If it's the same search as last time, perform search manually
    // since URL didn't change and useEffect won't trigger
    if (currentSearchId === lastSearchId) {
      setFlights([]);
      performSearch(from, to, date);
    }
    
    // Update last search ID
    setLastSearchId(currentSearchId);
  };

  const handleSwapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen pt-10 pb-12 p-4 md:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100">
      <motion.div
        className="max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        {/* Back to Home Link */}
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium">
            <FaArrowLeft className="mr-2 h-3.5 w-3.5"/> Back to Home
          </Link>
        </div>

        {/* Search Form Card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-blue-100"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Find Your Perfect Flight</h2>
          
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-4 items-end">
              <div className="lg:col-span-4 relative">
                <label htmlFor="from-search" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <div className="relative">
                  <FaPlaneDeparture className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                  <select
                    id="from-search" 
                    required 
                    value={from} 
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full py-3 pl-10 pr-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50"
                  >
                    <option value="">Select departure city</option>
                    {CITIES.filter(city => city !== to).map(city => (
                      <option key={`from-${city}`} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Swap button */}
              <div className="flex justify-center items-center lg:col-span-1">
                <button 
                  type="button" 
                  onClick={handleSwapLocations}
                  className="h-10 w-10 rounded-full bg-white border border-blue-200 flex items-center justify-center hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-500 mt-5"
                >
                  <FaExchangeAlt className="h-4 w-4" />
                </button>
              </div>
              
              <div className="lg:col-span-4">
                <label htmlFor="to-search" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <div className="relative">
                  <FaPlaneArrival className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" />
                  <select
                    id="to-search" 
                    required 
                    value={to} 
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full py-3 pl-10 pr-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50"
                  >
                    <option value="">Select destination city</option>
                    {CITIES.filter(city => city !== from).map(city => (
                      <option key={`to-${city}`} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <label htmlFor="date-search" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                  <input
                    id="date-search" 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full py-3 pl-10 pr-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50"
                  />
                </div>
              </div>
              
              <div className="lg:col-span-3">
                <label htmlFor="passengers-search" className="block text-sm font-medium text-gray-700 mb-1">Passengers</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                  <select
                    id="passengers-search"
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                    className="w-full py-3 pl-10 pr-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Passenger' : 'Passengers'}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="lg:col-span-12 mt-2">
                <button
                  type="submit"
                  disabled={loading || initialLoading}
                  className="w-full btn py-3.5 text-base flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl"
                >
                  {loading ? <FaSpinner className="animate-spin h-5 w-5 mr-2" /> : <FaSearch className="h-5 w-5 mr-2" />}
                  {loading ? 'Searching Flights...' : 'Find Flights'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Initial Loading State */}
        {initialLoading && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="h-16 w-16 relative">
              <div className="h-16 w-16 rounded-full border-4 border-blue-200 opacity-20"></div>
              <div className="h-16 w-16 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0 animate-spin"></div>
            </div>
            <p className="text-xl font-semibold text-blue-800 mt-6">Searching for the best flights...</p>
            <p className="text-gray-500 mt-2">This may take a moment</p>
          </div>
        )}

        {/* Error Display */}
        {!initialLoading && error && hasSearched && (
          <motion.div
            className="text-center py-10 bg-red-50 p-6 rounded-xl shadow border border-red-100"
            variants={fadeIn}
          >
            <FaExclamationCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700">Search Problem</h3>
            <p className="text-red-600 mt-1">{error}</p>
          </motion.div>
        )}

        {/* Flight Results */}
        {!initialLoading && !error && hasSearched && (
          <>
            {/* Flight count display */}
            {flights.length > 0 && (
              <div className="mb-4 text-blue-800 font-medium">
                {flights.length} {flights.length === 1 ? 'flight' : 'flights'} found
              </div>
            )}
            
            {flights.length > 0 ? (
              <motion.div
                className="space-y-5"
                variants={staggerChildren}
              >
                <AnimatePresence>
                  {flights.map((flight, index) => (
                    <motion.div 
                      key={flight._id} 
                      variants={fadeIn} 
                      initial="hidden" 
                      animate="visible" 
                      exit="hidden" 
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <FlightCard flight={flight} numPassengers={passengers} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              // Only show "No Flights Found" if the user has actually searched
              <motion.div className="text-center py-12 bg-blue-50 p-8 rounded-xl shadow-md border border-blue-100" variants={fadeIn}>
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaSearch className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-semibold text-blue-800 mb-2">No Flights Found</h3>
                <p className="text-blue-600 mt-1 max-w-md mx-auto">
                  We couldn&apos;t find flights from <strong className="font-medium">{from}</strong> to <strong className="font-medium">{to}</strong> on <strong className="font-medium">{new Date(date).toLocaleDateString()}</strong>.
                </p>
                <p className="text-gray-500 mt-4 text-sm">Try changing your search criteria or selecting different dates.</p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

// Wrap SearchPageContent with Suspense because it uses useSearchParams
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-t-blue-600 border-r-blue-300 border-b-blue-600 border-l-blue-300 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-blue-600 text-xs font-medium">Loading</span>
          </div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}