// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { FaSearch } from 'react-icons/fa';
// import debounce from 'lodash.debounce';

// interface AutoSuggestProps {
//   value: string;
//   onChange: (val: string) => void;
//   placeholder?: string;
// }

// interface Suggestion {
//   code: string;
//   name: string;
//   city: string;
//   country: string;
// }

// export default function AutoSuggest({ value, onChange, placeholder = '' }: AutoSuggestProps) {
//   const [query, setQuery] = useState(value);
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef<HTMLDivElement>(null);

//   // Fetch suggestions from backend
//   const fetchSuggestions = async (q: string) => {
//     if (!q) {
//       setSuggestions([]);
//       return;
//     }
//     try {
//       const res = await fetch(`/api/airports?search=${encodeURIComponent(q)}`);
//       if (!res.ok) throw new Error('Network response was not ok');
//       const data = await res.json();
//       setSuggestions(data.slice(0, 5));
//     } catch (err) {
//       console.error('Error fetching suggestions', err);
//       setSuggestions([]);
//     }
//   };

//   // Debounce calls to avoid flooding
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const debouncedFetch = useRef(debounce(fetchSuggestions, 300)).current;

//   useEffect(() => {
//     debouncedFetch(query);
//   }, [query, debouncedFetch]);

//   // Close dropdown on outside click
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener('click', handleClickOutside);
//     return () => document.removeEventListener('click', handleClickOutside);
//   }, []);

//   const handleSelect = (s: Suggestion) => {
//     const display = `${s.city} (${s.code}) - ${s.name}`;
//     setQuery(display);
//     onChange(s.code);
//     setIsOpen(false);
//   };

//   return (
//     <div ref={containerRef} className="relative">
//       <div className="flex items-center">
//         <FaSearch className="absolute left-3 text-gray-400" />
//         <input
//           type="text"
//           value={query}
//           onChange={e => { setQuery(e.target.value); onChange(''); setIsOpen(true); }}
//           placeholder={placeholder}
//           className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       </div>
//       {isOpen && suggestions.length > 0 && (
//         <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
//           {suggestions.map(s => (
//             <li
//               key={s.code}
//               onClick={() => handleSelect(s)}
//               className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
//             >
//               <span className="font-medium">{s.city} ({s.code})</span> <span className="text-gray-500">- {s.name}</span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }
