'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Hospital,
  Users,
  FileCheck,
  BarChart3,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Shield,
  AlertTriangle,
  Trash2,
  Edit2,
  Search,
  ChevronRight,
  Activity,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Hospital as HospitalType } from '@/types';
import Link from 'next/link';

const TABS = [
  { id: 'overview',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'hospitals',   label: 'Hospitals',    icon: Hospital },
  { id: 'claims',      label: 'Claims',       icon: FileCheck },
  { id: 'users',       label: 'Users',        icon: Users },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart3 },
  { id: 'moderation',  label: 'Moderation',   icon: Eye },
] as const;
type TabId = typeof TABS[number]['id'];

const DEMO_USERS = [
  { id: 'user-patient-1', name: 'Amara Okonkwo',    email: 'patient@demo.com',  role: 'patient',        status: 'active',   joined: '2026-07-12' },
  { id: 'user-rep-1',     name: 'Dr. Adeyemi Adeleke', email: 'rep@demo.com',   role: 'representative', status: 'active',   joined: '2026-08-01' },
  { id: 'user-admin-1',   name: 'System Admin',     email: 'admin@demo.com',    role: 'admin',          status: 'active',   joined: '2026-01-01' },
  { id: 'user-rep-2',     name: 'Dr. Babatunde Sanusi', email: 'sanusi@firstcardiology.ng', role: 'representative', status: 'pending', joined: '2026-09-18' },
];

export default function AdminDashboard() {
  const {
    hospitals,
    reviews,
    claims,
    approveClaim,
    rejectClaim,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [exportSuccess, setExportSuccess] = useState('');

  const filteredHospitals = useMemo(() =>
    hospitals.filter((h) =>
      h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
      h.city.toLowerCase().includes(hospitalSearch.toLowerCase())
    ),
    [hospitals, hospitalSearch]
  );

  const pendingClaims  = claims.filter((c) => c.status === 'pending');
  const approvedClaims = claims.filter((c) => c.status === 'approved');
  const rejectedClaims = claims.filter((c) => c.status === 'rejected');

  function exportData(format: 'json' | 'csv') {
    const data = hospitals.map((h) => ({
      id: h._id, name: h.name, city: h.city, state: h.state,
      type: h.facilityType, emergency: h.emergency24Hours,
      rating: h.averageRating, reviews: h.totalReviews,
      verified: h.verified,
    }));
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'hospitals.json'; a.click();
    } else {
      const keys = Object.keys(data[0]) as (keyof typeof data[0])[];
      const csv = [keys.join(','), ...data.map((row) => keys.map((k) => `"${row[k]}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'hospitals.csv'; a.click();
    }
    setExportSuccess(`Exported ${hospitals.length} hospitals as ${format.toUpperCase()}`);
    setTimeout(() => setExportSuccess(''), 3000);
  }

  const avgRating = hospitals.reduce((s, h) => s + h.averageRating, 0) / hospitals.length;
  const emergencyCount = hospitals.filter((h) => h.emergency24Hours).length;
  const verifiedCount  = hospitals.filter((h) => h.verified).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-rose-900 px-4 py-10">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-red-200 text-xs uppercase tracking-wider mb-1">System Administrator</p>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-red-200 text-sm">Hospital Locator Nigeria — Control Panel</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 bg-gray-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors relative ${
                activeTab === id ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'claims' && pendingClaims.length > 0 && (
                <span className="absolute -top-0.5 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {pendingClaims.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── DASHBOARD OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Hospitals', value: hospitals.length, color: 'text-blue-400',   icon: Hospital   },
                { label: 'Verified',         value: verifiedCount,   color: 'text-green-400',  icon: CheckCircle },
                { label: '24/7 Emergency',   value: emergencyCount,  color: 'text-red-400',    icon: Activity   },
                { label: 'Avg Rating',        value: avgRating.toFixed(2), color: 'text-yellow-400', icon: Star },
              ].map((s) => (
                <div key={s.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-gray-400 text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Claim queue preview */}
            {pendingClaims.length > 0 && (
              <div className="bg-yellow-950/20 border border-yellow-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-yellow-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {pendingClaims.length} Pending Claim{pendingClaims.length !== 1 ? 's' : ''}
                  </h3>
                  <button onClick={() => setActiveTab('claims')} className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1">
                    Review all <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {pendingClaims.slice(0, 2).map((c) => (
                  <div key={c._id} className="flex items-center justify-between text-sm py-2 border-b border-yellow-900/30 last:border-0">
                    <span className="text-gray-300">{c.hospitalName}</span>
                    <span className="text-yellow-400">{c.userName}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quick stats by city */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="font-semibold mb-4">Hospitals by City</h3>
              <div className="space-y-3">
                {Object.entries(
                  hospitals.reduce((acc, h) => { acc[h.city] = (acc[h.city] ?? 0) + 1; return acc; }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([city, count]) => (
                    <div key={city} className="flex items-center gap-3">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-300 text-sm w-28">{city}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(count / hospitals.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-white text-sm font-semibold w-6 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HOSPITALS ── */}
        {activeTab === 'hospitals' && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search hospitals…"
                  value={hospitalSearch}
                  onChange={(e) => setHospitalSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
              </div>
            </div>

            {exportSuccess && (
              <div className="flex items-center gap-2 bg-green-900/20 border border-green-700 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
                <CheckCircle className="w-4 h-4" /> {exportSuccess}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 border-b border-gray-800">
                  <tr>
                    {['Hospital', 'City', 'Type', 'ER', 'Status', 'Rating', 'Verified', ''].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredHospitals.map((h) => (
                    <tr key={h._id} className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <Link href={`/hospitals/${h._id}`} className="text-white hover:text-blue-400 font-medium line-clamp-1 max-w-[200px]">
                          {h.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{h.city}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{h.facilityType}</td>
                      <td className="py-3 px-4">
                        {h.emergency24Hours
                          ? <span className="text-green-400 text-xs font-medium">✓ 24/7</span>
                          : <span className="text-gray-600 text-xs">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium capitalize ${
                          h.emergencyStatus === 'accepting' ? 'text-green-400' :
                          h.emergencyStatus === 'limited'   ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {h.emergencyStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                          <Star className="w-3 h-3 fill-yellow-400" />
                          {h.averageRating.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {h.verified
                          ? <CheckCircle className="w-4 h-4 text-green-400" />
                          : <XCircle className="w-4 h-4 text-gray-600" />}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/hospitals/${h._id}`} className="text-blue-400 hover:text-blue-300">
                          <Edit2 className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CLAIMS ── */}
        {activeTab === 'claims' && (
          <div>
            <div className="flex items-center gap-4 mb-5">
              {[
                { label: 'Pending',  count: pendingClaims.length,  color: 'text-yellow-400' },
                { label: 'Approved', count: approvedClaims.length, color: 'text-green-400' },
                { label: 'Rejected', count: rejectedClaims.length, color: 'text-red-400' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-2.5 flex items-center gap-2">
                  <span className={`font-bold ${s.color}`}>{s.count}</span>
                  <span className="text-gray-400 text-sm">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim._id}
                  className={`bg-gray-900 rounded-2xl border p-5 ${
                    claim.status === 'pending'  ? 'border-yellow-800' :
                    claim.status === 'approved' ? 'border-green-800' : 'border-red-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                          claim.status === 'pending'  ? 'bg-yellow-900/50 text-yellow-400' :
                          claim.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {claim.status}
                        </span>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(claim.createdAt).toLocaleDateString('en-NG')}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold">{claim.hospitalName}</h3>
                      <div className="text-gray-400 text-sm mt-1">
                        {claim.userName} · {claim.position}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">{claim.userEmail}</div>
                      <div className="text-blue-400 text-xs mt-1 flex items-center gap-1">
                        <FileCheck className="w-3 h-3" />
                        {claim.documentName}
                      </div>
                      {claim.rejectionReason && (
                        <div className="text-red-400 text-xs mt-2">
                          <strong>Rejected:</strong> {claim.rejectionReason}
                        </div>
                      )}
                    </div>

                    {claim.status === 'pending' && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => approveClaim(claim._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-xl text-xs font-medium transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                        {rejectingId === claim._id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Rejection reason…"
                              className="text-xs px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white w-48 focus:outline-none"
                            />
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => { rejectClaim(claim._id, rejectReason); setRejectingId(null); setRejectReason(''); }}
                                className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600 text-white rounded-lg"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setRejectingId(null)}
                                className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRejectingId(claim._id)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-900/50 hover:bg-red-700 text-red-400 hover:text-white border border-red-800 rounded-xl text-xs font-medium transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              User Management ({DEMO_USERS.length})
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 border-b border-gray-800">
                  <tr>
                    {['User', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
                      <th key={h} className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wider font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DEMO_USERS.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {user.name[0]}
                          </div>
                          <span className="text-white font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                          user.role === 'admin'          ? 'bg-red-900/40 text-red-400' :
                          user.role === 'representative' ? 'bg-purple-900/40 text-purple-400' :
                          'bg-blue-900/40 text-blue-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium ${user.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
                          ● {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{user.joined}</td>
                      <td className="py-3 px-4">
                        <button className="text-gray-500 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Hospitals',   value: hospitals.length,      icon: Hospital,   color: 'text-blue-400' },
                { label: 'Total Reviews',     value: reviews.length,         icon: Star,       color: 'text-yellow-400' },
                { label: 'Emergency 24/7',    value: emergencyCount,         icon: Activity,   color: 'text-red-400' },
                { label: 'Avg System Rating', value: avgRating.toFixed(2),   icon: TrendingUp, color: 'text-green-400' },
                { label: 'Total Claims',      value: claims.length,          icon: FileCheck,  color: 'text-purple-400' },
                { label: 'Verified Hospitals',value: verifiedCount,          icon: Shield,     color: 'text-teal-400' },
              ].map((m) => (
                <div key={m.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                  <m.icon className={`w-5 h-5 mb-3 ${m.color}`} />
                  <div className={`text-3xl font-bold ${m.color}`}>{m.value}</div>
                  <div className="text-gray-400 text-sm mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facility Type breakdown */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="font-semibold mb-4">Hospitals by Facility Type</h3>
                {Object.entries(
                  hospitals.reduce((acc, h) => { acc[h.facilityType] = (acc[h.facilityType] ?? 0) + 1; return acc; }, {} as Record<string, number>)
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center gap-3 mb-2.5">
                      <span className="text-gray-400 text-xs w-36 truncate" title={type}>{type}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(count / hospitals.length) * 100}%` }} />
                      </div>
                      <span className="text-white text-xs font-semibold w-5 text-right">{count}</span>
                    </div>
                  ))}
              </div>

              {/* Trauma Level breakdown */}
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h3 className="font-semibold mb-4">Trauma Level Distribution</h3>
                {['Level I', 'Level II', 'Level III', 'None'].map((level) => {
                  const count = hospitals.filter((h) => h.traumaLevel === level).length;
                  const colors: Record<string, string> = {
                    'Level I': 'bg-red-500', 'Level II': 'bg-orange-500', 'Level III': 'bg-yellow-500', 'None': 'bg-gray-600',
                  };
                  return (
                    <div key={level} className="flex items-center gap-3 mb-2.5">
                      <span className="text-gray-400 text-xs w-20">{level}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[level]} rounded-full`} style={{ width: `${(count / hospitals.length) * 100}%` }} />
                      </div>
                      <span className="text-white text-xs font-semibold w-5 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-400" />
                Data Export
              </h3>
              {exportSuccess && (
                <div className="flex items-center gap-2 bg-green-900/20 border border-green-700 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
                  <CheckCircle className="w-4 h-4" /> {exportSuccess}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => exportData('json')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Export JSON
                </button>
                <button
                  onClick={() => exportData('csv')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODERATION ── */}
        {activeTab === 'moderation' && (
          <div>
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-400" />
              Content Moderation ({reviews.length} Reviews)
            </h2>
            <div className="space-y-4">
              {reviews.slice(0, 10).map((review) => {
                const h = hospitals.find((hosp) => hosp._id === review.hospitalId);
                return (
                  <div key={review._id} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">{review.userName}</span>
                          <span className="text-gray-500 text-xs">→</span>
                          <Link href={`/hospitals/${review.hospitalId}`} className="text-blue-400 text-xs hover:underline truncate">
                            {h?.name ?? 'Unknown'}
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`w-3 h-3 ${s <= review.overallRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                          ))}
                          <span className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString('en-NG')}</span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">{review.reviewText}</p>
                      </div>
                      <button className="text-red-500 hover:text-red-400 flex-shrink-0" title="Flag review">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {reviews.length > 10 && (
                <p className="text-center text-gray-500 text-sm py-4">
                  Showing 10 of {reviews.length} reviews
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
