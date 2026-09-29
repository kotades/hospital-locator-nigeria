'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  X,
  Plus,
  Star,
  Shield,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Search,
  Navigation,
  Activity,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Hospital } from '@/types';
import { calculateDistance, formatDistance, formatTravelTime, estimateTravelTime } from '@/utils/geo';

const MAX_COMPARE = 3;

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color = value >= 4 ? 'bg-green-500' : value >= 3 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white font-semibold w-6">{value.toFixed(1)}</span>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= Math.round(value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
        />
      ))}
      <span className="text-xs text-gray-400 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

function BooleanCell({ value, yes = 'Yes', no = 'No' }: { value: boolean; yes?: string; no?: string }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-green-400 text-sm font-medium">
      <CheckCircle className="w-4 h-4" /> {yes}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
      <XCircle className="w-4 h-4" /> {no}
    </span>
  );
}

function HospitalPickerModal({
  hospitals,
  selected,
  onSelect,
  onClose,
  userLat,
  userLng,
}: {
  hospitals: Hospital[];
  selected: string[];
  onSelect: (h: Hospital) => void;
  onClose: () => void;
  userLat: number;
  userLng: number;
}) {
  const [query, setQuery] = useState('');
  const filtered = hospitals.filter(
    (h) =>
      !selected.includes(h._id) &&
      (h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.city.toLowerCase().includes(query.toLowerCase()))
  );
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-white font-semibold">Add Hospital to Compare</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search hospitals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {filtered.map((h) => {
              const dist = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
              return (
                <button
                  key={h._id}
                  onClick={() => { onSelect(h); onClose(); }}
                  className="w-full text-left p-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 transition-all"
                >
                  <div className="text-white text-sm font-medium">{h.name}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{h.city}</span>
                    <span>•</span>
                    <span>{formatDistance(dist)}</span>
                    {h.emergency24Hours && (
                      <span className="text-red-400 font-medium">• 24/7 ER</span>
                    )}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-6">No matching hospitals</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { hospitals, reviews, activeLocation } = useAppContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);

  const userLat = activeLocation?.lat ?? 6.5244;
  const userLng = activeLocation?.lng ?? 3.3792;

  const selectedHospitals = useMemo(
    () => hospitals.filter((h) => selectedIds.includes(h._id)),
    [hospitals, selectedIds]
  );

  function addHospital(h: Hospital) {
    if (selectedIds.length < MAX_COMPARE) {
      setSelectedIds((prev) => [...prev, h._id]);
    }
  }

  function removeHospital(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }

  function getReviewStats(hospitalId: string) {
    const hrs = reviews.filter((r) => r.hospitalId === hospitalId);
    if (!hrs.length) return null;
    const avg = (key: keyof typeof hrs[0]) =>
      hrs.reduce((s, r) => s + (r[key] as number), 0) / hrs.length;
    return {
      overall: avg('overallRating'),
      staff: avg('staffRating'),
      cleanliness: avg('cleanlinessRating'),
      waitTime: avg('waitTimeRating'),
      careQuality: avg('careQualityRating'),
    };
  }

  const colCount = selectedHospitals.length;
  const colClass = colCount === 1 ? 'grid-cols-2' : colCount === 2 ? 'grid-cols-3' : 'grid-cols-4';

  const Row = ({
    label,
    render,
  }: {
    label: string;
    render: (h: Hospital) => React.ReactNode;
  }) => (
    <tr className="border-b border-gray-800">
      <td className="py-3 px-4 text-gray-400 text-sm font-medium bg-gray-900/60 sticky left-0 min-w-[140px]">
        {label}
      </td>
      {selectedHospitals.map((h) => (
        <td key={h._id} className="py-3 px-4 text-sm text-gray-200 bg-gray-800/40">
          {render(h)}
        </td>
      ))}
      {/* Empty slot columns */}
      {Array.from({ length: MAX_COMPARE - selectedHospitals.length }).map((_, i) => (
        <td key={`empty-${i}`} className="py-3 px-4 bg-gray-800/20" />
      ))}
    </tr>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-300" />
            Hospital Comparison
          </h1>
          <p className="text-blue-200 text-sm">
            Compare up to 3 hospitals side-by-side on proximity, services, ratings, and emergency readiness
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Slot picker row */}
        <div className="flex flex-wrap gap-3 mb-8">
          {selectedHospitals.map((h) => {
            const dist = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
            return (
              <div
                key={h._id}
                className="flex items-center gap-2 bg-gray-800 border border-blue-600 rounded-2xl px-4 py-2.5"
              >
                <div>
                  <div className="text-white text-sm font-semibold line-clamp-1 max-w-[180px]">{h.name}</div>
                  <div className="text-gray-400 text-xs">{h.city} · {formatDistance(dist)}</div>
                </div>
                <button
                  onClick={() => removeHospital(h._id)}
                  className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {selectedHospitals.length < MAX_COMPARE && (
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-2 bg-gray-800/60 border border-dashed border-gray-600 hover:border-blue-500 rounded-2xl px-4 py-2.5 text-gray-400 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Hospital ({MAX_COMPARE - selectedHospitals.length} remaining)
            </button>
          )}
        </div>

        {selectedHospitals.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-700" />
            <p className="text-xl font-medium mb-2">No hospitals selected</p>
            <p className="text-sm mb-6">Add 2–3 hospitals to compare them side-by-side</p>
            <button
              onClick={() => setShowPicker(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
            >
              + Add First Hospital
            </button>
          </div>
        )}

        {/* Comparison table */}
        {selectedHospitals.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-800">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 border-b border-gray-800">
                  <th className="py-4 px-4 text-left text-xs text-gray-400 uppercase tracking-wider font-medium sticky left-0 bg-gray-900 min-w-[140px]">
                    Category
                  </th>
                  {selectedHospitals.map((h) => (
                    <th key={h._id} className="py-4 px-4 text-left min-w-[200px]">
                      <Link
                        href={`/hospitals/${h._id}`}
                        className="text-white font-semibold text-sm hover:text-blue-400 transition-colors line-clamp-2"
                      >
                        {h.name}
                      </Link>
                      <div className="text-gray-400 text-xs mt-0.5">{h.city}, {h.state}</div>
                    </th>
                  ))}
                  {Array.from({ length: MAX_COMPARE - selectedHospitals.length }).map((_, i) => (
                    <th key={`empty-h-${i}`} className="py-4 px-4 min-w-[200px] bg-gray-900/40">
                      <button
                        onClick={() => setShowPicker(true)}
                        className="text-gray-600 text-xs hover:text-blue-400 transition-colors"
                      >
                        + Add hospital
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Section: Location */}
                <tr className="bg-gray-900/80">
                  <td colSpan={4} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-blue-400">
                    📍 Proximity & Location
                  </td>
                </tr>
                <Row
                  label="Distance"
                  render={(h) => {
                    const dist = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
                    return (
                      <div className="flex items-center gap-1 text-white font-semibold">
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        {formatDistance(dist)}
                      </div>
                    );
                  }}
                />
                <Row
                  label="Est. Travel Time"
                  render={(h) => {
                    const dist = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
                    const eta = estimateTravelTime(dist);
                    return (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        ~{formatTravelTime(eta)}
                      </div>
                    );
                  }}
                />
                <Row label="City" render={(h) => <span>{h.city}, {h.state}</span>} />

                {/* Section: Facility */}
                <tr className="bg-gray-900/80">
                  <td colSpan={4} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-purple-400">
                    🏥 Facility Details
                  </td>
                </tr>
                <Row label="Facility Type" render={(h) => <span className="text-white">{h.facilityType}</span>} />
                <Row label="Verified" render={(h) => <BooleanCell value={h.verified} yes="Verified" no="Unverified" />} />
                <Row label="Claimed" render={(h) => <BooleanCell value={h.claimedBy !== null} yes="Claimed" no="Unclaimed" />} />
                <Row
                  label="Operating Hours"
                  render={(h) => <span className="text-xs text-gray-300">{h.operatingHours}</span>}
                />

                {/* Section: Emergency */}
                <tr className="bg-gray-900/80">
                  <td colSpan={4} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-red-400">
                    🚨 Emergency Readiness
                  </td>
                </tr>
                <Row
                  label="24/7 Emergency"
                  render={(h) => <BooleanCell value={h.emergency24Hours} yes="Open 24/7" no="No 24/7 ER" />}
                />
                <Row
                  label="ER Status"
                  render={(h) => {
                    const colors: Record<string, string> = {
                      accepting: 'text-green-400',
                      limited: 'text-yellow-400',
                      critical: 'text-red-400',
                    };
                    return (
                      <span className={`font-semibold capitalize ${colors[h.emergencyStatus]}`}>
                        {h.emergencyStatus}
                      </span>
                    );
                  }}
                />
                <Row
                  label="Trauma Level"
                  render={(h) => (
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-gray-400" />
                      {h.traumaLevel}
                    </span>
                  )}
                />
                <Row
                  label="Emergency Phone"
                  render={(h) => (
                    <a href={`tel:${h.emergencyPhone}`} className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium">
                      <Phone className="w-3.5 h-3.5" />
                      {h.emergencyPhone}
                    </a>
                  )}
                />

                {/* Section: Services */}
                <tr className="bg-gray-900/80">
                  <td colSpan={4} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-green-400">
                    ⚕️ Services & Specialties
                  </td>
                </tr>
                <Row
                  label="Specialties"
                  render={(h) => (
                    <div className="flex flex-wrap gap-1">
                      {h.specialties.slice(0, 4).map((s) => (
                        <span key={s} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                      {h.specialties.length > 4 && (
                        <span className="text-xs text-gray-500">+{h.specialties.length - 4} more</span>
                      )}
                    </div>
                  )}
                />
                <Row
                  label="Key Services"
                  render={(h) => (
                    <div className="flex flex-wrap gap-1">
                      {h.services.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                      {h.services.length > 3 && (
                        <span className="text-xs text-gray-500">+{h.services.length - 3}</span>
                      )}
                    </div>
                  )}
                />
                <Row
                  label="Insurance (HMO)"
                  render={(h) => (
                    <div className="flex flex-wrap gap-1">
                      {h.insuranceAccepted.slice(0, 3).map((ins) => (
                        <span key={ins} className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full">
                          {ins}
                        </span>
                      ))}
                      {h.insuranceAccepted.length > 3 && (
                        <span className="text-xs text-gray-500">+{h.insuranceAccepted.length - 3}</span>
                      )}
                    </div>
                  )}
                />

                {/* Section: Accessibility */}
                <tr className="bg-gray-900/80">
                  <td colSpan={4} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-yellow-400">
                    ♿ Accessibility
                  </td>
                </tr>
                <Row label="Wheelchair Access" render={(h) => <BooleanCell value={h.accessibility.wheelchair} />} />
                <Row label="Parking Available" render={(h) => <BooleanCell value={h.accessibility.parking} />} />
                <Row label="Ambulance Bay" render={(h) => <BooleanCell value={h.accessibility.ambulanceBay} />} />

                {/* Section: Ratings */}
                <tr className="bg-gray-900/80">
                  <td colSpan={4} className="py-2 px-4 text-xs font-bold uppercase tracking-wider text-yellow-400">
                    ⭐ Patient Ratings
                  </td>
                </tr>
                <Row
                  label="Overall Rating"
                  render={(h) => {
                    const stats = getReviewStats(h._id);
                    return stats ? <StarRow value={stats.overall} /> : <span className="text-gray-500 text-xs">No reviews</span>;
                  }}
                />
                <Row
                  label="Staff"
                  render={(h) => {
                    const stats = getReviewStats(h._id);
                    return stats ? <RatingBar value={stats.staff} /> : <span className="text-gray-500 text-xs">—</span>;
                  }}
                />
                <Row
                  label="Cleanliness"
                  render={(h) => {
                    const stats = getReviewStats(h._id);
                    return stats ? <RatingBar value={stats.cleanliness} /> : <span className="text-gray-500 text-xs">—</span>;
                  }}
                />
                <Row
                  label="Wait Time"
                  render={(h) => {
                    const stats = getReviewStats(h._id);
                    return stats ? <RatingBar value={stats.waitTime} /> : <span className="text-gray-500 text-xs">—</span>;
                  }}
                />
                <Row
                  label="Care Quality"
                  render={(h) => {
                    const stats = getReviewStats(h._id);
                    return stats ? <RatingBar value={stats.careQuality} /> : <span className="text-gray-500 text-xs">—</span>;
                  }}
                />
                <Row label="Total Reviews" render={(h) => <span className="text-white font-semibold">{h.totalReviews.toLocaleString()}</span>} />

                {/* Action row */}
                <tr className="bg-gray-900">
                  <td className="py-4 px-4 text-gray-400 text-sm sticky left-0 bg-gray-900">Actions</td>
                  {selectedHospitals.map((h) => (
                    <td key={h._id} className="py-4 px-4">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/hospitals/${h._id}`}
                          className="text-center w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                          View Profile
                        </Link>
                        {h.emergency24Hours && (
                          <a
                            href={`tel:${h.emergencyPhone}`}
                            className="text-center w-full py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
                          >
                            Call ER
                          </a>
                        )}
                      </div>
                    </td>
                  ))}
                  {Array.from({ length: MAX_COMPARE - selectedHospitals.length }).map((_, i) => (
                    <td key={`empty-action-${i}`} className="py-4 px-4" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPicker && (
        <HospitalPickerModal
          hospitals={hospitals}
          selected={selectedIds}
          onSelect={addHospital}
          onClose={() => setShowPicker(false)}
          userLat={userLat}
          userLng={userLng}
        />
      )}
    </div>
  );
}
