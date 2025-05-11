"use client";

import React, { useState, useContext, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner } from 'react-icons/fa';

// This component will use the search params hook
function LoginForm({ from }: { from: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (!authContext) return <div>Error: AuthContext not found.</div>;
  const { login, authError, loading: authOpLoading, setAuthError } = authContext;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (setAuthError) setAuthError(null);
    const success = await login(email, password);
    if (success) router.replace(from);
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className="z-10 w-full max-w-md backdrop-blur-sm bg-white/80 p-10 rounded-3xl shadow-xl border border-white/20"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      transition={{ duration: 0.5 }}
    >
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
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Welcome Back</h2>
        <p className="mt-2 text-gray-500">Sign in to continue your journey</p>
      </div>

      {authError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-600">{authError}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email-login"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Password</label>
            <Link href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500">Forgot password?</Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password-login"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <motion.button
            type="submit"
            disabled={authOpLoading}
            className="w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 flex justify-center items-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            style={{
              backgroundImage: 'linear-gradient(to right, #3b82f6, #6366f1)',
              color: '#fff'
            }}
          >
            {authOpLoading ? (
              <><FaSpinner className="animate-spin h-5 w-5 mr-2" />Signing In...</>
            ) : (
              <><FaSignInAlt className="h-5 w-5 mr-2" />Sign In</>
            )}
          </motion.button>
        </div>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">Create an account</Link>
      </p>
    </motion.div>
  );
}

// Loading fallback for the Suspense boundary
function LoginFormFallback() {
  return (
    <div className="z-10 w-full max-w-md backdrop-blur-sm bg-white/80 p-10 rounded-3xl shadow-xl border border-white/20 flex justify-center items-center">
      <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
    </div>
  );
}

// Main page component that wraps the form in Suspense
export default function LoginPage() {
  // This component extracts the search params and passes them to the form
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm from={from} />
      </Suspense>
    </div>
  );
}