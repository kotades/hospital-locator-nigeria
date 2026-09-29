import React from 'react';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthSessionProvider } from '@/context/AuthSessionProvider';
import { AppContextProvider } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoRoleBar } from '@/components/DemoRoleBar';

export const metadata: Metadata = {
  title: 'Hospital Locator Nigeria | Emergency & Geospatial Healthcare Directory',
  description:
    'Geospatial discovery platform for accredited Nigerian hospitals, 24/7 emergency trauma units, NHIS/HMO verified clinics, and specialist healthcare facilities across Lagos, Abuja, Ibadan, and nationwide.',
  keywords: [
    'Nigerian hospitals',
    'Emergency 112 Nigeria',
    'Trauma Center Lagos Abuja',
    'Hospital Locator Nigeria',
    'LUTH',
    'LASUTH',
    'HEFAMAA accredited',
    'NHIS hospitals Nigeria',
    'Federal Medical Centre',
    'Emergency medical service Nigeria'
  ],
  authors: [{ name: 'Sanni Inuoluwadunsimi' }],
  icons: {
    icon: '/favicon.ico'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0284c7'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-hospital-blue-100 selection:text-hospital-blue-900">
        <AuthSessionProvider>
          <AppContextProvider>
            {/* Global Sticky Navigation */}
            <Navbar />

            {/* Main Application Content Area */}
            <main className="flex-1 pb-24 md:pb-20">
              {children}
            </main>

            {/* Global Emergency Hotlines & Directory Footer */}
            <Footer />

            {/* Floating Persona Switcher & Nigerian City Simulator */}
            <DemoRoleBar />
          </AppContextProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
