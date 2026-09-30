'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  User,
  Heart,
  Star,
  Clock,
  Trash2,
  MapPin,
  ChevronRight,
  Search,
  MessageSquare,
  Settings,
  AlertTriangle,
  Hospital,
  Phone,
  Edit2,
  X,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { formatDistance, calculateDistance } from '@/utils/geo';

const TABS = [
  { id: 'profile',  label: 'Profile',        icon: User },
  { id: 'favorites', label: 'Favourites',    icon: Heart },
  { id: 'reviews',  label: 'My Reviews',     icon: Star },
  { id: 'history',  label: 'Search History', icon: Clock },
  { id: 'settings', label: 'Settings',       icon: Settings },
] as const;

type TabId = typeof TABS[number]['id'];

export default function PatientDashboard() {
  const { data: session } = useSession();
  const {
    hospitals,
    reviews,
    favorites,
    searchHistory,
    activeLocation,
    toggleFavorite,
    addFavoriteNote,
    clearSearchHistory,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [noteEditing, setNoteEditing] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const userLat = activeLocation?.lat ?? 6.5244;
  const userLng = activeLocation?.lng ?? 3.3792;

  const myReviews = useMemo(
    () => reviews.filter((r) => r.userId === (session?.user?.id ?? 'user-patient-1')),
    [reviews, session]
  );

  const favoriteHospitals = useMemo(
    () =>
      favorites
        .map((fav) => ({
          fav,
          hospital: hospitals.find((h) => h._id === fav.hospitalId),
        }))
        .filter(({ hospital }) => !!hospital),
    [favorites, hospitals]
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 pt-8 pb-6 sm:py-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {session?.user?.name?.[0] ?? 'P'}
          </div>
          <div>
            <h1 className="text-2xl font-bold"><span>{session?.user?.name ?? 'My Account'}</span></h1>
            <p className="text-blue-200 text-sm">{session?.user?.email ?? 'patient@hospital.ng'}</p>
            <span className="inline-block mt-1 bg-blue-700/60 text-blue-200 text-xs px-2 py-0.5 rounded-full">
              Patient Account
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Saved Hospitals', value: favoriteHospitals.length, color: 'text-blue-400' },
                { label: 'My Reviews',      value: myReviews.length,         color: 'text-yellow-400' },
                { label: 'Searches Made',   value: searchHistory.length,     color: 'text-purple-400' },
                { label: 'Account Status',  value: 'Active',                 color: 'text-green-400' },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: session?.user?.name ?? 'My Account' },
                  { label: 'Email',     value: session?.user?.email ?? 'patient@hospital.ng' },
                  { label: 'Phone',     value: '+234 801 234 5678' },
                  { label: 'Location',  value: activeLocation ? `${activeLocation.city ?? 'Custom'}` : 'Lagos, Nigeria' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">{field.label}</label>
                    <p className="text-white mt-0.5">{field.value}</p>
                  </div>
                ))}
              </div>
              <button className="mt-4 flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                <Edit2 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* ── FAVORITES ── */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              Saved Hospitals ({favoriteHospitals.length})
            </h2>
            {favoriteHospitals.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>No saved hospitals yet</p>
                <Link href="/hospitals" className="text-blue-400 text-sm mt-2 inline-block hover:underline">
                  Browse hospitals →
                </Link>
              </div>
            )}
            <div className="space-y-4">
              {favoriteHospitals.map(({ fav, hospital: h }) => {
                if (!h) return null;
                const dist = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
                const editing = noteEditing === h._id;
                return (
                  <div key={h._id} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link href={`/hospitals/${h._id}`} className="text-white font-semibold hover:text-blue-400 transition-colors line-clamp-1">
                          {h.name}
                        </Link>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{h.city}</span>
                          <span>{formatDistance(dist)}</span>
                          {h.emergency24Hours && <span className="text-red-400">• 24/7 ER</span>}
                        </div>
                        {fav.note && !editing && (
                          <div className="mt-2 text-xs text-gray-300 bg-gray-800 rounded-lg px-3 py-2 italic">
                            📝 {fav.note}
                          </div>
                        )}
                        {editing && (
                          <div className="mt-2 flex gap-2">
                            <input
                              type="text"
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              placeholder="Add a note…"
                              className="flex-1 text-xs bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            />
                            <button
                              onClick={() => {
                                addFavoriteNote(h._id, noteText);
                                setNoteEditing(null);
                              }}
                              className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg"
                            >
                              Save
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setNoteEditing(editing ? null : h._id); setNoteText(fav.note ?? ''); }}
                          className="text-gray-500 hover:text-blue-400"
                          title="Edit note"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleFavorite(h._id)}
                          className="text-gray-500 hover:text-red-400"
                          title="Remove favourite"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a
                        href={`tel:${h.emergencyPhone}`}
                        className="flex items-center gap-1 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg text-gray-300 transition-colors"
                      >
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <Link
                        href={`/hospitals/${h._id}`}
                        className="flex items-center gap-1 text-xs bg-blue-900/40 hover:bg-blue-900/60 border border-blue-700 px-3 py-1.5 rounded-lg text-blue-300 transition-colors"
                      >
                        View Profile <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              My Reviews ({myReviews.length})
            </h2>
            {myReviews.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>You haven&apos;t written any reviews yet</p>
                <Link href="/hospitals" className="text-blue-400 text-sm mt-2 inline-block hover:underline">
                  Find a hospital to review →
                </Link>
              </div>
            )}
            <div className="space-y-4">
              {myReviews.map((review) => {
                const h = hospitals.find((hosp) => hosp._id === review.hospitalId);
                return (
                  <div key={review._id} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <Link href={`/hospitals/${review.hospitalId}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                          {h?.name ?? 'Unknown Hospital'}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.overallRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-NG')}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">👍 {review.helpful} helpful</span>
                    </div>
                    <p className="text-gray-300 text-sm">{review.reviewText}</p>
                    {review.response && (
                      <div className="mt-3 bg-blue-900/20 border border-blue-800 rounded-xl p-3 text-xs text-blue-200">
                        <strong className="text-blue-400">Facility Response:</strong> {review.response}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SEARCH HISTORY ── */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                Search History ({searchHistory.length})
              </h2>
              {searchHistory.length > 0 && (
                <button
                  onClick={() => clearSearchHistory()}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>
            {searchHistory.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>No search history</p>
              </div>
            )}
            <div className="space-y-2">
              {searchHistory.map((log) => (
                <Link
                  key={log._id}
                  href={`/hospitals?q=${encodeURIComponent(log.query)}`}
                  className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl px-4 py-3 transition-all"
                >
                  <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{log.query}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      {log.city && <span>{log.city}</span>}
                      {log.specialty && <><span>•</span><span>{log.specialty}</span></>}
                      <span>•</span>
                      <span>{new Date(log.timestamp).toLocaleDateString('en-NG')}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-400" />
                Account Settings
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', desc: 'Receive updates about saved hospitals' },
                  { label: 'Location Services', desc: 'Allow GPS-based hospital discovery' },
                  { label: 'Review Notifications', desc: 'Get alerts when your reviews get responses' },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm font-medium">{setting.label}</div>
                      <div className="text-gray-500 text-xs">{setting.desc}</div>
                    </div>
                    <button className="relative w-10 h-5 bg-blue-600 rounded-full transition-colors">
                      <span className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-red-950/20 rounded-2xl border border-red-900 p-6">
              <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Deleting your account will remove all your data permanently.
              </p>
              {deleteConfirm ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="flex-1 py-2 bg-red-700 hover:bg-red-600 rounded-xl text-sm text-white transition-colors"
                  >
                    Confirm Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-800 px-4 py-2 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete My Account
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
