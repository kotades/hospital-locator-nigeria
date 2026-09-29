'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  Shield,
  Navigation,
  Zap,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Hospital, EmergencyStatus, TraumaLevel } from '@/types';
import { calculateDistance, formatDistance, formatTravelTime, estimateTravelTime } from '@/utils/geo';
import { NIGERIAN_LOCATIONS } from '@/data/nigerianLocations';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const EMERGENCY_RADIUS_KM = 10;

const TRAUMA_BADGE: Record<TraumaLevel, { label: string; color: string }> = {
  'Level I':   { label: 'Level I Trauma', color: 'bg-red-700 text-white' },
  'Level II':  { label: 'Level II Trauma', color: 'bg-orange-600 text-white' },
  'Level III': { label: 'Level III Trauma', color: 'bg-yellow-600 text-white' },
  'None':      { label: 'No Trauma Centre', color: 'bg-gray-500 text-white' },
};

const STATUS_CONFIG: Record<EmergencyStatus, { label: string; color: string; pulse: boolean }> = {
  accepting: { label: 'Accepting Patients',  color: 'bg-green-500',  pulse: false },
  limited:   { label: 'Limited Capacity',    color: 'bg-yellow-500', pulse: true  },
  critical:  { label: 'Critical – Full',     color: 'bg-red-600',    pulse: true  },
};

const NATIONAL_LINES = [
  { label: 'National Emergency',     number: '112', icon: '🆘' },
  { label: 'Federal Fire Service',   number: '767', icon: '🚒' },
  { label: 'NEMA Disaster Relief',   number: '122', icon: '⛑️' },
  { label: 'Nigeria Police',         number: '199', icon: '🚔' },
];

function TraumaBadge({ level }: { level: TraumaLevel }) {
  const cfg = TRAUMA_BADGE[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.color}`}>
      <Shield className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function StatusPill({ status }: { status: EmergencyStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
      <span className={`w-2.5 h-2.5 rounded-full ${cfg.color} ${cfg.pulse ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
}

interface ERCardProps {
  hospital: Hospital;
  distance: number;
  eta: number;
  rank: number;
}

function ERCard({ hospital, distance, eta, rank }: ERCardProps) {
  const isFirst = rank === 1;
  return (
    <div
      className={`rounded-2xl border-2 p-4 transition-all ${
        isFirst
          ? 'border-red-500 bg-red-950/40 shadow-red-900/30 shadow-lg'
          : 'border-gray-700 bg-gray-800/60'
      }`}
    >
      {isFirst && (
        <div className="flex items-center gap-2 mb-3 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          Closest Emergency Hospital
        </div>
      )}

      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isFirst ? 'bg-red-500 text-white' : 'bg-gray-600 text-gray-200'
            }`}>
              {rank}
            </span>
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{hospital.name}</h3>
          </div>

          <div className="flex items-center gap-1 text-gray-400 text-xs mt-1 ml-8">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{hospital.address}, {hospital.city}</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-3 ml-8">
            <StatusPill status={hospital.emergencyStatus} />
            <TraumaBadge level={hospital.traumaLevel} />
          </div>

          <div className="flex items-center gap-4 mt-3 ml-8 text-sm">
            <div className="flex items-center gap-1 text-gray-300">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">{formatDistance(distance)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">~{formatTravelTime(eta)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4">
        <a
          href={`tel:${hospital.emergencyPhone}`}
          className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call ER
        </a>
        <a
          href={`https://maps.google.com/?q=${hospital.location.lat},${hospital.location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Navigate
        </a>
        <a
          href={`/hospitals/${hospital._id}`}
          className="flex items-center justify-center px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function EmergencyPage() {
  const { hospitals, activeLocation, setSimulatedLocation } = useAppContext();
  const [mapVisible, setMapVisible] = useState(false);

  const userLat = activeLocation?.lat ?? 6.5244;
  const userLng = activeLocation?.lng ?? 3.3792;

  const emergencyHospitals = useMemo(() => {
    return hospitals
      .filter((h) => h.emergency24Hours)
      .map((h) => {
        const distance = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
        const eta = estimateTravelTime(distance);
        return { hospital: h, distance, eta };
      })
      .filter(({ distance }) => distance <= EMERGENCY_RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
  }, [hospitals, userLat, userLng]);

  const allEmergencyHospitals = useMemo(() => {
    return hospitals
      .filter((h) => h.emergency24Hours)
      .map((h) => {
        const distance = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
        const eta = estimateTravelTime(distance);
        return { hospital: h, distance, eta };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);
  }, [hospitals, userLat, userLng]);

  const displayList = emergencyHospitals.length > 0 ? emergencyHospitals : allEmergencyHospitals;
  const usingFallback = emergencyHospitals.length === 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Critical Banner */}
      <div className="bg-red-700 py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-sm animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          EMERGENCY MODE — Showing nearest 24/7 ER hospitals
          <AlertTriangle className="w-4 h-4" />
        </div>
      </div>

      {/* National Hotlines */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">National Emergency Lines</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {NATIONAL_LINES.map((line) => (
            <a
              key={line.number}
              href={`tel:${line.number}`}
              className="flex items-center gap-2 bg-gray-800 hover:bg-red-900/50 border border-gray-700 hover:border-red-600 rounded-xl px-3 py-2 text-sm font-semibold transition-all"
            >
              <span className="text-lg">{line.icon}</span>
              <div>
                <div className="text-white font-bold">{line.number}</div>
                <div className="text-gray-400 text-xs">{line.label}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Location info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>
              Searching within{' '}
              <span className="text-white font-semibold">10 km</span> of your location
            </span>
            <span className="text-xs bg-blue-900/50 text-blue-300 px-2 py-0.5 rounded-full">
              {activeLocation.city}, {activeLocation.state}
            </span>
          </div>
          <button
            onClick={() => setMapVisible((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            {mapVisible ? 'Hide Map' : 'Show Map'}
            <RefreshCw className={`w-3.5 h-3.5 ${mapVisible ? 'rotate-180' : ''} transition-transform`} />
          </button>
        </div>

        {/* City Switcher */}
        <div className="flex flex-wrap gap-2 mb-5">
          {NIGERIAN_LOCATIONS.slice(0, 5).map((city) => (
            <button
              key={city.id}
              onClick={() => setSimulatedLocation(city)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeLocation.id === city.id
                  ? 'bg-blue-900/60 border-blue-500 text-white'
                  : 'bg-gray-800 hover:bg-blue-900/60 border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white'
              }`}
            >
              📍 {city.city}
            </button>
          ))}
        </div>

        {/* Map toggle */}
        {mapVisible && (
          <div className="rounded-2xl overflow-hidden mb-6 h-64 border border-gray-700">
            <Map
              hospitals={displayList.map((d) => d.hospital)}
              center={[userLat, userLng]}
              showEmergencyRadius
            />
          </div>
        )}

        {/* Results */}
        {usingFallback && (
          <div className="flex items-center gap-2 text-yellow-400 text-sm mb-4 bg-yellow-900/20 border border-yellow-800 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            No 24/7 emergency hospitals within 10 km. Showing nearest 5 ER hospitals system-wide.
          </div>
        )}

        <h2 className="text-lg font-bold text-white mb-4">
          {usingFallback
            ? 'Nearest Emergency Hospitals'
            : `${emergencyHospitals.length} Emergency Hospital${emergencyHospitals.length !== 1 ? 's' : ''} Nearby`}
        </h2>

        <div className="space-y-4">
          {displayList.map(({ hospital, distance, eta }, idx) => (
            <ERCard
              key={hospital._id}
              hospital={hospital}
              distance={distance}
              eta={eta}
              rank={idx + 1}
            />
          ))}
        </div>

        {displayList.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-700" />
            <p className="text-lg font-medium">No emergency hospitals found</p>
            <p className="text-sm mt-1">Please call 112 immediately</p>
          </div>
        )}
      </div>
    </div>
  );
}
