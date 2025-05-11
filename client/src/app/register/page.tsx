"use client";

import React, { useState, useContext, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaSpinner, FaUserPlus } from 'react-icons/fa';

export default function RegisterPage() {
  // Use a generic record type so indexing by string keys is allowed
  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });
  const authContext = useContext(AuthContext);
  const router = useRouter();
  const [clientError, setClientError] = useState('');

  if (!authContext) return <div>Error: AuthContext not found.</div>;
  const { register, authError, loading: authOpLoading, setAuthError } = authContext;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setClientError('');
    setAuthError?.(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientError('');
    setAuthError?.(null);

    if (formData.password !== formData.confirmPassword) {
      setClientError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setClientError('Password must be at least 6 characters long.');
      return;
    }

    const { confirmPassword, ...registrationData } = formData;
    const success = await register(registrationData);
    if (success) router.push('/');
  };

  const displayError = clientError || authError;
  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <motion.div
        className="relative w-full max-w-2xl bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.5 }}
      >
        {/* Logo Header with Animation */}
        <div className="text-center mb-8">
          <motion.div
            className="flex items-center justify-center"
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
            <h1 className="ml-3 text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Lets Go Sky.
            </h1>
          </motion.div>
          {/* <p className="mt-2 text-gray-500">Sign in to continue your journey</p> */}
        </div>

        {displayError && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded-lg">
            <p className="text-sm text-red-600">{displayError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { id: 'name', name: 'name', label: 'Full Name', type: 'text', Icon: FaUser, placeholder: 'John Doe' },
            { id: 'email', name: 'email', label: 'Email Address', type: 'email', Icon: FaEnvelope, placeholder: 'you@example.com' },
            { id: 'phoneNumber', name: 'phoneNumber', label: 'Phone Number', type: 'tel', Icon: FaPhone, placeholder: '(+1) 555-1234' },
            { id: 'password', name: 'password', label: 'Password', type: 'password', Icon: FaLock, placeholder: 'Min 6 characters' },
          ].map(({ id, name, label, type, Icon, placeholder }) => (
            <div key={name} className="flex flex-col">
              <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
              <div className="relative mt-1">
                <Icon className="absolute left-3 top-3 text-gray-400" />
                <input
                  id={id}
                  name={name}
                  type={type}
                  required={name !== 'phoneNumber'}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          ))}

          {/* Confirm Password */}
          <div className="flex flex-col md:col-span-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative mt-1">
              <FaLock className="absolute left-3 top-3 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                className="w-full pl-10 pr-3 py-3 text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={authOpLoading}
            className="md:col-span-2 w-full py-3 rounded-lg font-semibold flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #6366f1)', color: '#fff' }}
          >
            {authOpLoading ? (
              <><FaSpinner className="animate-spin h-5 w-5 mr-2" />Creating...</>
            ) : (
              <><FaUserPlus className="h-5 w-5 mr-2" />Create Account</>
            )}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}