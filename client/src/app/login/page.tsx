// src/app/login/page.tsx
"use client";

import React, { useState, useContext, FormEvent, Suspense, lazy } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner, FaExclamationCircle } from 'react-icons/fa';

// Lazy-load the inner form so Suspense can catch the useSearchParams call
const LoginForm = lazy(() => Promise.resolve({ default: InnerLoginForm }));

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
      </div>

      {/* Suspense boundary around the part that calls useSearchParams */}
      <Suspense
        fallback={
          <div className="z-10 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 rounded-full border-t-4 border-blue-500" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

// We define the inner form in the same file.
// Because page.tsx is already "use client", this component can use hooks freely.
function InnerLoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const authContext             = useContext(AuthContext);
  const router                  = useRouter();
  const searchParams            = useSearchParams();
  const from                    = searchParams.get('from') || '/';

  if (!authContext) {
    return <div className="p-4 bg-red-100 text-red-700 rounded">Error: AuthContext not found.</div>;
  }
  const { login, authError, loading: authOpLoading, setAuthError } = authContext;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError?.(null);
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
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          className="flex items-center justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20" />
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* Auth error */}
      {authError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center text-red-600">
          <FaExclamationCircle className="h-5 w-5 mr-2" />
          <span>{authError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">Email Address</label>
          <div className="relative mt-1">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              id="email-login"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              id="password-login"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={authOpLoading}
          className="w-full py-3 rounded-lg font-semibold flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #6366f1)', color: '#fff' }}
        >
          {authOpLoading
            ? <><FaSpinner className="animate-spin h-5 w-5 mr-2" />Signing In...</>
            : <><FaSignInAlt className="h-5 w-5 mr-2" />Sign In</>
          }
        </motion.button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-blue-600 hover:underline">
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
