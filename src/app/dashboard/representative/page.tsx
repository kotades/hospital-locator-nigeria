'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Building2,
  Activity,
  MessageSquare,
  BarChart3,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Phone,
  Mail,
  Globe,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Save,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { EmergencyStatus } from '@/types';

const TABS = [
  { id: 'overview',   label: 'Overview',        icon: Building2 },
  { id: 'emergency',  label: 'Emergency Status', icon: Zap },
  { id: 'details',    label: 'Edit Details',     icon: Edit2 },
  { id: 'reviews',    label: 'Reviews',          icon: MessageSquare },
  { id: 'analytics',  label: 'Analytics',        icon: BarChart3 },
  { id: 'claim',      label: 'Claim Facility',   icon: FileCheck },
] as const;
type TabId = typeof TABS[number]['id'];

const STATUS_OPTIONS: { value: EmergencyStatus; label: string; color: string; dot: string }[] = [
  { value: 'accepting', label: 'Accepting Patients', color: 'border-green-500 bg-green-900/20', dot: 'bg-green-500' },
  { value: 'limited',   label: 'Limited Capacity',   color: 'border-yellow-500 bg-yellow-900/20', dot: 'bg-yellow-500 animate-pulse' },
  { value: 'critical',  label: 'Critical – Full',    color: 'border-red-600 bg-red-900/20', dot: 'bg-red-600 animate-pulse' },
];

export default function RepresentativeDashboard() {
  const { data: session } = useSession();
  const {
    hospitals,
    reviews,
    claims,
    updateHospitalEmergencyStatus,
    updateHospitalDetails,
    respondToReview,
    submitClaim,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Facility Representative manages Federal Medical Centre (FMC), Asaba, Delta State
  const managedHospitalId = (session?.user as any)?.hospitalId ?? 'hosp-fmc-asaba';
  const hospital = hospitals.find((h) => h._id === managedHospitalId) ?? hospitals[0];

  const myReviews = useMemo(
    () => reviews.filter((r) => r.hospitalId === hospital?._id),
    [reviews, hospital]
  );

  // Details edit state
  const [editPhone, setEditPhone]   = useState(hospital?.phoneNumbers[0] ?? '');
  const [editEmail, setEditEmail]   = useState(hospital?.email ?? '');
  const [editWebsite, setEditWebsite] = useState(hospital?.website ?? '');
  const [editHours, setEditHours]   = useState(hospital?.operatingHours ?? '');
  const [editSaved, setEditSaved]   = useState(false);

  // Review response
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  // Claim state
  const [claimPos, setClaimPos]   = useState('');
  const [claimDoc, setClaimDoc]   = useState('');
  const [claimSent, setClaimSent] = useState(false);

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-700" />
          <p className="text-gray-400">No managed facility found.</p>
        </div>
      </div>
    );
  }

  function saveDetails() {
    updateHospitalDetails(hospital!._id, {
      phoneNumbers: [editPhone],
      email: editEmail,
      website: editWebsite,
      operatingHours: editHours,
    });
    setEditSaved(true);
    setTimeout(() => setEditSaved(false), 3000);
  }

  function submitResponse(reviewId: string) {
    respondToReview(reviewId, responseText);
    setRespondingTo(null);
    setResponseText('');
  }

  const avgRating = myReviews.length
    ? myReviews.reduce((s, r) => s + r.overallRating, 0) / myReviews.length
    : 0;

  const claimForHospital = claims.find((c) => c.hospitalId === hospital._id);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-purple-300 text-xs uppercase tracking-wider mb-1">Facility Representative</p>
              <h1 className="text-2xl font-bold">{hospital.name}</h1>
              <p className="text-purple-200 text-sm">{hospital.city}, {hospital.state}</p>
              <div className="flex items-center gap-2 mt-2">
                {hospital.verified && (
                  <span className="flex items-center gap-1 text-xs bg-green-900/40 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
                {hospital.claimedBy && (
                  <span className="flex items-center gap-1 text-xs bg-purple-900/40 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full">
                    <Shield className="w-3 h-3" /> Claimed
                  </span>
                )}
              </div>
            </div>
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
                activeTab === id ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-5 sm:py-8">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Reviews', value: myReviews.length, color: 'text-yellow-400' },
                { label: 'Avg Rating',    value: avgRating.toFixed(1), color: 'text-blue-400' },
                { label: 'Unanswered',    value: myReviews.filter((r) => !r.response).length, color: 'text-orange-400' },
                { label: 'ER Status',     value: hospital.emergencyStatus, color: 'text-green-400' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                  <div className={`text-2xl font-bold capitalize ${s.color}`}>{s.value}</div>
                  <div className="text-gray-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Update ER Status', icon: Zap, tab: 'emergency' as TabId, color: 'bg-red-900/30 border-red-800 hover:border-red-600 text-red-400' },
                  { label: 'Edit Contact Info', icon: Edit2, tab: 'details' as TabId, color: 'bg-blue-900/30 border-blue-800 hover:border-blue-600 text-blue-400' },
                  { label: 'Respond to Reviews', icon: MessageSquare, tab: 'reviews' as TabId, color: 'bg-yellow-900/30 border-yellow-800 hover:border-yellow-600 text-yellow-400' },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setActiveTab(action.tab)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium transition-all ${action.color}`}
                  >
                    <action.icon className="w-5 h-5 flex-shrink-0" />
                    {action.label}
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── EMERGENCY STATUS ── */}
        {activeTab === 'emergency' && (
          <div className="max-w-lg space-y-6">
            <div className="bg-red-950/20 border border-red-900 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                <AlertTriangle className="w-5 h-5" />
                Live Emergency Status
              </div>
              <p className="text-gray-400 text-sm">
                Changes take effect immediately site-wide. Patients searching for emergency care will see this status in real-time.
              </p>
            </div>

            <div className="space-y-3">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = hospital.emergencyStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateHospitalEmergencyStatus(hospital._id, opt.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                      isActive ? opt.color : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 ${isActive ? opt.dot : 'bg-gray-600'}`} />
                    <div>
                      <div className="text-white font-semibold">{opt.label}</div>
                      <div className="text-gray-400 text-xs">
                        {opt.value === 'accepting' && 'All emergency beds available, staff on duty'}
                        {opt.value === 'limited' && 'Some capacity remaining — prioritize critical cases'}
                        {opt.value === 'critical' && 'No capacity — redirect non-critical patients'}
                      </div>
                    </div>
                    {isActive && <CheckCircle className="w-5 h-5 text-green-400 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-xs text-gray-500">
              <strong className="text-gray-400">Current status:</strong>{' '}
              <span className="capitalize font-medium text-white">{hospital.emergencyStatus}</span>{' '}
              · Last updated: {new Date().toLocaleTimeString('en-NG')}
            </div>
          </div>
        )}

        {/* ── EDIT DETAILS ── */}
        {activeTab === 'details' && (
          <div className="max-w-xl space-y-5">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h2 className="font-semibold mb-5 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                Edit Facility Details
              </h2>
              {editSaved && (
                <div className="flex items-center gap-2 text-green-400 text-sm mb-4 bg-green-900/20 border border-green-800 rounded-xl px-4 py-3">
                  <CheckCircle className="w-4 h-4" /> Changes saved successfully
                </div>
              )}
              <div className="space-y-4">
                {[
                  { label: 'Phone Number', icon: Phone, value: editPhone, onChange: setEditPhone, placeholder: '+234 1 234 5600' },
                  { label: 'Email Address', icon: Mail, value: editEmail, onChange: setEditEmail, placeholder: 'info@hospital.ng' },
                  { label: 'Website', icon: Globe, value: editWebsite, onChange: setEditWebsite, placeholder: 'https://hospital.ng' },
                  { label: 'Operating Hours', icon: Clock, value: editHours, onChange: setEditHours, placeholder: 'Mon-Sun: 24 Hours' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-1.5">
                      <field.icon className="w-3.5 h-3.5 text-gray-500" />
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                ))}
                <button
                  onClick={saveDetails}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold transition-colors mt-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-yellow-400" />
              Patient Reviews ({myReviews.length})
            </h2>
            {myReviews.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-700" />
                <p>No reviews yet for this facility</p>
              </div>
            )}
            <div className="space-y-4">
              {myReviews.map((review) => (
                <div key={review._id} className={`bg-gray-900 rounded-2xl border p-4 ${!review.response ? 'border-orange-800' : 'border-gray-800'}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                          {review.userName[0]}
                        </div>
                        <span className="text-white font-medium text-sm">{review.userName}</span>
                        {!review.response && (
                          <span className="text-xs bg-orange-900/30 text-orange-400 border border-orange-800 px-2 py-0.5 rounded-full">
                            Needs Response
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= review.overallRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm mb-3">{review.reviewText}</p>

                  {review.response && (
                    <div className="bg-purple-900/20 border border-purple-800 rounded-xl p-3 mb-3 text-xs text-purple-200">
                      <strong className="text-purple-400">Your Response:</strong> {review.response}
                    </div>
                  )}

                  {!review.response && respondingTo !== review._id && (
                    <button
                      onClick={() => setRespondingTo(review._id ?? '')}
                      className="text-xs flex items-center gap-1.5 text-purple-400 hover:text-purple-300"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reply as Facility
                    </button>
                  )}

                  {respondingTo === review._id && (
                    <div className="space-y-2">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a professional response on behalf of the facility…"
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitResponse(review._id ?? '')}
                          disabled={!responseText.trim()}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
                        >
                          Post Response
                        </button>
                        <button
                          onClick={() => setRespondingTo(null)}
                          className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Reviews', value: myReviews.length, trend: '+12%', icon: Star },
                { label: 'Avg Rating',    value: avgRating.toFixed(2), trend: '+0.3', icon: TrendingUp },
                { label: 'Response Rate', value: `${myReviews.length ? Math.round((myReviews.filter((r) => r.response).length / myReviews.length) * 100) : 0}%`, trend: 'Active', icon: Activity },
              ].map((metric) => (
                <div key={metric.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <metric.icon className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-green-400 font-medium">{metric.trend}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{metric.value}</div>
                  <div className="text-gray-400 text-sm mt-1">{metric.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="font-semibold mb-4">Rating Breakdown</h3>
              {['overallRating', 'staffRating', 'cleanlinessRating', 'waitTimeRating', 'careQualityRating'].map((key) => {
                const avg = myReviews.length
                  ? myReviews.reduce((s, r) => s + ((r as any)[key] as number), 0) / myReviews.length
                  : 0;
                const label = key.replace('Rating', '').replace(/([A-Z])/g, ' $1').replace('overall ', 'Overall ');
                return (
                  <div key={key} className="flex items-center gap-3 mb-3">
                    <span className="text-gray-400 text-sm w-28 capitalize">{label}</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${(avg / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-white text-sm font-semibold w-8">{avg.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CLAIM ── */}
        {activeTab === 'claim' && (
          <div className="max-w-lg">
            {claimForHospital ? (
              <div className={`rounded-2xl border p-6 ${
                claimForHospital.status === 'approved' ? 'border-green-700 bg-green-900/20' :
                claimForHospital.status === 'pending'  ? 'border-yellow-700 bg-yellow-900/20' :
                'border-red-700 bg-red-900/20'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck className={`w-6 h-6 ${
                    claimForHospital.status === 'approved' ? 'text-green-400' :
                    claimForHospital.status === 'pending'  ? 'text-yellow-400' : 'text-red-400'
                  }`} />
                  <h2 className="font-semibold text-white">Claim {claimForHospital.status === 'approved' ? 'Approved' : claimForHospital.status === 'pending' ? 'Under Review' : 'Rejected'}</h2>
                </div>
                <div className="text-gray-300 text-sm space-y-2">
                  <p><strong className="text-gray-400">Submitted:</strong> {new Date(claimForHospital.createdAt).toLocaleDateString('en-NG')}</p>
                  <p><strong className="text-gray-400">Position:</strong> {claimForHospital.position}</p>
                  <p><strong className="text-gray-400">Document:</strong> {claimForHospital.documentName}</p>
                  {claimForHospital.rejectionReason && (
                    <p className="text-red-400"><strong className="text-red-300">Rejection Reason:</strong> {claimForHospital.rejectionReason}</p>
                  )}
                </div>
              </div>
            ) : claimSent ? (
              <div className="text-center py-10">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Claim Submitted!</h2>
                <p className="text-gray-400 text-sm">Your claim is under review. You&apos;ll be notified within 3–5 business days.</p>
              </div>
            ) : (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-400" />
                  Claim This Facility
                </h2>
                <p className="text-gray-400 text-sm mb-5">
                  Submit a claim to gain management access to {hospital.name}. Provide your official position and supporting documentation.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Your Position / Title</label>
                    <input
                      type="text"
                      value={claimPos}
                      onChange={(e) => setClaimPos(e.target.value)}
                      placeholder="e.g. Chief Medical Director"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Supporting Document Name</label>
                    <input
                      type="text"
                      value={claimDoc}
                      onChange={(e) => setClaimDoc(e.target.value)}
                      placeholder="e.g. CAC_Certificate.pdf"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      submitClaim({
                        hospitalId: hospital._id,
                        hospitalName: hospital.name,
                        userId: (session?.user as any)?.id ?? 'user-rep-1',
                        userName: session?.user?.name ?? 'Facility Representative',
                        userEmail: session?.user?.email ?? 'rep@hospital.ng',
                        position: claimPos,
                        documentName: claimDoc,
                      });
                      setClaimSent(true);
                    }}
                    disabled={!claimPos || !claimDoc}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors"
                  >
                    Submit Claim
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
