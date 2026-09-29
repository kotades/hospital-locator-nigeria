'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Hospital, NigerianCityLocation } from '@/types';
import { INITIAL_HOSPITALS } from '@/data/initialHospitals';
import { DEFAULT_LOCATION } from '@/data/nigerianLocations';
import { useAppContext } from '@/context/AppContext';
import { MapLoadingSkeleton } from './MapLoadingSkeleton';
import type { MapInnerProps } from './MapInner';
export { getHospitalMarkerCategory, MARKER_COLORS, type HospitalMarkerCategory } from './mapUtils';

export interface MapProps {
  hospitals?: Hospital[];
  activeLocation?: NigerianCityLocation;
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospital: Hospital) => void;
  showEmergencyRadius?: boolean;
  className?: string;
  height?: string | number;
  zoom?: number;
  interactive?: boolean;
  center?: [number, number];
}

// Dynamically import the browser-only Leaflet map component with ssr: false
const DynamicMapInner = dynamic<MapInnerProps>(
  () => import('./MapInner').then((mod) => mod.MapInner),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />
  }
);

export function Map({
  hospitals,
  activeLocation,
  selectedHospitalId,
  onSelectHospital,
  showEmergencyRadius = false,
  className = '',
  height = '500px',
  zoom = 12,
  interactive = true,
  center
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  // Safeguard against missing AppContext (e.g. standalone test harness or isolated stories)
  let contextHospitals: Hospital[] | undefined;
  let contextLocation: NigerianCityLocation | undefined;

  try {
    const context = useAppContext();
    contextHospitals = context.hospitals;
    contextLocation = context.activeLocation;
  } catch {
    // If rendered outside AppProvider
  }

  const effectiveHospitals = hospitals || contextHospitals || INITIAL_HOSPITALS;
  const effectiveLocation = activeLocation || contextLocation || DEFAULT_LOCATION;

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR and pre-hydration placeholder
  if (!mounted) {
    return <MapLoadingSkeleton height={height} className={className} />;
  }

  return (
    <DynamicMapInner
      hospitals={effectiveHospitals}
      activeLocation={effectiveLocation}
      selectedHospitalId={selectedHospitalId}
      onSelectHospital={onSelectHospital}
      showEmergencyRadius={showEmergencyRadius}
      className={className}
      height={height}
      zoom={zoom}
      interactive={interactive}
      center={center}
    />
  );
}

export default Map;
