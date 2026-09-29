'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Ambulance,
  Star,
  Heart,
  Clock,
  Car,
  FileText,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { Hospital, NigerianCityLocation, EmergencyStatus } from '@/types';
import { calculateDistance, estimateTravelTime, formatDistance, formatTravelTime } from '@/utils/geo';
import { DEFAULT_LOCATION } from '@/data/nigerianLocations';
import { useAppContext } from '@/context/AppContext';

export interface HospitalCardProps {
  hospital: Hospital;
  activeLocation?: NigerianCityLocation;
  compact?: boolean;
  isSelected?: boolean;
  onSelect?: (hospital: Hospital) => void;
  className?: string;
  showActions?: boolean;
}

export function HospitalCard({
  hospital,
  activeLocation,
  compact = false,
  isSelected = false,
  onSelect,
  className = '',
  showActions = true
}: HospitalCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showNoteTooltip, setShowNoteTooltip] = useState(false);

  // Safeguard against missing AppContext (e.g. standalone test harness or isolated stories)
  let contextLocation: NigerianCityLocation | undefined;
  let isFav = false;
  let userNote: string | undefined;
  let handleToggleFavorite: ((id: string) => void) | undefined;

  try {
    const context = useAppContext();
    contextLocation = context.activeLocation;
    isFav = context.isFavorite(hospital._id);
    const favItem = context.favorites.find((f) => f.hospitalId === hospital._id);
    userNote = favItem?.note;
    handleToggleFavorite = context.toggleFavorite;
  } catch {
    contextLocation = DEFAULT_LOCATION;
  }

  const effectiveLocation = activeLocation || contextLocation || DEFAULT_LOCATION;

  // Calculate Haversine distance and driving transit time
  const distanceKm = calculateDistance(
    effectiveLocation.lat,
    effectiveLocation.lng,
    hospital.location.lat,
    hospital.location.lng
  );
  const drivingMinutes = estimateTravelTime(distanceKm);
  const formattedDistance = formatDistance(distanceKm);
  const formattedTravelTime = formatTravelTime(drivingMinutes);

  const fallbackImage =
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80';
  const displayImage =
    !imageError && hospital.images && hospital.images.length > 0
      ? hospital.images[0]
      : fallbackImage;

  const primaryPhone = hospital.emergencyPhone || hospital.phoneNumbers[0] || '';

  // Emergency status styling configuration
  const getEmergencyPill = (status: EmergencyStatus) => {
    switch (status) {
      case 'accepting':
        return {
          label: 'Accepting Patients',
          badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotClass: 'bg-emerald-500 animate-pulse'
        };
      case 'limited':
        return {
          label: 'Limited Capacity',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          dotClass: 'bg-amber-500'
        };
      case 'critical':
      default:
        return {
          label: 'Critical Divert',
          badgeClass: 'bg-red-50 text-red-800 border-red-200',
          dotClass: 'bg-red-500 animate-ping'
        };
    }
  };

  const emergencyPill = getEmergencyPill(hospital.emergencyStatus);

  const onCardClick = () => {
    onSelect?.(hospital);
  };

  // Compact horizontal layout (ideal for map sidebars or split search views)
  if (compact) {
    return (
      <div
        onClick={onCardClick}
        className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-md ${
          isSelected
            ? 'border-hospital-blue-600 ring-2 ring-hospital-blue-100 shadow-md'
            : 'border-slate-200 hover:border-slate-300'
        } ${onSelect ? 'cursor-pointer' : ''} ${className}`}
      >
        {/* Thumbnail on Left */}
        <div className="relative sm:w-44 h-36 sm:h-auto shrink-0 bg-slate-100 overflow-hidden">
          <img
            src={displayImage}
            alt={hospital.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent sm:hidden" />

          {/* Status Badges Overlay */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full border shadow-xs backdrop-blur-md ${emergencyPill.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${emergencyPill.dotClass}`} />
              {emergencyPill.label}
            </span>
          </div>

          {/* Favorite Button */}
          {handleToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(hospital._id);
              }}
              title={isFav ? 'Remove from saved facilities' : 'Save to my facilities'}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white text-slate-500 transition-colors z-10"
              aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
                }`}
              />
            </button>
          )}
        </div>

        {/* Info on Right */}
        <div className="flex-1 p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <div>
                <span className="text-[11px] font-semibold text-hospital-blue-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 inline-block mb-1">
                  {hospital.facilityType}
                </span>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-hospital-blue-600 transition-colors line-clamp-1">
                  {hospital.name}
                </h4>
              </div>
            </div>

            {/* Distance & ETA */}
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 mb-2">
              <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                <MapPin className="w-3.5 h-3.5 text-hospital-blue-600" />
                {formattedDistance}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                ~{formattedTravelTime}
              </span>
            </div>

            {/* Address */}
            <p className="text-xs text-slate-500 line-clamp-1 mb-2">
              {hospital.address}, {hospital.city}
            </p>
          </div>

          {/* Action Row */}
          {showActions && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
              {primaryPhone && (
                <a
                  href={`tel:${primaryPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center justify-center gap-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
              )}
              <Link
                href={`/hospitals/${hospital._id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-hospital-blue-600 text-white hover:bg-hospital-blue-700 transition-colors shadow-xs"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard vertical grid card layout
  return (
    <div
      onClick={onCardClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col hover:shadow-lg ${
        isSelected
          ? 'border-hospital-blue-600 ring-2 ring-hospital-blue-100 shadow-md'
          : 'border-slate-200 hover:border-hospital-blue-200'
      } ${onSelect ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Facility Image with Badges */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={hospital.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/20" />

        {/* Top Badges: Verified & Emergency 24/7 */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {hospital.verified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-white/95 backdrop-blur-md text-hospital-blue-700 border border-hospital-blue-200 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-hospital-blue-600" />
              <span>Verified Facility</span>
            </span>
          )}

          {hospital.emergency24Hours && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-full bg-red-600 text-white shadow-sm">
              <Ambulance className="w-3 h-3" />
              <span>24/7 Emergency</span>
            </span>
          )}

          {hospital.traumaLevel && hospital.traumaLevel !== 'None' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full bg-slate-900/80 text-white backdrop-blur-sm shadow-sm">
              {hospital.traumaLevel}
            </span>
          )}
        </div>

        {/* Favorite Heart Button & Note Tooltip */}
        {handleToggleFavorite && (
          <div className="absolute top-3 right-3 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(hospital._id);
              }}
              onMouseEnter={() => userNote && setShowNoteTooltip(true)}
              onMouseLeave={() => setShowNoteTooltip(false)}
              title={
                userNote
                  ? `Saved note: "${userNote}"`
                  : isFav
                  ? 'Remove from saved facilities'
                  : 'Save to my facilities'
              }
              className={`p-2 rounded-full backdrop-blur-md shadow-md transition-all active:scale-90 ${
                isFav
                  ? 'bg-white text-rose-500 shadow-rose-500/20'
                  : 'bg-white/85 text-slate-500 hover:text-rose-500 hover:bg-white'
              }`}
              aria-label={isFav ? 'Remove from saved facilities' : 'Save to my facilities'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                }`}
              />
            </button>

            {/* Note Preview Tooltip */}
            {isFav && userNote && (
              <div
                className={`absolute right-0 top-10 w-48 p-2 rounded-lg bg-slate-900 text-white text-[11px] shadow-xl z-20 transition-opacity pointer-events-none ${
                  showNoteTooltip ? 'opacity-100' : 'opacity-0 hidden'
                }`}
              >
                <div className="flex items-center gap-1 text-amber-300 font-semibold mb-0.5">
                  <FileText className="w-3 h-3" /> Note
                </div>
                <p className="line-clamp-2 text-slate-200">{userNote}</p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Banner Pill: Live Emergency Status */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm backdrop-blur-md ${emergencyPill.badgeClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${emergencyPill.dotClass}`} />
            <span>{emergencyPill.label}</span>
          </span>

          <span className="text-xs font-semibold text-white/90 drop-shadow-md">
            {hospital.city}, {hospital.state}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Distance Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="ml-1 text-sm font-bold text-slate-900">
                  {hospital.averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                {hospital.totalReviews} {hospital.totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Distance & Driving ETA relative to Active Location */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <span className="font-semibold text-hospital-blue-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-hospital-blue-600" />
                {formattedDistance}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 flex items-center gap-1">
                <Car className="w-3 h-3 text-slate-400" />
                ~{formattedTravelTime}
              </span>
            </div>
          </div>

          {/* Hospital Name & Facility Type */}
          <div className="mb-2">
            <h3 className="font-bold text-slate-900 text-base group-hover:text-hospital-blue-600 transition-colors line-clamp-1">
              {hospital.name}
            </h3>
            <span className="inline-block mt-0.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
              {hospital.facilityType}
            </span>
          </div>

          {/* Address & Primary Phone */}
          <div className="text-xs text-slate-500 space-y-1 mb-3">
            <p className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{hospital.address}</span>
            </p>
            {primaryPhone && (
              <p className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{primaryPhone}</span>
              </p>
            )}
          </div>

          {/* Top Specialties Pills */}
          {hospital.specialties && hospital.specialties.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mb-3">
              {hospital.specialties.slice(0, 3).map((specialty) => (
                <span
                  key={specialty}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-hospital-blue-50 text-hospital-blue-700 border border-hospital-blue-100"
                >
                  {specialty}
                </span>
              ))}
              {hospital.specialties.length > 3 && (
                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200">
                  +{hospital.specialties.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-2">
            {primaryPhone && (
              <a
                href={`tel:${primaryPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-xs active:scale-[0.98]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Hospital</span>
              </a>
            )}

            <Link
              href={`/hospitals/${hospital._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-hospital-blue-600 text-white hover:bg-hospital-blue-700 transition-colors shadow-sm active:scale-[0.98] group/link"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default HospitalCard;
