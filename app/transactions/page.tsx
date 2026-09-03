"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Building, 
  Handshake, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ArrowUpRight, 
  ChevronRight, 
  X, 
  CreditCard, 
  Share2, 
  Calculator, 
  ShieldCheck, 
  Check,
  Download,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { CostSheetModal, CostSheetUnit } from '@/components/cost-sheet/CostSheetModal';
import { InlineStatsBar } from '@/components/ui/InlineStatsBar';
import { AvatarCell } from '@/components/ui/AvatarCell';
import {
  TransactionStage,
  ALL_TRANSACTION_STAGES,
  PaymentMilestone,
  DealTransaction,
  SEED_TRANSACTIONS,
  fetchTransactions,
  saveTransactions
} from '@/lib/transactions';
import { SEED_PROPERTIES, SEED_SALESPEOPLE } from '@/lib/queries';
import { SEED_CHANNEL_PARTNERS } from '@/lib/partners';
import type { CommissionEntry } from '@/lib/partners';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<DealTransaction[]>(SEED_TRANSACTIONS);

  useEffect(() => {
    async function loadTx() {
      const data = await fetchTransactions();
      if (data && data.length > 0) {
        setTransactions(data);
        if (!selectedTx || !data.some(t => t.id === selectedTx.id)) {
          setSelectedTx(data[0]);
        }
      }
    }
    loadTx();

    const handleUpdate = () => loadTx();
    window.addEventListener('focus', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('focus', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const [selectedTx, setSelectedTx] = useState<DealTransaction | null>(transactions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [costSheetUnit, setCostSheetUnit] = useState<CostSheetUnit | null>(null);

  // New Transaction Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newPropertyTitle, setNewPropertyTitle] = useState(SEED_PROPERTIES[0]?.title || 'Luxe Azure Palms - Tower A');
  const [newUnitNumber, setNewUnitNumber] = useState(SEED_PROPERTIES[0]?.unit_no || 'A-1204');
  const [newConfig, setNewConfig] = useState(SEED_PROPERTIES[0]?.configuration || '3 BHK');
  const [newDealValue, setNewDealValue] = useState(String(SEED_PROPERTIES[0]?.price || 13500000));
  const [newTokenAmount, setNewTokenAmount] = useState('500000');
  const [newAgent, setNewAgent] = useState('Rishi Mahboobani');
  const [newPartner, setNewPartner] = useState('ABC Realty Consultants');
  const [newStage, setNewStage] = useState<TransactionStage>('Token / EOI');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.property_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.channel_partner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.sales_agent.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === 'All' || tx.current_stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [transactions, searchQuery, stageFilter]);

  // Aggregate Metrics & Exact Multi-Milestone Math
  const totalPipelineValue = useMemo(() => transactions.reduce((acc, t) => acc + (t.deal_value || 0), 0), [transactions]);
  const totalTokensCollected = useMemo(() => transactions.reduce((acc, t) => acc + (t.token_amount || 0), 0), [transactions]);
  const totalCollectionsReceived = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const paidSum = t.payment_schedule
        ? t.payment_schedule.filter(m => m.status === 'Paid').reduce((mAcc, m) => mAcc + (m.amount || 0), 0)
        : t.token_amount || 0;
      return acc + paidSum;
    }, 0);
  }, [transactions]);
  const activeBookingsCount = useMemo(() => transactions.filter(t => t.booking_status === 'Confirmed' || t.booking_status === 'Completed').length, [transactions]);

  const inlineStats = useMemo(() => [
    { label: 'Active Deals', count: transactions.length, colorClass: 'bg-zinc-400' },
    { label: 'Gross Deal Volume', count: formatPriceShort(totalPipelineValue), colorClass: 'bg-[#b8922e]' },
    { label: 'Collections Received', count: formatPriceShort(totalCollectionsReceived), colorClass: 'bg-emerald-500' },
    { label: 'Tokens Escrowed', count: formatPriceShort(totalTokensCollected), colorClass: 'bg-blue-500' },
    { label: 'Confirmed Bookings', count: activeBookingsCount, colorClass: 'bg-[#d4ad4d]' }
  ], [transactions, totalPipelineValue, totalCollectionsReceived, totalTokensCollected, activeBookingsCount]);

  const handleStageChange = (newStageValue: TransactionStage) => {
    if (!selectedTx) return;
    const updated = { ...selectedTx, current_stage: newStageValue };
    setSelectedTx(updated);
    const updatedAll = transactions.map(t => t.id === selectedTx.id ? updated : t);
    setTransactions(updatedAll);
    saveTransactions(updatedAll);
  };

  const handleToggleMilestone = (milestoneId: string) => {
    if (!selectedTx) return;
    const updatedSchedule = selectedTx.payment_schedule.map(m => {
      if (m.id === milestoneId) {
        const nextStatus = m.status === 'Paid' ? 'Pending' : 'Paid';
        return {
          ...m,
          status: nextStatus as any,
          paidDate: nextStatus === 'Paid' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return m;
    });
    const updatedTx = { ...selectedTx, payment_schedule: updatedSchedule };
    setSelectedTx(updatedTx);
    const updatedAll = transactions.map(t => t.id === selectedTx.id ? updatedTx : t);
    setTransactions(updatedAll);
    saveTransactions(updatedAll);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const dealVal = Number(newDealValue) || 10000000;
    const tokVal = Number(newTokenAmount) || 500000;
    const m1 = tokVal;
    const m2 = Math.round(dealVal * 0.15);
    const m3 = Math.round(dealVal * 0.35);
    const m4 = Math.max(0, dealVal - m1 - m2 - m3);

    const newTx: DealTransaction = {
      id: `tx-${Date.now()}`,
      client_name: newClientName,
      client_phone: newClientPhone,
      property_title: newPropertyTitle,
      tower: newUnitNumber.charAt(0) || 'A',
      unit_number: newUnitNumber,
      configuration: newConfig,
      deal_value: dealVal,
      token_amount: tokVal,
      booking_status: 'Confirmed',
      current_stage: newStage,
      sales_agent: newAgent,
      channel_partner: newPartner,
      booking_date: new Date().toISOString().split('T')[0],
      expected_closure_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      payment_schedule: [
        { id: `m-${Date.now()}-1`, name: 'Token Amount', amount: m1, dueDate: 'Immediate', status: 'Paid', paidDate: new Date().toISOString().split('T')[0] },
        { id: `m-${Date.now()}-2`, name: 'Agreement (15%)', amount: m2, dueDate: 'In 15 days', status: 'Pending' },
        { id: `m-${Date.now()}-3`, name: 'Construction Installment (35%)', amount: m3, dueDate: 'In 60 days', status: 'Pending' },
        { id: `m-${Date.now()}-4`, name: 'Handover & Possession Balance', amount: m4, dueDate: 'On Possession', status: 'Pending' }
      ],
      notes: 'New verified transaction registered.'
    };
    const updatedAll = [newTx, ...transactions];
    setTransactions(updatedAll);
    saveTransactions(updatedAll);
    setSelectedTx(newTx);
    setIsNewModalOpen(false);

    // ── INTERCALCULATION 1: Auto-accrue Channel Partner Commission ──
    if (newPartner && newPartner !== 'Direct' && newPartner !== 'None') {
      import('@/lib/partners').then(async ({ fetchChannelPartners, saveCommission }) => {
        const partners = await fetchChannelPartners();
        const matchedPartner = partners.find(p => 
          p.firm_name.toLowerCase().includes(newPartner.toLowerCase()) ||
          p.contact_person.toLowerCase().includes(newPartner.toLowerCase())
        );
        const rate = matchedPartner ? matchedPartner.commission_rate : 2.0;
        const totalComm = Math.round((dealVal * rate) / 100);

        const newComm: CommissionEntry = {
          id: `comm-${Date.now()}`,
          deal_id: newTx.id,
          client_name: newClientName,
          property_title: newPropertyTitle,
          unit_number: newUnitNumber,
          booking_value: dealVal,
          commission_rate: rate,
          total_commission: totalComm,
          paid_amount: 0,
          pending_amount: totalComm,
          recipient_type: 'Channel Partner',
          recipient_name: newPartner,
          status: 'Pending Approval'
        };
        await saveCommission(newComm);
      });
    }

    // ── INTERCALCULATION 2: Update Unit Inventory Status ──
    import('@/lib/inventory').then(async ({ fetchDeveloperUnits, saveDeveloperUnits }) => {
      const units = await fetchDeveloperUnits();
      const matchIdx = units.findIndex(u => 
        (u.unit_number && u.unit_number.toLowerCase() === newUnitNumber.toLowerCase()) ||
        (u.project_title && u.project_title.toLowerCase().includes(newPropertyTitle.toLowerCase()))
      );
      if (matchIdx >= 0) {
        units[matchIdx].status = 'Token';
        units[matchIdx].buyer_name = newClientName;
        units[matchIdx].agent_name = newAgent;
        await saveDeveloperUnits(units);
      }
    });
  };

  const openCostSheetForDeal = (tx: DealTransaction) => {
    setCostSheetUnit({
      project_title: tx.property_title,
      tower: tx.tower,
      floor: parseInt(tx.unit_number.replace(/\D/g, '').slice(0, 2)) || 12,
      unit_number: tx.unit_number,
      configuration: tx.configuration,
      carpet_area: 1450,
      base_price: tx.deal_value - 1500000,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 200000
    });
  };

  const getStageIndex = (stg: TransactionStage) => ALL_TRANSACTION_STAGES.indexOf(stg);

  return (
    <div className="w-full pb-20 text-zinc-900 text-left space-y-6">
      
      {/* ══════════════════════════════════════════════════════════════════════
          UPPER SECTION (100% FULL WIDTH): DEALS & TRANSACTIONS TABLE
         ══════════════════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden bg-white border border-[#e8e7e4] rounded-2xl shadow-sm">
        
        {/* Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 px-6 py-5 border-b border-[#ebebeb]">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-extrabold tracking-tight text-zinc-900" style={{ letterSpacing: '-0.4px' }}>
                Deals & Transactions Lifecycle
              </h1>
              <span className="bg-zinc-900 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                {transactions.length} Active Deals
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              11-Stage Full Pipeline Tracking: Token ➔ Booking ➔ Agreement ➔ Payment Milestones ➔ Registration ➔ Possession
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {selectedTx && (
              <button
                type="button"
                onClick={() => openCostSheetForDeal(selectedTx)}
                className="dc-btn font-semibold flex items-center gap-1.5 text-zinc-700"
              >
                <Calculator className="h-3.5 w-3.5 text-[#d4ad4d]" />
                Cost Sheet
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="dc-btn gold font-bold flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              New Transaction
            </button>
          </div>
        </div>

        {/* Inline Stats Bar */}
        <InlineStatsBar stats={inlineStats} />

        {/* Porcelain Unified Toolbar */}
        <div className="dc-toolbar">
          <div className="dc-search-container">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search by client, property, unit #, agent, partner..." 
              className="dc-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter by Stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="dc-btn font-semibold cursor-pointer"
          >
            <option value="All">All 11 Transaction Stages</option>
            {ALL_TRANSACTION_STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* ── FULLY SHOWN 100% WIDTH TABLE ── */}
        <div className="dc-table-container">
          <table className="dc-table">
            <thead>
              <tr>
                <th className="pl-6">Client Details & Contact</th>
                <th>Property Project & Layout</th>
                <th className="text-center">Unit #</th>
                <th className="text-right">Deal Value</th>
                <th className="text-right">Token Amount</th>
                <th>Current Stage & Progress</th>
                <th>Sales Agent</th>
                <th>Channel Partner</th>
                <th>Booking Status</th>
                <th style={{ width: '90px' }} className="text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-xs font-semibold text-zinc-400">
                    No transactions match the selected filters
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSelected = selectedTx?.id === tx.id;
                  const stageIdx = getStageIndex(tx.current_stage);
                  return (
                    <tr 
                      key={tx.id} 
                      className={`cursor-pointer group hover:bg-[#fafaf7] transition-colors ${isSelected ? 'bg-[#fffdf5]' : ''}`}
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td className="pl-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-[#fafaf8] border border-[#e8e7e4] text-zinc-700 flex items-center justify-center font-extrabold text-[11px] shrink-0 shadow-xs">
                            {tx.client_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-zinc-900 text-xs group-hover:text-[#b8922e] transition-colors truncate">
                              {tx.client_name}
                            </span>
                            <span className="text-[11px] text-zinc-600 font-medium mt-0.5">
                              {tx.client_phone}
                            </span>
                            {tx.client_email && (
                              <span className="text-[10px] text-zinc-400 font-normal truncate mt-0.5">
                                {tx.client_email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900 text-xs">
                            {tx.property_title}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium mt-0.5">
                            {tx.configuration} • Tower {tx.tower}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-[10.5px] font-extrabold text-zinc-800 uppercase">
                          {tx.unit_number}
                        </span>
                      </td>
                      <td className="text-right font-black text-zinc-900 text-xs py-3.5">
                        {formatPriceShort(tx.deal_value)}
                      </td>
                      <td className="text-right font-bold text-emerald-700 text-xs py-3.5">
                        {formatPriceShort(tx.token_amount)}
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-col gap-1 min-w-[130px]">
                          <div className="flex items-center justify-between">
                            <span className="dc-badge dc-hot">
                              {tx.current_stage}
                            </span>
                            <span className="text-[9px] font-extrabold text-zinc-400">
                              {stageIdx + 1}/11
                            </span>
                          </div>
                          <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#d4ad4d]" 
                              style={{ width: `${((stageIdx + 1) / 11) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className="text-xs text-zinc-700 font-semibold truncate block max-w-[120px]">
                          {tx.sales_agent}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="text-xs text-zinc-700 font-semibold truncate block max-w-[120px]">
                          {tx.channel_partner}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold">
                          {tx.booking_status}
                        </span>
                      </td>
                      <td className="text-center py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedTx(tx)}
                          className="text-[10.5px] font-bold text-[#d4ad4d] hover:text-[#b8922e] transition-colors whitespace-nowrap"
                        >
                          {isSelected ? 'Selected ✓' : 'Inspect →'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-7 py-3.5 bg-[#fafaf8] border-t border-[#ebebeb] flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-zinc-500">
          <span>Showing {filteredTransactions.length} of {transactions.length} verified transactions</span>
          <div className="flex flex-wrap items-center gap-4">
            <span>Gross Pipeline: <strong className="text-zinc-900">{formatCurrency(totalPipelineValue)}</strong></span>
            <span>Collections Received: <strong className="text-emerald-700">{formatCurrency(totalCollectionsReceived)}</strong></span>
            <span>Tokens Escrowed: <strong className="text-blue-700">{formatCurrency(totalTokensCollected)}</strong></span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          LOWER SECTION: 2 CARDS BESIDE EACH OTHER (50% / 50% GRID)
         ══════════════════════════════════════════════════════════════════════ */}
      {selectedTx ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* ── CARD 1 (LEFT 50%): SELECTED DEAL OVERVIEW & 11-STAGE PROGRESS ── */}
          <div className="overflow-hidden bg-white border border-[#e8e7e4] rounded-2xl shadow-sm flex flex-col">
            
            {/* Card Header */}
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 flex items-center justify-center text-[#99771f]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-extrabold text-zinc-900 tracking-tight">
                    Deal Inspection: {selectedTx.client_name}
                  </h3>
                  <div className="flex flex-col text-[11px] text-zinc-500 font-medium mt-0.5">
                    <span>{selectedTx.client_phone}</span>
                    {selectedTx.client_email && (
                      <span className="text-zinc-400 font-normal text-[10px]">{selectedTx.client_email}</span>
                    )}
                  </div>
                </div>
              </div>

              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold">
                {selectedTx.booking_status}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-5">
              
              {/* Granular Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#fafaf8] border border-[#ebebeb] rounded-xl text-xs">
                <div>
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase block">Property & Unit</span>
                  <span className="font-extrabold text-zinc-900 text-xs">{selectedTx.property_title}</span>
                  <span className="text-[10.5px] text-zinc-500 font-medium block">Unit {selectedTx.unit_number} ({selectedTx.configuration})</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase block">Total Agreed Value</span>
                  <span className="font-black text-[#b8922e] text-sm">{formatPriceShort(selectedTx.deal_value)}</span>
                  <span className="text-[10px] text-zinc-400 font-medium block">{formatCurrency(selectedTx.deal_value)}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase block">Token / EOI</span>
                  <span className="font-black text-emerald-700 text-sm">{formatPriceShort(selectedTx.token_amount)}</span>
                  <span className="text-[10px] text-emerald-600 font-medium block">✓ Received</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase block">Sales Agent</span>
                  <span className="font-bold text-zinc-800">{selectedTx.sales_agent}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase block">Channel Partner</span>
                  <span className="font-bold text-zinc-800">{selectedTx.channel_partner}</span>
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase block">Booking Date</span>
                  <span className="font-bold text-zinc-800">{selectedTx.booking_date}</span>
                </div>
              </div>

              {/* 11-Stage Interactive Pipeline Step Selector */}
              <div className="space-y-2.5 pt-2 border-t border-[#ebebeb]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Transaction Stage Progress
                  </span>
                  <span className="text-zinc-900 font-extrabold text-xs">
                    Stage {getStageIndex(selectedTx.current_stage) + 1} of 11: <span className="text-[#b8922e]">{selectedTx.current_stage}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ALL_TRANSACTION_STAGES.map((stg, i) => {
                    const isCurrent = selectedTx.current_stage === stg;
                    const isPassed = getStageIndex(selectedTx.current_stage) >= i;
                    return (
                      <button
                        key={stg}
                        type="button"
                        onClick={() => handleStageChange(stg)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#d4ad4d] text-white shadow-xs scale-105'
                            : isPassed
                            ? 'bg-zinc-200 text-zinc-800 hover:bg-zinc-300'
                            : 'bg-white border border-[#e8e7e4] text-zinc-400 hover:text-zinc-700 hover:border-zinc-300'
                        }`}
                      >
                        {i + 1}. {stg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes / Remarks */}
              {selectedTx.notes && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs space-y-1">
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase block">Internal Remarks & Next Actions</span>
                  <p className="text-zinc-700 font-medium text-[11px]">{selectedTx.notes}</p>
                </div>
              )}

            </div>
          </div>

          {/* ── CARD 2 (RIGHT 50%): MILESTONE PAYMENT SCHEDULE & LEDGER ── */}
          <div className="overflow-hidden bg-white border border-[#e8e7e4] rounded-2xl shadow-sm flex flex-col">
            
            {/* Card Header */}
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 flex items-center justify-center text-[#99771f]">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-[13px] font-extrabold text-zinc-900 tracking-tight">
                    Milestone Payment Schedule & Ledger
                  </h3>
                  <p className="text-[10.5px] text-zinc-400 font-medium">Click any milestone row to toggle Paid / Pending reconciliation</p>
                </div>
              </div>

              <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                {selectedTx.payment_schedule.filter(m => m.status === 'Paid').length} of {selectedTx.payment_schedule.length} Paid
              </span>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              
              <div className="space-y-2">
                {selectedTx.payment_schedule.map((milestone) => (
                  <div 
                    key={milestone.id}
                    onClick={() => handleToggleMilestone(milestone.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      milestone.status === 'Paid'
                        ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50'
                        : 'bg-white border-[#e8e7e4] hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        milestone.status === 'Paid' 
                          ? 'bg-emerald-500 text-white shadow-2xs' 
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-300'
                      }`}>
                        {milestone.status === 'Paid' ? '✓' : '•'}
                      </div>
                      <div>
                        <p className="font-extrabold text-xs text-zinc-900">{milestone.name}</p>
                        <p className="text-[10.5px] text-zinc-400 font-medium">
                          Due: {milestone.dueDate} {milestone.paidDate ? `• Settled: ${milestone.paidDate}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-xs text-zinc-900">{formatPriceShort(milestone.amount)}</p>
                      <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${
                        milestone.status === 'Paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions Bar inside Card */}
              <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openCostSheetForDeal(selectedTx)}
                  className="dc-btn font-semibold flex items-center gap-1.5 text-xs text-zinc-800"
                >
                  <Calculator className="h-3.5 w-3.5 text-[#d4ad4d]" />
                  Recalculate Cost Sheet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const msg = `Hi ${selectedTx.client_name}, your booking for ${selectedTx.property_title} (Unit ${selectedTx.unit_number}) is in stage: ${selectedTx.current_stage}. Milestone payments update is available.`;
                    window.open(`https://wa.me/${selectedTx.client_phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="dc-btn gold font-bold flex items-center gap-1.5 text-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  WhatsApp Client
                </button>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="p-12 text-center text-zinc-400 text-xs bg-white border border-[#e8e7e4] rounded-2xl">
          Select a transaction from the table above to inspect details and milestone payments.
        </div>
      )}

      {/* ── MODAL: CREATE NEW TRANSACTION ── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#e8e7e4] overflow-hidden">
            <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#d4ad4d]" />
                <h3 className="font-extrabold text-sm text-zinc-900">Register New Deal Transaction</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Client Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Phone Number *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="+91 98200..."
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Property Project</label>
                  <select 
                    value={newPropertyTitle}
                    onChange={(e) => {
                      const selectedProp = SEED_PROPERTIES.find(p => p.title === e.target.value);
                      setNewPropertyTitle(e.target.value);
                      if (selectedProp) {
                        if (selectedProp.unit_no) setNewUnitNumber(selectedProp.unit_no);
                        if (selectedProp.configuration) setNewConfig(selectedProp.configuration);
                        if (selectedProp.price) setNewDealValue(String(selectedProp.price));
                      }
                    }}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-semibold cursor-pointer"
                  >
                    {SEED_PROPERTIES.map(p => (
                      <option key={p.id} value={p.title}>{p.title} ({p.configuration})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Unit Number & Config</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input 
                      type="text" 
                      value={newUnitNumber}
                      placeholder="Unit No"
                      onChange={(e) => setNewUnitNumber(e.target.value)}
                      className="h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-semibold"
                    />
                    <input 
                      type="text" 
                      value={newConfig}
                      placeholder="Config"
                      onChange={(e) => setNewConfig(e.target.value)}
                      className="h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Agreed Deal Value (₹)</label>
                  <input 
                    type="number" 
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs font-bold text-[#b8922e]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Token Amount (₹)</label>
                  <input 
                    type="number" 
                    value={newTokenAmount}
                    onChange={(e) => setNewTokenAmount(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs font-bold text-emerald-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Sales Agent</label>
                  <select 
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-semibold cursor-pointer"
                  >
                    {SEED_SALESPEOPLE.map(agent => (
                      <option key={agent.id} value={agent.full_name}>{agent.full_name} ({agent.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Channel Partner / Source</label>
                  <select 
                    value={newPartner}
                    onChange={(e) => setNewPartner(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-semibold cursor-pointer"
                  >
                    <option value="Direct In-House">Direct In-House (0% CP Comm)</option>
                    {SEED_CHANNEL_PARTNERS.map(cp => (
                      <option key={cp.id} value={cp.firm_name}>{cp.firm_name} ({cp.tier} · {cp.commission_rate}%)</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#ebebeb]">
                <button 
                  type="button" 
                  onClick={() => setIsNewModalOpen(false)}
                  className="dc-btn font-semibold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="dc-btn gold font-bold"
                >
                  Save Deal & Generate Milestones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cost Sheet Modal integration */}
      {costSheetUnit && (
        <CostSheetModal 
          unit={costSheetUnit}
          clientName={selectedTx?.client_name}
          clientPhone={selectedTx?.client_phone}
          isOpen={Boolean(costSheetUnit)}
          onClose={() => setCostSheetUnit(null)}
        />
      )}

    </div>
  );
}
