"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Home, 
  Briefcase, 
  Users, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Database,
  Layers,
  Award
} from 'lucide-react';
import { 
  PersonaType, 
  FullOnboardingData, 
  BuyerProfileData, 
  BuilderProfileData, 
  BrokerProfileData, 
  SalespersonProfileData,
  saveOnboardingProfile,
  isOnboardingCompleted
} from '@/lib/onboarding';

interface OnboardingGatewayModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export function OnboardingGatewayModal({ forceOpen = false, onClose }: OnboardingGatewayModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [d1Success, setD1Success] = useState(false);

  // ── STEP 1: Universal Fields ──
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Pune');
  const [personaType, setPersonaType] = useState<PersonaType>('Buyer');

  // ── STEP 2: Persona 1 (Buyer) ──
  const [buyerBudget, setBuyerBudget] = useState('₹1.2 Cr–₹2 Cr');
  const [buyerConfigs, setBuyerConfigs] = useState<string[]>(['3 BHK']);
  const [buyerLocalities, setBuyerLocalities] = useState<string[]>(['Kalyani Nagar', 'Koregaon Park']);
  const [buyerPurpose, setBuyerPurpose] = useState<'Self-Use' | 'Investment'>('Self-Use');
  const [buyerTimeline, setBuyerTimeline] = useState('Ready to Move (0–30 Days)');
  const [buyerFunding, setBuyerFunding] = useState('Pre-Approved Home Loan');

  // ── STEP 2: Persona 2 (Builder) ──
  const [builderCompany, setBuilderCompany] = useState('');
  const [builderProjects, setBuilderProjects] = useState('3–5 Projects');
  const [builderUnits, setBuilderUnits] = useState('200–800 Units');
  const [builderLocalities, setBuilderLocalities] = useState('East Pune, West Pune');
  const [builderSalesChannel, setBuilderSalesChannel] = useState('50-50 Hybrid');
  const [builderCrm, setBuilderCrm] = useState('Excel / Sheets');

  // ── STEP 2: Persona 3 (Broker) ──
  const [brokerAgency, setBrokerAgency] = useState('');
  const [brokerRera, setBrokerRera] = useState('');
  const [brokerLocalities, setBrokerLocalities] = useState<string[]>(['Koregaon Park', 'Kalyani Nagar']);
  const [brokerVisits, setBrokerVisits] = useState('6–15 Tours/mo');
  const [brokerTicket, setBrokerTicket] = useState('₹1 Cr–₹3 Cr');

  // ── STEP 2: Persona 4 (Salesperson) ──
  const [salesOrg, setSalesOrg] = useState('');
  const [salesRole, setSalesRole] = useState('Senior Sales Executive');
  const [salesLeads, setSalesLeads] = useState('20–50 Leads');
  const [salesObstacles, setSalesObstacles] = useState<string[]>(['Slow Cost Sheet Calculations', 'Client Follow-up Lag']);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }
    // Check if user has already onboarded
    const completed = isOnboardingCompleted();
    if (!completed) {
      // Small timeout to allow initial page rendering
      const timer = setTimeout(() => setIsOpen(true), 350);
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  // Helpers for multi-select arrays
  const toggleItem = (list: string[], item: string, setList: (vals: string[]) => void) => {
    if (list.includes(item)) {
      if (list.length > 1) setList(list.filter(x => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) return;
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const buyerData: BuyerProfileData | undefined = personaType === 'Buyer' ? {
      budget_range: buyerBudget,
      preferred_configurations: buyerConfigs,
      target_localities: buyerLocalities,
      purchase_purpose: buyerPurpose,
      buying_timeline: buyerTimeline,
      funding_status: buyerFunding
    } : undefined;

    const builderData: BuilderProfileData | undefined = personaType === 'Builder' ? {
      company_name: builderCompany || 'Independent Developer Group',
      active_projects: builderProjects,
      total_inventory_units: builderUnits,
      key_project_localities: builderLocalities,
      primary_sales_channel: builderSalesChannel,
      current_crm_tool: builderCrm
    } : undefined;

    const brokerData: BrokerProfileData | undefined = personaType === 'Broker' ? {
      agency_name: brokerAgency || `${fullName} Advisory`,
      rera_number: brokerRera || 'A52100009999',
      core_localities: brokerLocalities,
      monthly_client_visits: brokerVisits,
      average_ticket_size: brokerTicket
    } : undefined;

    const salespersonData: SalespersonProfileData | undefined = personaType === 'Salesperson' ? {
      current_organization: salesOrg || 'Luxe Realty In-House Team',
      designation: salesRole,
      active_leads_managed: salesLeads,
      top_closing_obstacle: salesObstacles
    } : undefined;

    const profilePayload: Omit<FullOnboardingData, 'id' | 'created_at'> = {
      full_name: fullName,
      phone,
      email,
      city,
      persona_type: personaType,
      buyer_data: buyerData,
      builder_data: builderData,
      broker_data: brokerData,
      salesperson_data: salespersonData
    };

    const result = await saveOnboardingProfile(profilePayload);
    setIsSubmitting(false);
    setD1Success(true);
    setStep(3);

    // Auto close after success
    setTimeout(() => {
      setIsOpen(false);
      if (onClose) onClose();
    }, 1600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white border border-[#e8e7e4] rounded-2xl shadow-2xl overflow-hidden my-auto text-left"
      >
        {/* Top Header & Cloudflare Status Banner */}
        <div className="bg-[#fafaf8] border-b border-[#ebebeb] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 px-2.5 rounded-full bg-[#d4ad4d]/15 text-[#99771f] border border-[#d4ad4d]/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                RealtyOS Gateway Intake
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloudflare D1 Live
              </span>
            </div>
            <div className="text-[11px] font-bold text-zinc-400">
              {step === 1 ? 'Step 1 of 2' : step === 2 ? 'Step 2 of 2' : 'Completed'}
            </div>
          </div>

          <h2 className="text-lg font-extrabold text-zinc-900 tracking-tight mt-2">
            {step === 1 ? 'Welcome to RealtyOS — Tell Us About You' : 
             step === 2 ? `Personalize Your ${personaType} Experience` : 
             'Access Unlocked!'}
          </h2>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">
            {step === 1 ? 'Provide your contact info and select your real estate role to unlock tailored inventory & tools.' :
             step === 2 ? 'Your answers configure the AI Matchmaker, live cost sheets, and commission ledgers.' :
             'Profile stored in Cloudflare D1 edge database.'}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-zinc-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#d4ad4d] via-[#f3d37c] to-[#b8922e] transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* ══════════════════════════════════════════════════════════════
              STEP 1: Universal Identity & Persona Selection
             ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <User className="h-3 w-3 text-[#d4ad4d]" />
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g., Sandesh Kulkarni"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#d4ad4d] focus:ring-2 focus:ring-[#d4ad4d]/20 transition-all"
                  />
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-emerald-500" />
                      WhatsApp Number <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Verified</span>
                  </label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+91 98200 44556"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#d4ad4d] focus:ring-2 focus:ring-[#d4ad4d]/20 transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-[#d4ad4d]" />
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    required
                    placeholder="sandesh@kulkarnigroup.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-[#d4ad4d] focus:ring-2 focus:ring-[#d4ad4d]/20 transition-all"
                  />
                </div>

                {/* City Location */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#d4ad4d]" />
                    Base City / Location
                  </label>
                  <select 
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900 focus:bg-white focus:outline-none focus:border-[#d4ad4d] focus:ring-2 focus:ring-[#d4ad4d]/20 transition-all cursor-pointer"
                  >
                    <option value="Pune">Pune, Maharashtra</option>
                    <option value="Mumbai">Mumbai, Maharashtra</option>
                    <option value="Bangalore">Bangalore, Karnataka</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Dubai/NRI">Dubai / International NRI</option>
                  </select>
                </div>
              </div>

              {/* Persona Selection Cards */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                  I am using RealtyOS Suite as a: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'Buyer', label: '🏠 Buyer', desc: 'Homebuyer or Investor looking for luxury properties' },
                    { id: 'Builder', label: '🏢 Builder', desc: 'Developer managing projects, towers & inventory' },
                    { id: 'Broker', label: '🤝 Broker', desc: 'Channel Partner closing deals & tracking brokerage' },
                    { id: 'Salesperson', label: '👔 Sales Executive', desc: 'Real estate agent managing client pipelines' }
                  ].map((p) => {
                    const isSelected = personaType === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPersonaType(p.id as PersonaType)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                          isSelected 
                            ? 'bg-[#fffdf5] border-[#d4ad4d] shadow-sm ring-2 ring-[#d4ad4d]/20' 
                            : 'bg-[#fafaf8] border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-xs text-zinc-900">{p.label}</div>
                          <div className="text-[10px] text-zinc-500 font-medium mt-1 leading-tight">{p.desc}</div>
                        </div>
                        {isSelected && (
                          <div className="mt-2 text-[9px] font-black text-[#b8922e] flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Selected
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Step 1 Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={!fullName || !phone || !email}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <span>Continue to Step 2</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#d4ad4d]" />
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 2: Persona-Specific Granular Fields
             ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5">
              
              {/* ── PERSONA 1: BUYER ── */}
              {personaType === 'Buyer' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  
                  {/* Budget Range */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Target Budget Range
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['₹75L–₹1.2 Cr', '₹1.2 Cr–₹2 Cr', '₹2 Cr–₹4 Cr', '₹4 Cr–₹8 Cr', '₹8 Cr+ Ultra Luxury'].map((b) => (
                        <button
                          type="button"
                          key={b}
                          onClick={() => setBuyerBudget(b)}
                          className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                            buyerBudget === b 
                              ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs' 
                              : 'bg-[#fafaf8] border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Configuration */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Preferred Configuration (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK+', 'Penthouse', 'Villa', 'Office Space'].map((c) => {
                        const sel = buyerConfigs.includes(c);
                        return (
                          <button
                            type="button"
                            key={c}
                            onClick={() => toggleItem(buyerConfigs, c, setBuyerConfigs)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              sel 
                                ? 'bg-[#fffdf5] border-[#d4ad4d] text-[#b8922e] ring-1 ring-[#d4ad4d]/40 font-extrabold' 
                                : 'bg-[#fafaf8] border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                            }`}
                          >
                            {sel ? `✓ ${c}` : c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Localities */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Target Pune Localities
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Kalyani Nagar', 'Koregaon Park', 'Baner/Balewadi', 'Kharadi', 'Boat Club Rd', 'Viman Nagar', 'Hadapsar'].map((loc) => {
                        const sel = buyerLocalities.includes(loc);
                        return (
                          <button
                            type="button"
                            key={loc}
                            onClick={() => toggleItem(buyerLocalities, loc, setBuyerLocalities)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              sel 
                                ? 'bg-zinc-900 text-white border-zinc-900' 
                                : 'bg-[#fafaf8] border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                            }`}
                          >
                            {sel ? `✓ ${loc}` : loc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Purchase Purpose & Timeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Purchase Purpose
                      </label>
                      <div className="flex gap-2">
                        {['Self-Use', 'Investment'].map((p) => (
                          <button
                            type="button"
                            key={p}
                            onClick={() => setBuyerPurpose(p as any)}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                              buyerPurpose === p 
                                ? 'bg-[#d4ad4d] text-white border-[#c49d3d]' 
                                : 'bg-[#fafaf8] border-zinc-200 text-zinc-700'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Buying Timeline
                      </label>
                      <select
                        value={buyerTimeline}
                        onChange={(e) => setBuyerTimeline(e.target.value)}
                        className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                      >
                        <option value="Ready to Move (0–30 Days)">Ready to Move (0–30 Days)</option>
                        <option value="Within 3–6 Months">Within 3–6 Months</option>
                        <option value="Under Construction (1–2 Yrs)">Under Construction (1–2 Yrs)</option>
                      </select>
                    </div>
                  </div>

                  {/* Funding Status */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Funding Status
                    </label>
                    <select
                      value={buyerFunding}
                      onChange={(e) => setBuyerFunding(e.target.value)}
                      className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                    >
                      <option value="Pre-Approved Home Loan">Pre-Approved Home Loan</option>
                      <option value="Self-Funded / Cash">Self-Funded / Cash</option>
                      <option value="Need Loan Assistance">Need Loan Assistance</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── PERSONA 2: BUILDER ── */}
              {personaType === 'Builder' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Developer / Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g., Panchshil Realty / Godrej Properties"
                      value={builderCompany}
                      onChange={(e) => setBuilderCompany(e.target.value)}
                      className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Active Projects / Towers
                      </label>
                      <select
                        value={builderProjects}
                        onChange={(e) => setBuilderProjects(e.target.value)}
                        className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                      >
                        <option value="1–2 Projects">1–2 Projects</option>
                        <option value="3–5 Projects">3–5 Projects</option>
                        <option value="6+ Projects">6+ Projects</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Total Inventory Units
                      </label>
                      <select
                        value={builderUnits}
                        onChange={(e) => setBuilderUnits(e.target.value)}
                        className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                      >
                        <option value="< 200 Units">&lt; 200 Units</option>
                        <option value="200–800 Units">200–800 Units</option>
                        <option value="800+ Units">800+ Units</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Primary Sales Channel
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Mostly In-House Team', 'Mostly Channel Partners', '50-50 Hybrid'].map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setBuilderSalesChannel(c)}
                          className={`py-2 px-2 text-[11px] font-bold rounded-lg border text-center transition-all ${
                            builderSalesChannel === c 
                              ? 'bg-zinc-900 text-white border-zinc-900' 
                              : 'bg-[#fafaf8] border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Current ERP / CRM Tool
                    </label>
                    <select
                      value={builderCrm}
                      onChange={(e) => setBuilderCrm(e.target.value)}
                      className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                    >
                      <option value="Salesforce">Salesforce</option>
                      <option value="Sell.Do">Sell.Do</option>
                      <option value="LeadSquared">LeadSquared</option>
                      <option value="Excel / Sheets">Excel / Sheets</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── PERSONA 3: BROKER ── */}
              {personaType === 'Broker' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Agency / Brokerage Firm Name <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g., ABC Realty Consultants"
                        value={brokerAgency}
                        onChange={(e) => setBrokerAgency(e.target.value)}
                        className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        MahaRERA Registration No.
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g., A52100001234"
                        value={brokerRera}
                        onChange={(e) => setBrokerRera(e.target.value)}
                        className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Core Operating Micro-Markets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Kharadi', 'Hinjewadi', 'Viman Nagar'].map((loc) => {
                        const sel = brokerLocalities.includes(loc);
                        return (
                          <button
                            type="button"
                            key={loc}
                            onClick={() => toggleItem(brokerLocalities, loc, setBrokerLocalities)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              sel 
                                ? 'bg-[#d4ad4d] text-white border-[#c49d3d]' 
                                : 'bg-[#fafaf8] border-zinc-200 text-zinc-600'
                            }`}
                          >
                            {sel ? `✓ ${loc}` : loc}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Monthly Client Tours
                      </label>
                      <select
                        value={brokerVisits}
                        onChange={(e) => setBrokerVisits(e.target.value)}
                        className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                      >
                        <option value="1–5 Tours/mo">1–5 Tours/mo</option>
                        <option value="6–15 Tours/mo">6–15 Tours/mo</option>
                        <option value="15+ Tours/mo">15+ Tours/mo</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Average Client Ticket Size
                      </label>
                      <select
                        value={brokerTicket}
                        onChange={(e) => setBrokerTicket(e.target.value)}
                        className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                      >
                        <option value="Under ₹1 Cr">Under ₹1 Cr</option>
                        <option value="₹1 Cr–₹3 Cr">₹1 Cr–₹3 Cr</option>
                        <option value="₹3 Cr–₹7 Cr">₹3 Cr–₹7 Cr</option>
                        <option value="₹7 Cr+ Ultra Luxury">₹7 Cr+ Ultra Luxury</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PERSONA 4: SALESPERSON ── */}
              {personaType === 'Salesperson' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Current Organization / Brokerage
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g., ANAROCK / In-House Sales"
                        value={salesOrg}
                        onChange={(e) => setSalesOrg(e.target.value)}
                        className="w-full h-10 px-3.5 bg-[#fafaf8] border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                        Designation / Role
                      </label>
                      <select
                        value={salesRole}
                        onChange={(e) => setSalesRole(e.target.value)}
                        className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                      >
                        <option value="Sales Manager">Sales Manager</option>
                        <option value="Senior Sales Executive">Senior Sales Executive</option>
                        <option value="Pre-Sales Specialist">Pre-Sales Specialist</option>
                        <option value="Independent Realtor">Independent Realtor</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Active Leads Managed
                    </label>
                    <select
                      value={salesLeads}
                      onChange={(e) => setSalesLeads(e.target.value)}
                      className="w-full h-9 px-3 bg-[#fafaf8] border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-900"
                    >
                      <option value="< 20 Leads">&lt; 20 Leads</option>
                      <option value="20–50 Leads">20–50 Leads</option>
                      <option value="50–150 Leads">50–150 Leads</option>
                      <option value="150+ Leads">150+ Leads</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                      Top Closing Obstacles (Select all that apply)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Slow Cost Sheet Calculations', 'Client Follow-up Lag', 'Inventory Availability', 'Loan Delays'].map((obs) => {
                        const sel = salesObstacles.includes(obs);
                        return (
                          <button
                            type="button"
                            key={obs}
                            onClick={() => toggleItem(salesObstacles, obs, setSalesObstacles)}
                            className={`p-2 text-[11px] font-bold rounded-lg border text-left transition-all ${
                              sel 
                                ? 'bg-zinc-900 text-white border-zinc-900' 
                                : 'bg-[#fafaf8] border-zinc-200 text-zinc-700'
                            }`}
                          >
                            {sel ? `✓ ${obs}` : obs}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation & Submit Buttons */}
              <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-600 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#d4ad4d] hover:bg-[#c49d3d] text-white text-xs font-extrabold flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Syncing with Cloudflare D1...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete & Unlock Suite</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 3: Completion & Cloudflare D1 Verification
             ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="h-16 w-16 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-zinc-900">
                  Welcome to RealtyOS, {fullName}!
                </h3>
                <p className="text-xs text-zinc-500 max-w-sm">
                  Your customized {personaType} profile has been saved to the Cloudflare D1 Database. Dashboard access is now unlocked.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                <span>Cloudflare D1 Edge Replicas Synced</span>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
