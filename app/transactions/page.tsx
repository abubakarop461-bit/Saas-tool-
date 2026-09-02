"use client";

import React, { useState, useMemo } from 'react';
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

export type TransactionStage = 
  | 'Lead'
  | 'Qualified'
  | 'Site Visit'
  | 'Follow-up'
  | 'Negotiation'
  | 'Token / EOI'
  | 'Booking'
  | 'Agreement'
  | 'Payment'
  | 'Registration'
  | 'Possession';

export const ALL_TRANSACTION_STAGES: TransactionStage[] = [
  'Lead',
  'Qualified',
  'Site Visit',
  'Follow-up',
  'Negotiation',
  'Token / EOI',
  'Booking',
  'Agreement',
  'Payment',
  'Registration',
  'Possession'
];

export interface PaymentMilestone {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
}

export interface DealTransaction {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  property_title: string;
  tower: string;
  unit_number: string;
  configuration: string;
  deal_value: number;
  token_amount: number;
  booking_status: 'Confirmed' | 'Draft' | 'Under Legal Review' | 'Completed';
  current_stage: TransactionStage;
  sales_agent: string;
  channel_partner: string;
  booking_date: string;
  expected_closure_date: string;
  payment_schedule: PaymentMilestone[];
  notes?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<DealTransaction[]>([
    {
      id: 'tx-1',
      client_name: 'Sandesh Kulkarni',
      client_phone: '+91 98200 44556',
      client_email: 'sandesh.k@kulkarnigroup.in',
      property_title: 'Vivencia Luxury Residences',
      tower: 'A',
      unit_number: 'A-1204',
      configuration: '3 BHK',
      deal_value: 13500000, // ₹1.35 Cr
      token_amount: 500000,  // ₹5 L
      booking_status: 'Confirmed',
      current_stage: 'Booking',
      sales_agent: 'Rishi Mahboobani',
      channel_partner: 'ABC Realty',
      booking_date: '2026-09-01',
      expected_closure_date: '2026-09-15',
      payment_schedule: [
        { id: 'm-1', name: 'Token / EOI', amount: 500000, dueDate: '2026-09-01', status: 'Paid', paidDate: '2026-09-01' },
        { id: 'm-2', name: 'Agreement (15%)', amount: 2000000, dueDate: '2026-09-15', status: 'Pending' },
        { id: 'm-3', name: '1st Installment (Plinth)', amount: 3000000, dueDate: '2026-10-15', status: 'Pending' },
        { id: 'm-4', name: 'Final Handover & Registration', amount: 8000000, dueDate: '2026-12-30', status: 'Pending' }
      ],
      notes: 'Customer requires agreement draft before Sep 10. Home loan pre-approved with HDFC.'
    },
    {
      id: 'tx-2',
      client_name: 'Ananya Sharma',
      client_phone: '+91 98200 11223',
      client_email: 'ananya.s@gmail.com',
      property_title: 'Pristine Kyra',
      tower: 'B',
      unit_number: 'B-1602',
      configuration: '4 BHK',
      deal_value: 31000000, // ₹3.10 Cr
      token_amount: 1000000, // ₹10 L
      booking_status: 'Confirmed',
      current_stage: 'Agreement',
      sales_agent: 'Vikram Seth',
      channel_partner: 'ANAROCK Property Consultants',
      booking_date: '2026-08-20',
      expected_closure_date: '2026-09-05',
      payment_schedule: [
        { id: 'm-1', name: 'Token Amount', amount: 1000000, dueDate: '2026-08-20', status: 'Paid', paidDate: '2026-08-20' },
        { id: 'm-2', name: 'Agreement Stamp Duty', amount: 4500000, dueDate: '2026-09-05', status: 'Paid', paidDate: '2026-09-04' },
        { id: 'm-3', name: 'Structure Milestone', amount: 10000000, dueDate: '2026-11-15', status: 'Pending' },
        { id: 'm-4', name: 'Possession Balance', amount: 15500000, dueDate: '2027-03-31', status: 'Pending' }
      ],
      notes: 'Stamp duty completed. Agreement signed and registered.'
    },
    {
      id: 'tx-3',
      client_name: 'Vikram Malhotra',
      client_phone: '+91 99100 55443',
      client_email: 'vikram.m@corporatespace.in',
      property_title: 'Power Heights',
      tower: 'East Tower',
      unit_number: 'E-0801',
      configuration: '3 BHK',
      deal_value: 14800000, // ₹1.48 Cr
      token_amount: 500000,
      booking_status: 'Draft',
      current_stage: 'Token / EOI',
      sales_agent: 'Rishi Mahboobani',
      channel_partner: 'Direct In-House',
      booking_date: '2026-09-01',
      expected_closure_date: '2026-09-20',
      payment_schedule: [
        { id: 'm-1', name: 'Token Amount', amount: 500000, dueDate: '2026-09-01', status: 'Paid', paidDate: '2026-09-01' },
        { id: 'm-2', name: 'Agreement (20%)', amount: 2460000, dueDate: '2026-09-20', status: 'Pending' },
        { id: 'm-3', name: 'Possession Balance', amount: 11840000, dueDate: '2027-01-31', status: 'Pending' }
      ],
      notes: 'Token cheque deposited in escrow.'
    },
    {
      id: 'tx-4',
      client_name: 'Rajesh Gupta',
      client_phone: '+91 98330 99881',
      client_email: 'rgupta@heritageinfra.com',
      property_title: 'Vivencia Heritage Villa',
      tower: 'Villa Row',
      unit_number: 'V-09',
      configuration: '5 BHK Villa',
      deal_value: 48000000, // ₹4.80 Cr
      token_amount: 2500000,
      booking_status: 'Completed',
      current_stage: 'Possession',
      sales_agent: 'Vikram Seth',
      channel_partner: 'XYZ Luxury Advisory',
      booking_date: '2026-05-10',
      expected_closure_date: '2026-08-30',
      payment_schedule: [
        { id: 'm-1', name: 'Token Amount', amount: 2500000, dueDate: '2026-05-10', status: 'Paid', paidDate: '2026-05-10' },
        { id: 'm-2', name: 'Agreement (15%)', amount: 7200000, dueDate: '2026-05-30', status: 'Paid', paidDate: '2026-05-28' },
        { id: 'm-3', name: 'Stage Payments', amount: 28300000, dueDate: '2026-07-30', status: 'Paid', paidDate: '2026-07-25' },
        { id: 'm-4', name: 'Final Handover', amount: 10000000, dueDate: '2026-08-30', status: 'Paid', paidDate: '2026-08-30' }
      ],
      notes: 'Possession certificate and keys handed over.'
    }
  ]);

  const [selectedTx, setSelectedTx] = useState<DealTransaction | null>(transactions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [costSheetUnit, setCostSheetUnit] = useState<CostSheetUnit | null>(null);

  // New Transaction Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newPropertyTitle, setNewPropertyTitle] = useState('Vivencia Luxury Residences');
  const [newUnitNumber, setNewUnitNumber] = useState('B-1402');
  const [newConfig, setNewConfig] = useState('3 BHK');
  const [newDealValue, setNewDealValue] = useState('14500000');
  const [newTokenAmount, setNewTokenAmount] = useState('500000');
  const [newAgent, setNewAgent] = useState('Rishi Mahboobani');
  const [newPartner, setNewPartner] = useState('ABC Realty');
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

  // Aggregate Metrics
  const totalPipelineValue = useMemo(() => transactions.reduce((acc, t) => acc + t.deal_value, 0), [transactions]);
  const totalTokensCollected = useMemo(() => transactions.reduce((acc, t) => acc + t.token_amount, 0), [transactions]);
  const activeBookingsCount = useMemo(() => transactions.filter(t => t.booking_status === 'Confirmed').length, [transactions]);

  const inlineStats = useMemo(() => [
    { label: 'Active Deals', count: transactions.length, colorClass: 'bg-zinc-400' },
    { label: 'Total Deal Value', count: formatPriceShort(totalPipelineValue), colorClass: 'bg-emerald-500' },
    { label: 'Tokens Collected', count: formatPriceShort(totalTokensCollected), colorClass: 'bg-blue-500' },
    { label: 'Confirmed Bookings', count: activeBookingsCount, colorClass: 'bg-[#d4ad4d]' }
  ], [transactions, totalPipelineValue, totalTokensCollected, activeBookingsCount]);

  const handleStageChange = (newStageValue: TransactionStage) => {
    if (!selectedTx) return;
    const updated = { ...selectedTx, current_stage: newStageValue };
    setSelectedTx(updated);
    setTransactions(prev => prev.map(t => t.id === selectedTx.id ? updated : t));
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
    setTransactions(prev => prev.map(t => t.id === selectedTx.id ? updatedTx : t));
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const dealVal = Number(newDealValue) || 10000000;
    const tokVal = Number(newTokenAmount) || 500000;
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
        { id: `m-${Date.now()}-1`, name: 'Token Amount', amount: tokVal, dueDate: 'Immediate', status: 'Paid', paidDate: new Date().toISOString().split('T')[0] },
        { id: `m-${Date.now()}-2`, name: 'Agreement (15%)', amount: Math.round(dealVal * 0.15), dueDate: 'In 15 days', status: 'Pending' },
        { id: `m-${Date.now()}-3`, name: 'Installments', amount: Math.round(dealVal * 0.35), dueDate: 'In 60 days', status: 'Pending' },
        { id: `m-${Date.now()}-4`, name: 'Final Handover', amount: Math.round(dealVal * 0.50) - tokVal, dueDate: 'On Possession', status: 'Pending' }
      ],
      notes: 'New transaction registered.'
    };
    setTransactions([newTx, ...transactions]);
    setSelectedTx(newTx);
    setIsNewModalOpen(false);
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
                <th>Client Details & Contact</th>
                <th>Property Project & Layout</th>
                <th className="text-center">Unit #</th>
                <th className="text-right">Deal Value</th>
                <th className="text-right">Token Amount</th>
                <th>Current Stage & Progress</th>
                <th>Sales Agent</th>
                <th>Channel Partner</th>
                <th>Booking Status</th>
                <th style={{ width: '80px' }} className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-xs font-semibold text-zinc-400">
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
                      className={`cursor-pointer group hover:bg-[#fafaf7] ${isSelected ? 'bg-[#fffdf5]' : ''}`}
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td>
                        <div className="flex flex-col">
                          <span className="font-extrabold text-zinc-900 text-xs group-hover:text-[#b8922e] transition-colors">
                            {tx.client_name}
                          </span>
                          <span className="text-[10.5px] text-zinc-500 font-medium">
                            {tx.client_phone} {tx.client_email ? `• ${tx.client_email}` : ''}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-800 text-xs">
                            {tx.property_title}
                          </span>
                          <span className="text-[10.5px] text-zinc-500 font-medium">
                            {tx.configuration} • Tower {tx.tower}
                          </span>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-zinc-100 text-[10.5px] font-extrabold text-zinc-800 uppercase">
                          {tx.unit_number}
                        </span>
                      </td>
                      <td className="text-right font-black text-zinc-900 text-xs">
                        {formatPriceShort(tx.deal_value)}
                      </td>
                      <td className="text-right font-bold text-emerald-700 text-xs">
                        {formatPriceShort(tx.token_amount)}
                      </td>
                      <td>
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
                      <td>
                        <span className="text-xs text-zinc-700 font-semibold truncate block max-w-[120px]">
                          {tx.sales_agent}
                        </span>
                      </td>
                      <td>
                        <span className="text-xs text-zinc-700 font-semibold truncate block max-w-[120px]">
                          {tx.channel_partner}
                        </span>
                      </td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold">
                          {tx.booking_status}
                        </span>
                      </td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
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
        <div className="px-6 py-3 bg-[#fafaf8] border-t border-[#ebebeb] flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-zinc-500">
          <span>Showing {filteredTransactions.length} of {transactions.length} commercial transactions</span>
          <div className="flex items-center gap-4">
            <span>Total Value: <strong className="text-zinc-900">{formatCurrency(totalPipelineValue)}</strong></span>
            <span>Tokens Collected: <strong className="text-emerald-700">{formatCurrency(totalTokensCollected)}</strong></span>
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
                  <h3 className="text-[13px] font-extrabold text-zinc-900 tracking-tight">
                    Deal Inspection: {selectedTx.client_name}
                  </h3>
                  <p className="text-[10.5px] text-zinc-400 font-medium">
                    {selectedTx.client_phone} • {selectedTx.client_email || 'No email registered'}
                  </p>
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
                  <input 
                    type="text" 
                    value={newPropertyTitle}
                    onChange={(e) => setNewPropertyTitle(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Unit Number & Config</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input 
                      type="text" 
                      value={newUnitNumber}
                      onChange={(e) => setNewUnitNumber(e.target.value)}
                      className="h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs"
                    />
                    <input 
                      type="text" 
                      value={newConfig}
                      onChange={(e) => setNewConfig(e.target.value)}
                      className="h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Agreed Deal Value (₹)</label>
                  <input 
                    type="number" 
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Token Amount (₹)</label>
                  <input 
                    type="number" 
                    value={newTokenAmount}
                    onChange={(e) => setNewTokenAmount(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Sales Agent</label>
                  <input 
                    type="text" 
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Channel Partner / Source</label>
                  <input 
                    type="text" 
                    value={newPartner}
                    onChange={(e) => setNewPartner(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-3 text-xs"
                  />
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
