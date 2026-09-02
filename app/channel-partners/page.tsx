"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users2, 
  BadgePercent, 
  Plus, 
  Search, 
  Filter, 
  Building, 
  DollarSign, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Award, 
  X, 
  Check, 
  SlidersHorizontal, 
  ExternalLink, 
  ChevronRight, 
  TrendingUp, 
  AlertTriangle, 
  LayoutGrid, 
  Rows3, 
  Columns2 
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { InlineStatsBar } from '@/components/ui/InlineStatsBar';
import { AvatarCell } from '@/components/ui/AvatarCell';
import {
  ChannelPartner,
  CommissionEntry,
  SEED_CHANNEL_PARTNERS,
  SEED_COMMISSIONS,
  fetchChannelPartners,
  saveChannelPartners,
  fetchCommissions,
  saveCommissions
} from '@/lib/partners';

export type { ChannelPartner, CommissionEntry };

export default function ChannelPartnersAndCommissionsPage() {
  // Layout arrangement: 'stacked' (one below the other 100% width) | 'side-by-side' (50/50 split) | 'partners' | 'commissions'
  const [layoutMode, setLayoutMode] = useState<'stacked' | 'side-by-side' | 'partners' | 'commissions'>('stacked');
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerTierFilter, setPartnerTierFilter] = useState('All');
  const [commissionStatusFilter, setCommissionStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'developer-crm' | 'broker-portal'>('developer-crm');

  // Modals & Drawers
  const [selectedPartner, setSelectedPartner] = useState<ChannelPartner | null>(null);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<CommissionEntry | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(50000);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  // Broker portal simulation state (Anti-poaching lead check)
  const [isRegisterLeadModalOpen, setIsRegisterLeadModalOpen] = useState(false);
  const [registeredLeadName, setRegisteredLeadName] = useState('');
  const [registeredLeadPhone, setRegisteredLeadPhone] = useState('');
  const [registeredLeadBudget, setRegisteredLeadBudget] = useState('15000000');
  const [registeredLeadConfig, setRegisteredLeadConfig] = useState('3 BHK');
  const [selectedCPForLead, setSelectedCPForLead] = useState('ABC Realty Consultants');
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // New Partner form state
  const [newFirmName, setNewFirmName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRera, setNewRera] = useState('');
  const [newTier, setNewTier] = useState<'Diamond' | 'Platinum' | 'Gold' | 'Registered'>('Gold');
  const [newRate, setNewRate] = useState('2.0');

  // Persistent State for Channel Partners & Commissions
  const [partners, setPartners] = useState<ChannelPartner[]>(SEED_CHANNEL_PARTNERS);
  const [commissions, setCommissions] = useState<CommissionEntry[]>(SEED_COMMISSIONS);

  useEffect(() => {
    async function loadData() {
      const p = await fetchChannelPartners();
      if (p && p.length > 0) setPartners(p);
      const c = await fetchCommissions();
      if (c && c.length > 0) setCommissions(c);
    }
    loadData();
  }, []);

  // Aggregate stats
  const totalCPRevenue = useMemo(() => partners.reduce((acc, p) => acc + p.delivered_revenue, 0), [partners]);
  const totalCPBookings = useMemo(() => partners.reduce((acc, p) => acc + p.bookings, 0), [partners]);
  const totalAccruedCommission = useMemo(() => commissions.reduce((acc, c) => acc + c.total_commission, 0), [commissions]);
  const totalPaidCommission = useMemo(() => commissions.reduce((acc, c) => acc + c.paid_amount, 0), [commissions]);
  const totalPendingCommission = useMemo(() => commissions.reduce((acc, c) => acc + c.pending_amount, 0), [commissions]);

  const inlineStats = useMemo(() => [
    { label: 'Channel Partners', count: partners.length, colorClass: 'bg-zinc-400' },
    { label: 'CP Delivered Revenue', count: formatPriceShort(totalCPRevenue), colorClass: 'bg-emerald-500' },
    { label: 'CP Bookings', count: totalCPBookings, colorClass: 'bg-blue-500' },
    { label: 'Total Commission', count: formatPriceShort(totalAccruedCommission), colorClass: 'bg-[#d4ad4d]' },
    { label: 'Settled Payouts', count: formatPriceShort(totalPaidCommission), colorClass: 'bg-emerald-600' },
    { label: 'Pending Approval', count: formatPriceShort(totalPendingCommission), colorClass: 'bg-amber-500' }
  ], [partners, totalCPRevenue, totalCPBookings, totalAccruedCommission, totalPaidCommission, totalPendingCommission]);

  // Filtered lists
  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      const matchesSearch = 
        p.firm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.rera_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = partnerTierFilter === 'All' || p.tier === partnerTierFilter;
      return matchesSearch && matchesTier;
    });
  }, [partners, searchQuery, partnerTierFilter]);

  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => {
      const matchesSearch = 
        c.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.unit_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = commissionStatusFilter === 'All' || c.status === commissionStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [commissions, searchQuery, commissionStatusFilter]);

  // Handlers
  const handleAddPartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirmName) return;
    const partner: ChannelPartner = {
      id: `cp-${Date.now()}`,
      firm_name: newFirmName,
      contact_person: newContactPerson || 'Principal Partner',
      phone: newPhone || '+91 98000 00000',
      email: newEmail || 'info@partnerfirm.com',
      rera_number: newRera || 'A52100009999',
      tier: newTier,
      commission_rate: parseFloat(newRate) || 2.0,
      active_leads: 0,
      site_visits: 0,
      negotiations: 0,
      bookings: 0,
      delivered_revenue: 0,
      accrued_commission: 0,
      paid_commission: 0
    };
    const updated = [partner, ...partners];
    setPartners(updated);
    saveChannelPartners(updated);
    setIsAddPartnerModalOpen(false);
    setNewFirmName('');
    setNewContactPerson('');
    setNewPhone('');
    setNewEmail('');
    setNewRera('');
  };

  const handleRegisterLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (registeredLeadPhone.includes('98200 11223') || registeredLeadPhone.includes('99100 55443')) {
      setDuplicateAlert(`Conflict detected: Lead phone ${registeredLeadPhone} was already registered by in-house sales 12 days ago.`);
      setRegistrationSuccess(false);
      return;
    }
    setDuplicateAlert(null);
    setRegistrationSuccess(true);
    setTimeout(() => {
      setRegistrationSuccess(false);
      setIsRegisterLeadModalOpen(false);
      setRegisteredLeadName('');
      setRegisteredLeadPhone('');
    }, 1500);
  };

  const handleExecutePayout = () => {
    if (!selectedCommission || payoutAmount <= 0) return;
    const newPaid = Math.min(selectedCommission.paid_amount + payoutAmount, selectedCommission.total_commission);
    const newPending = selectedCommission.total_commission - newPaid;
    const newStatus = newPending === 0 ? 'Fully Paid' : 'Partially Paid';

    const updated = commissions.map(c => c.id === selectedCommission.id ? {
      ...c,
      paid_amount: newPaid,
      pending_amount: newPending,
      status: newStatus as any,
      last_payout_date: new Date().toISOString().split('T')[0]
    } : c);

    setCommissions(updated);
    saveCommissions(updated);
    setIsPayoutModalOpen(false);
    setSelectedCommission(null);
  };

  const getTierBadgeClass = (tier: string) => {
    switch (tier) {
      case 'Diamond': return 'border-cyan-200 bg-cyan-50 text-cyan-800';
      case 'Platinum': return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'Gold': return 'border-amber-200 bg-amber-50 text-amber-800';
      default: return 'border-zinc-200 bg-zinc-50 text-zinc-700';
    }
  };

  const getCommissionStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Fully Paid': return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'Partially Paid': return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'Pending Approval': return 'border-rose-200 bg-rose-50 text-rose-700';
      default: return 'border-zinc-200 bg-zinc-50 text-zinc-700';
    }
  };

  return (
    <div className="w-full pb-20 text-zinc-900 text-left space-y-6">
      
      {/* ── TOP EDITORIAL CARD & CONTROLS ── */}
      <div className="overflow-hidden bg-white border border-[#e8e7e4] rounded-2xl shadow-sm">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 px-6 py-5 border-b border-[#ebebeb]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-extrabold tracking-tight text-zinc-900" style={{ letterSpacing: '-0.4px' }}>
                Channel Partners & Commission Settlements
              </h1>
              <span className="bg-zinc-900 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                {partners.length} Partners • {commissions.length} Deals
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Comprehensive Broker Management & Deal-Level Payout Financial Ledger
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            
            {/* Layout Arranger (Stacked below vs 50/50 side-by-side) */}
            <div className="dc-seg">
              <button
                type="button"
                onClick={() => setLayoutMode('stacked')}
                className={`dc-seg-btn flex items-center gap-1 ${layoutMode === 'stacked' ? 'on' : ''}`}
                title="Stack tables vertically (100% full width)"
              >
                <Rows3 className="h-3.5 w-3.5" />
                <span>Stacked</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('side-by-side')}
                className={`dc-seg-btn flex items-center gap-1 ${layoutMode === 'side-by-side' ? 'on' : ''}`}
                title="50% / 50% split view"
              >
                <Columns2 className="h-3.5 w-3.5" />
                <span>50 / 50</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('partners')}
                className={`dc-seg-btn ${layoutMode === 'partners' ? 'on' : ''}`}
              >
                Partners Only
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('commissions')}
                className={`dc-seg-btn ${layoutMode === 'commissions' ? 'on' : ''}`}
              >
                Commissions Only
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsRegisterLeadModalOpen(true)}
              className="dc-btn font-semibold flex items-center gap-1.5 text-zinc-700"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#d4ad4d]" />
              Anti-Poach Check
            </button>

            <button
              type="button"
              onClick={() => setIsAddPartnerModalOpen(true)}
              className="dc-btn gold font-bold flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Partner
            </button>
          </div>
        </div>

        {/* Inline Stats Bar */}
        <InlineStatsBar stats={inlineStats} />

        {/* Porcelain Unified Toolbar */}
        <div className="dc-toolbar">
          {/* Global Search */}
          <div className="dc-search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search partner firm, RERA, client, unit..." 
              className="dc-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tier Filter */}
          <select
            aria-label="Filter by Tier"
            value={partnerTierFilter}
            onChange={(e) => setPartnerTierFilter(e.target.value)}
            className="dc-btn font-semibold cursor-pointer"
          >
            <option value="All">All Tiers</option>
            <option value="Diamond">Diamond Tier</option>
            <option value="Platinum">Platinum Tier</option>
            <option value="Gold">Gold Tier</option>
          </select>

          {/* Commission Status Filter */}
          <select
            aria-label="Filter by Payout Status"
            value={commissionStatusFilter}
            onChange={(e) => setCommissionStatusFilter(e.target.value)}
            className="dc-btn font-semibold cursor-pointer"
          >
            <option value="All">All Settlement Statuses</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LAYOUT CONTAINER (STACKED VERTICALLY OR 50/50 SIDE-BY-SIDE)
         ══════════════════════════════════════════════════════════════════════ */}
      <div className={
        layoutMode === 'side-by-side' 
          ? 'grid grid-cols-1 xl:grid-cols-2 gap-6' 
          : 'space-y-6'
      }>

        {/* ── SECTION 1: CHANNEL PARTNER DIRECTORY TABLE ── */}
        {(layoutMode === 'stacked' || layoutMode === 'side-by-side' || layoutMode === 'partners') && (
          <div className="overflow-hidden bg-white border border-[#e8e7e4] rounded-2xl shadow-sm flex flex-col">
            
            {/* Section Header */}
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 flex items-center justify-center text-[#99771f]">
                  <Users2 className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[13px] font-extrabold text-zinc-900 tracking-tight">
                    Channel Partner Directory ({filteredPartners.length})
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-medium">External broker network, tier rankings, and sales metrics</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-[#fafaf8] border border-[#e8e7e4] text-zinc-700">
                  Total Delivered: <strong className="text-emerald-700">{formatPriceShort(totalCPRevenue)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddPartnerModalOpen(true)}
                  className="dc-btn font-bold text-[11px] py-1 text-zinc-700 hover:text-zinc-950"
                >
                  <Plus className="h-3 w-3" /> Add Partner
                </button>
              </div>
            </div>

            {/* Table Container */}
            <div className="dc-table-container">
              <table className="dc-table">
                <thead>
                  <tr>
                    <th className="pl-6">Partner Firm & Contact</th>
                    <th>RERA Number</th>
                    <th>Tier & Rate</th>
                    <th className="text-center">Active Leads</th>
                    <th className="text-center">Site Visits</th>
                    <th className="text-center">Closed Deals</th>
                    <th className="text-right">Delivered Revenue</th>
                    <th className="text-right">Accrued Commission</th>
                    <th className="text-right">Paid Commission</th>
                    <th style={{ width: '80px' }} className="text-center pr-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-xs font-semibold text-zinc-400">
                        No channel partners match the current filters
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner) => (
                      <tr 
                        key={partner.id} 
                        className={`cursor-pointer group hover:bg-[#fafaf7] transition-colors ${selectedPartner?.id === partner.id ? 'bg-[#fffdf5]' : ''}`}
                        onClick={() => setSelectedPartner(selectedPartner?.id === partner.id ? null : partner)}
                      >
                        <td className="pl-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#fafaf8] border border-[#e8e7e4] text-zinc-700 flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-xs">
                              {partner.firm_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-zinc-900 text-xs group-hover:text-[#b8922e] transition-colors truncate">
                                {partner.firm_name}
                              </span>
                              <span className="text-[11px] text-zinc-600 font-medium mt-0.5">
                                {partner.contact_person} • {partner.phone}
                              </span>
                              {partner.email && (
                                <span className="text-[10px] text-zinc-400 font-normal truncate mt-0.5">
                                  {partner.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center gap-1 font-semibold text-zinc-700 text-xs">
                            <ShieldCheck className="h-3 w-3 text-emerald-500 shrink-0" />
                            {partner.rera_number}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className={`dc-badge ${getTierBadgeClass(partner.tier)}`}>
                            {partner.tier} ({partner.commission_rate}%)
                          </span>
                        </td>
                        <td className="text-center font-bold text-zinc-700 text-xs py-3.5">
                          {partner.active_leads}
                        </td>
                        <td className="text-center font-bold text-zinc-700 text-xs py-3.5">
                          {partner.site_visits}
                        </td>
                        <td className="text-center py-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-900 text-[10.5px] font-extrabold">
                            {partner.bookings}
                          </span>
                        </td>
                        <td className="text-right font-black text-zinc-900 text-xs py-3.5">
                          {formatPriceShort(partner.delivered_revenue)}
                        </td>
                        <td className="text-right font-black text-[#b8922e] text-xs py-3.5">
                          {formatPriceShort(partner.accrued_commission)}
                        </td>
                        <td className="text-right font-extrabold text-emerald-700 text-xs py-3.5">
                          {formatPriceShort(partner.paid_commission)}
                        </td>
                        <td className="text-center pr-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedPartner(selectedPartner?.id === partner.id ? null : partner)}
                            className="text-[10.5px] font-bold text-[#d4ad4d] hover:text-[#b8922e] transition-colors whitespace-nowrap"
                          >
                            {selectedPartner?.id === partner.id ? 'Close ✕' : 'Details →'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected Partner Highlight Details Box */}
            {selectedPartner && (
              <div className="p-4 m-4 bg-[#fafaf8] border border-[#e8e7e4] rounded-xl space-y-3 animate-in fade-in duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-black text-xs">
                      {selectedPartner.firm_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-zinc-900">{selectedPartner.firm_name}</h3>
                      <p className="text-[11px] text-zinc-500">
                        {selectedPartner.contact_person} • {selectedPartner.phone} • {selectedPartner.email} • MahaRERA: {selectedPartner.rera_number}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedPartner(null)} 
                    className="text-zinc-400 hover:text-zinc-700 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-[#ebebeb] text-xs">
                  <div className="p-2 bg-white border border-[#e8e7e4] rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Active Leads</span>
                    <span className="font-black text-zinc-900 text-sm">{selectedPartner.active_leads} Leads</span>
                  </div>
                  <div className="p-2 bg-white border border-[#e8e7e4] rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Site Visits</span>
                    <span className="font-black text-zinc-900 text-sm">{selectedPartner.site_visits} Conducted</span>
                  </div>
                  <div className="p-2 bg-white border border-[#e8e7e4] rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Negotiations</span>
                    <span className="font-black text-zinc-900 text-sm">{selectedPartner.negotiations} Active</span>
                  </div>
                  <div className="p-2 bg-white border border-[#e8e7e4] rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Total Delivered</span>
                    <span className="font-black text-zinc-900 text-sm">{formatPriceShort(selectedPartner.delivered_revenue)}</span>
                  </div>
                  <div className="p-2 bg-white border border-[#e8e7e4] rounded-lg">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Settled Brokerage</span>
                    <span className="font-black text-emerald-700 text-sm">{formatPriceShort(selectedPartner.paid_commission)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 2: COMMISSION DISBURSEMENTS & PAYOUTS LEDGER (100% WIDTH BELOW) ── */}
        {(layoutMode === 'stacked' || layoutMode === 'side-by-side' || layoutMode === 'commissions') && (
          <div className="overflow-hidden bg-white border border-[#e8e7e4] rounded-2xl shadow-sm flex flex-col">
            
            {/* Section Header */}
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 flex items-center justify-center text-[#99771f]">
                  <BadgePercent className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-[13px] font-extrabold text-zinc-900 tracking-tight">
                    Commission Disbursements & Payouts Ledger ({filteredCommissions.length})
                  </h2>
                  <p className="text-[10px] text-zinc-400 font-medium">Deal-level financial settlement, brokerage accounting, and disbursements</p>
                </div>
              </div>

              {/* Summary Badges on Header */}
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Settled: {formatPriceShort(totalPaidCommission)}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-800">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Pending Approval: {formatPriceShort(totalPendingCommission)}</span>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="dc-table-container">
              <table className="dc-table">
                <thead>
                  <tr>
                    <th className="pl-6">Beneficiary & Recipient</th>
                    <th>Client Name & Property</th>
                    <th>Unit</th>
                    <th className="text-right">Booking Value</th>
                    <th className="text-center">Rate %</th>
                    <th className="text-right">Total Comm.</th>
                    <th className="text-right">Paid Amount</th>
                    <th className="text-right">Pending Balance</th>
                    <th>Status</th>
                    <th>Last Payout</th>
                    <th style={{ width: '90px' }} className="text-center pr-6">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-12 text-center text-xs font-semibold text-zinc-400">
                        No commission records found matching current criteria
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((comm) => (
                      <tr key={comm.id} className="hover:bg-[#fafaf7] transition-colors">
                        <td className="pl-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#fafaf8] border border-[#e8e7e4] text-zinc-700 flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-xs">
                              {comm.recipient_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-extrabold text-zinc-900 text-xs truncate">
                                {comm.recipient_name}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">
                                {comm.recipient_type}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-[#fafaf8] border border-[#e8e7e4] text-zinc-700 flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-xs">
                              {comm.client_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-zinc-900 text-xs truncate">
                                {comm.client_name}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
                                {comm.property_title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 text-[10.5px] font-extrabold text-zinc-800 uppercase">
                            {comm.unit_number}
                          </span>
                        </td>
                        <td className="text-right font-extrabold text-zinc-900 text-xs py-3.5">
                          {formatPriceShort(comm.booking_value)}
                        </td>
                        <td className="text-center font-bold text-zinc-700 text-xs py-3.5">
                          {comm.commission_rate}%
                        </td>
                        <td className="text-right font-black text-zinc-900 text-xs py-3.5">
                          {formatPriceShort(comm.total_commission)}
                        </td>
                        <td className="text-right font-extrabold text-emerald-700 text-xs py-3.5">
                          {formatPriceShort(comm.paid_amount)}
                        </td>
                        <td className="text-right font-black text-amber-700 text-xs py-3.5">
                          {formatPriceShort(comm.pending_amount)}
                        </td>
                        <td className="py-3.5">
                          <span className={`dc-badge ${getCommissionStatusBadgeClass(comm.status)}`}>
                            {comm.status}
                          </span>
                        </td>
                        <td className="text-xs font-semibold text-zinc-500 py-3.5">
                          {comm.last_payout_date ? new Date(comm.last_payout_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="text-center pr-6 py-3.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCommission(comm);
                              setPayoutAmount(comm.pending_amount > 0 ? comm.pending_amount : 50000);
                              setIsPayoutModalOpen(true);
                            }}
                            className={`px-3 py-1 rounded-md text-[10.5px] font-extrabold transition-all ${
                              comm.pending_amount > 0
                                ? 'bg-[#d4ad4d] text-white hover:bg-[#b8922e] shadow-xs cursor-pointer'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                            disabled={comm.pending_amount === 0}
                          >
                            {comm.pending_amount > 0 ? 'Pay Out →' : 'Settled ✓'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Financial Ledger Footer */}
            <div className="px-6 py-3 bg-[#fafaf8] border-t border-[#ebebeb] flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-zinc-600">
              <span>Showing {filteredCommissions.length} of {commissions.length} deal commission records</span>
              <div className="flex items-center gap-4">
                <span>Total Accrued: <strong className="text-zinc-900">{formatCurrency(totalAccruedCommission)}</strong></span>
                <span>Total Settled: <strong className="text-emerald-700">{formatCurrency(totalPaidCommission)}</strong></span>
                <span>Total Pending: <strong className="text-amber-800">{formatCurrency(totalPendingCommission)}</strong></span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── MODAL: RECORD COMMISSION PAYOUT ── */}
      {isPayoutModalOpen && selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e8e7e4] overflow-hidden">
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#d4ad4d]" />
                <h3 className="font-extrabold text-sm text-zinc-900">Record Commission Disbursement</h3>
              </div>
              <button onClick={() => setIsPayoutModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                <p className="font-bold text-zinc-900">{selectedCommission.recipient_name}</p>
                <p className="text-zinc-500">Deal: {selectedCommission.client_name} • Unit {selectedCommission.unit_number} ({selectedCommission.property_title})</p>
                <p className="text-zinc-600 font-semibold pt-1">
                  Total: {formatPriceShort(selectedCommission.total_commission)} | Paid: {formatPriceShort(selectedCommission.paid_amount)} | <span className="text-amber-700 font-bold">Pending: {formatPriceShort(selectedCommission.pending_amount)}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Disbursement Amount (₹)</label>
                <input 
                  type="number"
                  value={payoutAmount}
                  max={selectedCommission.pending_amount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full h-9 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs font-bold text-zinc-900 focus:border-[#d4ad4d] focus:ring-2 focus:ring-[#d4ad4d]/15"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ebebeb]">
                <button 
                  type="button" 
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="dc-btn font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleExecutePayout}
                  className="dc-btn gold font-bold"
                >
                  Confirm Payout (₹{payoutAmount.toLocaleString('en-IN')})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW CHANNEL PARTNER ── */}
      {isAddPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#e8e7e4] overflow-hidden">
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-[#d4ad4d]" />
                <h3 className="font-extrabold text-sm text-zinc-900">Register New Channel Partner</h3>
              </div>
              <button onClick={() => setIsAddPartnerModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddPartnerSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Brokerage Firm Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Knight Frank Pune"
                    value={newFirmName}
                    onChange={(e) => setNewFirmName(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Primary Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Rahul Patil"
                    value={newContactPerson}
                    onChange={(e) => setNewContactPerson(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone</label>
                  <input 
                    type="text" 
                    placeholder="+91 98..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Email</label>
                  <input 
                    type="email" 
                    placeholder="partner@firm.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">MahaRERA Number</label>
                  <input 
                    type="text" 
                    placeholder="A521000..."
                    value={newRera}
                    onChange={(e) => setNewRera(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Tier & Commission %</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      value={newTier} 
                      onChange={(e) => setNewTier(e.target.value as any)}
                      className="h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs"
                    >
                      <option value="Diamond">Diamond</option>
                      <option value="Platinum">Platinum</option>
                      <option value="Gold">Gold</option>
                      <option value="Registered">Registered</option>
                    </select>
                    <input 
                      type="number" 
                      step="0.25"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs text-right"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ebebeb]">
                <button 
                  type="button" 
                  onClick={() => setIsAddPartnerModalOpen(false)}
                  className="dc-btn font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="dc-btn gold font-bold"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ANTI-POACHING LEAD CHECK & REGISTRATION ── */}
      {isRegisterLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#e8e7e4] overflow-hidden">
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#d4ad4d]" />
                <h3 className="font-extrabold text-sm text-zinc-900">Anti-Poaching Broker Lead Registration</h3>
              </div>
              <button onClick={() => setIsRegisterLeadModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterLeadSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-zinc-500 text-[11px]">
                Enter customer phone number to verify 30-day anti-poaching lock and register under channel partner.
              </p>

              {duplicateAlert && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Duplicate Conflict</p>
                    <p className="text-[11px]">{duplicateAlert}</p>
                  </div>
                </div>
              )}

              {registrationSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Lead successfully protected & locked under broker partner!
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Channel Partner Firm</label>
                  <select
                    value={selectedCPForLead}
                    onChange={(e) => setSelectedCPForLead(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs font-semibold"
                  >
                    {partners.map(p => (
                      <option key={p.id} value={p.firm_name}>{p.firm_name} ({p.tier} • {p.commission_rate}%)</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Lead Client Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Saurabh Mittal"
                      value={registeredLeadName}
                      onChange={(e) => setRegisteredLeadName(e.target.value)}
                      className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone Number *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="+91 98200..."
                      value={registeredLeadPhone}
                      onChange={(e) => setRegisteredLeadPhone(e.target.value)}
                      className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ebebeb]">
                <button 
                  type="button" 
                  onClick={() => setIsRegisterLeadModalOpen(false)}
                  className="dc-btn font-semibold"
                >
                  Close
                </button>
                <button 
                  type="submit" 
                  className="dc-btn gold font-bold"
                >
                  Verify & Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
