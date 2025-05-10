"use client";

import React, { useState, useContext } from 'react';
import { AuthContext } from '../src/context/AuthContext';
import { useRouter } from 'next/navigation';
import { FaPlane, FaRegClock, FaChair, FaExclamationTriangle, FaArrowRight, FaClock, FaTag, FaPlaneArrival, FaPlaneDeparture } from 'react-icons/fa';
import { formatPrice, calculateDuration, displayTime, displayShortDate } from '../lib/utils';
import BookingModal from './BookingModal';

export interface Flight {
  _id: string;
  flightNumber: string;
  airline: string;
  departureCity: string;
  departureAirport: string;
  departureAirportCode: string;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalAirportCode: string;
  departureTime: string;
  arrivalTime: string;
  basePrice: number;
  currentPrice: number;
  seatsAvailable: number;
  aircraft: string;
}

interface FlightCardProps {
  flight: Flight;
  numPassengers: number;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, numPassengers }) => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const authContext = useContext(AuthContext);
  const router = useRouter();

  const user = authContext?.user;

  const handleBookNow = () => {
    if (!user) {
      const currentSearchParamsString = window.location.search || '';
      router.push(`/login?from=/search${currentSearchParamsString.replace(/^\?/, '%3F')}`);
      return;
    }
    setShowBookingModal(true);
  };

  const isPriceIncreased = flight.currentPrice > flight.basePrice;
  const isPriceDropped = flight.currentPrice < flight.basePrice;
  const duration = calculateDuration(flight.departureTime, flight.arrivalTime);
  const departureDate = new Date(flight.departureTime);
  const arrivalDate = new Date(flight.arrivalTime);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl border border-blue-100 overflow-hidden transition-all duration-300 ease-in-out transform hover:-translate-y-1">
        {/* Top ribbon - conditional based on price */}
        {isPriceIncreased && (
          <div className="bg-orange-500 text-white text-xs font-semibold py-1 px-3 flex items-center justify-center">
            <FaExclamationTriangle className="mr-1.5 h-3 w-3"/> 
            Price increased from {formatPrice(flight.basePrice)}
          </div>
        )}
        {isPriceDropped && (
          <div className="bg-green-500 text-white text-xs font-semibold py-1 px-3 flex items-center justify-center">
            <FaTag className="mr-1.5 h-3 w-3"/> 
            Special deal! Price dropped from {formatPrice(flight.basePrice)}
          </div>
        )}

        <div className="p-5 md:p-6">
          {/* Airline & Flight Info Header */}
          <div className="flex flex-wrap justify-between items-start mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-blue-800">{flight.airline}</h3>
              <div className="text-sm text-blue-600 font-medium flex items-center mt-1">
                {flight.flightNumber} • {flight.aircraft}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl md:text-3xl font-extrabold ${isPriceIncreased ? 'text-orange-600' : isPriceDropped ? 'text-green-600' : 'text-blue-700'}`}>
                {formatPrice(flight.currentPrice)}
              </div>
              <div className="text-sm text-gray-500 mt-1">per passenger</div>
            </div>
          </div>

          {/* Flight Route and Time Details */}
          <div className="flex flex-col md:flex-row items-stretch justify-between">
            {/* Route visualization */}
            <div className="flex-grow flex items-center justify-between space-x-4 md:space-x-8">
              {/* Departure */}
              <div className="text-center md:text-left">
                <div className="text-3xl font-bold text-gray-800">{displayTime(flight.departureTime)}</div>
                <div className="text-lg font-bold text-blue-600">{flight.departureAirportCode}</div>
                <div className="text-sm text-gray-500 mt-1">{flight.departureCity}</div>
                <div className="text-xs text-gray-400 mt-1">{displayShortDate(flight.departureTime)}</div>
              </div>

              {/* Flight path visualization */}
              <div className="flex-grow flex flex-col items-center justify-center py-2">
                <div className="text-sm text-gray-500 font-medium flex items-center">
                  <FaClock className="mr-1.5 h-3.5 w-3.5 text-blue-500"/> {duration}
                </div>
                <div className="relative w-full my-2">
                  <div className="absolute top-1/2 left-0 right-0 border-t-2 border-dashed border-blue-200 -translate-y-1/2"></div>
                  <div className="absolute left-0 h-2 w-2 rounded-full bg-blue-500 top-1/2 -translate-y-1/2"></div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaPlane className="h-3 w-3 text-blue-600 transform rotate-90" />
                    </div>
                  </div>
                  <div className="absolute right-0 h-2 w-2 rounded-full bg-blue-500 top-1/2 -translate-y-1/2"></div>
                </div>
                <div className="text-xs text-blue-600 font-medium">Direct Flight</div>
              </div>

              {/* Arrival */}
              <div className="text-center md:text-right">
                <div className="text-3xl font-bold text-gray-800">{displayTime(flight.arrivalTime)}</div>
                <div className="text-lg font-bold text-blue-600">{flight.arrivalAirportCode}</div>
                <div className="text-sm text-gray-500 mt-1">{flight.arrivalCity}</div>
                <div className="text-xs text-gray-400 mt-1">{displayShortDate(flight.arrivalTime)}</div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-5"></div>

          {/* Footer / Action Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Additional flight info badges */}
            <div className="flex flex-wrap gap-3">
              {/* Seat availability indicator */}
              <div className={`text-sm px-3 py-1.5 rounded-full flex items-center 
                ${flight.seatsAvailable > 10 
                  ? 'bg-green-100 text-green-700' 
                  : flight.seatsAvailable > 0 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-red-100 text-red-700'}`}>
                <FaChair className="mr-1.5 h-3.5 w-3.5" />
                {flight.seatsAvailable > 0 ? (
                  <span>
                    {flight.seatsAvailable <= 10 ? `Only ${flight.seatsAvailable} ` : `${flight.seatsAvailable} `}
                    {flight.seatsAvailable === 1 ? 'seat left' : 'seats available'}
                  </span>
                ) : (
                  <span>Sold Out</span>
                )}
              </div>
              
              {/* Aircraft type badge */}
              <div className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full flex items-center">
                <FaPlane className="mr-1.5 h-3.5 w-3.5" />
                {flight.aircraft}
              </div>
            </div>

            {/* Book now button */}
            <button
              onClick={handleBookNow}
              disabled={flight.seatsAvailable < 1}
              className={`w-full md:w-auto px-6 py-3 rounded-lg font-semibold text-white flex items-center justify-center transition-all
                ${flight.seatsAvailable < 1 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow hover:shadow-lg'}`}
            >
              {flight.seatsAvailable < 1 ? (
                'Sold Out'
              ) : (
                <>
                  Book Now <FaArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally render the BookingModal */}
      {showBookingModal && user && (
        <BookingModal
          flight={flight}
          onClose={() => setShowBookingModal(false)}
          numPassengers={numPassengers}
        />
      )}
    </>
  );
};

export default FlightCard;