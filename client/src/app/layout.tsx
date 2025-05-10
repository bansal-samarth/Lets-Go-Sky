// client/src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../context/AuthContext';
import { BookingProvider } from '../context/BookingContext'; // Adjust path
import Navbar from '@/components/Navbar'; // Using path alias
import Footer from '@/components/Footer';   // Using path alias

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkyBooker - Flights',
  description: 'Book your flights with SkyBooker.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}> {/* Base styles applied via globals.css */}
        <AuthProvider>
        <Navbar />
        <BookingProvider> {/* Wrap with BookingProvider */}
            {children}
          </BookingProvider>
        <Footer />  
        </AuthProvider>
      </body>
    </html>
  )
}