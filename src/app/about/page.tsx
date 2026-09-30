import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Heart,
  MapPin,
  Shield,
  Search,
  Star,
  Phone,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  Users,
  Building2,
  Activity,
  Zap,
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'About | Hospital Locator Nigeria',
  description:
    'Learn about Hospital Locator Nigeria — a geospatial healthcare discovery platform built to connect Nigerians with accredited hospitals, emergency care units, and specialist clinics nationwide.',
};

const STATS = [
  { value: '23+', label: 'Hospitals Listed', icon: Building2, color: 'text-hospital-blue-600' },
  { value: '6', label: 'States Covered', icon: MapPin, color: 'text-health-emerald-600' },
  { value: '24/7', label: 'Emergency Data', icon: Activity, color: 'text-emergency-red-600' },
  { value: '5', label: 'Trauma Levels Tracked', icon: Shield, color: 'text-purple-600' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & Filter',
    desc: 'Enter your location or select a Nigerian city. Filter by specialty, facility type, insurance (HMO/NHIS), or emergency capability.',
    icon: Search,
    color: 'bg-hospital-blue-100 text-hospital-blue-600',
  },
  {
    step: '02',
    title: 'Discover & Compare',
    desc: 'View hospitals on an interactive Leaflet map with real distance and travel-time estimates. Compare up to 3 hospitals side-by-side across 20+ attributes.',
    icon: MapPin,
    color: 'bg-health-emerald-100 text-health-emerald-600',
  },
  {
    step: '03',
    title: 'Connect & Act',
    desc: 'Call the hospital directly, get navigation directions, read verified patient reviews, or call national emergency lines 112 / 767 / 122.',
    icon: Phone,
    color: 'bg-emergency-red-100 text-emergency-red-600',
  },
];

const TECH_STACK = [
  { name: 'Next.js 15', desc: 'App Router, SSR, TypeScript', color: 'bg-black text-white' },
  { name: 'Tailwind CSS', desc: 'Custom medical design system', color: 'bg-sky-500 text-white' },
  { name: 'Leaflet.js', desc: 'Interactive geospatial maps', color: 'bg-green-600 text-white' },
  { name: 'NextAuth.js', desc: 'JWT session & role auth', color: 'bg-purple-600 text-white' },
  { name: 'Lucide React', desc: 'Accessible icon system', color: 'bg-orange-500 text-white' },
  { name: 'Haversine', desc: 'Real-world distance engine', color: 'bg-slate-700 text-white' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-hospital-blue-700 to-hospital-blue-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-hospital-blue-200 text-sm font-semibold uppercase tracking-widest">About This Platform</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
            Making Delta State & Nigerian Healthcare<br className="hidden sm:block" /> Discoverable for Everyone
          </h1>
          <p className="text-hospital-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed">
            Hospital Locator Nigeria is a geospatial healthcare discovery platform centered in Delta State,
            connecting students, families, and residents with accredited hospitals, emergency trauma units,
            and NHIS/HMO-verified facilities — across Asaba, Warri, Oghara, Abraka, Agbor, and nationwide.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              href="/hospitals"
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-hospital-blue-700 rounded-xl font-semibold text-sm hover:bg-hospital-blue-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              Find a Hospital
            </Link>
            <Link
              href="/emergency"
              className="flex items-center gap-2 px-5 py-2.5 bg-emergency-red-600 text-white rounded-xl font-semibold text-sm hover:bg-emergency-red-700 transition-colors"
            >
              <Zap className="w-4 h-4" />
              Emergency Finder
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Disclaimer */}
      <div className="bg-emergency-red-50 border-b border-emergency-red-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-emergency-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-emergency-red-700 text-xs sm:text-sm">
            <strong>Emergency Disclaimer:</strong> This platform is a healthcare discovery tool. In life-threatening
            emergencies, always call <strong>112</strong> (National Emergency) or <strong>767</strong> (Federal Fire
            Service) directly. Do not wait to search this platform.
          </p>
        </div>
      </div>

      {/* Stats */}
      <section className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 text-center shadow-sm">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-500 text-xs sm:text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <span className="text-health-emerald-600 text-xs font-bold uppercase tracking-widest">The Problem</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-4">
                Finding the Right Hospital in Nigeria Shouldn&apos;t Be This Hard
              </h2>
              <p className="text-slate-600 mb-4 leading-relaxed">
                Nigeria has over 34,000 health facilities, but patients — especially in emergencies —
                often cannot quickly identify the nearest hospital with the right capability. Trauma
                levels, 24/7 availability, HMO acceptance, and specialist availability are rarely
                discoverable in one place.
              </p>
              <p className="text-slate-600 leading-relaxed">
                This platform aggregates, verifies, and geospatially indexes key healthcare data so
                that any Nigerian — urban or semi-urban — can make an informed decision in seconds,
                not hours.
              </p>
            </div>
            <div className="space-y-3">
              {[
                'Finding the nearest 24/7 emergency hospital',
                'Knowing which hospitals accept your HMO',
                'Identifying trauma levels before arrival',
                'Comparing hospitals without calling each one',
                'Getting real patient reviews, not just listings',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle className="w-4 h-4 text-health-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="text-hospital-blue-600 text-xs font-bold uppercase tracking-widest">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Three Steps to the Right Care</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-black text-slate-200">{step.step}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-health-emerald-600 text-xs font-bold uppercase tracking-widest">Our Data</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">How We Source &amp; Verify Hospital Data</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: Shield, title: 'Government Accreditation', desc: 'Hospitals are cross-referenced with Federal Ministry of Health and state health authority listings.' },
              { icon: Star, title: 'Patient Reviews', desc: 'Multi-dimensional ratings (staff, cleanliness, wait time, care quality) from verified visits.' },
              { icon: Users, title: 'Facility Representatives', desc: 'Claimed facilities allow authorized representatives to update contact info, hours, and emergency status in real-time.' },
              { icon: MapPin, title: 'Geospatial Accuracy', desc: 'GPS coordinates are verified to within 100m using satellite imagery and on-ground confirmation.' },
              { icon: Activity, title: 'Live Emergency Status', desc: 'Facility representatives can update ER capacity (accepting / limited / critical) and this reflects immediately in search results.' },
              { icon: CheckCircle, title: 'Ongoing Curation', desc: 'Data is reviewed quarterly. Stale or unverified listings are flagged and escalated to the admin team.' },
            ].map((item) => (
              <div key={item.title} className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-hospital-blue-300 hover:shadow-sm transition-all">
                <item.icon className="w-5 h-5 text-hospital-blue-600 mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 sm:py-20 bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-hospital-blue-400 text-xs font-bold uppercase tracking-widest">Built With</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">Technology Stack</h2>
            <p className="text-slate-400 text-sm mt-2">Production-grade technologies chosen for performance, accessibility, and developer clarity</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {TECH_STACK.map((tech) => (
              <div key={tech.name} className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-500 transition-colors">
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-2 ${tech.color}`}>{tech.name}</span>
                <p className="text-slate-400 text-xs">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About the Project */}
      <section className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-hospital-blue-50 to-health-emerald-50 border border-hospital-blue-200 rounded-3xl p-6 sm:p-10">
            <span className="text-hospital-blue-600 text-xs font-bold uppercase tracking-widest">Academic Project</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 mb-4">
              Hospital Locator Nigeria — CSC Final Project
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              This platform was researched and engineered within Delta State as a Computer Science (CSC) final year project,
              demonstrating real-world system analysis, design principles, and geospatial indexing — including a full ERD,
              use case analysis, functional requirements specification, and 3-tier application architecture.
            </p>
            <p className="text-slate-700 leading-relaxed mb-6">
              With Delta State as our primary epicenter (covering FMC Asaba, DELSUTH Oghara, Central Hospital Warri, and community health centers),
              the system addresses Nigeria&apos;s critical healthcare accessibility gap by connecting patients directly to verified 24/7 emergency capacity.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/kotades/hospital-locator-nigeria"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                View Source Code
              </a>
              <Link
                href="/hospitals"
                className="flex items-center gap-2 px-4 py-2.5 bg-hospital-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-hospital-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Explore the App
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">Questions or Feedback?</h2>
          <p className="text-slate-600 text-sm mb-6">
            This is an academic project. For questions about data accuracy, hospital listings, or the platform architecture, reach out via GitHub.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://github.com/kotades/hospital-locator-nigeria/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              Open an Issue
            </a>
            <Link
              href="/hospitals"
              className="flex items-center gap-2 px-5 py-2.5 border border-hospital-blue-300 text-hospital-blue-700 rounded-xl text-sm font-semibold hover:bg-hospital-blue-50 transition-colors"
            >
              <Search className="w-4 h-4" />
              Find Hospitals
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
