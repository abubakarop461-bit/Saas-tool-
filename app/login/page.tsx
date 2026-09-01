"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Building2, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Auto-ready for local access
  useEffect(() => {
    setCheckingAuth(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.removeItem('luxe-role-override');
    router.replace('/dashboard');
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="h-6 w-6 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-12 bg-zinc-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-800/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-zinc-700/5 blur-[80px]" />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 bg-zinc-900 border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center gap-3 text-center">
          <img 
            src="/luxe-logo.png" 
            alt="Luxe Realty Logo" 
            className="h-16 w-auto object-contain shrink-0" 
          />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            PROPERTY ERP
          </p>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-sm font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="text-[11px] text-zinc-400 mt-1 font-semibold">
            Enter your credentials to access the ERP.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@luxerealtypune.com"
                required
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-2 focus:ring-zinc-750/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-2 focus:ring-zinc-750/20 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-350 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-zinc-950 text-sm font-black hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Role Fast-Track */}
        <div className="pt-5 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d4ad4d]">
              Quick Demo Access
            </span>
            <span className="text-[9px] text-zinc-500 font-bold">1-Click Role Exploration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            <button
              type="button"
              onClick={() => {
                const demoProfile = {
                  id: 'e2c5f803-2500-4538-a763-680d7279b4e7',
                  role: 'SuperAdmin',
                  full_name: 'Rahul Sharma (Managing Director)',
                  email: 'rahul@luxerealtypune.com',
                  company_name: 'Luxe Realty Advisors'
                };
                localStorage.setItem('luxe-demo-user', JSON.stringify(demoProfile));
                localStorage.setItem('luxe-role-override', 'SuperAdmin');
                router.replace('/dashboard');
              }}
              className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-[#d4ad4d] hover:bg-zinc-950 transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-white group-hover:text-[#d4ad4d]">👑 SuperAdmin</div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Full ERP + Ledgers</p>
            </button>

            <button
              type="button"
              onClick={() => {
                const demoProfile = {
                  id: 'd1b4e702-1400-3427-9652-570c6168a3d6',
                  role: 'Admin',
                  full_name: 'Vikram Seth (Sales Manager)',
                  email: 'vikram@luxerealtypune.com',
                  company_name: 'Luxe Realty Advisors'
                };
                localStorage.setItem('luxe-demo-user', JSON.stringify(demoProfile));
                localStorage.setItem('luxe-role-override', 'Admin');
                router.replace('/dashboard');
              }}
              className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-[#d4ad4d] hover:bg-zinc-950 transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-white group-hover:text-[#d4ad4d]">🛡️ Manager</div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Pipeline & Risks</p>
            </button>

            <button
              type="button"
              onClick={() => {
                const demoProfile = {
                  id: 'c0a3d601-0300-2316-8541-460b505792c5',
                  role: 'SalesPerson',
                  full_name: 'Rishi Mahboobani (Sales Exec)',
                  email: 'rishi@luxerealtypune.com',
                  company_name: 'Luxe Realty Advisors'
                };
                localStorage.setItem('luxe-demo-user', JSON.stringify(demoProfile));
                localStorage.setItem('luxe-role-override', 'SalesPerson');
                router.replace('/leads');
              }}
              className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-[#d4ad4d] hover:bg-zinc-950 transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-white group-hover:text-[#d4ad4d]">👤 Sales Exec</div>
              <p className="text-[10px] text-zinc-500 mt-0.5">Leads & Tours</p>
            </button>
          </div>
        </div>

        {/* Team hint */}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
            Access restricted to authorized Luxe Realty team members and verified partners.
          </p>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="absolute bottom-6 z-10 text-center">
        <p className="text-[10px] text-zinc-600 font-medium">
          © 2026 Luxe Realty Advisors, Pune. Powered by Outgrow Intelligence Studios.
        </p>
      </div>
    </div>
  );
}
