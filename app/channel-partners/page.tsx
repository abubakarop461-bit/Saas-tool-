"use client";

import React, { useState, useMemo } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { InlineStatsBar } from '@/components/ui/InlineStatsBar';
import { AvatarCell } from '@/components/ui/AvatarCell';

export interface ChannelPartner {
  id: string;
  firm_name: string;
  contact_person: string;
  phone: string;
  email: string;
  rera_number: string;
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Registered';
  commission_rate: number; // e.g. 2% or 2.5%
  active_leads: number;
  site_visits: number;
  negotiations: number;
  bookings: number;
  delivered_revenue: number;
  accrued_commission: number;
  paid_commission: number;
}

export interface CommissionEntry {
  id: string;
  deal_id: string;
  client_name: string;
  property_title: string;
  unit_number: string;
  booking_value: number;
  commission_rate: number; // e.g. 2.0%
  total_commission: number;
  paid_amount: number;
  pending_amount: number;
  recipient_type: 'Channel Partner' | 'Sales Executive';
  recipient_name: string;
  status: 'Fully Paid' | 'Partially Paid' | 'Pending Approval';
  last_payout_date?: string;
}

export default function ChannelPartnersAndCommissionsPage() {
  // Search & Filters
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

  // Mock State for Channel Partners
  const [partners, setPartners] = useState<ChannelPartner[]>([
    {
      id: 'cp-1',
      firm_name: 'ABC Realty Consultants',
      contact_person: 'Anil Agarwal',
      phone: '+91 98200 77889',
      email: 'anil@abcrealty.in',
      rera_number: 'A52100001234',
      tier: 'Diamond',
      commission_rate: 2.0,
      active_leads: 24,
      site_visits: 13,
      negotiations: 6,
      bookings: 3,
      delivered_revenue: 48000000, // ₹4.8 Cr
      accrued_commission: 960000,   // ₹9.6 L
      paid_commission: 500000
    },
    {
      id: 'cp-2',
      firm_name: 'ANAROCK Property Consultants',
      contact_person: 'Siddharth Rao',
      phone: '+91 99100 88990',
      email: 'siddharth.r@anarock.com',
      rera_number: 'A52100009876',
      tier: 'Platinum',
      commission_rate: 2.0,
      active_leads: 42,
      site_visits: 28,
      negotiations: 12,
      bookings: 8,
      delivered_revenue: 102000000, // ₹10.2 Cr
      accrued_commission: 2040000,   // ₹20.4 L
      paid_commission: 1500000
    },
    {
      id: 'cp-3',
      firm_name: 'XYZ Luxury Advisory',
      contact_person: 'Kavita Chawla',
      phone: '+91 97100 33445',
      email: 'kavita@xyzrealty.com',
      rera_number: 'A52100004567',
      tier: 'Platinum',
      commission_rate: 2.0,
      active_leads: 31,
      site_visits: 19,
      negotiations: 8,
      bookings: 5,
      delivered_revenue: 78000000, // ₹7.8 Cr
      accrued_commission: 1560000,  // ₹15.6 L
      paid_commission: 1000000
    },
    {
      id: 'cp-4',
      firm_name: 'Square Yards Premier',
      contact_person: 'Deepak Saxena',
      phone: '+91 98400 11223',
      email: 'deepak.s@squareyards.co.in',
      rera_number: 'A52100003322',
      tier: 'Gold',
      commission_rate: 1.75,
      active_leads: 18,
      site_visits: 9,
      negotiations: 3,
      bookings: 2,
      delivered_revenue: 29000000, // ₹2.9 Cr
      accrued_commission: 507500,
      paid_commission: 300000
    }
  ]);

  // Mock State for Commission Entries
  const [commissions, setCommissions] = useState<CommissionEntry[]>([
    {
      id: 'comm-1',
      deal_id: 'tx-1',
      client_name: 'Sandesh Kulkarni',
      property_title: 'Vivencia Luxury Residences',
      unit_number: 'A-1204',
      booking_value: 15000000, // ₹1.50 Cr
      commission_rate: 2.0,
      total_commission: 300000, // ₹3.00 L
      paid_amount: 100000,
      pending_amount: 200000,
      recipient_type: 'Channel Partner',
      recipient_name: 'ABC Realty Consultants',
      status: 'Partially Paid',
      last_payout_date: '2026-08-15'
    },
    {
      id: 'comm-2',
      deal_id: 'tx-2',
      client_name: 'Ananya Sharma',
      property_title: 'Pristine Kyra',
      unit_number: 'B-1602',
      booking_value: 31000000, // ₹3.10 Cr
      commission_rate: 2.0,
      total_commission: 620000, // ₹6.20 L
      paid_amount: 620000,
      pending_amount: 0,
      recipient_type: 'Channel Partner',
      recipient_name: 'ANAROCK Property Consultants',
      status: 'Fully Paid',
      last_payout_date: '2026-08-25'
    },
    {
      id: 'comm-3',
      deal_id: 'tx-3',
      client_name: 'Vikram Malhotra',
      property_title: 'Power Heights',
      unit_number: 'E-0801',
      booking_value: 14800000, // ₹1.48 Cr
      commission_rate: 1.0,
      total_commission: 148000,
      paid_amount: 0,
      pending_amount: 148000,
      recipient_type: 'Sales Executive',
      recipient_name: 'Rishi Mahboobani (In-House)',
      status: 'Pending Approval'
    },
    {
      id: 'comm-4',
      deal_id: 'tx-4',
      client_name: 'Rajesh Gupta',
      property_title: 'Vivencia Heritage Villa',
      unit_number: 'V-09',
      booking_value: 48000000, // ₹4.80 Cr
      commission_rate: 1.5,
      total_commission: 720000,
      paid_amount: 720000,
      pending_amount: 0,
      recipient_type: 'Sales Executive',
      recipient_name: 'Neha Roy (In-House)',
      status: 'Fully Paid',
      last_payout_date: '2026-08-30'
    }
  ]);

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
    { label: 'Paid Settlements', count: formatPriceShort(totalPaidCommission), colorClass: 'bg-emerald-600' },
    { label: 'Pending Payouts', count: formatPriceShort(totalPendingCommission), colorClass: 'bg-amber-500' }
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
    setPartners([partner, ...partners]);
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

    setCommissions(prev => prev.map(c => c.id === selectedCommission.id ? {
      ...c,
      paid_amount: newPaid,
      pending_amount: newPending,
      status: newStatus,
      last_payout_date: new Date().toISOString().split('T')[0]
    } : c));

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
    <div className="w-full pb-20 text-zinc-900 text-left">
      
      {/* ── UNIFIED DIRECTION C PORCELAIN CARD FRAME ── */}
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
              Unified 50/50 Command Center: External Broker Relations & Financial Payout Ledger
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Segment */}
            <div className="dc-seg">
              <button
                type="button"
                onClick={() => setViewMode('developer-crm')}
                className={`dc-seg-btn ${viewMode === 'developer-crm' ? 'on' : ''}`}
              >
                Developer CRM
              </button>
              <button
                type="button"
                onClick={() => setViewMode('broker-portal')}
                className={`dc-seg-btn ${viewMode === 'broker-portal' ? 'on' : ''}`}
              >
                Broker Portal Mode
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

        {/* ── 50% / 50% SIDE-BY-SIDE SECTION ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-[#ebebeb] bg-white">
          
          {/* ══════════════════════════════════════════════════════════════════
              LEFT SECTION (50% WIDTH): CHANNEL PARTNER DIRECTORY
             ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col">
            <div className="px-5 py-3.5 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-[#d4ad4d]" />
                <h2 className="text-[12px] font-extrabold text-zinc-900 tracking-tight">
                  Channel Partner Directory ({filteredPartners.length})
                </h2>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                External Brokerage Network
              </span>
            </div>

            <div className="dc-table-container">
              <table className="dc-table">
                <thead>
                  <tr>
                    <th>Partner & RERA</th>
                    <th>Tier</th>
                    <th className="text-right">Delivered Rev</th>
                    <th className="text-center">Deals</th>
                    <th className="text-right">Accrued</th>
                    <th style={{ width: '60px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-xs font-semibold text-zinc-400">
                        No channel partners match the filter
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner) => (
                      <tr 
                        key={partner.id} 
                        className={`cursor-pointer group ${selectedPartner?.id === partner.id ? 'bg-[#fafaf7]' : ''}`}
                        onClick={() => setSelectedPartner(partner)}
                      >
                        <td>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 text-xs group-hover:text-[#b8922e] transition-colors">
                              {partner.firm_name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
                              <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
                              {partner.rera_number} • {partner.contact_person}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`dc-badge ${getTierBadgeClass(partner.tier)}`}>
                            {partner.tier} ({partner.commission_rate}%)
                          </span>
                        </td>
                        <td className="text-right font-bold text-zinc-900 text-xs">
                          {formatPriceShort(partner.delivered_revenue)}
                        </td>
                        <td className="text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800 text-[10px] font-extrabold">
                            {partner.bookings}
                          </span>
                        </td>
                        <td className="text-right font-bold text-[#b8922e] text-xs">
                          {formatPriceShort(partner.accrued_commission)}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPartner(partner);
                            }}
                            className="text-[10.5px] font-bold text-[#d4ad4d] hover:text-[#b8922e] transition-colors whitespace-nowrap"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Selected Partner Highlight Card inside Left Section */}
            {selectedPartner && (
              <div className="p-4 m-4 bg-[#fafaf8] border border-[#e8e7e4] rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs text-zinc-900">{selectedPartner.firm_name}</h3>
                    <p className="text-[11px] text-zinc-500">{selectedPartner.contact_person} • {selectedPartner.phone} • {selectedPartner.email}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedPartner(null)} 
                    className="text-zinc-400 hover:text-zinc-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#ebebeb] text-[11px]">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Active Leads</span>
                    <span className="font-extrabold text-zinc-900">{selectedPartner.active_leads}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Site Visits</span>
                    <span className="font-extrabold text-zinc-900">{selectedPartner.site_visits}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Negotiations</span>
                    <span className="font-extrabold text-zinc-900">{selectedPartner.negotiations}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase block">Paid Brokerage</span>
                    <span className="font-extrabold text-emerald-700">{formatPriceShort(selectedPartner.paid_commission)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT SECTION (50% WIDTH): COMMISSION SETTLEMENT LEDGER
             ══════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col">
            <div className="px-5 py-3.5 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BadgePercent className="h-4 w-4 text-[#d4ad4d]" />
                <h2 className="text-[12px] font-extrabold text-zinc-900 tracking-tight">
                  Commission Disbursements & Payouts ({filteredCommissions.length})
                </h2>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Deal-Level Financial Ledger
              </span>
            </div>

            <div className="dc-table-container">
              <table className="dc-table">
                <thead>
                  <tr>
                    <th>Beneficiary & Deal</th>
                    <th>Unit</th>
                    <th className="text-right">Total Comm</th>
                    <th className="text-right">Pending</th>
                    <th>Status</th>
                    <th style={{ width: '80px' }}>Settlement</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-xs font-semibold text-zinc-400">
                        No commission records found
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((comm) => (
                      <tr key={comm.id} className="cursor-pointer group hover:bg-[#fafaf7]">
                        <td>
                          <div className="flex flex-col">
                            <span className="font-bold text-zinc-900 text-xs">
                              {comm.recipient_name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-medium">
                              Client: {comm.client_name} • {comm.property_title}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 text-[10px] font-bold text-zinc-700 uppercase">
                            {comm.unit_number}
                          </span>
                        </td>
                        <td className="text-right font-bold text-zinc-900 text-xs">
                          {formatPriceShort(comm.total_commission)}
                        </td>
                        <td className="text-right font-bold text-amber-700 text-xs">
                          {formatPriceShort(comm.pending_amount)}
                        </td>
                        <td>
                          <span className={`dc-badge ${getCommissionStatusBadgeClass(comm.status)}`}>
                            {comm.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCommission(comm);
                              setPayoutAmount(comm.pending_amount > 0 ? comm.pending_amount : 50000);
                              setIsPayoutModalOpen(true);
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10.5px] font-extrabold transition-all ${
                              comm.pending_amount > 0
                                ? 'bg-[#d4ad4d] text-white hover:bg-[#b8922e] shadow-xs'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                            }`}
                            disabled={comm.pending_amount === 0}
                          >
                            {comm.pending_amount > 0 ? 'Pay →' : 'Settled'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Pill inside Right Section */}
            <div className="p-4 m-4 bg-[#fcfcfa] border border-[#e8e7e4] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <span className="font-bold text-zinc-700">Settled to Date: {formatPriceShort(totalPaidCommission)}</span>
              </div>
              <div className="flex items-center gap-1.5 font-extrabold text-amber-800">
                <Clock className="h-3.5 w-3.5" />
                <span>Pending Approval: {formatPriceShort(totalPendingCommission)}</span>
              </div>
            </div>
          </div>
        </div>
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
