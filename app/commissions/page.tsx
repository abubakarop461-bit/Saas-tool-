"use client";

import React, { useState } from 'react';
import { 
  BadgePercent, 
  DollarSign, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Building, 
  Users, 
  Award, 
  Plus, 
  FileText, 
  CreditCard,
  X,
  Check
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';

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

export default function CommissionManagementPage() {
  const [entries, setEntries] = useState<CommissionEntry[]>([
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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [selectedEntry, setSelectedEntry] = useState<CommissionEntry | null>(null);
  const [payoutAmount, setPayoutAmount] = useState<number>(50000);

  // Aggregate metrics
  const totalCommissionAll = entries.reduce((acc, c) => acc + c.total_commission, 0);
  const totalPaidAll = entries.reduce((acc, c) => acc + c.paid_amount, 0);
  const totalPendingAll = entries.reduce((acc, c) => acc + c.pending_amount, 0);

  const filteredEntries = entries.filter(e => {
    const matchesSearch = 
      e.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.unit_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || e.recipient_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleRecordPayout = () => {
    if (!selectedEntry || payoutAmount <= 0) return;
    const newPaid = Math.min(selectedEntry.paid_amount + payoutAmount, selectedEntry.total_commission);
    const newPending = selectedEntry.total_commission - newPaid;
    const newStatus = newPending === 0 ? 'Fully Paid' : 'Partially Paid';

    setEntries(prev => prev.map(e => e.id === selectedEntry.id ? {
      ...e,
      paid_amount: newPaid,
      pending_amount: newPending,
      status: newStatus,
      last_payout_date: new Date().toISOString().split('T')[0]
    } : e));

    setSelectedEntry(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-zinc-900">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#d4ad4d]/20 text-[#99771f]">
              Financial Settlement Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Commission Management & Disbursements
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Track deal-level commission calculations, disbursement milestones, and partner settlement ledgers.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Commission Accrued</span>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">₹{(totalCommissionAll / 100000).toFixed(2)} Lakhs</p>
            <p className="text-xs text-zinc-500 font-medium mt-1">Across all closed transactions</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-[#d4ad4d] flex items-center justify-center font-black">
            <BadgePercent className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Commission Paid</span>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">₹{(totalPaidAll / 100000).toFixed(2)} Lakhs</p>
            <p className="text-xs text-emerald-700 font-bold mt-1">Disbursed to date</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Pending Disbursement</span>
            <p className="text-2xl font-black text-amber-600 mt-0.5">₹{(totalPendingAll / 100000).toFixed(2)} Lakhs</p>
            <p className="text-xs text-amber-700 font-bold mt-1">Awaiting milestone triggers</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Partner Leaderboard Summary */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
          <Award className="h-4 w-4 text-[#b38f2d]" />
          Channel Partner Settlement Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { partner: 'ABC Realty Consultants', bookings: 8, revenue: 102000000, comm: 2040000, paid: 1500000 },
            { partner: 'XYZ Luxury Advisory', bookings: 5, revenue: 78000000, comm: 1560000, paid: 1000000 },
            { partner: 'ANAROCK Property', bookings: 3, revenue: 48000000, comm: 960000, paid: 500000 }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-xs text-zinc-900">{item.partner}</h4>
                  <p className="text-[11px] text-zinc-500">{item.bookings} Bookings • ₹{(item.revenue / 10000000).toFixed(1)} Cr Revenue</p>
                </div>
              </div>
              <div className="pt-2 border-t border-zinc-200 flex justify-between items-center text-xs">
                <span className="font-black text-[#b38f2d]">Total: ₹{(item.comm / 100000).toFixed(1)}L</span>
                <span className="font-bold text-emerald-600">Paid: ₹{(item.paid / 100000).toFixed(1)}L</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission Ledger Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search partner, client, unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#d4ad4d]"
            />
          </div>

          <div className="flex items-center gap-1">
            {['All', 'Channel Partner', 'Sales Executive'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === type ? 'bg-zinc-900 text-[#d4ad4d]' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-100 text-zinc-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3">Beneficiary</th>
                <th className="p-3">Deal / Unit</th>
                <th className="p-3">Booking Value</th>
                <th className="p-3">Rate</th>
                <th className="p-3">Total Commission</th>
                <th className="p-3">Paid vs Pending</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 font-medium">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-zinc-900">{entry.recipient_name}</div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase">{entry.recipient_type}</span>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-zinc-800">{entry.client_name}</div>
                    <div className="text-[11px] text-zinc-500">{entry.unit_number} ({entry.property_title})</div>
                  </td>
                  <td className="p-3 font-bold text-zinc-900">
                    {formatCurrency(entry.booking_value)}
                  </td>
                  <td className="p-3 font-bold text-[#b38f2d]">
                    {entry.commission_rate}%
                  </td>
                  <td className="p-3 font-black text-zinc-900">
                    {formatCurrency(entry.total_commission)}
                  </td>
                  <td className="p-3">
                    <div className="text-emerald-700 font-bold">Paid: {formatCurrency(entry.paid_amount)}</div>
                    <div className="text-amber-700 font-bold text-[11px]">Pending: {formatCurrency(entry.pending_amount)}</div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      entry.status === 'Fully Paid' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : entry.status === 'Partially Paid'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-zinc-100 text-zinc-700 border border-zinc-300'
                    }`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {entry.pending_amount > 0 ? (
                      <button
                        onClick={() => {
                          setSelectedEntry(entry);
                          setPayoutAmount(entry.pending_amount);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 text-[#d4ad4d] text-[10px] font-bold hover:bg-zinc-800"
                      >
                        Record Payout
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600">Settled ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden text-zinc-900">
            <div className="p-5 bg-zinc-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Disburse Commission Payout</h3>
              <button onClick={() => setSelectedEntry(null)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] font-bold uppercase">Beneficiary</span>
                <span className="font-bold text-sm text-zinc-900">{selectedEntry.recipient_name}</span>
                <p className="text-zinc-500">{selectedEntry.client_name} • Unit {selectedEntry.unit_number}</p>
              </div>

              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-1">
                <div className="flex justify-between">
                  <span>Total Commission:</span>
                  <span className="font-bold">{formatCurrency(selectedEntry.total_commission)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Already Paid:</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(selectedEntry.paid_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Pending:</span>
                  <span className="font-bold text-amber-600">{formatCurrency(selectedEntry.pending_amount)}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Disbursement Amount (₹)</label>
                <input 
                  type="number"
                  max={selectedEntry.pending_amount}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full border rounded-xl p-2.5 font-black text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRecordPayout}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  Confirm Payout Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
