'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  RotateCcw,
  Ambulance,
  Star,
  Car,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Grid,
  Map as MapIcon,
  List,
  Compass,
  Phone,
  ArrowRight,
  Filter,
  Check,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Hospital, NigerianCityLocation } from '@/types';
import { HospitalCard } from '@/components/HospitalCard';
import { Map } from '@/components/Map';
import { MapLoadingSkeleton } from '@/components/MapLoadingSkeleton';
import { NIGERIAN_LOCATIONS } from '@/data/nigerianLocations';
import {
  HospitalFilterState,
  DEFAULT_FILTER_STATE,
  STATE_OPTIONS,
  FACILITY_TYPE_OPTIONS,
  SERVICE_OPTIONS,
  INSURANCE_OPTIONS,
  SPECIALTY_OPTIONS,
  SORT_OPTIONS,
  SortOption,
  filterHospitals,
  sortHospitals,
  HospitalWithDistance
} from './searchUtils';

type ViewMode = 'split' | 'list' | 'map';

function HospitalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    hospitals,
    activeLocation,
    setSimulatedLocation,
    logSearch,
    searchHistory
  } = useAppContext();

  // Desktop view mode ('split' | 'list' | 'map') and mobile active tab ('list' | 'map')
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [mobileTab, setMobileTab] = useState<'list' | 'map'>('list');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Filter & sort state
  const [filters, setFilters] = useState<HospitalFilterState>(DEFAULT_FILTER_STATE);

  // Hydrate filters from URL search params on mount or when params change
  useEffect(() => {
    if (!searchParams) return;

    const q = searchParams.get('q') || '';
    const specialty = searchParams.get('specialty') || 'all';
    const service = searchParams.get('service') || '';
    const insurance = searchParams.get('insurance') || 'all';
    const emergencyOnlyParam = searchParams.get('emergencyOnly');
    const emergencyOnly = emergencyOnlyParam === 'true' || emergencyOnlyParam === '1';
    const typeParam = searchParams.get('type') || 'all';
    const stateParam = searchParams.get('state');
    const sortParam = (searchParams.get('sort') as SortOption) || 'distance';
    const radiusParam = searchParams.get('radius') || searchParams.get('distance');

    const services = service ? [service] : [];
    const radius = radiusParam ? parseInt(radiusParam, 10) : 50;
    const isDistanceFilterActive = radiusParam !== null && !isNaN(radius);

    setFilters((prev) => ({
      ...prev,
      query: q,
      state: stateParam !== null ? stateParam : prev.state,
      specialty,
      services: services.length > 0 ? services : prev.services,
      insurance,
      emergencyOnly: emergencyOnly || prev.emergencyOnly,
      facilityType: typeParam !== 'all' ? typeParam : prev.facilityType,
      distanceRadiusKm: !isNaN(radius) ? radius : prev.distanceRadiusKm,
      isDistanceFilterActive: isDistanceFilterActive || prev.isDistanceFilterActive,
      sortBy: ['distance', 'rating', 'reviews', 'name'].includes(sortParam)
        ? sortParam
        : prev.sortBy
    }));
  }, [searchParams]);

  // Close location selector dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target as Node)
      ) {
        setLocationDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter & Sort calculation
  const filteredAndSortedHospitals = useMemo<HospitalWithDistance[]>(() => {
    const filtered = filterHospitals(hospitals, activeLocation, filters);
    return sortHospitals(filtered, filters.sortBy);
  }, [hospitals, activeLocation, filters]);

  // Log non-empty searches to search history
  const lastLoggedQueryRef = useRef<string>('');
  useEffect(() => {
    const trimmed = filters.query.trim();
    if (trimmed && trimmed.length >= 2 && trimmed !== lastLoggedQueryRef.current) {
      const timer = setTimeout(() => {
        lastLoggedQueryRef.current = trimmed;
        logSearch(
          trimmed,
          activeLocation.city,
          filters.specialty !== 'all' ? filters.specialty : undefined,
          filteredAndSortedHospitals.length
        );
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [filters.query, filters.specialty, activeLocation.city, filteredAndSortedHospitals.length, logSearch]);

  // Active filter count for badge indicator
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.query.trim()) count++;
    if (filters.facilityType !== 'all') count++;
    if (filters.services.length > 0) count += filters.services.length;
    if (filters.insurance !== 'all') count++;
    if (filters.specialty !== 'all') count++;
    if (filters.emergencyOnly) count++;
    if (filters.minRating > 0) count++;
    if (filters.isDistanceFilterActive) count++;
    return count;
  }, [filters]);

  // Reset all filters to default
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
    setSelectedHospitalId(null);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '/hospitals');
    }
  }, []);

  // Toggle specific service selection
  const handleToggleService = useCallback((serviceName: string) => {
    setFilters((prev) => {
      const exists = prev.services.includes(serviceName);
      const nextServices = exists
        ? prev.services.filter((s) => s !== serviceName)
        : [...prev.services, serviceName];
      return { ...prev, services: nextServices };
    });
  }, []);

  // Select hospital and focus on map
  const handleSelectHospital = useCallback((hospital: Hospital) => {
    setSelectedHospitalId(hospital._id);
  }, []);

  // Find currently selected hospital entity
  const selectedHospital = useMemo(() => {
    if (!selectedHospitalId) return null;
    return filteredAndSortedHospitals.find((h) => h._id === selectedHospitalId) || null;
  }, [selectedHospitalId, filteredAndSortedHospitals]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & GEOSPATIAL SEARCH BAR                                     */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-slate-200 sticky top-16 sm:top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Search input */}
            <div className="relative flex-1 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, query: e.target.value }))
                  }
                  placeholder="Search hospital name, specialty, address, city, or service..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-hospital-blue-500 focus:border-transparent transition-all shadow-xs"
                />
                {filters.query && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, query: '' }))}
                    className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Clear search input"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Right: Active Location Selector & View Toggles */}
            <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3">
              {/* Active Simulated Location Dropdown */}
              <div className="relative" ref={locationDropdownRef}>
                <button
                  type="button"
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                  aria-label="Change simulated location"
                  aria-expanded={locationDropdownOpen}
                >
                  <MapPin className="w-3.5 h-3.5 text-hospital-blue-600 shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[150px]">
                    {activeLocation.city}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">
                    ({activeLocation.state})
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {locationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="font-bold text-slate-800">Simulate Nigerian GPS Hub</p>
                      <p className="text-[11px] text-slate-500">
                        Distances recomputed relative to chosen hub
                      </p>
                    </div>
                    <div className="max-h-72 overflow-y-auto py-1">
                      <div className="px-3 py-1 bg-hospital-blue-50/70 text-[10px] font-bold text-hospital-blue-800 uppercase tracking-wider flex items-center justify-between">
                        <span>⭐ Delta State Hubs (Primary)</span>
                        <span className="text-[9px] font-normal lowercase bg-hospital-blue-100 text-hospital-blue-700 px-1.5 py-0.5 rounded">
                          local
                        </span>
                      </div>
                      {NIGERIAN_LOCATIONS.filter((l) => l.state === 'Delta').map((loc) => {
                        const isCurrent = loc.id === activeLocation.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => {
                              setSimulatedLocation(loc);
                              setLocationDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isCurrent ? 'bg-hospital-blue-50 text-hospital-blue-700 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <div className="truncate">
                              <p className="truncate font-medium">{loc.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {loc.city}, {loc.state}
                              </p>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-hospital-blue-600 shrink-0" />}
                          </button>
                        );
                      })}

                      <div className="px-3 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 border-t border-slate-100">
                        Other Nigerian Cities
                      </div>
                      {NIGERIAN_LOCATIONS.filter((l) => l.state !== 'Delta').map((loc) => {
                        const isCurrent = loc.id === activeLocation.id;
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => {
                              setSimulatedLocation(loc);
                              setLocationDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isCurrent ? 'bg-hospital-blue-50 text-hospital-blue-700 font-bold' : 'text-slate-700'
                            }`}
                          >
                            <div className="truncate">
                              <p className="truncate font-medium">{loc.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {loc.city}, {loc.state}
                              </p>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-hospital-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop View Mode Segmented Controls */}
              <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'split'
                      ? 'bg-white text-hospital-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Split view (List + Map)"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-hospital-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="List only view"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    viewMode === 'map'
                      ? 'bg-white text-hospital-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Map only view"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map</span>
                </button>
              </div>

              {/* Mobile Filter Sheet Trigger Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-hospital-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Tab Switcher: List vs Map */}
          <div className="flex lg:hidden items-center justify-between border-t border-slate-200/80 pt-2.5 mt-2.5">
            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setMobileTab('list')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === 'list'
                    ? 'bg-hospital-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List ({filteredAndSortedHospitals.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('map')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-all ${
                  mobileTab === 'map'
                    ? 'bg-hospital-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Interactive Map</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE: FILTERS SIDEBAR + RESULTS LIST + MAP VIEW              */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* --------------------------------------------------------------------- */}
          {/* A. DESKTOP FILTER SIDEBAR (FR2.3)                                     */}
          {/* --------------------------------------------------------------------- */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs sticky top-40 max-h-[calc(100vh-11rem)] overflow-y-auto">
            {/* Header: Title & Reset Button */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-hospital-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-hospital-blue-50 text-hospital-blue-700 border border-hospital-blue-200">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* 1. 24/7 Emergency Only Toggle */}
            <div className="p-3 rounded-xl bg-red-50/60 border border-red-100">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-600 text-white">
                    <Ambulance className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      24/7 Emergency
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Operational trauma & ER
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.emergencyOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, emergencyOnly: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
              </label>
            </div>

            {/* 1. State / Geographic Region Filter */}
            <div className="space-y-1.5 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-hospital-blue-600" />
                  <span>State / Geographic Zone</span>
                </label>
                <span className="text-[10px] font-bold text-hospital-blue-700 bg-hospital-blue-50 px-2 py-0.5 rounded-full border border-hospital-blue-200">
                  {filters.state === 'Delta' ? 'Delta Primary' : filters.state === 'all' ? 'Nationwide' : filters.state}
                </span>
              </div>
              <select
                value={filters.state}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, state: e.target.value }))
                }
                className="w-full py-2 px-2.5 rounded-xl border border-hospital-blue-300 bg-hospital-blue-50/40 text-xs font-bold text-slate-900 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-hospital-blue-500 shadow-xs"
              >
                {STATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Distance Radius Slider (1 km - 50 km from activeLocation) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-800 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-hospital-blue-600" />
                  <span>Distance Radius</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-hospital-blue-700 text-xs">
                    {filters.isDistanceFilterActive
                      ? `≤ ${filters.distanceRadiusKm} km`
                      : 'Any distance'}
                  </span>
                </div>
              </div>

              {/* Toggle radius constraint */}
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Filter within radius</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isDistanceFilterActive}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        isDistanceFilterActive: e.target.checked
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-hospital-blue-600"></div>
                </label>
              </div>

              {/* Range slider */}
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={filters.distanceRadiusKm}
                disabled={!filters.isDistanceFilterActive}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    distanceRadiusKm: parseInt(e.target.value, 10),
                    isDistanceFilterActive: true
                  }))
                }
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-opacity ${
                  filters.isDistanceFilterActive
                    ? 'bg-hospital-blue-100 accent-hospital-blue-600'
                    : 'bg-slate-200 opacity-50 cursor-not-allowed'
                }`}
              />

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>1 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>

              {/* Quick Distance Presets */}
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[5, 10, 25, 50].map((radius) => (
                  <button
                    key={radius}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        distanceRadiusKm: radius,
                        isDistanceFilterActive: true
                      }))
                    }
                    className={`py-1 text-[10px] font-semibold rounded-md border text-center transition-colors ${
                      filters.isDistanceFilterActive && filters.distanceRadiusKm === radius
                        ? 'bg-hospital-blue-600 text-white border-hospital-blue-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {radius} km
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Facility Type Filter */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Facility Classification
              </label>
              <select
                value={filters.facilityType}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, facilityType: e.target.value }))
                }
                className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-hospital-blue-500"
              >
                {FACILITY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. HMO / Health Insurance Accepted */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                HMO / Health Insurance
              </label>
              <select
                value={filters.insurance}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, insurance: e.target.value }))
                }
                className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-hospital-blue-500"
              >
                {INSURANCE_OPTIONS.map((hmo) => (
                  <option key={hmo.value} value={hmo.value}>
                    {hmo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Medical Specialties */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Medical Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, specialty: e.target.value }))
                }
                className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-hospital-blue-500"
              >
                {SPECIALTY_OPTIONS.map((spec) => (
                  <option key={spec.value} value={spec.value}>
                    {spec.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Clinical Services Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Clinical Services
              </label>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {SERVICE_OPTIONS.map((service) => {
                  const isChecked = filters.services.includes(service);
                  return (
                    <label
                      key={service}
                      className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleService(service)}
                        className="w-3.5 h-3.5 rounded text-hospital-blue-600 focus:ring-hospital-blue-500 border-slate-300"
                      />
                      <span className="truncate">{service}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 7. Minimum Rating Filter */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block">
                Patient Rating
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'All', value: 0 },
                  { label: '3+ ★', value: 3.0 },
                  { label: '4+ ★', value: 4.0 }
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, minRating: item.value }))
                    }
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                      filters.minRating === item.value
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* --------------------------------------------------------------------- */}
          {/* B. MAIN RESULTS & MAP DISCOVERY CONTAINER                              */}
          {/* --------------------------------------------------------------------- */}
          <div className="flex-1 w-full min-w-0">
            {/* Quick State Focal Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, state: 'Delta' }))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  filters.state === 'Delta'
                    ? 'bg-hospital-blue-600 text-white shadow-hospital-blue-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🏥 Delta State Healthcare Hub (9)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, state: 'all' }))}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  filters.state === 'all'
                    ? 'bg-hospital-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>🌍 All Nigeria (Nationwide)</span>
              </button>
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, state: 'Lagos' }))}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filters.state === 'Lagos'
                    ? 'bg-hospital-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>📍 Lagos State</span>
              </button>
              <button
                type="button"
                onClick={() => setFilters((p) => ({ ...p, state: 'Federal Capital Territory' }))}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filters.state === 'Federal Capital Territory'
                    ? 'bg-hospital-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>📍 Abuja (FCT)</span>
              </button>
            </div>

            {/* Delta State Center-Point Banner Callout */}
            {filters.state === 'Delta' && (
              <div className="bg-hospital-blue-50/90 border border-hospital-blue-200 rounded-2xl p-3.5 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex items-center gap-2.5 text-hospital-blue-900">
                  <div className="w-7 h-7 rounded-xl bg-hospital-blue-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-hospital-blue-950 block">
                      Delta State Healthcare Directory (Primary Focal Hub)
                    </span>
                    <span className="text-hospital-blue-800 text-[11px]">
                      Showing 9 accredited facilities across Asaba (FMC), Warri, Oghara (DELSUTH), Abraka (DELSU Campus), Agbor, Ughelli, Sapele & Eku.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, state: 'all' }))}
                  className="inline-flex items-center gap-1 text-hospital-blue-700 font-bold hover:text-hospital-blue-900 shrink-0 self-start sm:self-auto text-xs underline underline-offset-2"
                >
                  Show All Nigerian Hospitals →
                </button>
              </div>
            )}

            {/* Results bar: Count, Sorting Engine (FR2.5), and Active Filter Pills */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Result count & Proximity reference */}
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>
                      {filteredAndSortedHospitals.length}{' '}
                      {filteredAndSortedHospitals.length === 1
                        ? 'Hospital Found'
                        : 'Hospitals Found'}
                    </span>
                    {filters.isDistanceFilterActive && (
                      <span className="text-xs font-normal text-slate-500">
                        within {filters.distanceRadiusKm} km of {activeLocation.city}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Calculated from{' '}
                    <strong className="text-slate-700 font-semibold">
                      {activeLocation.name}
                    </strong>
                  </p>
                </div>

                {/* Sorting Engine (FR2.5) */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs font-semibold text-slate-500 shrink-0">
                    Sort by:
                  </span>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value as SortOption
                      }))
                    }
                    className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-hospital-blue-500"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filter Badges */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Active:
                  </span>

                  {filters.state !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-hospital-blue-100 text-hospital-blue-900 border border-hospital-blue-200">
                      Region: {filters.state === 'Delta' ? 'Delta State (Primary)' : filters.state}
                      <button
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, state: 'all' }))}
                        className="hover:text-rose-600"
                        title="Show All Nigeria"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.query && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      Query: &ldquo;{filters.query}&rdquo;
                      <button
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, query: '' }))}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.emergencyOnly && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      <Ambulance className="w-3 h-3" /> 24/7 Emergency
                      <button
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, emergencyOnly: false }))}
                        className="hover:text-rose-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.isDistanceFilterActive && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                      ≤ {filters.distanceRadiusKm} km
                      <button
                        type="button"
                        onClick={() =>
                          setFilters((p) => ({ ...p, isDistanceFilterActive: false }))
                        }
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.facilityType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-hospital-blue-100 text-hospital-blue-800">
                      {filters.facilityType}
                      <button
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, facilityType: 'all' }))}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.insurance !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      HMO: {filters.insurance}
                      <button
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, insurance: 'all' }))}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.specialty !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Specialty: {filters.specialty}
                      <button
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, specialty: 'all' }))}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {filters.services.map((serv) => (
                    <span
                      key={serv}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                    >
                      {serv}
                      <button
                        type="button"
                        onClick={() => handleToggleService(serv)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}

                  {filters.minRating > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      ★ {filters.minRating}+
                      <button
                        type="button"
                        onClick={() => setFilters((p) => ({ ...p, minRating: 0 }))}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline ml-1"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>

            {/* ----------------------------------------------------------------- */}
            {/* VIEW MODE VARIATIONS (Split / List / Map on Desktop & Mobile Tabs)  */}
            {/* ----------------------------------------------------------------- */}

            {/* Desktop: Split View (List on Left, Sticky Map on Right) */}
            <div className="w-full">
              {/* Desktop Split View or Mobile Layout */}
              <div
                className={`${
                  viewMode === 'split'
                    ? 'grid grid-cols-1 xl:grid-cols-12 gap-6'
                    : viewMode === 'list'
                    ? 'block'
                    : 'hidden lg:block'
                }`}
              >
                {/* 1. Results List Container */}
                <div
                  className={`${
                    viewMode === 'split'
                      ? 'xl:col-span-7 space-y-4'
                      : viewMode === 'list'
                      ? 'space-y-4'
                      : 'hidden'
                  } ${mobileTab === 'map' ? 'hidden lg:block' : 'block'}`}
                >
                  {filteredAndSortedHospitals.length > 0 ? (
                    <div
                      className={
                        viewMode === 'list'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                          : 'space-y-3.5'
                      }
                    >
                      {filteredAndSortedHospitals.map((hospital) => (
                        <HospitalCard
                          key={hospital._id}
                          hospital={hospital}
                          activeLocation={activeLocation}
                          compact={viewMode === 'split'}
                          isSelected={selectedHospitalId === hospital._id}
                          onSelect={handleSelectHospital}
                        />
                      ))}
                    </div>
                  ) : (
                    /* Empty State when 0 hospitals match filters */
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs">
                      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-hospital-blue-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        No facilities found matching your criteria
                      </h3>
                      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                        We couldn&rsquo;t find accredited hospitals matching your specific combination of
                        filters. Try expanding your distance radius or clearing some filters.
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {filters.isDistanceFilterActive && (
                          <button
                            type="button"
                            onClick={() =>
                              setFilters((p) => ({
                                ...p,
                                isDistanceFilterActive: false,
                                distanceRadiusKm: 50
                              }))
                            }
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-hospital-blue-50 text-hospital-blue-700 hover:bg-hospital-blue-100 transition-colors"
                          >
                            Expand to Nationwide (No distance limit)
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-hospital-blue-600 text-white hover:bg-hospital-blue-700 transition-colors shadow-xs"
                        >
                          Reset All Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Interactive Map Container (Sticky in Split Mode, Full in Map Mode) */}
                <div
                  className={`${
                    viewMode === 'split'
                      ? 'xl:col-span-5 sticky top-40'
                      : viewMode === 'map'
                      ? 'w-full'
                      : 'hidden'
                  } ${mobileTab === 'list' ? 'hidden lg:block' : 'block'}`}
                >
                  <div className="relative">
                    <Map
                      hospitals={filteredAndSortedHospitals}
                      activeLocation={activeLocation}
                      selectedHospitalId={selectedHospitalId}
                      onSelectHospital={handleSelectHospital}
                      showEmergencyRadius={filters.emergencyOnly}
                      height={viewMode === 'map' ? '680px' : '620px'}
                    />

                    {/* Floating Selected Hospital preview card (in full map mode or mobile) */}
                    {selectedHospital && (
                      <div className="absolute bottom-4 left-4 right-4 z-[400] max-w-md mx-auto lg:hidden">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-hospital-blue-700 bg-sky-50 px-2 py-0.5 rounded-full inline-block mb-1">
                              {selectedHospital.facilityType}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm truncate">
                              {selectedHospital.name}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {selectedHospital.address}, {selectedHospital.city}
                            </p>
                          </div>
                          <Link
                            href={`/hospitals/${selectedHospital._id}`}
                            className="shrink-0 px-3 py-2 rounded-xl bg-hospital-blue-600 hover:bg-hospital-blue-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. MOBILE FILTER BOTTOM SHEET / DRAWER                                    */}
      {/* ========================================================================= */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Sheet Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-hospital-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Filter Facilities</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body Scroll Area */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* 24/7 Emergency Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2">
                  <Ambulance className="w-4 h-4 text-red-600" />
                  <span className="font-bold text-slate-900">24/7 Emergency Only</span>
                </div>
                <input
                  type="checkbox"
                  checked={filters.emergencyOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, emergencyOnly: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                />
              </label>

              {/* State / Region (Mobile) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  State / Geographic Region
                </label>
                <select
                  value={filters.state}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, state: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-hospital-blue-300 bg-hospital-blue-50/50 text-sm font-semibold text-slate-900"
                >
                  {STATE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Radius */}
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Radius from {activeLocation.city}</span>
                  <span className="text-hospital-blue-700">
                    {filters.isDistanceFilterActive
                      ? `≤ ${filters.distanceRadiusKm} km`
                      : 'Any distance'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Apply radius filter</span>
                  <input
                    type="checkbox"
                    checked={filters.isDistanceFilterActive}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, isDistanceFilterActive: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-hospital-blue-600 focus:ring-hospital-blue-500"
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={filters.distanceRadiusKm}
                  disabled={!filters.isDistanceFilterActive}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      distanceRadiusKm: parseInt(e.target.value, 10),
                      isDistanceFilterActive: true
                    }))
                  }
                  className="w-full accent-hospital-blue-600"
                />
              </div>

              {/* Facility Classification */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Facility Type</label>
                <select
                  value={filters.facilityType}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, facilityType: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {FACILITY_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* HMO Insurance */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Health Insurance / HMO
                </label>
                <select
                  value={filters.insurance}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, insurance: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {INSURANCE_OPTIONS.map((hmo) => (
                    <option key={hmo.value} value={hmo.value}>
                      {hmo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Specialty */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Medical Specialty</label>
                <select
                  value={filters.specialty}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, specialty: e.target.value }))
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                >
                  {SPECIALTY_OPTIONS.map((spec) => (
                    <option key={spec.value} value={spec.value}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Services Checklist */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Clinical Services
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_OPTIONS.map((serv) => {
                    const isChecked = filters.services.includes(serv);
                    return (
                      <button
                        key={serv}
                        type="button"
                        onClick={() => handleToggleService(serv)}
                        className={`p-2 rounded-lg border text-left text-[11px] font-medium transition-colors ${
                          isChecked
                            ? 'bg-hospital-blue-50 text-hospital-blue-700 border-hospital-blue-300'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        {serv}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minimum Rating */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Patient Rating</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'All', value: 0 },
                    { label: '3+ Stars', value: 3.0 },
                    { label: '4+ Stars', value: 4.0 }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setFilters((p) => ({ ...p, minRating: item.value }))}
                      className={`py-2 rounded-lg border font-semibold text-center ${
                        filters.minRating === item.value
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sheet Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-hospital-blue-600 hover:bg-hospital-blue-700 text-white text-xs font-semibold text-center shadow-xs"
              >
                Show {filteredAndSortedHospitals.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HospitalsLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-12 h-12 rounded-2xl bg-hospital-blue-100 text-hospital-blue-600 flex items-center justify-center mb-4 animate-pulse">
        <Compass className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-bold text-slate-800">
        Loading Nigerian Healthcare Directory...
      </p>
      <p className="text-xs text-slate-500 mt-1">
        Initializing Leaflet geospatial engine &amp; verified hospital records
      </p>
    </div>
  );
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={<HospitalsLoadingFallback />}>
      <HospitalsContent />
    </Suspense>
  );
}
