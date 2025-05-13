"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import { FaSearch, FaTimesCircle } from "react-icons/fa";

export interface Location {
  id: string;
  iataCode: string;
  name: string;
  detailedName: string;
  subType: "CITY" | "AIRPORT";
  cityName: string;
}

// Define interface for location data from API
interface LocationApiResponse {
  id: string;
  iataCode: string;
  name: string;
  detailedName: string;
  subType: "CITY" | "AIRPORT";
  address: {
    cityName: string;
  };
}

interface Props {
  countryCode?: string;
  placeholder?: string;
  onSelect: (loc: Location) => void;
  selectedLocation?: Location | null;
  className?: string;
}

export default function LocationAutosuggest({
  countryCode = "IN",
  placeholder = "Search city or airport…",
  onSelect,
  selectedLocation = null,
  className = "",
}: Props) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle pre-selected location
  useEffect(() => {
    if (selectedLocation) {
      setTerm(selectedLocation.cityName);
    }
  }, [selectedLocation]);

  const fetchLocations = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    fetch(
      `/api/amadeus/locations?keyword=${encodeURIComponent(
        q
      )}&countryCode=${countryCode}`
    )
      .then((res) => res.json())
      .then((json) => {
        // Map in the cityName from address
        const mapped: Location[] = (json.data || []).map((loc: LocationApiResponse) => ({
          id: loc.id,
          iataCode: loc.iataCode,
          name: loc.name,
          detailedName: loc.detailedName,
          subType: loc.subType,
          cityName: loc.address.cityName,
        }));

        setResults(mapped);
      })
      .catch(() => {
        setResults([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [countryCode]);

  const debouncedFetch = useCallback(
    debounce((q: string) => {
      fetchLocations(q);
    }, 300),
    [fetchLocations]
  );

  useEffect(() => {
    debouncedFetch(term);
  }, [term, debouncedFetch]);

  const handleClear = () => {
    setTerm("");
    onSelect({
      id: "",
      iataCode: "",
      name: "",
      detailedName: "",
      subType: "CITY",
      cityName: ""
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      {/* Input wrapper with dynamic styling */}
      <div 
        className={`relative flex items-center w-full transition-all border rounded-xl overflow-hidden
          ${focused ? 'ring-2 ring-blue-500 border-blue-300' : 'border-blue-200'} 
          ${term ? 'bg-white' : 'bg-blue-50/50'}
          ${className}`}
      >
        <div className="pl-4">
          <FaSearch className={`text-blue-500 transition-all ${focused || term ? 'opacity-100' : 'opacity-70'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            blurTimeout.current = setTimeout(() => setOpen(false), 200);
          }}
          onFocus={() => {
            setFocused(true);
            if (blurTimeout.current) {
              clearTimeout(blurTimeout.current);
            }
            if (term.length >= 2) setOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 w-full py-3 px-3 outline-none bg-transparent"
        />
        {term && (
          <button 
            type="button"
            onClick={handleClear}
            className="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimesCircle />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && (
        <ul className="absolute z-20 w-full bg-white border border-blue-200 rounded-xl mt-1 max-h-60 overflow-auto shadow-lg">
          {loading && (
            <li className="px-4 py-3 text-gray-500 italic">
              <div className="flex items-center">
                <span className="w-4 h-4 mr-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                Searching...
              </div>
            </li>
          )}
          {!loading && results.length === 0 && term.length >= 2 && (
            <li className="px-4 py-3 text-gray-500 italic">No results found</li>
          )}
          {!loading &&
            results.map((loc) => (
              <li
                key={loc.id}
                onMouseDown={(e) => {
                  e.preventDefault(); 
                  onSelect(loc);
                  setTerm(loc.cityName);
                  setOpen(false);
                }}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-blue-800">{loc.name}</div>
                    <div className="text-sm text-gray-600">{loc.detailedName}</div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {loc.iataCode}
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}