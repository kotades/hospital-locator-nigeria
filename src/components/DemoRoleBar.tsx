'use client';

import React, { useState, useTransition } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  UserCheck,
  User,
  Building2,
  ShieldAlert,
  RotateCcw,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  SlidersHorizontal,
  Compass,
  Loader2
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { NIGERIAN_LOCATIONS } from '@/data/nigerianLocations';
import { NigerianCityLocation, UserRole } from '@/types';

interface PersonaOption {
  id: string;
  name: string;
  roleLabel: string;
  role: UserRole | 'guest';
  email?: string;
  password?: string;
  avatarBg: string;
  badgeBg: string;
  description: string;
}

const PERSONAS: PersonaOption[] = [
  {
    id: 'guest',
    name: 'Guest',
    roleLabel: 'Anonymous Visitor',
    role: 'guest',
    avatarBg: 'bg-slate-700 text-slate-300',
    badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
    description: 'Browse facilities & calculate distance as a public visitor'
  },
  {
    id: 'patient',
    name: 'Patient (Amina)',
    roleLabel: 'Amina Bello',
    role: 'patient',
    email: 'patient@demo.com',
    password: 'password123',
    avatarBg: 'bg-emerald-600 text-white',
    badgeBg: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    description: 'Save favorite facilities & submit patient reviews'
  },
  {
    id: 'rep',
    name: 'Facility Rep (Dr. Okafor)',
    roleLabel: 'Dr. Okafor (LUTH Rep)',
    role: 'representative',
    email: 'rep@demo.com',
    password: 'password123',
    avatarBg: 'bg-blue-600 text-white',
    badgeBg: 'bg-blue-900/60 text-blue-300 border-blue-700',
    description: 'Update real-time ER capacity status & official replies'
  },
  {
    id: 'admin',
    name: 'Admin (Admin Dunsimi)',
    roleLabel: 'Federal Admin Dunsimi',
    role: 'admin',
    email: 'admin@demo.com',
    password: 'password123',
    avatarBg: 'bg-purple-600 text-white',
    badgeBg: 'bg-purple-900/60 text-purple-300 border-purple-700',
    description: 'Approve representative claims & facility directory'
  }
];

export function DemoRoleBar() {
  const { data: session, status } = useSession();
  const { activeLocation, setSimulatedLocation, resetDemoData } = useAppContext();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Determine current active persona
  const currentRole: UserRole | 'guest' =
    status === 'authenticated' && session?.user?.role
      ? (session.user.role as UserRole)
      : 'guest';

  // Handler for 1-click persona switching
  const handleSwitchPersona = async (persona: PersonaOption) => {
    if (persona.role === currentRole && !switchingTo) {
      return; // Already on this persona
    }

    setSwitchingTo(persona.id);

    try {
      if (persona.role === 'guest') {
        await signOut({ redirect: false });
      } else if (persona.email && persona.password) {
        await signIn('credentials', {
          email: persona.email,
          password: persona.password,
          redirect: false
        });
      }
    } catch (err) {
      console.error('Error switching demo persona:', err);
    } finally {
      setSwitchingTo(null);
    }
  };

  // Handler for location change
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = NIGERIAN_LOCATIONS.find((l) => l.id === e.target.value);
    if (loc) {
      startTransition(() => {
        setSimulatedLocation(loc);
      });
    }
  };

  // Handler for quick demo data reset
  const handleReset = () => {
    resetDemoData();
    setResetFeedback(true);
    setTimeout(() => {
      setResetFeedback(false);
    }, 2000);
  };

  // When collapsed, show a floating minimizer chip in bottom corner
  if (isCollapsed) {
    return (
      <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-40 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all group focus:outline-none focus:ring-2 focus:ring-hospital-blue-500"
          aria-label="Expand Demo Role & Simulation Bar"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span className="flex items-center gap-1.5">
            <span>Demo Mode</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="capitalize text-slate-300 font-normal">
              ({currentRole})
            </span>
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Demo Simulator & Role Switcher"
      className="fixed bottom-2 inset-x-2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 w-auto max-w-6xl animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-slate-900/95 backdrop-blur-lg border border-slate-700/90 rounded-2xl shadow-2xl px-3 py-2 sm:px-4 sm:py-2.5 text-white">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-4">
          
          {/* Left: Indicator & 1-Click Role Switcher */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 w-full lg:w-auto">
            
            <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:flex">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Demo Persona:</span>
            </div>

            {/* Persona Switcher Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 max-w-full">
              {PERSONAS.map((persona) => {
                const isActive = currentRole === persona.role;
                const isLoading = switchingTo === persona.id;

                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSwitchPersona(persona)}
                    disabled={isLoading || !!switchingTo}
                    className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium transition-all transform active:scale-95 disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-hospital-blue-400 ${
                      isActive
                        ? 'bg-gradient-to-r from-hospital-blue-600 to-hospital-blue-700 text-white shadow-md shadow-hospital-blue-900/60 ring-1 ring-hospital-blue-400'
                        : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                    title={`${persona.name} — ${persona.description}`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-hospital-blue-300" />
                    ) : isActive ? (
                      <Check className="w-3 h-3 text-emerald-300" strokeWidth={3} />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${persona.avatarBg}`}></span>
                    )}

                    <span className="whitespace-nowrap">{persona.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Simulated Nigerian Location & Data Controls */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3 w-full lg:w-auto pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-800">
            
            {/* City Preset Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-hospital-blue-400 flex-shrink-0" />
              <label htmlFor="simulated-city-select" className="sr-only">
                Simulated Nigerian Location
              </label>
              <select
                id="simulated-city-select"
                value={activeLocation.id}
                onChange={handleLocationChange}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                title="Select simulated user coordinates in Nigeria"
              >
                {NIGERIAN_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Coordinates Display */}
            <div className="hidden xl:flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/50 rounded-xl px-2.5 py-1">
              <Compass className="w-3 h-3 text-slate-500" />
              <span>
                {activeLocation.lat.toFixed(4)}°N, {activeLocation.lng.toFixed(4)}°E
              </span>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleReset}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border ${
                resetFeedback
                  ? 'bg-emerald-900/60 text-emerald-300 border-emerald-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
              }`}
              title="Reset hospital ratings, reviews, and representative claims to initial seed data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetFeedback ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span className="whitespace-nowrap">
                {resetFeedback ? 'Data Reset!' : 'Reset Data'}
              </span>
            </button>

            {/* Minimize / Collapse Bar Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Minimize Demo Bar"
              aria-label="Minimize Demo Bar"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>
    </aside>
  );
}

export default DemoRoleBar;
