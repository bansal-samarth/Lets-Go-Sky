"use client";

import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContext, AuthContextType } from '../src/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlaneDeparture, 
  FaBars, 
  FaTimes, 
  FaUserCircle, 
  FaWallet, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaUserPlus,
  FaHome,
  FaSearch,
  FaBookmark
} from 'react-icons/fa';

const Navbar: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#user-menu') && !target.closest('#user-menu-button')) {
        setIsUserDropdownOpen(false);
      }
      if (!target.closest('#mobile-menu') && !target.closest('#mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!authContext) return null;
  const { user, logout, walletBalance } = authContext;

  const navLinks = [
    { href: '/', label: 'Home', icon: <FaHome className="mr-2" /> },
    ...(user ? [
      { href: '/search', label: 'Search Flights', icon: <FaSearch className="mr-2" /> },
      { href: '/bookings', label: 'My Bookings', icon: <FaBookmark className="mr-2" /> },
    ] : [])
  ];

  const handleLogout = () => {
    logout();
  };

  const fadeIn = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <header className="fixed w-full z-50 top-0 left-0">
      {/* Frosted glass effect */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-lg shadow-sm border-b border-white/10"></div>
      
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center text-2xl font-bold transition-colors">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 rounded-lg blur-sm opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-tr from-blue-500 to-indigo-600 text-white p-2 rounded-lg group-hover:shadow-md transition-all">
                <FaPlaneDeparture className="h-6 w-6" />
              </div>
            </div>
            <span className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lets Go Sky.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${pathname === link.href
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Links / User Menu - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <motion.div 
                  className="text-sm text-gray-600 hidden lg:flex items-center px-3 py-1.5 bg-blue-50 rounded-full shadow-sm"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaWallet className="mr-2 text-blue-500" />
                  <span className="font-medium">₹{walletBalance.toLocaleString('en-IN')}</span>
                </motion.div>
                
                <div className="relative" id="user-menu">
                  <button
                    id="user-menu-button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 hover:bg-gray-50 transition-all"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 font-medium text-gray-700 hidden lg:inline truncate max-w-xs">
                      {user.name}
                    </span>
                    <svg 
                      className={`ml-1 h-4 w-4 text-gray-500 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </button>
                  
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={fadeIn}
                        transition={{ duration: 0.2 }}
                        className="origin-top-right absolute right-0 mt-2 w-60 rounded-xl shadow-lg py-1 bg-white ring-1 ring-black/5 focus:outline-none overflow-hidden backdrop-blur-sm bg-white/90"
                      >
                        <div className="px-4 py-4 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate mt-1">{user.email}</p>
                        </div>
                        
                        <div className="py-2">
                          <Link 
                            href="/wallet" 
                            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <div className="p-1.5 bg-blue-50 rounded-lg mr-3">
                              <FaWallet className="text-blue-500" />
                            </div>
                            <div>
                              <div className="font-medium">Wallet Balance</div>
                              <div className="text-xs text-gray-500 mt-0.5">₹{walletBalance.toLocaleString('en-IN')}</div>
                            </div>
                          </Link>
                          
                          <button
                            onClick={handleLogout}
                            className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-red-50 group transition-colors"
                          >
                            <div className="p-1.5 bg-red-50 rounded-lg mr-3">
                              <FaSignOutAlt className="text-red-500" />
                            </div>
                            <span className="font-medium group-hover:text-red-600">Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-full text-blue-600 font-medium text-sm hover:bg-blue-50 transition-all"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm hover:shadow-md transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              id="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? 
                <FaTimes className="block h-5 w-5" /> : 
                <FaBars className="block h-5 w-5" />
              }
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden relative overflow-hidden"
          >
            <div className="px-4 pt-3 pb-4 space-y-1 backdrop-blur-sm bg-white/90 shadow-lg border-t border-white/20">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all
                    ${pathname === link.href
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Auth Links / User Info - Mobile */}
            <div className="backdrop-blur-sm bg-white/90 px-4 pt-4 pb-6 border-t border-gray-100">
              {user ? (
                <>
                  <div className="flex items-center px-3 py-3 bg-gray-50 rounded-xl mb-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-medium text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Link
                      href="/wallet"
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 text-gray-700 font-medium transition-colors"
                    >
                      <div className="flex items-center">
                        <FaWallet className="text-blue-500 mr-3" /> 
                        <span>Wallet Balance</span>
                      </div>
                      <span className="font-semibold text-blue-700">₹{walletBalance.toLocaleString('en-IN')}</span>
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                    >
                      <FaSignOutAlt className="mr-3" /> Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Link 
                    href="/login" 
                    className="flex items-center justify-center w-full px-4 py-3 border border-blue-500 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors"
                  >
                    <FaSignInAlt className="mr-2" /> Sign In
                  </Link>
                  
                  <Link 
                    href="/register" 
                    className="flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-md transition-all"
                  >
                    <FaUserPlus className="mr-2" /> Create Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;