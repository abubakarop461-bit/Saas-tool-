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
  MoreVertical,
  X,
  CreditCard,
  Share2,
  Calculator,
  ShieldCheck,
  Check
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { CostSheetModal, CostSheetUnit } from '@/components/cost-sheet/CostSheetModal';

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
      sales_agent: 'Aarav Mehta',
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
      channel_partner: 'Square Yards',
      booking_date: '2026-08-28',
      expected_closure_date: '2026-09-20',
      payment_schedule: [
        { id: 'm-1', name: 'Token Booking', amount: 500000, dueDate: '2026-08-28', status: 'Paid', paidDate: '2026-08-28' },
        { id: 'm-2', name: 'Allotment Letter', amount: 1500000, dueDate: '2026-09-20', status: 'Pending' },
        { id: 'm-3', name: 'Slab Milestones', amount: 6000000, dueDate: '2026-12-15', status: 'Pending' },
        { id: 'm-4', name: 'Registry & Handover', amount: 6800000, dueDate: '2027-02-28', status: 'Pending' }
      ]
    },
    {
      id: 'tx-4',
      client_name: 'Rajesh Gupta',
      client_phone: '+91 94400 88776',
      client_email: 'rajesh.gupta@outlook.com',
      property_title: 'Vivencia Heritage Villa',
      tower: 'Villa Cluster',
      unit_number: 'V-09',
      configuration: '5 BHK',
      deal_value: 48000000, // ₹4.80 Cr
      token_amount: 2500000,
      booking_status: 'Completed',
      current_stage: 'Possession',
      sales_agent: 'Neha Roy',
      channel_partner: 'Direct In-House',
      booking_date: '2026-05-10',
      expected_closure_date: '2026-08-30',
      payment_schedule: [
        { id: 'm-1', name: 'Token', amount: 2500000, dueDate: '2026-05-10', status: 'Paid', paidDate: '2026-05-10' },
        { id: 'm-2', name: 'Agreement (20%)', amount: 7100000, dueDate: '2026-05-30', status: 'Paid', paidDate: '2026-05-28' },
        { id: 'm-3', name: 'Finishing Works', amount: 18400000, dueDate: '2026-07-15', status: 'Paid', paidDate: '2026-07-14' },
        { id: 'm-4', name: 'Final Possession & Keys', amount: 20000000, dueDate: '2026-08-30', status: 'Paid', paidDate: '2026-08-30' }
      ]
    }
  ]);

  const [selectedTx, setSelectedTx] = useState<DealTransaction | null>(transactions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [costSheetUnit, setCostSheetUnit] = useState<CostSheetUnit | null>(null);

  // New Deal Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newPropertyTitle, setNewPropertyTitle] = useState('Vivencia Luxury Residences');
  const [newUnitNumber, setNewUnitNumber] = useState('A-1402');
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
        tx.channel_partner.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStage = stageFilter === 'All' || tx.current_stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [transactions, searchQuery, stageFilter]);

  // Aggregate Metrics
  const totalPipelineValue = transactions.reduce((acc, t) => acc + t.deal_value, 0);
  const totalTokensCollected = transactions.reduce((acc, t) => acc + t.token_amount, 0);
  const activeBookingsCount = transactions.filter(t => t.booking_status === 'Confirmed').length;

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-zinc-900">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#d4ad4d]/20 text-[#99771f]">
              Post-Closure Financial Module
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Transactions & Bookings
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Manage the full commercial lifecycle from Token & Agreement to Registration & Final Possession.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 text-[#d4ad4d] text-xs font-bold hover:bg-zinc-800 transition-all shadow-md"
          >
            <Plus className="h-4 w-4" />
            Create New Deal
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Deal Value</p>
            <p className="text-xl font-black text-zinc-900 mt-0.5">₹{(totalPipelineValue / 10000000).toFixed(2)} Cr</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Tokens / EOI Collected</p>
            <p className="text-xl font-black text-[#b38f2d] mt-0.5">₹{(totalTokensCollected / 100000).toFixed(1)} Lakhs</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Confirmed Bookings</p>
            <p className="text-xl font-black text-zinc-900 mt-0.5">{activeBookingsCount} Units</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Transactions List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
            
            {/* Search and Stage Selector */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search deals, clients, units..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#d4ad4d] outline-none"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                {['All', 'Token / EOI', 'Booking', 'Agreement', 'Payment', 'Possession'].map(stg => (
                  <button
                    key={stg}
                    onClick={() => setStageFilter(stg)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                      stageFilter === stg 
                        ? 'bg-zinc-900 text-[#d4ad4d]' 
                        : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            {/* List items */}
            <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1">
              {filteredTransactions.map((tx) => {
                const isSelected = selectedTx?.id === tx.id;
                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-zinc-900 bg-zinc-50/90 shadow-sm ring-1 ring-zinc-900' 
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">
                          {tx.current_stage}
                        </span>
                        <h4 className="font-bold text-sm text-zinc-900 mt-1.5">{tx.client_name}</h4>
                        <p className="text-[11px] text-zinc-500">
                          {tx.configuration} • {tx.unit_number} ({tx.property_title})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-zinc-900 block">
                          {formatPriceShort(tx.deal_value)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                          Token: {formatPriceShort(tx.token_amount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 mt-3 pt-2.5 text-[10px] text-zinc-400 font-medium">
                      <span>Agent: {tx.sales_agent}</span>
                      <span>CP: {tx.channel_partner}</span>
                    </div>
                  </div>
                );
              })}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-10 text-zinc-400 text-xs font-medium">
                  No deals match the selected criteria.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Selected Deal Overview & Payment Schedule (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedTx ? (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden space-y-6 p-6">
              
              {/* Deal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-200 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-[#d4ad4d] flex items-center justify-center font-black text-lg shadow-md">
                    {selectedTx.client_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{selectedTx.client_name}</h3>
                    <p className="text-xs text-zinc-500 font-medium">{selectedTx.client_phone} • {selectedTx.client_email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCostSheetForDeal(selectedTx)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-bold text-zinc-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Calculator className="h-3.5 w-3.5 text-[#b38f2d]" />
                    Cost Sheet
                  </button>
                </div>
              </div>

              {/* 11-Stage Interactive Pipeline Stepper */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Transaction Lifecycle Stage
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
                  {ALL_TRANSACTION_STAGES.map((stg) => {
                    const isActive = selectedTx.current_stage === stg;
                    const stageIndex = ALL_TRANSACTION_STAGES.indexOf(stg);
                    const currentIndex = ALL_TRANSACTION_STAGES.indexOf(selectedTx.current_stage);
                    const isPassed = stageIndex <= currentIndex;

                    return (
                      <button
                        key={stg}
                        onClick={() => handleStageChange(stg)}
                        className={`p-2 rounded-xl text-[10px] font-bold text-center transition-all border ${
                          isActive
                            ? 'bg-zinc-900 text-[#d4ad4d] border-zinc-900 shadow-sm ring-1 ring-[#d4ad4d]'
                            : isPassed
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        {stg}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deal Overview Grid */}
              <div className="p-5 rounded-2xl bg-zinc-50/80 border border-zinc-200 space-y-4">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                  <span>Deal Overview</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {selectedTx.booking_status}
                  </span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Property & Unit</span>
                    <span className="font-bold text-zinc-900">{selectedTx.configuration} - {selectedTx.property_title}</span>
                    <p className="text-[11px] text-[#b38f2d] font-bold">Unit: {selectedTx.unit_number}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Deal Value</span>
                    <span className="text-sm font-black text-zinc-900">{formatCurrency(selectedTx.deal_value)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Token Amount</span>
                    <span className="text-sm font-black text-emerald-600">{formatCurrency(selectedTx.token_amount)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Sales Agent</span>
                    <span className="font-bold text-zinc-800">{selectedTx.sales_agent}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Channel Partner</span>
                    <span className="font-bold text-zinc-800">{selectedTx.channel_partner}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase block">Booking Date</span>
                    <span className="font-bold text-zinc-800">{selectedTx.booking_date}</span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule & Milestone Ledger */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#b38f2d]" />
                    Payment Schedule & Milestones
                  </h4>
                  <span className="text-[11px] text-zinc-400 font-medium">Click row to toggle Paid status</span>
                </div>

                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 text-zinc-500 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="p-3">Milestone</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Due Date</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-medium">
                      {selectedTx.payment_schedule.map((milestone) => (
                        <tr 
                          key={milestone.id}
                          className="hover:bg-zinc-50/80 transition-colors"
                        >
                          <td className="p-3 font-bold text-zinc-900">{milestone.name}</td>
                          <td className="p-3 font-bold text-zinc-900">{formatCurrency(milestone.amount)}</td>
                          <td className="p-3 text-zinc-600">{milestone.dueDate}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              milestone.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              {milestone.status === 'Paid' && <Check className="h-3 w-3" />}
                              {milestone.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleToggleMilestone(milestone.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                                milestone.status === 'Paid'
                                  ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
                              }`}
                            >
                              {milestone.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-zinc-200 text-center text-zinc-400 font-medium text-xs">
              Select a deal to view complete commercial details.
            </div>
          )}
        </div>

      </div>

      {/* New Transaction Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 bg-zinc-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#d4ad4d]" />
                <h3 className="font-bold text-sm">Create New Transaction / Deal</h3>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4 text-xs text-zinc-900">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Client Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Sandesh Kulkarni"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="+91 98200 00000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Unit Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. A-1204"
                    value={newUnitNumber}
                    onChange={(e) => setNewUnitNumber(e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Deal Value (₹)</label>
                  <input 
                    type="number" 
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Token Amount (₹)</label>
                  <input 
                    type="number" 
                    value={newTokenAmount}
                    onChange={(e) => setNewTokenAmount(e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl p-2.5 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Sales Agent</label>
                  <input 
                    type="text" 
                    value={newAgent}
                    onChange={(e) => setNewAgent(e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-700 block mb-1">Channel Partner</label>
                  <input 
                    type="text" 
                    value={newPartner}
                    onChange={(e) => setNewPartner(e.target.value)}
                    className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-900 text-[#d4ad4d] font-bold shadow-md"
                >
                  Confirm & Create Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cost Sheet Modal Connector */}
      {costSheetUnit && (
        <CostSheetModal 
          isOpen={!!costSheetUnit}
          onClose={() => setCostSheetUnit(null)}
          unit={costSheetUnit}
          clientName={selectedTx?.client_name}
          clientPhone={selectedTx?.client_phone}
        />
      )}

    </div>
  );
}
