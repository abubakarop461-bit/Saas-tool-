"use client";

import React from 'react';
import { Database, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-1 w-full min-h-[70vh] flex flex-col items-center justify-center p-8 text-center animate-fade-in select-none">
      {/* Porcelain Loading Container */}
      <div className="bg-white border border-[#e8e7e4] rounded-2xl p-8 max-w-sm w-full shadow-sm flex flex-col items-center space-y-4">
        
        {/* Animated Gold Ring & Logo */}
        <div className="relative flex items-center justify-center h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-100 border-t-[#d4ad4d] animate-spin" />
          <img 
            src="/luxe-logo.png" 
            alt="Luxe Logo" 
            className="h-9 w-auto object-contain opacity-90"
          />
        </div>

        {/* Title and message */}
        <div className="space-y-1 text-center">
          <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">
            Loading CRM Records
          </h3>
          <p className="text-[11px] text-zinc-500 font-medium">
            Fetching real-time data & pipeline metrics
          </p>
        </div>

        {/* Cloudflare D1 Connection Live Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Connected to Cloudflare D1 Database</span>
        </div>

      </div>
    </div>
  );
}
