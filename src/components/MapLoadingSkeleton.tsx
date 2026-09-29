'use client';

import React from 'react';
import { MapPin, Navigation, ShieldCheck } from 'lucide-react';

export interface MapLoadingSkeletonProps {
  height?: string | number;
  className?: string;
  message?: string;
}

export function MapLoadingSkeleton({
  height = '500px',
  className = '',
  message = 'Loading interactive Nigeria hospital map...'
}: MapLoadingSkeletonProps) {
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      style={{ height: heightStyle }}
      className={`relative w-full rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
      aria-busy="true"
      aria-label="Loading map"
    >
      {/* Background simulated coordinate grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-70" />

      {/* Floating map skeleton controls: Zoom controls placeholder */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <div className="w-9 h-9 rounded-lg bg-white/90 border border-slate-200 shadow-sm animate-pulse" />
        <div className="w-9 h-9 rounded-lg bg-white/90 border border-slate-200 shadow-sm animate-pulse" />
      </div>

      {/* Floating map skeleton controls: Recenter button placeholder */}
      <div className="absolute top-4 right-4 z-10">
        <div className="w-36 h-9 rounded-xl bg-white/90 border border-slate-200 shadow-sm animate-pulse" />
      </div>

      {/* Center radar pulse & medical beacon */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-sky-200/50 animate-ping opacity-60" />
          <div className="absolute w-14 h-14 rounded-full bg-hospital-blue-100/80 animate-pulse" />
          <div className="absolute w-12 h-12 rounded-full bg-hospital-blue-600 text-white flex items-center justify-center shadow-lg shadow-hospital-blue-600/30">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>
        </div>

        <h3 className="font-bold text-slate-800 text-sm tracking-tight sm:text-base">
          {message}
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Calibrating GPS coordinates, trauma centers & real-time emergency capacity
        </p>

        {/* Small pulsing badges */}
        <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-400 font-medium">
          <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
            <Navigation className="w-3 h-3 text-hospital-blue-500 animate-spin" />
            <span>OpenStreetMap</span>
          </span>
          <span className="inline-flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>FMOH / HEFAMAA Verified</span>
          </span>
        </div>
      </div>

      {/* Bottom map skeleton status bar */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-xs text-slate-400">
        <div className="w-24 h-4 rounded bg-white/80 border border-slate-200 animate-pulse" />
        <div className="w-36 h-4 rounded bg-white/80 border border-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

export default MapLoadingSkeleton;
