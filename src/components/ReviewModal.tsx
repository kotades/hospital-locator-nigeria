'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import {
  X,
  Star,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  HeartPulse,
  Building2,
  Smile
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Review } from '@/types';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  hospitalName: string;
  onReviewSubmitted?: (review: Review) => void;
}

interface RatingDimension {
  key: 'overallRating' | 'staffRating' | 'cleanlinessRating' | 'waitTimeRating' | 'careQualityRating';
  label: string;
  description: string;
  icon: React.ReactNode;
}

const RATING_DIMENSIONS: RatingDimension[] = [
  {
    key: 'overallRating',
    label: 'Overall Experience',
    description: 'General satisfaction with the hospital visit and care received',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />
  },
  {
    key: 'staffRating',
    label: 'Staff Professionalism',
    description: 'Courtesy, empathy, and competence of nurses, doctors, and triage teams',
    icon: <Smile className="w-4 h-4 text-blue-500" />
  },
  {
    key: 'cleanlinessRating',
    label: 'Facility Cleanliness',
    description: 'Hygiene of waiting lounges, emergency bays, consultation rooms, and restrooms',
    icon: <Building2 className="w-4 h-4 text-emerald-500" />
  },
  {
    key: 'waitTimeRating',
    label: 'Wait Times & Triage',
    description: 'Speed from registration and payment to clinical consultation and pharmacy',
    icon: <Clock className="w-4 h-4 text-purple-500" />
  },
  {
    key: 'careQualityRating',
    label: 'Care Quality & Outcomes',
    description: 'Clarity of diagnosis, treatment effectiveness, and medical instructions',
    icon: <HeartPulse className="w-4 h-4 text-rose-500" />
  }
];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor (1.0)',
  2: 'Fair (2.0)',
  3: 'Good (3.0)',
  4: 'Very Good (4.0)',
  5: 'Excellent (5.0)'
};

export function ReviewModal({
  isOpen,
  onClose,
  hospitalId,
  hospitalName,
  onReviewSubmitted
}: ReviewModalProps) {
  const { data: session } = useSession();
  const { addReview } = useAppContext();

  // Form states
  const [overallRating, setOverallRating] = useState<number>(5);
  const [staffRating, setStaffRating] = useState<number>(5);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [waitTimeRating, setWaitTimeRating] = useState<number>(4);
  const [careQualityRating, setCareQualityRating] = useState<number>(5);

  const [userName, setUserName] = useState<string>('');
  const [visitDate, setVisitDate] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');

  // UI state
  const [hoveredStars, setHoveredStars] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize defaults when modal opens or session loads
  useEffect(() => {
    if (isOpen) {
      if (session?.user?.name) {
        setUserName(session.user.name);
      } else if (!userName) {
        setUserName('');
      }

      // Default visit date to today (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      setVisitDate(today);
      setError(null);
      setIsSubmitted(false);
      setIsSubmitting(false);
    }
  }, [isOpen, session]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const getDimensionValue = (key: RatingDimension['key']): number => {
    switch (key) {
      case 'overallRating':
        return overallRating;
      case 'staffRating':
        return staffRating;
      case 'cleanlinessRating':
        return cleanlinessRating;
      case 'waitTimeRating':
        return waitTimeRating;
      case 'careQualityRating':
        return careQualityRating;
    }
  };

  const setDimensionValue = (key: RatingDimension['key'], val: number) => {
    switch (key) {
      case 'overallRating':
        setOverallRating(val);
        break;
      case 'staffRating':
        setStaffRating(val);
        break;
      case 'cleanlinessRating':
        setCleanlinessRating(val);
        break;
      case 'waitTimeRating':
        setWaitTimeRating(val);
        break;
      case 'careQualityRating':
        setCareQualityRating(val);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const trimmedName = userName.trim();
    if (!trimmedName) {
      setError('Please provide your name or initials.');
      return;
    }

    const trimmedReview = reviewText.trim();
    if (trimmedReview.length < 15) {
      setError('Please provide a descriptive review (at least 15 characters).');
      return;
    }

    if (trimmedReview.length > 2000) {
      setError('Review text exceeds maximum limit of 2,000 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newReview: Review = {
        _id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        hospitalId,
        userId: session?.user?.id || `user-guest-${Date.now()}`,
        userName: trimmedName,
        overallRating,
        staffRating,
        cleanlinessRating,
        waitTimeRating,
        careQualityRating,
        reviewText: trimmedReview,
        visitDate: visitDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0
      };

      addReview(newReview);
      onReviewSubmitted?.(newReview);
      setIsSubmitted(true);

      // Auto close after 1.8 seconds on success
      setTimeout(() => {
        setIsSubmitted(false);
        setIsSubmitting(false);
        setReviewText('');
        onClose();
      }, 1800);
    } catch {
      setError('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-hospital-blue-50/50 via-white to-slate-50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-hospital-blue-700 mb-0.5">
              <ShieldCheck className="w-4 h-4 text-hospital-blue-600" />
              <span>Verified Patient Review</span>
            </div>
            <h2 id="review-modal-title" className="text-lg font-bold text-slate-900 line-clamp-1">
              Write a Review for {hospitalName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Review Submitted Successfully!</h3>
              <p className="text-sm text-slate-600 max-w-md">
                Thank you for contributing to Nigeria&apos;s healthcare transparency. Your feedback helps
                other patients make informed choices and dynamically recalculates hospital ratings.
              </p>
            </div>
          ) : (
            <form id="review-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {/* 5-Dimension Rating Sliders & Stars (FR4.1, FR4.3) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                    1. Multi-Dimensional Experience Ratings
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">1 (Poor) to 5 (Excellent)</span>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  {RATING_DIMENSIONS.map((dimension) => {
                    const currentValue = getDimensionValue(dimension.key);
                    const hoveredValue = hoveredStars[dimension.key] || 0;
                    const displayValue = hoveredValue || currentValue;

                    return (
                      <div
                        key={dimension.key}
                        className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-900">
                            {dimension.icon}
                            <span>{dimension.label}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {dimension.description}
                          </p>
                        </div>

                        {/* Interactive Star Buttons & Rating Tag */}
                        <div className="flex items-center gap-2 shrink-0">
                          <div
                            className="flex items-center gap-1"
                            onMouseLeave={() =>
                              setHoveredStars((prev) => ({ ...prev, [dimension.key]: 0 }))
                            }
                          >
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFilled = star <= displayValue;
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setDimensionValue(dimension.key, star)}
                                  onMouseEnter={() =>
                                    setHoveredStars((prev) => ({ ...prev, [dimension.key]: star }))
                                  }
                                  className="p-1 hover:scale-115 active:scale-95 transition-all text-slate-300 hover:text-amber-400 focus:outline-hidden"
                                  aria-label={`Rate ${dimension.label} ${star} of 5 stars`}
                                >
                                  <Star
                                    className={`w-5 h-5 transition-colors ${
                                      isFilled
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-slate-300'
                                    }`}
                                  />
                                </button>
                              );
                            })}
                          </div>

                          <span className="text-xs font-bold text-slate-700 min-w-[70px] text-right">
                            {RATING_LABELS[currentValue]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviewer Details Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="reviewer-name"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Your Name or Alias <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="reviewer-name"
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Amina Bello or Verified Patient"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-blue-500 focus:border-hospital-blue-500 outline-hidden transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Visit Date */}
                <div>
                  <label
                    htmlFor="visit-date"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Approximate Visit Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      id="visit-date"
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-blue-500 focus:border-hospital-blue-500 outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Review Narrative */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="review-text"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                  >
                    Review Comments & Feedback <span className="text-red-500">*</span>
                  </label>
                  <span
                    className={`text-xs font-mono ${
                      reviewText.length > 2000
                        ? 'text-red-600 font-bold'
                        : reviewText.length > 1800
                        ? 'text-amber-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {reviewText.length} / 2,000 characters
                  </span>
                </div>
                <textarea
                  id="review-text"
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Describe your care experience: doctors' responsiveness, emergency triage speed, facility hygiene, HMO approvals, or wait times..."
                  className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-hospital-blue-500 focus:border-hospital-blue-500 outline-hidden transition-all resize-y"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Keep feedback constructive and respectful. Do not include sensitive personal medical records or passwords.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!isSubmitted && (
          <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="review-form"
              disabled={isSubmitting || reviewText.trim().length < 15 || !userName.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-hospital-blue-600 hover:bg-hospital-blue-700 active:scale-95 rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Patient Review</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewModal;
