"use client";

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calculator, 
  FileText, 
  Share2, 
  Compass, 
  Car, 
  Sparkles, 
  Maximize2,
  X,
  Plus,
  ArrowRight,
  Home
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { CostSheetModal, CostSheetUnit } from '@/components/cost-sheet/CostSheetModal';
import { InlineStatsBar } from '@/components/ui/InlineStatsBar';

export type UnitStatus = 'Available' | 'Hold' | 'Token' | 'Negotiation' | 'Booked' | 'Sold';

export interface DeveloperUnit {
  id: string;
  project_title: string;
  tower: string;
  floor: number;
  unit_number: string;
  configuration: string;
  carpet_area: number; // sq ft
  built_up_area: number; // sq ft
  facing: string; // 'East' | 'North' | 'Garden' | 'Pool'
  base_price: number;
  floor_rise_rate: number;
  parking_charges: number;
  amenities_charges: number;
  other_charges: number;
  gst_rate: number;
  stamp_duty_rate: number;
  registration_rate: number;
  possession_date: string;
  status: UnitStatus;
  buyer_name?: string;
  agent_name?: string;
}

export const STATUS_COLORS: Record<UnitStatus, {
  badge: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
}> = {
  Available: {
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    bg: 'bg-emerald-50/50 hover:bg-emerald-100/70',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    dot: 'bg-emerald-500'
  },
  Hold: {
    badge: 'border-amber-200 bg-amber-50 text-amber-800',
    bg: 'bg-amber-50/50 hover:bg-amber-100/70',
    border: 'border-amber-200',
    text: 'text-amber-900',
    dot: 'bg-amber-500'
  },
  Token: {
    badge: 'border-blue-200 bg-blue-50 text-blue-800',
    bg: 'bg-blue-50/50 hover:bg-blue-100/70',
    border: 'border-blue-200',
    text: 'text-blue-900',
    dot: 'bg-blue-500'
  },
  Negotiation: {
    badge: 'border-orange-200 bg-orange-50 text-orange-800',
    bg: 'bg-orange-50/50 hover:bg-orange-100/70',
    border: 'border-orange-200',
    text: 'text-orange-900',
    dot: 'bg-orange-500'
  },
  Booked: {
    badge: 'border-rose-200 bg-rose-50 text-rose-800',
    bg: 'bg-rose-50/50 hover:bg-rose-100/70',
    border: 'border-rose-200',
    text: 'text-rose-900',
    dot: 'bg-rose-500'
  },
  Sold: {
    badge: 'border-zinc-300 bg-zinc-100 text-zinc-700',
    bg: 'bg-zinc-100/80 hover:bg-zinc-200/80',
    border: 'border-zinc-300',
    text: 'text-zinc-800',
    dot: 'bg-zinc-800'
  }
};

export default function UnitInventoryPage() {
  const [selectedProject, setSelectedProject] = useState('Panchshil Silverwoods');
  const [selectedTower, setSelectedTower] = useState('Tower A');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [configFilter, setConfigFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<DeveloperUnit | null>(null);
  const [costSheetTargetUnit, setCostSheetTargetUnit] = useState<CostSheetUnit | null>(null);

  // Initial developer building inventory
  const [units, setUnits] = useState<DeveloperUnit[]>([
    // Floor 14
    {
      id: 'u-1401',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 14,
      unit_number: '1401',
      configuration: '3 BHK',
      carpet_area: 1650,
      built_up_area: 2150,
      facing: 'East (Sunrise View)',
      base_price: 14800000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Available'
    },
    {
      id: 'u-1402',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 14,
      unit_number: '1402',
      configuration: '3 BHK',
      carpet_area: 1680,
      built_up_area: 2200,
      facing: 'Garden Facing',
      base_price: 15200000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Token',
      buyer_name: 'Anil Deshmukh',
      agent_name: 'Rishi M.'
    },
    {
      id: 'u-1403',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 14,
      unit_number: '1403',
      configuration: '4.5 BHK',
      carpet_area: 2450,
      built_up_area: 3200,
      facing: 'North-East (Vastu Compliant)',
      base_price: 24500000,
      floor_rise_rate: 60,
      parking_charges: 1000000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Hold',
      buyer_name: 'Sunita Rao',
      agent_name: 'Vikram Seth'
    },
    {
      id: 'u-1404',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 14,
      unit_number: '1404',
      configuration: '4.5 BHK',
      carpet_area: 2480,
      built_up_area: 3250,
      facing: 'Pool & Clubhouse View',
      base_price: 25200000,
      floor_rise_rate: 60,
      parking_charges: 1000000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Sold',
      buyer_name: 'Rajiv Bajaj',
      agent_name: 'Vikram Seth'
    },

    // Floor 12
    {
      id: 'u-1201',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 12,
      unit_number: '1201',
      configuration: '3 BHK',
      carpet_area: 1650,
      built_up_area: 2150,
      facing: 'East (Sunrise View)',
      base_price: 14600000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Available'
    },
    {
      id: 'u-1202',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 12,
      unit_number: '1202',
      configuration: '3 BHK',
      carpet_area: 1680,
      built_up_area: 2200,
      facing: 'Garden Facing',
      base_price: 14900000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Negotiation',
      buyer_name: 'Dr. Deshmukh',
      agent_name: 'Rishi M.'
    },
    {
      id: 'u-1203',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 12,
      unit_number: '1203',
      configuration: '4.5 BHK',
      carpet_area: 2450,
      built_up_area: 3200,
      facing: 'North-East (Vastu Compliant)',
      base_price: 24100000,
      floor_rise_rate: 60,
      parking_charges: 1000000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Booked',
      buyer_name: 'Vikramaditya S.',
      agent_name: 'Vikram Seth'
    },
    {
      id: 'u-1204',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 12,
      unit_number: '1204',
      configuration: '4.5 BHK',
      carpet_area: 2480,
      built_up_area: 3250,
      facing: 'Pool & Clubhouse View',
      base_price: 24800000,
      floor_rise_rate: 60,
      parking_charges: 1000000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Available'
    },

    // Floor 10
    {
      id: 'u-1001',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 10,
      unit_number: '1001',
      configuration: '3 BHK',
      carpet_area: 1650,
      built_up_area: 2150,
      facing: 'East (Sunrise View)',
      base_price: 14400000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Available'
    },
    {
      id: 'u-1002',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 10,
      unit_number: '1002',
      configuration: '3 BHK',
      carpet_area: 1680,
      built_up_area: 2200,
      facing: 'Garden Facing',
      base_price: 14700000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Available'
    },
    {
      id: 'u-1003',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 10,
      unit_number: '1003',
      configuration: '4.5 BHK',
      carpet_area: 2450,
      built_up_area: 3200,
      facing: 'North-East (Vastu Compliant)',
      base_price: 23800000,
      floor_rise_rate: 60,
      parking_charges: 1000000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Hold',
      buyer_name: 'Priya Sharma',
      agent_name: 'Rishi M.'
    },
    {
      id: 'u-1004',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 10,
      unit_number: '1004',
      configuration: '4.5 BHK',
      carpet_area: 2480,
      built_up_area: 3250,
      facing: 'Pool & Clubhouse View',
      base_price: 24400000,
      floor_rise_rate: 60,
      parking_charges: 1000000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Sold',
      buyer_name: 'Amitav Ghosh',
      agent_name: 'Vikram Seth'
    }
  ]);

  // Distinct floors sorted descending
  const floors = useMemo(() => {
    const set = new Set(units.map(u => u.floor));
    return Array.from(set).sort((a, b) => b - a);
  }, [units]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = units.length;
    const available = units.filter(u => u.status === 'Available').length;
    const hold = units.filter(u => u.status === 'Hold').length;
    const token = units.filter(u => u.status === 'Token').length;
    const neg = units.filter(u => u.status === 'Negotiation').length;
    const booked = units.filter(u => u.status === 'Booked').length;
    const sold = units.filter(u => u.status === 'Sold').length;
    return { total, available, hold, token, neg, booked, sold };
  }, [units]);

  const inlineStats = useMemo(() => [
    { label: 'Total Units', count: stats.total, colorClass: 'bg-zinc-400' },
    { label: 'Available Units', count: stats.available, colorClass: 'bg-emerald-500' },
    { label: 'On Hold', count: stats.hold, colorClass: 'bg-amber-500' },
    { label: 'Token / EOI', count: stats.token, colorClass: 'bg-blue-500' },
    { label: 'Negotiations', count: stats.neg, colorClass: 'bg-orange-500' },
    { label: 'Sold / Booked', count: stats.sold + stats.booked, colorClass: 'bg-zinc-800' }
  ], [stats]);

  // Filtered unit matrix
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchesTower = u.tower === selectedTower;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const matchesConfig = configFilter === 'All' || u.configuration === configFilter;
      const matchesSearch = !searchQuery || 
        u.unit_number.includes(searchQuery) ||
        u.configuration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.facing.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.buyer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTower && matchesStatus && matchesConfig && matchesSearch;
    });
  }, [units, selectedTower, statusFilter, configFilter, searchQuery]);

  const handleUpdateUnitStatus = (unitId: string, newStatus: UnitStatus) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: newStatus } : u));
    if (selectedUnit && selectedUnit.id === unitId) {
      setSelectedUnit(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const openCostSheet = (unit: DeveloperUnit) => {
    setCostSheetTargetUnit({
      project_title: unit.project_title,
      tower: unit.tower,
      floor: unit.floor,
      unit_number: unit.unit_number,
      configuration: unit.configuration,
      carpet_area: unit.carpet_area,
      built_up_area: unit.built_up_area,
      base_price: unit.base_price,
      parking_charges: unit.parking_charges,
      amenities_charges: unit.amenities_charges,
      other_charges: unit.other_charges,
      gst_percentage: unit.gst_rate,
      stamp_duty_percentage: unit.stamp_duty_rate,
      registration_charges: unit.registration_rate
    });
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
                Unit-Level Building Matrix
              </h1>
              <span className="bg-zinc-900 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                {units.length} Units Matrix
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Multi-Unit Developer ERP · Hierarchy: Project ➔ Tower ➔ Floor ➔ Color-Coded Unit Status
            </p>
          </div>

          {/* Header Controls: Project & Tower Selector */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tower Segment Control */}
            <div className="dc-seg">
              {['Tower A', 'Tower B', 'Sky Villas'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTower(t)}
                  className={`dc-seg-btn ${selectedTower === t ? 'on' : ''}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {selectedUnit && (
              <button
                type="button"
                onClick={() => openCostSheet(selectedUnit)}
                className="dc-btn gold font-bold flex items-center gap-1.5"
              >
                <Calculator className="h-3.5 w-3.5" />
                Generate Cost Sheet
              </button>
            )}
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
              placeholder="Search unit #, facing, buyer name..." 
              className="dc-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="dc-btn font-semibold cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available (🟢)</option>
            <option value="Hold">Hold (🟡)</option>
            <option value="Token">Token / EOI (🔵)</option>
            <option value="Negotiation">Negotiation (🟠)</option>
            <option value="Booked">Booked (🔴)</option>
            <option value="Sold">Sold (⚫)</option>
          </select>

          <select
            aria-label="Filter by BHK Configuration"
            value={configFilter}
            onChange={(e) => setConfigFilter(e.target.value)}
            className="dc-btn font-semibold cursor-pointer"
          >
            <option value="All">All BHK Layouts</option>
            <option value="3 BHK">3 BHK</option>
            <option value="4.5 BHK">4.5 BHK</option>
          </select>
        </div>

        {/* ── MATRIX VIEW & UNIT INSPECTOR SPLIT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#ebebeb] bg-white">
          
          {/* Unit Grid Matrix Column (8 cols) */}
          <div className="lg:col-span-8 p-6 space-y-6">
            
            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-2 text-xs pb-3 border-b border-[#ebebeb]">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mr-1">Legend:</span>
              {(['Available', 'Hold', 'Token', 'Negotiation', 'Booked', 'Sold'] as UnitStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(statusFilter === st ? 'All' : st)}
                  className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10.5px] font-bold transition-all border ${
                    statusFilter === st ? 'ring-2 ring-zinc-900' : ''
                  } ${STATUS_COLORS[st].badge}`}
                >
                  <span className={`h-2 w-2 rounded-full ${STATUS_COLORS[st].dot}`} />
                  {st}
                </button>
              ))}
            </div>

            {/* Building Floor Stack */}
            <div className="space-y-4">
              {floors.map((floorNum) => {
                const floorUnits = filteredUnits.filter(u => u.floor === floorNum);
                if (floorUnits.length === 0) return null;

                return (
                  <div key={floorNum} className="flex items-center gap-4">
                    {/* Floor Label */}
                    <div className="w-16 shrink-0 text-left">
                      <span className="text-xs font-extrabold text-zinc-900 block">Floor {floorNum}</span>
                      <span className="text-[9.5px] text-zinc-400 font-bold uppercase tracking-wider">{floorUnits.length} Units</span>
                    </div>

                    {/* Unit Cards in Floor */}
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {floorUnits.map((u) => {
                        const style = STATUS_COLORS[u.status];
                        const isSelected = selectedUnit?.id === u.id;
                        return (
                          <div
                            key={u.id}
                            onClick={() => setSelectedUnit(u)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${style.bg} ${style.border} ${
                              isSelected ? 'ring-2 ring-zinc-900 shadow-md scale-[1.02]' : 'hover:shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-xs font-black text-zinc-900 tracking-tight">
                                #{u.unit_number}
                              </span>
                              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                            </div>
                            <p className="text-[11px] font-bold text-zinc-700 mt-1">{u.configuration}</p>
                            <p className="text-[10px] text-zinc-500 font-medium">{u.carpet_area} sq ft</p>
                            <div className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between">
                              <span className="font-black text-xs text-zinc-900">{formatPriceShort(u.base_price)}</span>
                              <span className={`text-[8.5px] font-extrabold uppercase px-1 py-0.5 rounded ${style.badge}`}>
                                {u.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Granular Unit Inspector Column (4 cols) */}
          <div className="lg:col-span-4 p-6 bg-[#fafaf8] space-y-5">
            {selectedUnit ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-[#d4ad4d]">
                      Unit Specifications
                    </span>
                    <h3 className="text-base font-extrabold text-zinc-900 mt-0.5">
                      Unit #{selectedUnit.unit_number}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {selectedUnit.project_title} • {selectedUnit.tower}, Floor {selectedUnit.floor}
                    </p>
                  </div>
                  <span className={`dc-badge ${STATUS_COLORS[selectedUnit.status].badge}`}>
                    {selectedUnit.status}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="bg-white p-4 rounded-xl border border-[#e8e7e4] space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#f5f5f3]">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Configuration</span>
                    <span className="font-extrabold text-zinc-900">{selectedUnit.configuration}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f3]">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Carpet Area</span>
                    <span className="font-extrabold text-zinc-900">{selectedUnit.carpet_area} sq ft</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f3]">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Built-up Area</span>
                    <span className="font-extrabold text-zinc-900">{selectedUnit.built_up_area} sq ft</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f3]">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Facing / View</span>
                    <span className="font-bold text-zinc-800">{selectedUnit.facing}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#f5f5f3]">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Base Valuation</span>
                    <span className="font-extrabold text-[#b8922e]">{formatPriceShort(selectedUnit.base_price)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400 font-bold uppercase text-[9px]">Possession</span>
                    <span className="font-bold text-zinc-800">{selectedUnit.possession_date}</span>
                  </div>
                </div>

                {/* Status Switcher Controls */}
                <div className="bg-white p-4 rounded-xl border border-[#e8e7e4] space-y-2">
                  <span className="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Update Unit Status
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Available', 'Hold', 'Token', 'Negotiation', 'Booked', 'Sold'] as UnitStatus[]).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateUnitStatus(selectedUnit.id, st)}
                        className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          selectedUnit.status === st
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                            : 'bg-white border-[#e8e7e4] text-zinc-600 hover:border-zinc-400'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Action Trigger */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openCostSheet(selectedUnit)}
                    className="w-full dc-btn gold font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm text-xs"
                  >
                    <Calculator className="h-4 w-4" />
                    Generate 1-Click Cost Sheet
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-zinc-400 text-xs">
                Select a unit card in the building matrix to inspect detailed specifications and cost sheets.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost Sheet Modal */}
      {costSheetTargetUnit && (
        <CostSheetModal 
          unit={costSheetTargetUnit}
          isOpen={Boolean(costSheetTargetUnit)}
          onClose={() => setCostSheetTargetUnit(null)}
        />
      )}

    </div>
  );
}
