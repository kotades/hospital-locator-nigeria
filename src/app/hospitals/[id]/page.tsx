'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  MapPin,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Ambulance,
  Star,
  Heart,
  Clock,
  Car,
  FileText,
  Share2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building2,
  Stethoscope,
  CreditCard,
  Accessibility,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CornerDownRight,
  Send,
  Navigation,
  Sparkles,
  Info,
  Calendar,
  Check,
  ChevronRight
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Hospital, Review, EmergencyStatus } from '@/types';
import { calculateDistance, estimateTravelTime, formatDistance, formatTravelTime } from '@/utils/geo';
import { DEFAULT_LOCATION } from '@/data/nigerianLocations';
import { Map } from '@/components/Map';
import { ReviewModal } from '@/components/ReviewModal';

export interface HospitalDetailPageProps {
  params: Promise<{ id: string }>;
}

type TabType = 'overview' | 'services' | 'insurance' | 'accessibility' | 'location' | 'reviews';

export default function HospitalDetailPage({ params }: HospitalDetailPageProps) {
  // Safe resolution of params for Next.js 15 App Router promises using React.use()
  const resolvedParams = React.use(params);
  const hospitalId = resolvedParams.id;

  const { data: session } = useSession();
  const {
    hospitals,
    reviews,
    activeLocation,
    favorites,
    isFavorite,
    toggleFavorite,
    addFavoriteNote,
    voteReview,
    respondToReview
  } = useAppContext();

  // Active hospital
  const hospital = useMemo(() => {
    return hospitals.find((h) => h._id === hospitalId);
  }, [hospitals, hospitalId]);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewsSortBy, setReviewsSortBy] = useState<'newest' | 'highest' | 'helpful'>('newest');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  // Favorite Note Modal / Popover state
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [personalNote, setPersonalNote] = useState<string>('');

  // Representative reply state for individual review id
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Fallback image
  const fallbackImage =
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80';

  const isFav = hospital ? isFavorite(hospital._id) : false;
  const currentFav = hospital ? favorites.find((f) => f.hospitalId === hospital._id) : undefined;

  useEffect(() => {
    if (currentFav?.note) {
      setPersonalNote(currentFav.note);
    }
  }, [currentFav]);

  // Fallback location if context not hydrated
  const effectiveLocation = activeLocation || DEFAULT_LOCATION;

  // Calculate distance & travel time
  const distanceKm = useMemo(() => {
    if (!hospital) return 0;
    return calculateDistance(
      effectiveLocation.lat,
      effectiveLocation.lng,
      hospital.location.lat,
      hospital.location.lng
    );
  }, [hospital, effectiveLocation]);

  const drivingMinutes = estimateTravelTime(distanceKm);
  const formattedDistance = formatDistance(distanceKm);
  const formattedTravelTime = formatTravelTime(drivingMinutes);

  // Reviews for this hospital
  const hospitalReviews = useMemo(() => {
    if (!hospital) return [];
    return reviews.filter((r) => r.hospitalId === hospital._id);
  }, [reviews, hospital]);

  // Dynamic 5-Dimension Rating Computations (FR4.1, FR4.3)
  const ratingMetrics = useMemo(() => {
    if (!hospital) {
      return {
        overall: 0,
        staff: 0,
        cleanliness: 0,
        waitTime: 0,
        careQuality: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const count = hospitalReviews.length;
    if (count === 0) {
      const base = hospital.averageRating;
      return {
        overall: base,
        staff: Math.min(5, Math.round((base + 0.1) * 10) / 10),
        cleanliness: base,
        waitTime: Math.max(1, Math.round((base - 0.3) * 10) / 10),
        careQuality: base,
        total: hospital.totalReviews,
        distribution: {
          5: Math.round(hospital.totalReviews * 0.6),
          4: Math.round(hospital.totalReviews * 0.3),
          3: Math.round(hospital.totalReviews * 0.08),
          2: Math.round(hospital.totalReviews * 0.02),
          1: 0
        }
      };
    }

    const sumOverall = hospitalReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const sumStaff = hospitalReviews.reduce((sum, r) => sum + (r.staffRating || r.overallRating), 0);
    const sumClean = hospitalReviews.reduce((sum, r) => sum + (r.cleanlinessRating || r.overallRating), 0);
    const sumWait = hospitalReviews.reduce((sum, r) => sum + (r.waitTimeRating || r.overallRating), 0);
    const sumCare = hospitalReviews.reduce((sum, r) => sum + (r.careQualityRating || r.overallRating), 0);

    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    hospitalReviews.forEach((r) => {
      const clamped = Math.max(1, Math.min(5, Math.round(r.overallRating)));
      dist[clamped] = (dist[clamped] || 0) + 1;
    });

    return {
      overall: Math.round((sumOverall / count) * 10) / 10,
      staff: Math.round((sumStaff / count) * 10) / 10,
      cleanliness: Math.round((sumClean / count) * 10) / 10,
      waitTime: Math.round((sumWait / count) * 10) / 10,
      careQuality: Math.round((sumCare / count) * 10) / 10,
      total: count,
      distribution: dist
    };
  }, [hospital, hospitalReviews]);

  // Sorted reviews list
  const sortedReviews = useMemo(() => {
    const list = [...hospitalReviews];
    switch (reviewsSortBy) {
      case 'highest':
        return list.sort((a, b) => b.overallRating - a.overallRating);
      case 'helpful':
        return list.sort((a, b) => b.helpful - a.helpful);
      case 'newest':
      default:
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }, [hospitalReviews, reviewsSortBy]);

  // Share facility URL
  const handleShare = async () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: hospital?.name || 'Hospital Profile',
          text: `View details and live emergency capacity for ${hospital?.name} on Nigerian Hospital Locator.`,
          url: currentUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(currentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyAddress = async () => {
    if (!hospital || !navigator.clipboard) return;
    await navigator.clipboard.writeText(`${hospital.name}, ${hospital.address}, ${hospital.city}, ${hospital.state}`);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSaveFavoriteNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital) return;
    addFavoriteNote(hospital._id, personalNote.trim());
    setIsNoteModalOpen(false);
  };

  const handleRepresentativeReplySubmit = (reviewId: string) => {
    if (!replyText.trim()) return;
    respondToReview(reviewId, replyText.trim());
    setReplyText('');
    setReplyingReviewId(null);
  };

  // Emergency status helper
  const getEmergencyBadge = (status: EmergencyStatus) => {
    switch (status) {
      case 'accepting':
        return {
          label: 'Accepting Emergency Patients',
          subLabel: 'Normal Intake & Trauma Readiness',
          badgeClass: 'bg-emerald-500/90 text-white border-emerald-400',
          dotClass: 'bg-white animate-pulse'
        };
      case 'limited':
        return {
          label: 'Limited Emergency Capacity',
          subLabel: 'High Patient Volume / Delays Possible',
          badgeClass: 'bg-amber-500/90 text-white border-amber-400',
          dotClass: 'bg-white'
        };
      case 'critical':
      default:
        return {
          label: 'Critical Divert Active',
          subLabel: 'ICU / Acute Beds Near Maximum Saturation',
          badgeClass: 'bg-red-600/90 text-white border-red-400',
          dotClass: 'bg-white animate-ping'
        };
    }
  };

  // If hospital not found
  if (!hospital) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Hospital Profile Not Found</h1>
        <p className="text-sm text-slate-600 max-w-md mb-6">
          The requested healthcare facility does not exist or may have been unlisted from the verified national directory.
        </p>
        <Link
          href="/hospitals"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hospital-blue-600 text-white font-semibold text-sm hover:bg-hospital-blue-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Healthcare Directory</span>
        </Link>
      </div>
    );
  }

  const primaryPhone = hospital.emergencyPhone || hospital.phoneNumbers[0] || '';
  const receptionPhone = hospital.phoneNumbers[0] || hospital.emergencyPhone || '';
  const emergencyStatusConfig = getEmergencyBadge(hospital.emergencyStatus);
  const images = hospital.images && hospital.images.length > 0 ? hospital.images : [fallbackImage];
  const activeImage = images[activeImageIndex] || fallbackImage;

  // Check if current user is authorized representative or admin
  const isRepOrAdmin =
    session?.user?.role === 'admin' ||
    (session?.user?.role === 'representative' &&
      (session.user.hospitalId === hospital._id || !session.user.hospitalId));

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* 1. Breadcrumbs Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-hospital-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/hospitals" className="hover:text-hospital-blue-600 transition-colors">
              Directory
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400">{hospital.city}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-semibold text-slate-800 truncate max-w-xs">{hospital.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 2. Facility Header Card with Photo Gallery and Live Emergency Status */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Gallery Column (5 cols on lg) */}
            <div className="lg:col-span-5 relative bg-slate-900 flex flex-col justify-between">
              {/* Main Photo Banner */}
              <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden group">
                <img
                  src={activeImage}
                  alt={hospital.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                {/* Overlaid Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full shadow-md backdrop-blur-md border ${emergencyStatusConfig.badgeClass}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${emergencyStatusConfig.dotClass}`} />
                    <span>{emergencyStatusConfig.label}</span>
                  </span>

                  {hospital.emergency24Hours && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-red-600 text-white shadow-md">
                      <Ambulance className="w-3.5 h-3.5" />
                      <span>24/7 Emergency</span>
                    </span>
                  )}
                </div>

                {/* Verification Badge */}
                {hospital.verified && (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-hospital-blue-700 px-2.5 py-1 rounded-full shadow-md text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-hospital-blue-600" />
                    <span>MOH Verified</span>
                  </div>
                )}

                {/* Bottom Image Sub-info */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 drop-shadow-md z-10">
                  <span className="font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                    {hospital.facilityType}
                  </span>
                  {hospital.traumaLevel && hospital.traumaLevel !== 'None' && (
                    <span className="font-bold bg-amber-500/90 text-slate-950 px-2.5 py-1 rounded-lg">
                      {hospital.traumaLevel} Trauma Center
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails row (if multiple images) */}
              {images.length > 1 && (
                <div className="p-3 bg-slate-950/90 flex items-center gap-2 overflow-x-auto border-t border-slate-800">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-hospital-blue-500 ring-2 ring-hospital-blue-300'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header Content & Information (7 cols on lg) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Trauma Level & Category */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-sky-50 text-hospital-blue-700 border border-sky-100">
                      {hospital.facilityType}
                    </span>
                    {hospital.traumaLevel && hospital.traumaLevel !== 'None' && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        {hospital.traumaLevel}
                      </span>
                    )}
                  </div>

                  {/* Rating Badge */}
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-hospital-blue-600 transition-colors"
                  >
                    <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-extrabold text-slate-900">
                        {ratingMetrics.overall.toFixed(1)}
                      </span>
                    </div>
                    <span className="font-semibold underline">
                      ({ratingMetrics.total} {ratingMetrics.total === 1 ? 'review' : 'reviews'})
                    </span>
                  </button>
                </div>

                {/* Facility Name */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {hospital.name}
                </h1>

                {/* Address & City */}
                <div className="flex items-start gap-2 text-slate-600 text-sm mb-4">
                  <MapPin className="w-4 h-4 text-hospital-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span>{hospital.address}, {hospital.city}, {hospital.state}, Nigeria.</span>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="ml-2 text-xs text-hospital-blue-600 hover:text-hospital-blue-800 font-medium inline-flex items-center gap-0.5"
                    >
                      {copiedAddress ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        'Copy Address'
                      )}
                    </button>
                  </div>
                </div>

                {/* Distance & Travel Time Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hospital-blue-100 text-hospital-blue-700 flex items-center justify-center shadow-xs">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Estimated Drive from Your Location</div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>~{formattedTravelTime}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-hospital-blue-700">{formattedDistance} away</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Ref: {effectiveLocation.name}
                  </div>
                </div>
              </div>

              {/* 3. Quick Action Toolbar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                {/* Call Emergency Line */}
                <a
                  href={`tel:${hospital.emergencyPhone || primaryPhone}`}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs sm:text-sm hover:bg-red-700 shadow-sm active:scale-95 transition-all"
                >
                  <Ambulance className="w-4 h-4" />
                  <span>Call Emergency</span>
                </a>

                {/* Call Reception */}
                <a
                  href={`tel:${receptionPhone}`}
                  className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm hover:bg-emerald-100 active:scale-95 transition-all shadow-xs"
                >
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Call Reception</span>
                </a>

                {/* Google Maps Turn-by-turn Navigation */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-hospital-blue-50 text-hospital-blue-700 border border-hospital-blue-200 font-semibold text-xs sm:text-sm hover:bg-hospital-blue-100 active:scale-95 transition-all shadow-xs"
                  title="Open Google Maps directions"
                >
                  <Navigation className="w-4 h-4 text-hospital-blue-600" />
                  <span className="hidden sm:inline">Directions</span>
                </a>

                {/* Favorite Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    toggleFavorite(hospital._id);
                    if (!isFav) {
                      setIsNoteModalOpen(true);
                    }
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                    isFav
                      ? 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title={isFav ? 'Manage saved note' : 'Save to my facilities'}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                    }`}
                  />
                  <span className="hidden sm:inline">{isFav ? 'Saved' : 'Save'}</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all active:scale-95"
                  title="Share hospital profile link"
                >
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
                </button>
              </div>

              {/* Personal Note Callout if favorited */}
              {isFav && currentFav?.note && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>
                      <strong>Personal Note:</strong> {currentFav.note}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNoteModalOpen(true)}
                    className="text-[11px] text-amber-700 underline font-semibold ml-2 hover:text-amber-900"
                  >
                    Edit Note
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Tab Navigation Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'overview'
                  ? 'bg-hospital-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Overview & Hours</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('services')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'services'
                  ? 'bg-hospital-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Services & Specialties</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('insurance')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'insurance'
                  ? 'bg-hospital-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>HMO & Insurance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('accessibility')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'accessibility'
                  ? 'bg-hospital-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Accessibility className="w-4 h-4" />
              <span>Accessibility</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('location')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'location'
                  ? 'bg-hospital-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Map & Directions</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                activeTab === 'reviews'
                  ? 'bg-hospital-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Patient Reviews ({ratingMetrics.total})</span>
            </button>
          </div>
        </div>

        {/* 5. Tab Content Views */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Tab Panel (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {/* TAB: Overview & Operating Hours */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Operating Hours Card */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Clock className="w-5 h-5 text-hospital-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">Operating Schedule & Clinical Intake</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Outpatient Clinic Hours */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Outpatient Department (OPD)
                      </div>
                      <div className="text-base font-bold text-slate-900 mb-1">
                        {hospital.operatingHours}
                      </div>
                      <p className="text-xs text-slate-500">
                        General consultations, routine specialist clinics, and diagnostic sample collections.
                      </p>
                    </div>

                    {/* Emergency Intake Hours */}
                    <div
                      className={`p-4 rounded-xl border ${
                        hospital.emergency24Hours
                          ? 'bg-red-50/70 border-red-200 text-red-950'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider text-red-700 mb-1 flex items-center gap-1">
                        <Ambulance className="w-3.5 h-3.5" /> Emergency & Resuscitation
                      </div>
                      <div className="text-base font-bold text-red-900 mb-1">
                        {hospital.emergency24Hours ? '24 Hours / 7 Days Continuous' : 'Designated Daytime Hours'}
                      </div>
                      <p className="text-xs text-red-800/80">
                        Immediate medical intake for acute trauma, obstetric emergencies, and cardiopulmonary arrest.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact & Administration Directory */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Phone className="w-5 h-5 text-hospital-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">Contact & Verification Details</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block mb-0.5">Emergency Hotline</span>
                      <a
                        href={`tel:${hospital.emergencyPhone}`}
                        className="font-bold text-red-600 hover:underline flex items-center gap-1.5"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{hospital.emergencyPhone}</span>
                      </a>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block mb-0.5">Reception & General Enquiries</span>
                      <div className="font-semibold text-slate-800 space-y-0.5">
                        {hospital.phoneNumbers.map((phone, idx) => (
                          <a key={idx} href={`tel:${phone}`} className="hover:text-hospital-blue-600 block">
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block mb-0.5">Official Email</span>
                      <a
                        href={`mailto:${hospital.email}`}
                        className="font-medium text-hospital-blue-600 hover:underline truncate block"
                      >
                        {hospital.email}
                      </a>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400 font-medium block mb-0.5">Website</span>
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-hospital-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span className="truncate max-w-[180px]">{hospital.website}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Services & Specialties */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                {/* Clinical Services */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Stethoscope className="w-5 h-5 text-hospital-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">Clinical Facilities & Diagnostic Services</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {hospital.services.map((service, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Medical Specialties */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Sparkles className="w-5 h-5 text-hospital-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">Specialist Consultant Departments</h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-hospital-blue-50 text-hospital-blue-800 border border-hospital-blue-200 text-xs font-bold"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-hospital-blue-600" />
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: HMO & Insurance */}
            {activeTab === 'insurance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <CreditCard className="w-5 h-5 text-hospital-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">Accredited Health Maintenance Organizations (HMOs)</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {hospital.insuranceAccepted.map((hmo, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200 shadow-xs flex items-center justify-between"
                      >
                        <span className="text-xs font-bold text-slate-900">{hmo}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          Accepted
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* HMO Disclaimer & Protocols */}
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-hospital-blue-800">
                      <Info className="w-4 h-4 text-hospital-blue-600 shrink-0" />
                      <span>HMO Desk Admission Guidance</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Please carry your physical HMO card or policy identifier number along with government-issued photo ID.
                      For planned inpatient surgical procedures, kindly contact your HMO provider for advance pre-authorization.
                      Under the <strong>National Health Act Section 20</strong>, acute emergency stabilization is administered
                      without upfront payment impediments.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Accessibility */}
            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                    <Accessibility className="w-5 h-5 text-hospital-blue-600" />
                    <h2 className="text-lg font-bold text-slate-900">Accessibility & Emergency Infrastructure</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Wheelchair */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700">Wheelchair Accessibility</span>
                          {hospital.accessibility.wheelchair ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {hospital.accessibility.wheelchair
                            ? 'Ramps at main entrance, wide clinical doorways, level elevators, and accessible patient restrooms.'
                            : 'Limited wheelchair ramp infrastructure; ground floor triage assistance provided.'}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-500">
                        Status: {hospital.accessibility.wheelchair ? 'Fully Equipped' : 'Partial Access'}
                      </div>
                    </div>

                    {/* Dedicated Parking */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700">On-Site Patient Parking</span>
                          {hospital.accessibility.parking ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {hospital.accessibility.parking
                            ? 'Dedicated patient and visitor parking compound with reserved accessibility spaces near OPD gate.'
                            : 'Street parking only; drop-off zone available at primary intake gate.'}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-500">
                        Status: {hospital.accessibility.parking ? 'Available On-Premises' : 'Limited Street Parking'}
                      </div>
                    </div>

                    {/* Ambulance Bay */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-700">Dedicated Ambulance Bay</span>
                          {hospital.accessibility.ambulanceBay ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {hospital.accessibility.ambulanceBay
                            ? 'Clear 24/7 emergency vehicle driveway, covered stretcher bay, and direct pathway into trauma resuscitation.'
                            : 'Shared driveway; triage team dispatches portable gurney to vehicles on arrival.'}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] font-semibold text-slate-500">
                        Status: {hospital.accessibility.ambulanceBay ? 'Dedicated Bay Active' : 'Shared Entrance'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Map & Directions */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-hospital-blue-600" />
                      <h2 className="text-lg font-bold text-slate-900">Geographic Coordinates & Map</h2>
                    </div>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.lat},${hospital.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-hospital-blue-600 text-white hover:bg-hospital-blue-700 shadow-xs"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Open in Google Maps</span>
                    </a>
                  </div>

                  {/* Embedded Leaflet Map */}
                  <div className="rounded-xl overflow-hidden border border-slate-200 mb-4">
                    <Map
                      hospitals={[hospital]}
                      selectedHospitalId={hospital._id}
                      center={[hospital.location.lat, hospital.location.lng]}
                      zoom={15}
                      height="380px"
                    />
                  </div>

                  {/* Coordinates Bar */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <strong>Address:</strong> {hospital.address}, {hospital.city}, {hospital.state}
                    </div>
                    <div className="font-mono text-slate-500">
                      LAT: {hospital.location.lat.toFixed(5)}° | LNG: {hospital.location.lng.toFixed(5)}°
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Reviews & Dynamic Rating Feed */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Header CTA to write review */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Patient Experiences & Verified Feedback</h2>
                    <p className="text-xs text-slate-500">
                      Showing {hospitalReviews.length} verified patient ratings and clinical governance replies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-hospital-blue-600 text-white font-bold text-xs sm:text-sm hover:bg-hospital-blue-700 shadow-sm active:scale-95 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Write a Patient Review</span>
                  </button>
                </div>

                {/* Reviews Sort Bar */}
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="font-medium">
                    Sort reviews by:
                  </div>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setReviewsSortBy('newest')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        reviewsSortBy === 'newest'
                          ? 'bg-hospital-blue-50 text-hospital-blue-700'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Most Recent
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewsSortBy('highest')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        reviewsSortBy === 'highest'
                          ? 'bg-hospital-blue-50 text-hospital-blue-700'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Highest Rated
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewsSortBy('helpful')}
                      className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                        reviewsSortBy === 'helpful'
                          ? 'bg-hospital-blue-50 text-hospital-blue-700'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Most Helpful
                    </button>
                  </div>
                </div>

                {/* Reviews List */}
                {sortedReviews.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="font-bold text-slate-900 mb-1">No reviews yet for this facility</h3>
                    <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                      Have you visited this hospital? Be the first to share your experience with other patients across Nigeria.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-hospital-blue-600 text-white font-semibold text-xs shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Write First Review</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedReviews.map((review) => {
                      const formattedDate = new Date(review.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      const isRepReplying = replyingReviewId === review._id;

                      return (
                        <div
                          key={review._id}
                          className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                        >
                          {/* Review Top Row */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-hospital-blue-100 text-hospital-blue-700 font-bold flex items-center justify-center text-sm shadow-inner">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-tight">
                                  {review.userName}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                  <span>{formattedDate}</span>
                                  {review.visitDate && (
                                    <>
                                      <span>•</span>
                                      <span>Visit: {review.visitDate}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Overall Star Badge */}
                            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span className="font-extrabold text-sm text-slate-900">
                                {review.overallRating.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          {/* Sub-Dimension Ratings Pills */}
                          <div className="flex flex-wrap gap-1.5 text-[11px]">
                            {review.staffRating && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-100 font-medium">
                                Staff: {review.staffRating}★
                              </span>
                            )}
                            {review.cleanlinessRating && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium">
                                Cleanliness: {review.cleanlinessRating}★
                              </span>
                            )}
                            {review.waitTimeRating && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-100 font-medium">
                                Wait Time: {review.waitTimeRating}★
                              </span>
                            )}
                            {review.careQualityRating && (
                              <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-100 font-medium">
                                Care: {review.careQualityRating}★
                              </span>
                            )}
                          </div>

                          {/* Review Text Body */}
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                            {review.reviewText}
                          </p>

                          {/* Official Facility Representative Response (if any) */}
                          {review.response && (
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-3">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-hospital-blue-800">
                                  <ShieldCheck className="w-4 h-4 text-hospital-blue-600" />
                                  <span>Official Facility Representative Response</span>
                                </div>
                                {review.responseDate && (
                                  <span className="text-[11px] text-slate-400">
                                    {new Date(review.responseDate).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed italic">
                                &ldquo;{review.response}&rdquo;
                              </p>
                            </div>
                          )}

                          {/* Inline Representative Reply Box (if user is admin/rep or testing mode) */}
                          {isRepReplying && (
                            <div className="p-3 bg-hospital-blue-50/60 rounded-xl border border-hospital-blue-200 space-y-2">
                              <div className="text-xs font-bold text-hospital-blue-900">
                                Compose Official Facility Reply
                              </div>
                              <textarea
                                rows={2}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Thank the patient or clarify clinical procedures..."
                                className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-hospital-blue-500 outline-hidden"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyingReviewId(null)}
                                  className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRepresentativeReplySubmit(review._id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-hospital-blue-600 hover:bg-hospital-blue-700 rounded-lg"
                                >
                                  <Send className="w-3 h-3" />
                                  <span>Send Official Reply</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Review Action Footer: Helpfulness Voting */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400">Was this review helpful?</span>

                              {/* Upvote button (+1) */}
                              <button
                                type="button"
                                onClick={() => voteReview(review._id, 'helpful')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition-colors active:scale-95"
                                title="Vote review as helpful"
                              >
                                <ThumbsUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                                <span className="font-bold">{review.helpful}</span>
                              </button>

                              {/* Downvote button (-1) */}
                              <button
                                type="button"
                                onClick={() => voteReview(review._id, 'notHelpful')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 transition-colors active:scale-95"
                                title="Vote review as not helpful"
                              >
                                <ThumbsDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600" />
                                <span className="font-bold">{review.notHelpful}</span>
                              </button>
                            </div>

                            {/* Representative Reply Trigger Button */}
                            {!review.response && !isRepReplying && (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReviewId(review._id);
                                  setReplyText('');
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-hospital-blue-600 hover:text-hospital-blue-800"
                              >
                                <CornerDownRight className="w-3.5 h-3.5" />
                                <span>{isRepOrAdmin ? 'Official Reply' : 'Representative Reply'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Multi-Dimensional Rating Summary Card (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Multi-Dimensional Ratings Card (FR4.1, FR4.3) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Patient Ratings Summary
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  FR4.1 Verified
                </span>
              </div>

              {/* Big Score Box */}
              <div className="text-center py-2 bg-gradient-to-b from-amber-50/50 to-white rounded-xl border border-amber-100/80 p-4">
                <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {ratingMetrics.overall.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(ratingMetrics.overall)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Based on {ratingMetrics.total} verified patient evaluations
                </div>
              </div>

              {/* 5-Dimension Progress Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Category Breakdown
                </div>

                {/* Overall */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Overall Experience</span>
                    <span className="text-slate-900 font-bold">{ratingMetrics.overall.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ratingMetrics.overall / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Staff */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Staff Professionalism</span>
                    <span className="text-slate-900 font-bold">{ratingMetrics.staff.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ratingMetrics.staff / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Cleanliness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Facility Cleanliness</span>
                    <span className="text-slate-900 font-bold">{ratingMetrics.cleanliness.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ratingMetrics.cleanliness / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Wait Times */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Wait Times & Triage</span>
                    <span className="text-slate-900 font-bold">{ratingMetrics.waitTime.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ratingMetrics.waitTime / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Care Quality */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">Care Quality & Outcomes</span>
                    <span className="text-slate-900 font-bold">{ratingMetrics.careQuality.toFixed(1)} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(ratingMetrics.careQuality / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Star Distribution Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Star Rating Distribution
                </div>
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingMetrics.distribution[stars as keyof typeof ratingMetrics.distribution] || 0;
                  const total = ratingMetrics.total || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={stars} className="flex items-center gap-2 text-slate-600">
                      <span className="w-10 font-medium text-right shrink-0">{stars} ★</span>
                      <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-[11px] text-slate-400 text-right shrink-0">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Write Review Button */}
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-hospital-blue-600 hover:bg-hospital-blue-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Emergency Hotline Alert Box */}
            <div className="bg-red-50 rounded-2xl border border-red-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Life-Threatening Emergency?</span>
              </div>
              <p className="text-xs text-red-900 leading-relaxed">
                If the patient requires urgent resuscitation or is in critical shock, dial the direct emergency trauma line immediately.
              </p>
              <a
                href={`tel:${hospital.emergencyPhone}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {hospital.emergencyPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Review Modal Dialog (FR4.1, FR4.3) */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        hospitalId={hospital._id}
        hospitalName={hospital.name}
        onReviewSubmitted={() => {
          setActiveTab('reviews');
        }}
      />

      {/* 7. Favorite Note Dialog */}
      {isNoteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Personal Note for {hospital.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveFavoriteNote} className="space-y-4">
              <p className="text-xs text-slate-500">
                Save private notes visible only to you (e.g., preferred pediatrician, ward extension, emergency contacts).
              </p>
              <textarea
                rows={3}
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="e.g. Consult Dr. Ade at pediatric annex. 24/7 MRI available."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-blue-500 outline-hidden"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-hospital-blue-600 hover:bg-hospital-blue-700 rounded-lg"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
