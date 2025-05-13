// src/app/search/page.tsx
"use client";

import React, {
  useState,
  useEffect,
  useContext,
  FormEvent,
  Suspense,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import FlightCard, { Flight as FlightCardType } from "../../../components/FlightCard";
import LocationAutosuggest, { Location } from "../../../components/LocationAutosuggest";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaSearch,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaCalendarAlt,
  FaSpinner,
  FaExclamationCircle,
  FaArrowLeft,
  FaUser,
  FaExchangeAlt,
  FaArrowRight,
} from "react-icons/fa";

interface FlightSearchResult extends FlightCardType {
  searchRelevance?: number;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  // Form state
  const [fromLoc, setFromLoc] = useState<Location | null>(null);
  const [toLoc, setToLoc] = useState<Location | null>(null);
  const [date, setDate] = useState(
    searchParamsHook.get("date") || new Date().toISOString().split("T")[0]
  );
  const [passengers, setPassengers] = useState(
    parseInt(searchParamsHook.get("passengers") || "1", 10)
  );

  // Search state
  const [flights, setFlights] = useState<FlightSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchId, setLastSearchId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Perform the flight search
  const performSearch = useCallback(
    async (fromCode: string, toCode: string, travelDate: string) => {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const payload: { from: string; to: string; date: string; userId?: string } = {
          from: fromCode,
          to: toCode,
          date: travelDate,
        };
        if (user?._id) payload.userId = user._id;

        const { data } = await api.post<FlightSearchResult[]>(
          "/flights/search",
          payload
        );
        setFlights(data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to load flight results."
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Initial search from URL params
  useEffect(() => {
    const fromParam = searchParamsHook.get("from");
    const toParam = searchParamsHook.get("to");
    const dateParam = searchParamsHook.get("date");
    const paxParam = searchParamsHook.get("passengers");

    if (dateParam) setDate(dateParam);
    if (paxParam) setPassengers(parseInt(paxParam, 10));

    // Pre-fill minimal Location objects if URL has codes
    if (fromParam) {
      setFromLoc({
        id: "",
        iataCode: fromParam,
        name: fromParam,
        detailedName: fromParam,
        subType: "CITY",
        cityName: fromParam,
      });
    }
    if (toParam) {
      setToLoc({
        id: "",
        iataCode: toParam,
        name: toParam,
        detailedName: toParam,
        subType: "CITY",
        cityName: toParam,
      });
    }

    const hasValid =
      !!fromParam && !!toParam && !!dateParam && !!paxParam;

    if (hasValid) {
      setInitialLoading(true);
      setHasSearched(true);
      const id = `${fromParam}-${toParam}-${dateParam}-${paxParam}`;
      performSearch(fromParam!, toParam!, dateParam!).finally(() => {
        setInitialLoading(false);
        setLastSearchId(id);
      });
    } else {
      setInitialLoading(false);
      setHasSearched(false);
    }
  }, [searchParamsHook, performSearch]);

  // Handle form submission
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fromLoc || !toLoc) return; // require both selected

    const params = new URLSearchParams();
    params.set("from", fromLoc.iataCode);
    params.set("to", toLoc.iataCode);
    params.set("date", date);
    params.set("passengers", passengers.toString());

    const currentSearchId = `${fromLoc.iataCode}-${toLoc.iataCode}-${date}-${passengers}`;
    router.push(`/search?${params.toString()}`);

    if (currentSearchId === lastSearchId) {
      setFlights([]);
      performSearch(fromLoc.iataCode, toLoc.iataCode, date);
    }
    setLastSearchId(currentSearchId);
  };

  // Swap from/to
  const handleSwap = () => {
    setFromLoc(toLoc);
    setToLoc(fromLoc);
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const staggerChildren = { visible: { transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen pt-10 pb-12 p-4 md:p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100">
      <motion.div
        className="max-w-5xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center font-medium"
          >
            <FaArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Home
          </Link>
        </div>

        {/* Search Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10 border border-blue-100"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
            Find Your Perfect Flight
          </h2>
          <form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-4 items-end">
              {/* From */}
              <div className="lg:col-span-4">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                  <FaPlaneDeparture className="text-blue-500" />
                  <span>From</span>
                </label>
                <LocationAutosuggest
                  countryCode="IN"
                  placeholder="Type departure city or airport"
                  onSelect={(loc) => setFromLoc(loc)}
                  selectedLocation={fromLoc}
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center items-center lg:col-span-1">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="h-12 w-12 rounded-full bg-white border border-blue-200 flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 text-blue-500 transition-all duration-200 mt-5 shadow-sm hover:shadow"
                  aria-label="Swap departure and destination"
                >
                  <div className="relative">
                    <FaExchangeAlt className="h-4 w-4" />
                  </div>
                </button>
              </div>

              {/* To */}
              <div className="lg:col-span-4">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                  <FaPlaneArrival className="text-blue-600" />
                  <span>To</span>
                </label>
                <LocationAutosuggest
                  countryCode="IN"
                  placeholder="Type destination city or airport"
                  onSelect={(loc) => setToLoc(loc)}
                  selectedLocation={toLoc}
                />
              </div>

              {/* Date */}
              <div className="lg:col-span-3">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="text-blue-500" />
                  <span>Date</span>
                </label>
                <div className={`relative flex items-center w-full border rounded-xl overflow-hidden
                    ${date ? 'bg-white' : 'bg-blue-50/50'} border-blue-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-300`}>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full py-3 px-4 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Passengers */}
              <div className="lg:col-span-3">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="text-blue-500" />
                  <span>Passengers</span>
                </label>
                <div className={`relative flex items-center w-full border rounded-xl overflow-hidden
                    bg-white border-blue-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-300`}>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value, 10))}
                    className="w-full py-3 px-4 outline-none bg-transparent appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Passenger" : "Passengers"}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-blue-500">
                    <FaArrowRight className="transform rotate-90 h-3 w-3" />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="lg:col-span-12 mt-6">
                <button
                  type="submit"
                  disabled={loading || initialLoading || !fromLoc || !toLoc}
                  className={`w-full py-4 px-6 text-base flex items-center justify-center shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5 rounded-xl font-medium
                  ${(!fromLoc || !toLoc) ? 
                    'bg-gray-300 text-gray-500 cursor-not-allowed' : 
                    'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'}`}
                >
                  {loading ? (
                    <FaSpinner className="animate-spin h-5 w-5 mr-2" />
                  ) : (
                    <FaSearch className="h-5 w-5 mr-2" />
                  )}
                  {loading ? "Searching Flights..." : "Find Flights"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Initial Loading */}
        {initialLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 relative">
              <div className="h-16 w-16 rounded-full border-4 border-blue-200 opacity-20"></div>
              <div className="h-16 w-16 rounded-full border-4 border-t-blue-600 absolute top-0 left-0 animate-spin"></div>
            </div>
            <p className="text-xl font-semibold text-blue-800 mt-6">
              Searching for the best flights...
            </p>
            <p className="text-gray-500 mt-2">This may take a moment</p>
          </div>
        )}

        {/* Error */}
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

        {/* Results */}
        {!initialLoading && !error && hasSearched && (
          <>
            {flights.length > 0 && (
              <div className="mb-4 text-blue-800 font-medium">
                {flights.length} {flights.length === 1 ? "flight" : "flights"} found
              </div>
            )}

            {flights.length > 0 ? (
              <motion.div className="space-y-5" variants={staggerChildren}>
                <AnimatePresence>
                  {flights.map((flight, idx) => (
                    <motion.div
                      key={flight._id}
                      variants={fadeIn}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                    >
                      <FlightCard flight={flight} numPassengers={passengers} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12 bg-blue-50 p-8 rounded-xl shadow-md border border-blue-100"
                variants={fadeIn}
              >
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaSearch className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-2xl font-semibold text-blue-800 mb-2">
                  No Flights Found
                </h3>
                <p className="text-blue-600 mt-1 max-w-md mx-auto">
                  We couldn't find flights from{" "}
                  <strong>{fromLoc?.iataCode}</strong> to{" "}
                  <strong>{toLoc?.iataCode}</strong> on{" "}
                  <strong>{new Date(date).toLocaleDateString()}</strong>.
                </p>
                <p className="text-gray-500 mt-4 text-sm">
                  Try changing your search criteria or selecting different dates.
                </p>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-t-blue-600 border-r-blue-300 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 text-xs font-medium">Loading</span>
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}