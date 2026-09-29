'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Ambulance,
  Compass,
  Clock,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { Hospital, NigerianCityLocation } from '@/types';
import { calculateDistance, estimateTravelTime, formatDistance, formatTravelTime } from '@/utils/geo';
import { DEFAULT_LOCATION } from '@/data/nigerianLocations';
import { getHospitalMarkerCategory, MARKER_COLORS, type HospitalMarkerCategory } from './mapUtils';

export interface MapInnerProps {
  hospitals: Hospital[];
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

/**
 * Creates custom SVG Leaflet marker icons with clean drop shadows,
 * medical emblems, and interactive selection indicators.
 */
function createHospitalMarkerIcon(
  category: 'emergency' | 'specialist' | 'general',
  isSelected: boolean
): L.DivIcon {
  const isEmergency = category === 'emergency';
  const isSpecialist = category === 'specialist';

  // Category palette
  const bgColor = isEmergency ? '#dc2626' : isSpecialist ? '#059669' : '#0284c7';
  const strokeColor = isEmergency ? '#991b1b' : isSpecialist ? '#065f46' : '#075985';
  const glowColor = isEmergency ? 'rgba(220,38,38,0.45)' : isSpecialist ? 'rgba(5,150,105,0.45)' : 'rgba(2,132,199,0.45)';

  const size = isSelected ? 42 : 34;
  const height = isSelected ? 50 : 42;
  const anchorX = size / 2;
  const anchorY = height;

  let iconSvg = '';
  if (isEmergency) {
    // Red 24/7 Emergency Cross
    iconSvg = `
      <rect x="15.5" y="11" width="5" height="12" rx="1.5" fill="#dc2626" />
      <rect x="12" y="14.5" width="12" height="5" rx="1.5" fill="#dc2626" />
    `;
  } else if (isSpecialist) {
    // Emerald Specialist Star
    iconSvg = `
      <path d="M18 10.5L19.6 14.8L24.2 16.2L19.6 17.6L18 21.9L16.4 17.6L11.8 16.2L16.4 14.8L18 10.5Z" fill="#059669" />
    `;
  } else {
    // Blue Hospital 'H'
    iconSvg = `
      <path d="M13.5 12H16V15.5H20V12H22.5V22H20V18H16V22H13.5V12Z" fill="#0284c7" />
    `;
  }

  const selectionHalo = isSelected
    ? `
      <circle cx="18" cy="17" r="17" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="4 2" />
      <circle cx="18" cy="17" r="20" fill="none" stroke="#fbbf24" stroke-width="1.5" opacity="0.8" />
    `
    : '';

  const html = `
    <div class="custom-marker-container ${isSelected ? 'marker-selected' : ''}" style="width:${size}px; height:${height}px; position:relative;">
      ${
        isSelected
          ? `<div style="position:absolute; inset:-8px; border-radius:9999px; background:${glowColor}; filter:blur(6px); z-index:-1;"></div>`
          : ''
      }
      <svg width="${size}" height="${height}" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
        ${selectionHalo}
        <!-- Pin Base Body -->
        <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 44 18 44C18 44 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="${bgColor}" stroke="${strokeColor}" stroke-width="0.75" />
        <path d="M18 1.5C9.44 1.5 2.5 8.44 2.5 17C2.5 28.5 18 41 18 41C18 41 33.5 28.5 33.5 17C33.5 8.44 26.56 1.5 18 1.5Z" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" />
        <!-- White Circular Emblem Base -->
        <circle cx="18" cy="17" r="9.5" fill="#ffffff" />
        <!-- Medical Glyphs -->
        ${iconSvg}
      </svg>
    </div>
  `;

  return L.divIcon({
    className: 'custom-hospital-marker',
    html,
    iconSize: [size, height],
    iconAnchor: [anchorX, anchorY],
    popupAnchor: [0, -anchorY + 4]
  });
}

/**
 * Creates user location marker with distinct blue radar pulse.
 */
function createUserLocationIcon(): L.DivIcon {
  const html = `
    <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; width:34px; height:34px; border-radius:9999px; background-color:#0284c7; opacity:0.35; animation:ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position:relative; width:22px; height:22px; border-radius:9999px; background-color:#0284c7; border:3px solid #ffffff; box-shadow:0 4px 8px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
        <div style="width:6px; height:6px; border-radius:9999px; background-color:#ffffff;"></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-user-marker',
    html,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18]
  });
}

/**
 * Helper component that interacts with the Leaflet map instance
 * to smoothly pan and fly to selected facilities or active locations.
 */
function MapController({
  center,
  zoom,
  selectedHospital
}: {
  center: [number, number];
  zoom: number;
  selectedHospital?: Hospital | null;
}) {
  const map = useMap();
  const prevCenterRef = useRef<[number, number]>(center);

  // Smoothly fly to selected hospital when selected
  useEffect(() => {
    if (selectedHospital) {
      map.flyTo(
        [selectedHospital.location.lat, selectedHospital.location.lng],
        Math.max(map.getZoom(), 14),
        { duration: 1.1 }
      );
    }
  }, [selectedHospital, map]);

  // Recenter when center coordinates change explicitly
  useEffect(() => {
    const [prevLat, prevLng] = prevCenterRef.current;
    if (prevLat !== center[0] || prevLng !== center[1]) {
      prevCenterRef.current = center;
      if (!selectedHospital) {
        map.setView(center, zoom);
      }
    }
  }, [center, zoom, selectedHospital, map]);

  return null;
}

/**
 * Top-right floating map control to recenter on active user location
 */
function RecenterControl({ targetLocation }: { targetLocation: NigerianCityLocation }) {
  const map = useMap();

  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ pointerEvents: 'auto', marginTop: '12px', marginRight: '12px', zIndex: 400 }}
    >
      <button
        type="button"
        onClick={() => {
          map.flyTo([targetLocation.lat, targetLocation.lng], 13, { duration: 1 });
        }}
        title={`Recenter on ${targetLocation.name}`}
        className="bg-white/95 hover:bg-white text-slate-700 hover:text-hospital-blue-600 px-3 py-2 rounded-xl shadow-md border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm active:scale-95"
      >
        <Compass className="w-3.5 h-3.5 text-hospital-blue-600" />
        <span className="hidden sm:inline">Recenter ({targetLocation.city})</span>
        <span className="sm:hidden">Recenter</span>
      </button>
    </div>
  );
}

export function MapInner({
  hospitals,
  activeLocation = DEFAULT_LOCATION,
  selectedHospitalId,
  onSelectHospital,
  showEmergencyRadius = false,
  className = '',
  height = '500px',
  zoom = 12,
  interactive = true,
  center
}: MapInnerProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  const mapCenter: [number, number] = useMemo(() => {
    if (center) return center;
    return [activeLocation.lat, activeLocation.lng];
  }, [center, activeLocation.lat, activeLocation.lng]);

  const selectedHospital = useMemo(() => {
    if (!selectedHospitalId) return null;
    return hospitals.find((h) => h._id === selectedHospitalId) || null;
  }, [selectedHospitalId, hospitals]);

  // Automatically open popup of selected hospital
  useEffect(() => {
    if (selectedHospitalId && markerRefs.current[selectedHospitalId]) {
      markerRefs.current[selectedHospitalId]?.openPopup();
    }
  }, [selectedHospitalId]);

  const userMarkerIcon = useMemo(() => createUserLocationIcon(), []);

  return (
    <div
      style={{ height: heightStyle }}
      className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${className}`}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Camera controller for active city switch & hospital selection */}
        <MapController
          center={mapCenter}
          zoom={zoom}
          selectedHospital={selectedHospital}
        />

        {/* Floating recenter button */}
        <RecenterControl targetLocation={activeLocation} />

        {/* 10km Emergency Perimeter Visualization */}
        {showEmergencyRadius && (
          <Circle
            center={[activeLocation.lat, activeLocation.lng]}
            radius={10000}
            pathOptions={{
              color: '#dc2626',
              fillColor: '#ef4444',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '6, 6'
            }}
          >
            <Popup>
              <div className="p-2 text-xs max-w-[220px]">
                <div className="flex items-center gap-1.5 font-bold text-red-600 mb-1">
                  <Ambulance className="w-4 h-4 text-red-600" />
                  <span>10km Emergency Perimeter</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Rapid-response trauma zone centered around <strong>{activeLocation.name}</strong>.
                  Hospitals within this radius are prioritized for acute emergency admissions.
                </p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Active User Reference Marker */}
        <Marker
          position={[activeLocation.lat, activeLocation.lng]}
          icon={userMarkerIcon}
          zIndexOffset={500}
        >
          <Popup className="hospital-map-popup" autoPan={false}>
            <div className="p-3 text-xs min-w-[220px]">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-hospital-blue-50 text-hospital-blue-700 border border-hospital-blue-200 mb-1.5">
                <Compass className="w-3 h-3 text-hospital-blue-600" /> Active Simulated Location
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{activeLocation.name}</h4>
              <p className="text-slate-500 text-xs mt-0.5">
                {activeLocation.description || `${activeLocation.city}, ${activeLocation.state}`}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>LAT: {activeLocation.lat.toFixed(4)}°</span>
                <span>LNG: {activeLocation.lng.toFixed(4)}°</span>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Hospital Markers */}
        {hospitals.map((hospital) => {
          const isSelected = selectedHospitalId === hospital._id;
          const category = getHospitalMarkerCategory(hospital);
          const icon = createHospitalMarkerIcon(category, isSelected);

          const distanceKm = calculateDistance(
            activeLocation.lat,
            activeLocation.lng,
            hospital.location.lat,
            hospital.location.lng
          );
          const etaMinutes = estimateTravelTime(distanceKm);

          const primaryPhone = hospital.emergencyPhone || hospital.phoneNumbers[0] || '';
          const fallbackImage =
            'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80';
          const thumbnail = hospital.images?.[0] || fallbackImage;

          return (
            <Marker
              key={hospital._id}
              position={[hospital.location.lat, hospital.location.lng]}
              icon={icon}
              zIndexOffset={isSelected ? 1000 : 10}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current[hospital._id] = ref;
                }
              }}
              eventHandlers={{
                click: () => {
                  onSelectHospital?.(hospital);
                }
              }}
            >
              <Popup className="hospital-map-popup" autoPan={true} offset={[0, -18]}>
                <div className="w-[270px] sm:w-[290px] overflow-hidden text-slate-900">
                  {/* Thumbnail Banner with Status Badges */}
                  <div className="relative h-28 w-full bg-slate-100">
                    <img
                      src={thumbnail}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                    {/* Status badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 z-10">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm backdrop-blur-md flex items-center gap-1 ${
                          hospital.emergencyStatus === 'accepting'
                            ? 'bg-emerald-600/90 text-white'
                            : hospital.emergencyStatus === 'limited'
                            ? 'bg-amber-600/90 text-white'
                            : 'bg-red-600/90 text-white'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            hospital.emergencyStatus === 'accepting'
                              ? 'bg-white animate-pulse'
                              : 'bg-white'
                          }`}
                        />
                        {hospital.emergencyStatus === 'accepting'
                          ? 'Accepting'
                          : hospital.emergencyStatus === 'limited'
                          ? 'Limited'
                          : 'Critical'}
                      </span>

                      {hospital.emergency24Hours && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-full shadow-sm flex items-center gap-1">
                          <Ambulance className="w-2.5 h-2.5" /> 24/7
                        </span>
                      )}
                    </div>

                    {hospital.verified && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-hospital-blue-700 p-1 rounded-full shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5 text-hospital-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-3">
                    <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {hospital.name}
                    </h4>

                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1 mb-2">
                      <span className="font-medium text-slate-700">{hospital.facilityType}</span>
                      <span>•</span>
                      <span>{hospital.city}</span>
                    </div>

                    {/* Distance & ETA Chip */}
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-3 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                      <span className="font-semibold text-hospital-blue-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-hospital-blue-600" />
                        {formatDistance(distanceKm)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        ~{formatTravelTime(etaMinutes)} drive
                      </span>
                    </div>

                    {/* Action Links */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      {primaryPhone && (
                        <a
                          href={`tel:${primaryPhone}`}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                      <Link
                        href={`/hospitals/${hospital._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-hospital-blue-600 text-white hover:bg-hospital-blue-700 transition-colors shadow-sm active:scale-95"
                      >
                        View Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div
        className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 text-xs overflow-hidden transition-all duration-200 max-w-[240px]"
        style={{ pointerEvents: 'auto' }}
      >
        <button
          type="button"
          onClick={() => setLegendCollapsed(!legendCollapsed)}
          className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border-b border-slate-100 text-left transition-colors"
        >
          <span className="flex items-center gap-1.5 text-xs">
            <Info className="w-3.5 h-3.5 text-hospital-blue-600" /> Map Legend
          </span>
          {legendCollapsed ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {!legendCollapsed && (
          <div className="p-2.5 space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 shrink-0 shadow-xs" />
              <span className="leading-tight">24/7 Emergency Hospitals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0 shadow-xs" />
              <span className="leading-tight">Specialist Clinics</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-hospital-blue-600 shrink-0 shadow-xs" />
              <span className="leading-tight">General / Teaching Hospitals</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <span className="w-3 h-3 rounded-full bg-blue-600 border border-white ring-2 ring-blue-300 shrink-0" />
              <span className="leading-tight font-medium text-slate-800">Your Location</span>
            </div>
            {showEmergencyRadius && (
              <div className="flex items-center gap-2 text-red-600 font-medium">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500 shrink-0" />
                <span className="leading-tight">10km Emergency Zone</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapInner;
