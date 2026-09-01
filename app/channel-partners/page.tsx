"use client";

import React, { useState } from 'react';
import { 
  Users2, 
  Plus, 
  Search, 
  Filter, 
  Building, 
  Calendar, 
  DollarSign, 
  ShieldCheck, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  Eye, 
  Award,
  Layers,
  X,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';

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

export default function ChannelPartnersPage() {
  const [viewMode, setViewMode] = useState<'developer-crm' | 'broker-portal'>('developer-crm');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<ChannelPartner | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Broker portal simulation state
  const [registeredLeadName, setRegisteredLeadName] = useState('');
  const [registeredLeadPhone, setRegisteredLeadPhone] = useState('');
  const [registeredLeadBudget, setRegisteredLeadBudget] = useState('15000000');
  const [registeredLeadConfig, setRegisteredLeadConfig] = useState('3 BHK');
  const [duplicateAlert, setDuplicateAlert] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

  const totalCPRevenue = partners.reduce((acc, p) => acc + p.delivered_revenue, 0);
  const totalCPBookings = partners.reduce((acc, p) => acc + p.bookings, 0);
  const totalCPCommission = partners.reduce((acc, p) => acc + p.accrued_commission, 0);

  const filteredPartners = partners.filter(p => 
    p.firm_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.rera_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate duplicate anti-poaching check
    if (registeredLeadPhone.includes('98200 11223') || registeredLeadPhone.includes('99100 55443')) {
      setDuplicateAlert(`Conflict detected: Lead phone ${registeredLeadPhone} was already registered by in-house sales 12 days ago.`);
      setRegistrationSuccess(false);
      return;
    }

    setDuplicateAlert(null);
    setRegistrationSuccess(true);
    setTimeout(() => {
      setRegistrationSuccess(false);
      setRegisteredLeadName('');
      setRegisteredLeadPhone('');
    }, 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-zinc-900">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#d4ad4d]/20 text-[#99771f]">
              External Brokerage Ecosystem
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Channel Partner Management
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Manage partner onboarding, commission agreements, lead registrations, and dedicated broker portals.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
          <button
            onClick={() => setViewMode('developer-crm')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'developer-crm' ? 'bg-zinc-900 text-[#d4ad4d] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Developer CRM View
          </button>
          <button
            onClick={() => setViewMode('broker-portal')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'broker-portal' ? 'bg-zinc-900 text-[#d4ad4d] shadow-sm' : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            🌐 Broker Portal View
          </button>
        </div>
      </div>

      {viewMode === 'developer-crm' ? (
        <>
          {/* Developer CP Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total CP Revenue Delivered</span>
                <p className="text-2xl font-black text-zinc-900 mt-0.5">₹{(totalCPRevenue / 10000000).toFixed(2)} Cr</p>
                <p className="text-xs text-emerald-600 font-bold mt-1">From {totalCPBookings} Completed Bookings</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Broker Commission Accrued</span>
                <p className="text-2xl font-black text-[#b38f2d] mt-0.5">₹{(totalCPCommission / 100000).toFixed(1)} Lakhs</p>
                <p className="text-xs text-zinc-500 font-medium mt-1">Avg Rate: 2.0% on Booking Value</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <Award className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Registered Channel Partners</span>
                <p className="text-2xl font-black text-zinc-900 mt-0.5">{partners.length} Firms</p>
                <p className="text-xs text-blue-600 font-bold mt-1">100% RERA Verified</p>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                <Users2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Partners Table & Search */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input 
                  type="text"
                  placeholder="Search broker firm, contact, RERA..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#d4ad4d]"
                />
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-[#d4ad4d] text-xs font-bold hover:bg-zinc-800 flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Partner
              </button>
            </div>

            <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-100 text-zinc-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Partner Firm & Contact</th>
                    <th className="p-3">RERA ID</th>
                    <th className="p-3">Active Pipeline</th>
                    <th className="p-3">Bookings</th>
                    <th className="p-3">Delivered Revenue</th>
                    <th className="p-3">Commission Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium">
                  {filteredPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-zinc-900">{partner.firm_name}</div>
                        <div className="text-zinc-500 text-[11px]">{partner.contact_person} • {partner.phone}</div>
                      </td>
                      <td className="p-3 text-zinc-600 font-mono text-[11px]">{partner.rera_number}</td>
                      <td className="p-3">
                        <div className="text-zinc-800 font-bold">{partner.active_leads} Leads</div>
                        <div className="text-zinc-400 text-[10px]">{partner.site_visits} Visits • {partner.negotiations} In Negotiation</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {partner.bookings} Deals
                        </span>
                      </td>
                      <td className="p-3 font-black text-zinc-900">
                        {formatPriceShort(partner.delivered_revenue)}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-[#b38f2d]">{formatPriceShort(partner.accrued_commission)} Total</div>
                        <div className="text-[10px] text-zinc-500">
                          ₹{(partner.paid_commission / 100000).toFixed(1)}L Paid • ₹{((partner.accrued_commission - partner.paid_commission) / 100000).toFixed(1)}L Pending
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button 
                          onClick={() => {
                            setSelectedPartner(partner);
                            setViewMode('broker-portal');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-[#d4ad4d] text-[10px] font-bold hover:bg-zinc-800"
                        >
                          Launch Portal
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </>
      ) : (
        /* CHANNEL PARTNER DEDICATED PORTAL VIEW */
        <div className="space-y-6">
          <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#d4ad4d] text-zinc-950 flex items-center justify-center font-black">
                CP
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {selectedPartner ? selectedPartner.firm_name : 'ABC Realty Consultants — Partner Portal'}
                </h3>
                <p className="text-xs text-zinc-400">RERA: {selectedPartner?.rera_number || 'A52100001234'} • Tier: Diamond Partner</p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('developer-crm')}
              className="px-3 py-1.5 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300 hover:bg-zinc-800"
            >
              Exit Broker Portal
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Register Lead & Live Tracking */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Register New Lead Form */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#b38f2d]" />
                    Register New Prospective Client
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Anti-Poaching Protection Active
                  </span>
                </div>

                {duplicateAlert && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                    <X className="h-4 w-4 text-rose-600 flex-shrink-0" />
                    <span>{duplicateAlert}</span>
                  </div>
                )}

                {registrationSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Client successfully registered under your brokerage account for 60-day protection window!</span>
                  </div>
                )}

                <form onSubmit={handleRegisterLeadSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-700 block mb-1">Client Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Ramesh Shah"
                        value={registeredLeadName}
                        onChange={(e) => setRegisteredLeadName(e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-zinc-700 block mb-1">Phone Number (Protected)</label>
                      <input 
                        type="text" 
                        required
                        placeholder="+91 98200 00000"
                        value={registeredLeadPhone}
                        onChange={(e) => setRegisteredLeadPhone(e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-zinc-700 block mb-1">Preferred Configuration</label>
                      <select 
                        value={registeredLeadConfig}
                        onChange={(e) => setRegisteredLeadConfig(e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl p-2.5 font-bold"
                      >
                        <option value="2 BHK">2 BHK</option>
                        <option value="3 BHK">3 BHK</option>
                        <option value="4 BHK">4 BHK</option>
                        <option value="Villa">Villa</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-zinc-700 block mb-1">Budget Target</label>
                      <input 
                        type="text" 
                        value={registeredLeadBudget}
                        onChange={(e) => setRegisteredLeadBudget(e.target.value)}
                        className="w-full border border-zinc-300 rounded-xl p-2.5 font-medium"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-zinc-900 text-[#d4ad4d] font-bold text-xs hover:bg-zinc-800 shadow-md flex items-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" /> Register & Lock Lead Protection
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Broker Leads & Status Tracker */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                  <span>My Registered Clients Pipeline</span>
                  <span className="text-xs font-bold text-[#b38f2d]">Total 4 Active</span>
                </h3>

                <div className="space-y-3">
                  {[
                    { name: 'Sandesh Kulkarni', config: '3 BHK - Unit A-1204', stage: 'Booking Confirmed', comm: '₹2,70,000', status: 'Pending Invoice' },
                    { name: 'Sameer Verma', config: '3 BHK - Unit A-1202', stage: 'Site Visit Completed', comm: '₹2,96,000', status: 'In Negotiation' },
                    { name: 'Pooja Hegde', config: '3 BHK - Unit A-1001', stage: 'Token / EOI', comm: '₹2,88,000', status: 'Agreement Draft' }
                  ].map((lead, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-zinc-200 flex items-center justify-between text-xs bg-zinc-50/50">
                      <div>
                        <h4 className="font-bold text-zinc-900">{lead.name}</h4>
                        <p className="text-zinc-500 text-[11px]">{lead.config}</p>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-800">
                          {lead.stage}
                        </span>
                        <p className="text-[#b38f2d] font-black text-xs mt-1">Est. Comm: {lead.comm}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column: Broker Commission & Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
                <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-wider">Commission Summary</h3>
                
                <div className="p-4 rounded-xl bg-zinc-900 text-white space-y-2">
                  <span className="text-[10px] font-bold text-[#d4ad4d] uppercase block">Total Commission Accrued</span>
                  <p className="text-2xl font-black text-white">₹9,60,000</p>
                  <div className="pt-2 border-t border-zinc-800 flex justify-between text-xs">
                    <span className="text-zinc-400">Paid: ₹5,00,000</span>
                    <span className="text-emerald-400 font-bold">Pending: ₹4,60,000</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <button className="w-full py-2.5 rounded-xl border border-zinc-300 font-bold text-zinc-800 hover:bg-zinc-50 flex items-center justify-center gap-2">
                    <FileText className="h-4 w-4" /> Download Commission Invoices
                  </button>
                  <button className="w-full py-2.5 rounded-xl border border-zinc-300 font-bold text-zinc-800 hover:bg-zinc-50 flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" /> Book VIP Client Site Visit
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Partner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 bg-zinc-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Onboard Channel Partner</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              setIsAddModalOpen(false);
            }} className="p-6 space-y-4 text-xs text-zinc-900">
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Brokerage Firm Name</label>
                <input type="text" required placeholder="e.g. Pune Prime Realty" className="w-full border rounded-xl p-2.5" />
              </div>
              <div>
                <label className="font-bold text-zinc-700 block mb-1">Key Contact Person</label>
                <input type="text" required placeholder="e.g. Vikas Sharma" className="w-full border rounded-xl p-2.5" />
              </div>
              <div>
                <label className="font-bold text-zinc-700 block mb-1">RERA Registration No.</label>
                <input type="text" required placeholder="A5210000XXXX" className="w-full border rounded-xl p-2.5" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-zinc-900 text-[#d4ad4d] rounded-xl font-bold">
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
