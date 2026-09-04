"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/lib/auth';
import { fetchLeads, fetchProperties, Lead, Property } from '@/lib/queries';
import { fetchSiteVisits, SiteVisit } from '@/lib/siteVisits';
import { fetchTransactions, DealTransaction } from '@/lib/transactions';
import { fetchAdSpendMap, saveAdSpendRecord } from '@/lib/adSpend';
import { formatPriceShort } from '@/lib/formatters';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Award, 
  Target, 
  Filter, 
  Save, 
  Sparkles, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle,
  Megaphone,
  Globe,
  Users2,
  Compass,
  Layers,
  Search,
  FileSpreadsheet
} from 'lucide-react';
import { 
  computeAdPerformanceMetrics, 
  SourceMetrics, 
  ComputedAttributionResult 
} from '@/lib/attributionEngine';

// Helper to normalize strings for conservative exact matching
function normalizeName(name?: string | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.)\s+/i, '')
    .replace(/[^a-z0-9]/g, '');
}

// Canonical category mapping helper
function categorizeSource(source: string): 'Paid Digital' | 'Portals' | 'Channel Partners' | 'Organic / Direct' | 'Other' {
  const s = source.toLowerCase();
  if (s.includes('instagram') || s.includes('google') || s.includes('facebook') || s.includes('meta') || s.includes('ad') || s.includes('campaign')) {
    return 'Paid Digital';
  }
  if (s.includes('99acres') || s.includes('housing') || s.includes('magicbricks') || s.includes('portal')) {
    return 'Portals';
  }
  if (s.includes('channel partner') || s.includes('broker') || s.includes('cp') || s.includes('realty') || s.includes('knight frank')) {
    return 'Channel Partners';
  }
  if (s.includes('referral') || s.includes('walk-in') || s.includes('direct') || s.includes('vip')) {
    return 'Organic / Direct';
  }
  return 'Other';
}

export default function AdPerformancePage() {
  const profile = useProfile();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [transactions, setTransactions] = useState<DealTransaction[]>([]);
  const [adSpendMap, setAdSpendMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  // Extract Sheet State
  const [isExtractingSheet, setIsExtractingSheet] = useState(false);

  const handleExtractSheet = async () => {
    setIsExtractingSheet(true);
    try {
      const response = await fetch('/api/meta/leads/export', { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to extract Meta Lead Ads sheet.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Meta_Leads_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Raw Meta Lead Ads sheet extracted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Extract Sheet failed');
    } finally {
      setIsExtractingSheet(false);
    }
  };

  // Inline table spend editing state
  const [editingSpend, setEditingSpend] = useState<Record<string, string>>({});
  const [savingSource, setSavingSource] = useState<string | null>(null);

  // Modal State for Spend Management
  const [isSpendModalOpen, setIsSpendModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [spendInputValue, setSpendInputValue] = useState<string>('');
  const [isSavingSpend, setIsSavingSpend] = useState(false);

  // Load all foundational data sources
  useEffect(() => {
    async function loadData() {
      try {
        const [l, p, sv, tx, spend] = await Promise.all([
          fetchLeads(profile),
          fetchProperties(profile),
          fetchSiteVisits(profile),
          fetchTransactions(),
          fetchAdSpendMap(profile?.company_name || 'default_company')
        ]);
        setLeads(l || []);
        setProperties(p || []);
        setSiteVisits(sv || []);
        setTransactions(tx || []);
        setAdSpendMap(spend || {});

        const initialEdit: Record<string, string> = {};
        Object.entries(spend || {}).forEach(([src, val]) => {
          initialEdit[src] = String(val);
        });
        setEditingSpend(initialEdit);
      } catch (err) {
        console.error('Failed to load ad performance data:', err);
        toast.error('Failed to load marketing analytics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [profile]);

  const handleOpenSpendModal = (source: string) => {
    setEditingSource(source);
    setSpendInputValue(adSpendMap[source]?.toString() || '0');
    setIsSpendModalOpen(true);
  };

  const handleSaveSpend = async (sourceArg?: string) => {
    const src = sourceArg || editingSource;
    if (!src) return;

    const rawVal = sourceArg ? (editingSpend[src] ?? String(adSpendMap[src] || 0)) : spendInputValue;
    const amount = parseFloat(rawVal);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid non-negative number');
      return;
    }

    if (sourceArg) setSavingSource(src);
    else setIsSavingSpend(true);

    try {
      const res = await saveAdSpendRecord(src, amount, profile?.company_name || 'default_company');
      setAdSpendMap(prev => ({ ...prev, [src]: amount }));
      setEditingSpend(prev => ({ ...prev, [src]: String(amount) }));
      if (isSpendModalOpen) setIsSpendModalOpen(false);
      toast.success(`Ad spend updated for ${src} (${res.mode === 'd1' ? 'Cloudflare D1' : 'Local'})`);
    } catch {
      toast.error('Failed to persist ad spend');
    } finally {
      if (sourceArg) setSavingSource(null);
      else setIsSavingSpend(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // DATA ATTRIBUTION COMPUTATION (Pure Domain Engine Call)
  // ─────────────────────────────────────────────────────────────
  const computedMetrics = useMemo(() => {
    return computeAdPerformanceMetrics(
      leads,
      properties,
      siteVisits,
      transactions,
      adSpendMap,
      selectedPropertyId
    );
  }, [leads, properties, siteVisits, transactions, adSpendMap, selectedPropertyId]);

  // Filter rows by Category & Search Query
  const filteredRows = useMemo(() => {
    return computedMetrics.rows.filter(r => {
      const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
      const matchesQuery = !searchQuery.trim() || r.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [computedMetrics.rows, selectedCategory, searchQuery]);

  // Overall totals
  const totals = useMemo(() => {
    const totalSpend = filteredRows.reduce((acc, r) => acc + r.spend, 0);
    const totalLeads = filteredRows.reduce((acc, r) => acc + r.leadsCount, 0);
    const totalQualified = filteredRows.reduce((acc, r) => acc + r.qualifiedCount, 0);
    const totalVisits = filteredRows.reduce((acc, r) => acc + r.visitsCount, 0);
    const totalAttributedDeals = filteredRows.reduce((acc, r) => acc + r.dealsCount, 0);
    const totalAttributedRevenue = filteredRows.reduce((acc, r) => acc + r.revenue, 0);

    const overallCPL = totalLeads > 0 ? totalSpend / totalLeads : null;
    const overallCAC = totalAttributedDeals > 0 ? totalSpend / totalAttributedDeals : null;
    const overallROAS = totalSpend > 0 ? totalAttributedRevenue / totalSpend : null;
    const overallROI = totalSpend > 0 ? ((totalAttributedRevenue - totalSpend) / totalSpend) * 100 : null;

    return {
      totalSpend,
      totalLeads,
      totalQualified,
      totalVisits,
      totalAttributedDeals,
      totalAttributedRevenue,
      overallCPL,
      overallCAC,
      overallROAS,
      overallROI
    };
  }, [filteredRows]);

  // Performance Highlights / Evidence-based recommendations
  const insights = useMemo(() => {
    if (filteredRows.length === 0) return [];
    const res: { type: 'success' | 'warning' | 'info'; text: string }[] = [];

    // Highest Lead Volume
    const maxLeads = [...filteredRows].sort((a, b) => b.leadsCount - a.leadsCount)[0];
    if (maxLeads && maxLeads.leadsCount > 0) {
      res.push({
        type: 'info',
        text: `Highest Lead Volume: ${maxLeads.source} generated ${maxLeads.leadsCount} leads (${Math.round((maxLeads.leadsCount / (totals.totalLeads || 1)) * 100)}% of total).`
      });
    }

    // Best ROAS
    const bestRoas = [...filteredRows].filter(r => r.roas !== null && r.roas > 0).sort((a, b) => (b.roas || 0) - (a.roas || 0))[0];
    if (bestRoas && bestRoas.roas) {
      res.push({
        type: 'success',
        text: `Top ROAS Producer: ${bestRoas.source} returned ${bestRoas.roas.toFixed(2)}x ROAS on ₹${(bestRoas.spend / 1000).toFixed(0)}k spend.`
      });
    }

    // High Spend Low Conversion Warning
    const highSpendLowConversion = filteredRows.find(r => r.spend > 40000 && r.dealsCount === 0);
    if (highSpendLowConversion) {
      res.push({
        type: 'warning',
        text: `High Spend Audit Needed: ${highSpendLowConversion.source} has ₹${(highSpendLowConversion.spend / 1000).toFixed(0)}k spend with 0 closed deals.`
      });
    }

    return res;
  }, [filteredRows, totals]);

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-8 text-zinc-900">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER SECTION
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-zinc-900 text-[#d4ad4d]">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
                Ad Performance & ROI Attribution
              </h1>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">
                Track marketing spend, CPL, CAC, ROAS & verified deal revenue across acquisition channels
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Property Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search sources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:border-zinc-400 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg p-1 shadow-sm text-xs">
            <Filter className="h-3.5 w-3.5 text-zinc-400 ml-1.5" />
            <select 
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-transparent font-semibold text-zinc-800 pr-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="All">All Property Inventory</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* Extract Sheet Action Button */}
          <button
            onClick={handleExtractSheet}
            disabled={isExtractingSheet}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-black text-[#d4ad4d] border border-zinc-800 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isExtractingSheet ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#d4ad4d] animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-3.5 w-3.5 text-[#d4ad4d]" />
                <span>Extract Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. KPI SUMMARY OVERVIEW CARDS
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        
        {/* Total Ad Spend */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Ad Spend</p>
          <p className="text-lg font-extrabold text-zinc-900">{formatPriceShort(totals.totalSpend)}</p>
          <p className="text-[10px] font-medium text-zinc-400">Tracked Campaigns</p>
        </div>

        {/* Total Leads */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Leads</p>
          <p className="text-lg font-extrabold text-zinc-900">{totals.totalLeads}</p>
          <p className="text-[10px] font-medium text-zinc-400">Captured in ERP</p>
        </div>

        {/* Qualified Leads */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Qualified Leads</p>
          <p className="text-lg font-extrabold text-emerald-600">{totals.totalQualified}</p>
          <p className="text-[10px] font-medium text-zinc-400">
            {totals.totalLeads > 0 ? `${Math.round((totals.totalQualified / totals.totalLeads) * 100)}% Qualified` : '—'}
          </p>
        </div>

        {/* Site Visits */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Site Visits</p>
          <p className="text-lg font-extrabold text-indigo-600">{totals.totalVisits}</p>
          <p className="text-[10px] font-medium text-zinc-400">Tours Completed</p>
        </div>

        {/* Deals Closed */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Deals Closed</p>
          <p className="text-lg font-extrabold text-amber-600">{totals.totalAttributedDeals}</p>
          <p className="text-[10px] font-medium text-zinc-400">Attributed Transactions</p>
        </div>

        {/* Attributed Revenue */}
        <div className="p-4 rounded-xl bg-white border border-zinc-200/80 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Attributed Rev</p>
          <p className="text-lg font-extrabold text-emerald-700">{formatPriceShort(totals.totalAttributedRevenue)}</p>
          <p className="text-[10px] font-medium text-zinc-400">Verified Deals</p>
        </div>

        {/* ROAS */}
        <div className="p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-[#d4ad4d] uppercase tracking-wider">ROAS</p>
          <p className="text-lg font-extrabold text-white">
            {totals.overallROAS !== null ? `${totals.overallROAS.toFixed(2)}x` : '—'}
          </p>
          <p className="text-[10px] font-medium text-zinc-400">Rev / Spend</p>
        </div>

        {/* ROI % */}
        <div className="p-4 rounded-xl bg-zinc-900 text-white border border-zinc-800 shadow-xs space-y-1.5">
          <p className="text-[10px] font-bold text-[#d4ad4d] uppercase tracking-wider">ROI %</p>
          <p className={`text-lg font-extrabold ${totals.overallROI !== null && totals.overallROI >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totals.overallROI !== null ? `${totals.overallROI >= 0 ? '+' : ''}${totals.overallROI.toFixed(0)}%` : '—'}
          </p>
          <p className="text-[10px] font-medium text-zinc-400">Net Margin %</p>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORY TABS FILTER & EVIDENCE INSIGHTS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-zinc-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Paid Digital', 'Portals', 'Channel Partners', 'Organic / Direct', 'Other'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-[#d4ad4d] shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="text-xs font-medium text-zinc-500 px-2">
            Showing <span className="font-bold text-zinc-900">{filteredRows.length}</span> sources
          </div>
        </div>

        {/* Evidence-Based Performance Insights */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((ins, idx) => (
              <div 
                key={idx}
                className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2.5 ${
                  ins.type === 'success' 
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900' 
                    : ins.type === 'warning'
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : 'bg-blue-50/60 border-blue-200 text-blue-900'
                }`}
              >
                {ins.type === 'success' && <Award className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />}
                {ins.type === 'warning' && <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />}
                {ins.type === 'info' && <Sparkles className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />}
                <span>{ins.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. SOURCE & CAMPAIGN ATTRIBUTION TABLE
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-zinc-900">Campaign Spend & Source Performance Matrix</h2>
            <p className="text-xs font-medium text-zinc-500">Edit spend amounts directly to calculate live CPL, CAC, ROAS & ROI</p>
          </div>
          <div className="text-xs text-zinc-400 font-semibold">
            D1 Persisted Data
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100/70 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[200px]">Campaign / Source</th>
                <th className="py-3 px-4 w-[160px]">Ad Spend (₹)</th>
                <th className="py-3 px-3 text-right">Leads</th>
                <th className="py-3 px-3 text-right">Qualified</th>
                <th className="py-3 px-3 text-right">Visits</th>
                <th className="py-3 px-3 text-right">Deals</th>
                <th className="py-3 px-4 text-right">Attributed Rev</th>
                <th className="py-3 px-3 text-right">CPL</th>
                <th className="py-3 px-3 text-right">CAC</th>
                <th className="py-3 px-4 text-right">ROAS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-zinc-400 font-medium">
                    No marketing sources found matching criteria
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.source} className="hover:bg-zinc-50/80 transition-colors group">
                    
                    {/* 1. Campaign / Source (with inline FB/IG Meta badge) */}
                    <td className="py-3 px-4 font-bold text-zinc-900">
                      <div className="flex items-center gap-2">
                        {row.source.toLowerCase().includes('instagram') || row.source.toLowerCase().includes('ig') ? (
                          <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-700 text-[9px] font-mono font-bold shrink-0">
                            IG
                          </span>
                        ) : row.source.toLowerCase().includes('facebook') || row.source.toLowerCase().includes('meta') || row.source.toLowerCase().includes('fb') ? (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[9px] font-mono font-bold shrink-0">
                            FB
                          </span>
                        ) : null}
                        <span className="truncate">{row.source}</span>
                      </div>
                    </td>

                    {/* 2. Ad Spend (₹) */}
                    <td className="py-2 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-zinc-400 font-bold">₹</span>
                        <input 
                          type="number" 
                          value={editingSpend[row.source] ?? String(row.spend)}
                          onChange={(e) => setEditingSpend({ ...editingSpend, [row.source]: e.target.value })}
                          className="w-24 px-2 py-1 bg-white border border-zinc-200 rounded text-xs font-semibold text-zinc-900 focus:outline-none focus:border-zinc-500 shadow-2xs"
                        />
                        <button
                          onClick={() => handleSaveSpend(row.source)}
                          disabled={savingSource === row.source}
                          title="Save spend to D1 database"
                          className="p-1 rounded bg-zinc-900 text-[#d4ad4d] hover:bg-zinc-800 disabled:opacity-50 transition-all cursor-pointer"
                        >
                          <Save className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* 3. Leads */}
                    <td className="py-3 px-3 text-right font-bold text-zinc-900">
                      {row.leadsCount}
                    </td>

                    {/* 4. Qualified */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-600">
                      {row.qualifiedCount}
                    </td>

                    {/* 5. Visits */}
                    <td className="py-3 px-3 text-right font-bold text-indigo-600">
                      {row.visitsCount}
                    </td>

                    {/* 6. Deals */}
                    <td className="py-3 px-3 text-right font-bold text-amber-600">
                      {row.dealsCount}
                    </td>

                    {/* 7. Attributed Rev */}
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                      {row.revenue > 0 ? formatPriceShort(row.revenue) : '—'}
                    </td>

                    {/* 8. CPL */}
                    <td className="py-3 px-3 text-right font-semibold text-zinc-700">
                      {row.cpl !== null ? `₹${Math.round(row.cpl).toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* 9. CAC */}
                    <td className="py-3 px-3 text-right font-semibold text-zinc-700">
                      {row.cac !== null ? `₹${Math.round(row.cac).toLocaleString('en-IN')}` : '—'}
                    </td>

                    {/* 10. ROAS */}
                    <td className="py-3 px-4 text-right font-extrabold text-zinc-900">
                      {row.roas !== null ? `${row.roas.toFixed(2)}x` : '—'}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. SOURCE NOT IDENTIFIED REVENUE UNMATCHED BREAKDOWN
      ───────────────────────────────────────────────────────────── */}
      {computedMetrics.totalUnattributedRevenue > 0 && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-amber-950">
                Source Not Identified Revenue: {formatPriceShort(computedMetrics.totalUnattributedRevenue)} ({computedMetrics.totalUnattributedDeals} completed deal{computedMetrics.totalUnattributedDeals > 1 ? 's' : ''})
              </p>
              <p className="text-amber-800 text-[11px] font-medium mt-0.5">
                These completed transactions belong to clients whose names could not be conservatively matched 1-to-1 to a lead source. In accordance with strict evidence-based attribution rules, this revenue is unassigned rather than falsely attributed.
              </p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-amber-200/60 rounded-lg text-[11px] font-bold text-amber-900 shrink-0">
            Unattributed Revenue Flag
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. CONVERSION FUNNEL VISUALIZATION
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-extrabold text-zinc-900">Marketing & Sales Conversion Funnel</h2>
          <p className="text-xs font-medium text-zinc-500">Full lifecycle conversion rates calculated from verified ERP records</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Step 1: Leads */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-600 uppercase tracking-wider text-[10px]">1. Total Leads</span>
              <span className="font-extrabold text-zinc-900">100%</span>
            </div>
            <p className="text-2xl font-black text-zinc-900">{totals.totalLeads}</p>
            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
              <div className="bg-zinc-900 h-full w-full" />
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">Inquiries Captured</p>
          </div>

          {/* Step 2: Qualified */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">2. Qualified Leads</span>
              <span className="font-extrabold text-emerald-700">
                {totals.totalLeads > 0 ? `${Math.round((totals.totalQualified / totals.totalLeads) * 100)}%` : '—'}
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{totals.totalQualified}</p>
            <div className="w-full bg-emerald-200/80 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full" 
                style={{ width: `${totals.totalLeads > 0 ? (totals.totalQualified / totals.totalLeads) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">Hot or Active Pipeline</p>
          </div>

          {/* Step 3: Site Visits */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-800 uppercase tracking-wider text-[10px]">3. Site Visits</span>
              <span className="font-extrabold text-indigo-700">
                {totals.totalQualified > 0 ? `${Math.round((totals.totalVisits / totals.totalQualified) * 100)}%` : '—'}
              </span>
            </div>
            <p className="text-2xl font-black text-indigo-700">{totals.totalVisits}</p>
            <div className="w-full bg-indigo-200/80 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full" 
                style={{ width: `${totals.totalQualified > 0 ? Math.min(100, (totals.totalVisits / totals.totalQualified) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-indigo-600 font-medium">Physical Property Tours</p>
          </div>

          {/* Step 4: Deals Closed */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2 relative">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">4. Deals Closed</span>
              <span className="font-extrabold text-amber-700">
                {totals.totalVisits > 0 ? `${Math.round((totals.totalAttributedDeals / totals.totalVisits) * 100)}%` : '—'}
              </span>
            </div>
            <p className="text-2xl font-black text-amber-700">{totals.totalAttributedDeals}</p>
            <div className="w-full bg-amber-200/80 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-600 h-full" 
                style={{ width: `${totals.totalVisits > 0 ? Math.min(100, (totals.totalAttributedDeals / totals.totalVisits) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-700 font-medium">Completed Transactions</p>
          </div>

        </div>
      </div>

    </div>
  );
}
