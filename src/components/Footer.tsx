'use client';

import React from 'react';
import Link from 'next/link';
import {
  Activity,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Building2,
  ExternalLink,
  Scale,
  MapPin,
  Heart,
  FileText,
  AlertTriangle
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      
      {/* 1. National Emergency Hotlines Bar */}
      <section aria-label="Emergency Hotlines" className="bg-gradient-to-r from-emergency-red-900/90 via-slate-900 to-emergency-red-950/90 border-b border-emergency-red-800/40 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emergency-red-600 text-white rounded-xl shadow-lg shadow-emergency-red-900/50">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                  <span>National Emergency Dispatch Hotlines</span>
                  <span className="text-[11px] font-semibold bg-emergency-red-500/30 text-emergency-red-200 border border-emergency-red-400/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    24/7 Rapid Response
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Toll-free emergency lines for police, ambulance, fire, and highway trauma assistance across Nigeria.
                </p>
              </div>
            </div>

            {/* Quick Dial Badges */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
              {/* Hotline 112 */}
              <a
                href="tel:112"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emergency-red-600 hover:bg-emergency-red-700 text-white font-bold text-sm shadow-md transition-all group"
                title="Call 112 - National Emergency Toll-Free"
              >
                <PhoneCall className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                <span>112</span>
                <span className="text-[11px] font-normal text-emergency-red-100">National</span>
              </a>

              {/* Hotline 767 */}
              <a
                href="tel:767"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm shadow-md transition-all group"
                title="Call 767 - Lagos State Emergency Service"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>767</span>
                <span className="text-[11px] font-normal text-slate-300">Lagos State</span>
              </a>

              {/* Hotline 122 */}
              <a
                href="tel:122"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-sm shadow-md transition-all group"
                title="Call 122 - FRSC Highway Emergency Rescue"
              >
                <PhoneCall className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>122</span>
                <span className="text-[11px] font-normal text-slate-300">FRSC Rescue</span>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Main Directory & Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand & Project Summary */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-hospital-blue-500 to-health-emerald-500 text-white shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">
                Hospital<span className="text-hospital-blue-400">Locator</span>
                <span className="text-xs text-emerald-400 ml-1 font-mono">.ng</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              A specialized geospatial discovery platform for verified hospitals, 24/7 trauma emergency departments, and certified medical specialists across Lagos, Abuja, Ibadan, Port Harcourt, Kano, and all 36 Nigerian states.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <span>Federal Republic of Nigeria Medical Directory</span>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                MOH & HEFAMAA Accredited Facilities Only
              </span>
            </div>
          </div>

          {/* Directory Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Facility Discovery
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/hospitals" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-hospital-blue-400" />
                  All Hospitals Directory
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="text-slate-400 hover:text-emergency-red-400 transition-colors flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-emergency-red-400" />
                  Emergency 24/7 Finder
                </Link>
              </li>
              <li>
                <Link href="/compare" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-hospital-blue-400" />
                  Hospital Comparison
                </Link>
              </li>
              <li>
                <Link href="/hospitals?type=Teaching+Hospital" className="text-slate-400 hover:text-white transition-colors">
                  Teaching & Tertiary Hospitals
                </Link>
              </li>
              <li>
                <Link href="/hospitals?type=Federal+Medical+Centre" className="text-slate-400 hover:text-white transition-colors">
                  Federal Medical Centres
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-400 hover:text-hospital-blue-400 transition-colors flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-hospital-blue-400" />
                  About Platform & Research
                </Link>
              </li>
            </ul>
          </div>

          {/* System Portals */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Access Portals
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/dashboard/patient" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  Patient Portal
                </Link>
              </li>
              <li>
                <Link href="/dashboard/representative" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  Facility Representative
                </Link>
              </li>
              <li>
                <Link href="/dashboard/admin" className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  System Administrator
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-slate-400 hover:text-white transition-colors">
                  Sign In to Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-slate-400 hover:text-white transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Regulatory Agencies */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Official Regulators
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="https://health.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Federal Ministry of Health
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ncdc.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  NCDC Nigeria
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://nhia.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  NHIA (Health Insurance)
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://hefamaa.lagosstate.gov.ng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Lagos HEFAMAA
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 3. Official Regulatory & Emergency Disclaimer */}
        <div className="mt-10 p-4 sm:p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-slate-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                Ministry of Health Accreditation & Emergency Dispatch Disclaimer
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">
                Hospital Locator (Nigeria) compiles facility accreditations, emergency department capacities, trauma accreditations, and medical service listings in accordance with Federal Ministry of Health (FMoH) and State Health Facility Monitoring and Accreditation Agency (HEFAMAA) guidelines. While operational hours and status indicators are updated by verified facility representatives, life-threatening emergencies must not wait for online validation. In acute trauma or distress, immediately dial <strong>112</strong> or report directly to the nearest emergency department.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Academic Attribution & Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            <p className="text-slate-400 font-medium">
              CSC Final Year Project — Developed by <span className="text-white font-semibold">Sanni Inuoluwadunsimi</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Department of Computer Science • Geospatial Healthcare Information System (GHIS)
            </p>
          </div>

          <div className="flex items-center gap-4 text-center sm:text-right">
            <span>© {currentYear} Hospital Locator System (Nigeria)</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">Federal Health Portal</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
