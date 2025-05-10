import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane, FaPlane } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-blue-900 to-blue-950 text-blue-100">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Logo and tagline */}
        <div className="flex flex-col items-center mb-12 text-center">
          <div className="flex items-center mb-4">
            <FaPlane className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-2xl font-bold text-white">SkyBooker</span>
          </div>
          <p className="text-blue-300 max-w-md">
            Making your journey through the skies seamless and comfortable.
          </p>
        </div>

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 border-t border-blue-800 pt-12">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase pb-1 border-b border-blue-700 inline-block">
              Company
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              <li><Link href="/about" className="text-blue-200 hover:text-white transition duration-200">About</Link></li>
              <li><Link href="/careers" className="text-blue-200 hover:text-white transition duration-200">Careers</Link></li>
              <li><Link href="/contact" className="text-blue-200 hover:text-white transition duration-200">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase pb-1 border-b border-blue-700 inline-block">
              Support
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              <li><Link href="/faq" className="text-blue-200 hover:text-white transition duration-200">FAQ</Link></li>
              <li><Link href="/help" className="text-blue-200 hover:text-white transition duration-200">Help Center</Link></li>
              <li><Link href="/terms" className="text-blue-200 hover:text-white transition duration-200">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-blue-200 hover:text-white transition duration-200">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase pb-1 border-b border-blue-700 inline-block">
              Services
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              <li><Link href="/flights" className="text-blue-200 hover:text-white transition duration-200">Flights</Link></li>
              <li><Link href="/hotels" className="text-blue-200 hover:text-white transition duration-200">Hotels</Link></li>
              <li><Link href="/packages" className="text-blue-200 hover:text-white transition duration-200">Vacation Packages</Link></li>
              <li><Link href="/loyalty" className="text-blue-200 hover:text-white transition duration-200">Loyalty Program</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase pb-1 border-b border-blue-700 inline-block">
              Stay Connected
            </h3>
            <p className="mt-4 text-blue-300">
              Get the latest updates on flights and exclusive offers.
            </p>
            <form className="mt-4">
              <div className="flex flex-col sm:flex-row">
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="appearance-none min-w-0 w-full bg-blue-800/50 border border-blue-700 rounded-lg py-2 px-4 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="Enter your email"
                />
                <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition duration-200 shadow-md"
                  >
                    <FaPaperPlane className="h-4 w-4 mr-2" />
                    Subscribe
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* Social links and copyright */}
        <div className="mt-12 pt-8 border-t border-blue-800 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex space-x-6 justify-center md:order-2">
            <a href="#" className="text-blue-400 hover:text-white transition-colors duration-200">
              <span className="sr-only">Facebook</span>
              <FaFacebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-blue-400 hover:text-white transition-colors duration-200">
              <span className="sr-only">Instagram</span>
              <FaInstagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-blue-400 hover:text-white transition-colors duration-200">
              <span className="sr-only">Twitter</span>
              <FaTwitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-blue-400 hover:text-white transition-colors duration-200">
              <span className="sr-only">LinkedIn</span>
              <FaLinkedin className="h-6 w-6" />
            </a>
          </div>
          <p className="mt-8 md:mt-0 text-center md:text-left text-blue-300 md:order-1">
            © {currentYear} SkyBooker, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;