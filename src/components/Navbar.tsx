'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Activity,
  PhoneCall,
  MapPin,
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Building2,
  ShieldCheck,
  Heart,
  Scale,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { activeLocation, favorites } = useAppContext();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const userRole = session?.user?.role || 'patient';

  // Role display helpers
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Admin',
          bgColor: 'bg-purple-100 text-purple-800 border-purple-200',
          dotColor: 'bg-purple-500'
        };
      case 'representative':
        return {
          label: 'Facility Rep',
          bgColor: 'bg-blue-100 text-blue-800 border-blue-200',
          dotColor: 'bg-blue-500'
        };
      case 'patient':
      default:
        return {
          label: 'Patient',
          bgColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          dotColor: 'bg-emerald-500'
        };
    }
  };

  const getDashboardHref = (role: string) => {
    switch (role) {
      case 'admin':
        return '/dashboard/admin';
      case 'representative':
        return '/dashboard/representative';
      case 'patient':
      default:
        return '/dashboard/patient';
    }
  };

  const roleInfo = getRoleBadge(userRole);
  const dashboardHref = getDashboardHref(userRole);

  const navLinks = [
    { label: 'Hospitals', href: '/hospitals', icon: Building2 },
    { label: 'Emergency Finder', href: '/emergency', icon: PhoneCall },
    { label: 'Compare', href: '/compare', icon: Scale },
    { label: 'About', href: '/about', icon: ShieldCheck }
  ];

  const isLinkActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-hospital-blue-500 rounded-lg p-1"
              aria-label="Hospital Locator Nigeria Home"
            >
              {/* Medical Cross & Pulse Emblem */}
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-hospital-blue-600 via-hospital-blue-700 to-health-emerald-600 shadow-md shadow-hospital-blue-200 text-white transition-transform group-hover:scale-105">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emergency-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emergency-red-500 border-2 border-white"></span>
                </span>
              </div>

              {/* Title & Federal Subtext */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl font-sans">
                    Hospital<span className="text-hospital-blue-600">Locator</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    NG
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-500 tracking-wide hidden sm:block">
                  National Healthcare & Emergency Directory
                </span>
              </div>
            </Link>

            {/* Active Location Indicator (Desktop Chip) */}
            <div className="hidden xl:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-hospital-blue-600 flex-shrink-0" />
              <span className="font-medium text-slate-700 truncate max-w-[140px]" title={activeLocation.name}>
                {activeLocation.city}
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                {activeLocation.state}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-hospital-blue-50 text-hospital-blue-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-hospital-blue-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Items: Emergency CTA & Auth Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Prominent Emergency 24/7 CTA Pill */}
            <Link
              href="/emergency"
              className="relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-emergency-red-600 hover:bg-emergency-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emergency-red-200 hover:shadow-lg hover:shadow-emergency-red-300 transition-all transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emergency-red-500"
              aria-label="Emergency 24/7 Facility Finder"
            >
              <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-white"></span>
              </span>
              <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:rotate-12 transition-transform" />
              <span className="tracking-wide">
                <span className="hidden sm:inline">Emergency </span>24/7
              </span>
            </Link>

            {/* User Auth Section (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-hospital-blue-500"
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-hospital-blue-100 text-hospital-blue-700 flex items-center justify-center font-bold text-xs border border-hospital-blue-200">
                      {session?.user?.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : 'U'}
                    </div>

                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[110px]">
                        {session?.user?.name || 'User Account'}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        {userRole}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium border ${roleInfo.bgColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${roleInfo.dotColor} mr-1`}></span>
                      {roleInfo.label}
                    </span>

                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 transition-all duration-150 ${
                      userDropdownOpen
                        ? 'opacity-100 scale-100 pointer-events-auto visible'
                        : 'opacity-0 scale-95 pointer-events-none invisible'
                    }`}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {session?.user?.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {session?.user?.email}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${roleInfo.bgColor}`}
                        >
                          {roleInfo.label} Role
                        </span>
                        {session?.user?.hospitalId && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                            {session.user.hospitalId}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href={dashboardHref}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-hospital-blue-600 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-slate-400" />
                        My Dashboard
                      </Link>

                      {userRole === 'patient' && (
                        <Link
                          href="/dashboard/patient"
                          className="flex items-center justify-between px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-hospital-blue-600 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <Heart className="w-4 h-4 text-slate-400" />
                            Saved Facilities
                          </span>
                          {favorites.length > 0 && (
                            <span className="bg-hospital-blue-100 text-hospital-blue-700 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                              {favorites.length}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-emergency-red-600 hover:bg-emergency-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-emergency-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-hospital-blue-600 hover:bg-hospital-blue-700 text-white shadow-xs transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-hospital-blue-500"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation drawer"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-slate-800" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-800" />
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/98 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
          
          {/* Simulated Location Indicator Mobile */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-hospital-blue-600" />
              <span>Current City:</span>
              <strong className="text-slate-900">{activeLocation.city}</strong>
            </div>
            <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
              {activeLocation.state}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-hospital-blue-50 text-hospital-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-hospital-blue-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Auth Info Mobile */}
          <div className="border-t border-slate-200 pt-3">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-hospital-blue-100 text-hospital-blue-700 flex items-center justify-center font-bold text-xs">
                      {session?.user?.name
                        ? session.user.name.charAt(0).toUpperCase()
                        : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {session?.user?.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleInfo.bgColor}`}
                  >
                    {roleInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={dashboardHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-hospital-blue-50 text-hospital-blue-700 hover:bg-hospital-blue-100 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-emergency-red-50 text-emergency-red-700 hover:bg-emergency-red-100 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 px-3 rounded-lg text-xs font-semibold bg-hospital-blue-600 text-white hover:bg-hospital-blue-700 text-center shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}

export default Navbar;
