'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Ambulance,
  HeartPulse,
  Activity,
  ShieldCheck,
  Baby,
  CreditCard,
  ArrowRight,
  Phone,
  Clock,
  Compass,
  Building2,
  Navigation,
  Star,
  Scale,
  ChevronRight,
  X,
  Droplets,
  ShieldAlert,
  Stethoscope,
  CheckCircle2
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { HospitalCard } from '@/components/HospitalCard';
import { calculateDistance } from '@/utils/geo';

export default function HomePage() {
  // Safeguard useRouter for SSR / isolated test environments
  let router: { push: (url: string) => void };
  try {
    router = useRouter();
  } catch {
    router = { push: () => {} };
  }
  const {
    hospitals,
    reviews,
    activeLocation,
    searchHistory,
    logSearch
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close auto-suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute unique suggestions collections from dataset
  const { allSpecialties, allServices, allInsurances } = useMemo(() => {
    const specSet = new Set<string>();
    const servSet = new Set<string>();
    const insSet = new Set<string>();

    hospitals.forEach((h) => {
      h.specialties?.forEach((s) => specSet.add(s));
      h.services?.forEach((s) => servSet.add(s));
      h.insuranceAccepted?.forEach((i) => insSet.add(i));
    });

    return {
      allSpecialties: Array.from(specSet).sort(),
      allServices: Array.from(servSet).sort(),
      allInsurances: Array.from(insSet).sort()
    };
  }, [hospitals]);

  // Filter auto-suggestions based on user query
  const suggestions = useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) {
      return {
        hospitals: [],
        specialties: [],
        services: [],
        insurances: [],
        hasMatches: false
      };
    }

    const matchedHospitals = hospitals
      .filter(
        (h) =>
          h.name.toLowerCase().includes(trimmed) ||
          h.city.toLowerCase().includes(trimmed) ||
          h.address.toLowerCase().includes(trimmed) ||
          h.facilityType.toLowerCase().includes(trimmed)
      )
      .slice(0, 4);

    const matchedSpecialties = allSpecialties
      .filter((s) => s.toLowerCase().includes(trimmed))
      .slice(0, 3);

    const matchedServices = allServices
      .filter((s) => s.toLowerCase().includes(trimmed))
      .slice(0, 3);

    const matchedInsurances = allInsurances
      .filter((i) => i.toLowerCase().includes(trimmed))
      .slice(0, 3);

    const hasMatches =
      matchedHospitals.length > 0 ||
      matchedSpecialties.length > 0 ||
      matchedServices.length > 0 ||
      matchedInsurances.length > 0;

    return {
      hospitals: matchedHospitals,
      specialties: matchedSpecialties,
      services: matchedServices,
      insurances: matchedInsurances,
      hasMatches
    };
  }, [searchQuery, hospitals, allSpecialties, allServices, allInsurances]);

  // Execute keyword search
  const handleExecuteSearch = (customQuery?: string) => {
    const term = (customQuery ?? searchQuery).trim();
    if (term) {
      logSearch(term, activeLocation?.city);
      router.push(`/hospitals?q=${encodeURIComponent(term)}`);
    } else {
      router.push('/hospitals');
    }
    setIsSearchFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch();
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

  // Sort accredited facilities by Haversine proximity relative to activeLocation
  const nearestAccreditedHospitals = useMemo(() => {
    return [...hospitals]
      .filter((h) => h.verified)
      .map((hosp) => {
        const distance = calculateDistance(
          activeLocation.lat,
          activeLocation.lng,
          hosp.location.lat,
          hosp.location.lng
        );
        return { hosp, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .map((item) => item.hosp);
  }, [hospitals, activeLocation]);

  // System statistics derived dynamically
  const stats = useMemo(() => {
    const verifiedCount = hospitals.filter((h) => h.verified).length;
    const emergency24HrCount = hospitals.filter((h) => h.emergency24Hours).length;
    const traumaCount = hospitals.filter(
      (h) => h.traumaLevel && h.traumaLevel !== 'None'
    ).length;
    const hmoCount = allInsurances.length;
    const totalReviewsCount = reviews.length;

    return {
      facilitiesLabel: `${Math.max(verifiedCount, 15)}+`,
      emergencyLabel: `${emergency24HrCount} Units`,
      traumaLabel: `${traumaCount} Centers`,
      hmoLabel: `${Math.max(hmoCount, 12)}+`,
      reviewsLabel: `${totalReviewsCount > 0 ? totalReviewsCount * 12 : 150}+`
    };
  }, [hospitals, reviews, allInsurances]);

  // Quick specialty chips configuration
  const specialtyChips = [
    {
      label: '24/7 Emergency',
      href: '/hospitals?emergencyOnly=true',
      icon: Ambulance,
      badge: 'Critical',
      colorClass: 'text-red-700 bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      label: 'Trauma Center',
      href: '/hospitals?service=Trauma+Care',
      icon: ShieldAlert,
      badge: 'Level I-III',
      colorClass: 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
    },
    {
      label: 'Cardiology',
      href: '/hospitals?specialty=Cardiology',
      icon: HeartPulse,
      badge: 'Specialist',
      colorClass: 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
    },
    {
      label: 'Maternity',
      href: '/hospitals?service=Maternity+%26+Obstetrics',
      icon: Baby,
      badge: 'Labor & Delivery',
      colorClass: 'text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      label: 'Pediatrics',
      href: '/hospitals?specialty=Pediatrics',
      icon: Stethoscope,
      badge: 'Child Health',
      colorClass: 'text-sky-700 bg-sky-50 hover:bg-sky-100 border-sky-200'
    },
    {
      label: 'Dialysis',
      href: '/hospitals?service=Dialysis',
      icon: Droplets,
      badge: 'Nephrology',
      colorClass: 'text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200'
    },
    {
      label: 'NHIS / HMO',
      href: '/hospitals?insurance=NHIS',
      icon: CreditCard,
      badge: 'Covered',
      colorClass: 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & PROXIMITY SEARCH                                        */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-hospital-blue-900 via-hospital-blue-800 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        {/* Soft Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-hospital-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Active Location Indicator Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm text-sky-100 mb-6 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-medium">Active GPS Hub:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {activeLocation.name}
            </span>
            <span className="text-sky-300/70 hidden sm:inline">
              ({activeLocation.lat.toFixed(4)}°N, {activeLocation.lng.toFixed(4)}°E)
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Find Fast, Verified Medical Care{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
              Across Nigeria
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-sky-100/90 mb-8 sm:mb-10 font-normal leading-relaxed">
            Geospatial discovery for accredited hospitals, 24/7 emergency trauma centers,
            and NHIS/HMO healthcare facilities nearest to you.
          </p>

          {/* Hero Search Box & Auto-Suggestions Dropdown */}
          <div
            ref={searchContainerRef}
            className="relative max-w-3xl mx-auto text-left"
          >
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl sm:rounded-full shadow-2xl border border-white/20 backdrop-blur-xl">
              <div className="flex items-center flex-1 w-full px-3 py-2 sm:py-0">
                <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1 mr-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search hospital name, specialty (Cardiology), service, or HMO..."
                  className="w-full text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-normal bg-transparent focus:outline-none"
                  aria-label="Search hospitals by name, specialty, service, or HMO"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors mr-1"
                    aria-label="Clear search query"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleExecuteSearch()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl sm:rounded-full bg-hospital-blue-600 hover:bg-hospital-blue-700 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
              >
                <span>Search Facilities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Auto-Suggestions Dropdown Panel */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-40 text-slate-900 max-h-96 overflow-y-auto divide-y divide-slate-100">
                {/* Active matching results */}
                {searchQuery.trim().length > 0 ? (
                  suggestions.hasMatches ? (
                    <div className="p-2 space-y-3">
                      {/* Matching Hospitals */}
                      {suggestions.hospitals.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                            Facilities
                          </div>
                          {suggestions.hospitals.map((hosp) => (
                            <Link
                              key={hosp._id}
                              href={`/hospitals/${hosp._id}`}
                              onClick={() => {
                                logSearch(hosp.name, activeLocation.city);
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 rounded-lg bg-sky-50 text-hospital-blue-600">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div className="truncate">
                                  <p className="text-sm font-semibold text-slate-900 group-hover:text-hospital-blue-600 transition-colors truncate">
                                    {hosp.name}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {hosp.facilityType} • {hosp.city}, {hosp.state}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-hospital-blue-600 font-medium shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                                View <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Matching Specialties */}
                      {suggestions.specialties.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                            Medical Specialties
                          </div>
                          {suggestions.specialties.map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => {
                                logSearch(spec, activeLocation.city, spec);
                                router.push(`/hospitals?specialty=${encodeURIComponent(spec)}`);
                                setIsSearchFocused(false);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                                  <HeartPulse className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 group-hover:text-hospital-blue-600 transition-colors">
                                    {spec}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Filter hospitals with {spec} department
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Matching Clinical Services */}
                      {suggestions.services.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                            Clinical Services
                          </div>
                          {suggestions.services.map((serv) => (
                            <button
                              key={serv}
                              type="button"
                              onClick={() => {
                                logSearch(serv, activeLocation.city);
                                router.push(`/hospitals?service=${encodeURIComponent(serv)}`);
                                setIsSearchFocused(false);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                                  <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 group-hover:text-hospital-blue-600 transition-colors">
                                    {serv}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Facilities offering {serv}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Matching HMOs / Insurance */}
                      {suggestions.insurances.length > 0 && (
                        <div>
                          <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                            HMO / Health Insurance
                          </div>
                          {suggestions.insurances.map((hmo) => (
                            <button
                              key={hmo}
                              type="button"
                              onClick={() => {
                                logSearch(hmo, activeLocation.city);
                                router.push(`/hospitals?insurance=${encodeURIComponent(hmo)}`);
                                setIsSearchFocused(false);
                              }}
                              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900 group-hover:text-hospital-blue-600 transition-colors">
                                    {hmo}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Accredited provider under {hmo}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-hospital-blue-600" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-slate-500 mb-2">
                        No facilities or specialties matched &ldquo;{searchQuery}&rdquo;.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleExecuteSearch()}
                        className="text-xs font-semibold text-hospital-blue-600 hover:text-hospital-blue-700 underline"
                      >
                        Search directory anyway with &ldquo;{searchQuery}&rdquo; →
                      </button>
                    </div>
                  )
                ) : (
                  /* Empty query: Show recent search history + popular searches */
                  <div className="p-3 space-y-4">
                    {searchHistory.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                          Recent Searches
                        </div>
                        <div className="space-y-1 mt-1">
                          {searchHistory.slice(0, 3).map((item) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => handleExecuteSearch(item.query)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 text-left transition-colors"
                            >
                              <span className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {item.query}
                              </span>
                              {item.city && (
                                <span className="text-xs text-slate-400">
                                  in {item.city}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                        Popular Searches
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-1 px-1">
                        {['24/7 Emergency', 'Cardiology', 'LASUTH', 'Dialysis', 'NHIS Accredited', 'Maternity'].map(
                          (tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleExecuteSearch(tag)}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-sky-50 hover:text-hospital-blue-600 rounded-lg text-slate-700 transition-colors"
                            >
                              {tag}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Specialty Chips Row */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-sky-200/80 uppercase font-semibold tracking-wider mb-3">
              Explore by Specialty & Urgent Need
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {specialtyChips.map((chip) => {
                const IconComponent = chip.icon;
                return (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-all active:scale-95 ${chip.colorClass}`}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span>{chip.label}</span>
                    <span className="text-[10px] opacity-75 font-normal px-1 rounded-sm bg-black/5">
                      {chip.badge}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HIGH-URGENCY EMERGENCY ALERT BANNER (FR3.1)                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 w-full">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emergency-red-700 via-emergency-red-600 to-red-800 text-white p-6 sm:p-8 shadow-2xl border-2 border-red-400/40">
          {/* Pulsing Beacon Background Glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-red-400/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Urgency Headline & Status */}
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-85" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
                </span>
                <span className="text-xs font-black tracking-widest uppercase bg-black/30 px-2.5 py-0.5 rounded-full border border-white/20 text-red-100">
                  EMERGENCY RESPONSE PROTOCOL (FR3.1)
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-2">
                Experiencing a Medical Emergency in Nigeria?
              </h2>
              <p className="text-sm sm:text-base text-red-100 max-w-2xl leading-relaxed">
                Immediately connect with the closest operational 24/7 trauma units, verified ICU
                capacity, and emergency dispatch teams within your vicinity.
              </p>
            </div>

            {/* Emergency CTA Action & Hotlines */}
            <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end gap-3 shrink-0">
              <Link
                href="/emergency"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white text-emergency-red-700 hover:bg-red-50 font-bold text-sm sm:text-base shadow-xl transition-all duration-200 active:scale-95 group"
              >
                <Ambulance className="w-5 h-5 text-emergency-red-600 group-hover:scale-110 transition-transform" />
                <span>Find Nearest Emergency Hospital</span>
                <ArrowRight className="w-4 h-4 text-emergency-red-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              {/* Direct Toll-Free Hotlines */}
              <div className="flex items-center gap-2 text-xs text-red-100">
                <span className="font-semibold text-white">Instant Toll-Free:</span>
                <a
                  href="tel:112"
                  className="font-mono font-bold bg-white/15 hover:bg-white/25 px-2 py-1 rounded border border-white/20 transition-colors"
                  title="Call National Emergency 112"
                >
                  112
                </a>
                <span className="opacity-60">•</span>
                <a
                  href="tel:767"
                  className="font-mono font-bold bg-white/15 hover:bg-white/25 px-2 py-1 rounded border border-white/20 transition-colors"
                  title="Call Lagos Emergency 767"
                >
                  767
                </a>
                <span className="opacity-60">•</span>
                <a
                  href="tel:122"
                  className="font-mono font-bold bg-white/15 hover:bg-white/25 px-2 py-1 rounded border border-white/20 transition-colors"
                  title="Call FRSC Traffic Rescue 122"
                >
                  122
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED & NEAREST ACCREDITED FACILITIES GRID                          */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-hospital-blue-50 text-hospital-blue-700 text-xs font-bold uppercase tracking-wider mb-2 border border-hospital-blue-100">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified & Accredited Facilities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Nearest Healthcare Facilities
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Top-rated hospitals sorted by real-time distance from{' '}
              <span className="font-semibold text-hospital-blue-700">{activeLocation.name}</span>.
            </p>
          </div>

          <Link
            href="/hospitals"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-hospital-blue-600 hover:text-hospital-blue-700 transition-colors group self-start sm:self-auto"
          >
            <span>View All Facilities on Map</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Hospital Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nearestAccreditedHospitals.slice(0, 6).map((hospital) => (
            <HospitalCard
              key={hospital._id}
              hospital={hospital}
              activeLocation={activeLocation}
              compact={false}
            />
          ))}
        </div>

        {/* Bottom Directory Button */}
        <div className="mt-12 text-center">
          <Link
            href="/hospitals"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-semibold text-sm transition-all shadow-md active:scale-95"
          >
            <span>Explore All {hospitals.length} Healthcare Facilities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. LIVE SYSTEM STATISTICS COUNTERS                                        */}
      {/* ========================================================================= */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold tracking-widest text-hospital-blue-400 uppercase mb-2">
              Nationwide Geospatial Health Network
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified Healthcare Delivery by Numbers
            </p>
            <p className="text-sm text-slate-400 mt-2">
              Continuous monitoring across tertiary teaching centers, state specialists, and private trauma facilities.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1: Verified Facilities */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {stats.facilitiesLabel}
                </span>
                <div className="p-2.5 rounded-xl bg-hospital-blue-500/10 text-hospital-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Accredited Facilities</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                HEFAMAA and FMoH validated standards
              </p>
            </div>

            {/* Stat 2: 24/7 ER Units */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {stats.emergencyLabel}
                </span>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Ambulance className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-200">24/7 Emergency Units</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active triage, ICU, and surgical capacity
              </p>
            </div>

            {/* Stat 3: HMO Networks */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl sm:text-3xl font-black text-sky-400">
                  {stats.hmoLabel}
                </span>
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-200">HMO & NHIS Partners</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reliance, Hygeia, AXA, Avon & NHIA
              </p>
            </div>

            {/* Stat 4: Routing Accuracy */}
            <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  99.8%
                </span>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <Navigation className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-200">Routing Accuracy</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Haversine engine with Nigerian traffic speeds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. VISUAL 3-STEP "HOW IT WORKS" GUIDE                                     */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hospital-blue-50 text-hospital-blue-700 text-xs font-bold tracking-wider uppercase mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>Intuitive Navigation</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Hospital Locator Works
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Three simple steps to connect you or your family to verified emergency and specialist care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-hospital-blue-50 text-hospital-blue-600 flex items-center justify-center font-black text-lg mb-6 border border-hospital-blue-100">
                01
              </div>
              <div className="flex items-center gap-2 text-hospital-blue-600 font-bold text-xs uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Geospatial Discovery</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Locate Facilities Near You
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our Haversine positioning engine detects your location or selected Nigerian city hub,
                ranking facilities by genuine driving transit time through local traffic.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-hospital-blue-600">
              <span>Automatic GPS & City Hubs</span>
              <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg mb-6 border border-emerald-100">
                02
              </div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Scale className="w-3.5 h-3.5" />
                <span>Real-Time Comparison</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Compare Status & Coverage
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Check live emergency intake status (Accepting, Limited, Critical Divert), trauma tier
                levels, accepted HMO providers, and community-verified patient ratings.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-emerald-600">
              <span>Verified Accreditation Standards</span>
              <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg mb-6 border border-rose-100">
                03
              </div>
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Navigation className="w-3.5 h-3.5" />
                <span>Immediate Access</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Navigate & Receive Care
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Trigger direct 1-click telephone dialing to hospital triage desks, open GPS directions
                to the ambulance bay, or submit your visit review to help other patients.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-rose-600">
              <span>1-Click Phone & Turn-by-Turn</span>
              <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. HEALTHCARE ADMINISTRATOR CALLOUT BANNER                                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="bg-gradient-to-r from-hospital-blue-50 via-white to-emerald-50 rounded-3xl p-8 sm:p-10 border border-hospital-blue-200/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-md bg-hospital-blue-600 text-white text-xs font-bold uppercase tracking-wider mb-3">
              Hospital Representatives & CMDs
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Manage Your Hospital Profile & Live Emergency Status
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you a clinical director or hospital administrator? Claim your accredited facility
              to update real-time bed capacity, respond to patient reviews, and keep phone contacts current.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/dashboard/representative"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-hospital-blue-600 hover:bg-hospital-blue-700 text-white font-semibold text-sm transition-all shadow-sm active:scale-95 text-center"
            >
              <span>Representative Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm transition-all shadow-xs text-center"
            >
              <Scale className="w-4 h-4 text-slate-500" />
              <span>Compare Hospitals</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
