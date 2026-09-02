"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Home,
  Check
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { CostSheetModal, CostSheetUnit } from '@/components/cost-sheet/CostSheetModal';
import {
  DeveloperUnit,
  UnitStatus,
  SEED_DEVELOPER_UNITS,
  fetchDeveloperUnits,
  saveDeveloperUnits
} from '@/lib/inventory';

export type { UnitStatus, DeveloperUnit };

export const STATUS_COLORS: Record<UnitStatus, {
  badge: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
}> = {
  Available: {
    badge: 'bg-zinc-950 text-white border-zinc-900',
    bg: 'bg-white hover:bg-zinc-50',
    border: 'border-zinc-200',
    text: 'text-zinc-900',
    dot: 'bg-emerald-500'
  },
  Hold: {
    badge: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    bg: 'bg-zinc-50/80 hover:bg-zinc-100',
    border: 'border-zinc-200',
    text: 'text-zinc-900',
    dot: 'bg-amber-500'
  },
  Token: {
    badge: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    bg: 'bg-zinc-50/80 hover:bg-zinc-100',
    border: 'border-zinc-200',
    text: 'text-zinc-900',
    dot: 'bg-blue-500'
  },
  Negotiation: {
    badge: 'bg-zinc-100 text-zinc-800 border-zinc-300',
    bg: 'bg-zinc-50/80 hover:bg-zinc-100',
    border: 'border-zinc-200',
    text: 'text-zinc-900',
    dot: 'bg-orange-500'
  },
  Booked: {
    badge: 'bg-zinc-200 text-zinc-800 border-zinc-300',
    bg: 'bg-zinc-100/80 hover:bg-zinc-200',
    border: 'border-zinc-300',
    text: 'text-zinc-900',
    dot: 'bg-rose-500'
  },
  Sold: {
    badge: 'bg-zinc-200 text-zinc-600 border-zinc-300',
    bg: 'bg-zinc-100/50 hover:bg-zinc-100',
    border: 'border-zinc-200',
    text: 'text-zinc-600',
    dot: 'bg-zinc-800'
  }
};

export default function UnitInventoryPage() {
  const [selectedProject, setSelectedProject] = useState('Luxe Azure Palms - Tower A');
  const [selectedTower, setSelectedTower] = useState('Tower A');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [configFilter, setConfigFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<DeveloperUnit | null>(null);
  const [costSheetTargetUnit, setCostSheetTargetUnit] = useState<CostSheetUnit | null>(null);

  // Persistent building inventory
  const [units, setUnits] = useState<DeveloperUnit[]>(SEED_DEVELOPER_UNITS);

  useEffect(() => {
    async function loadUnits() {
      const data = await fetchDeveloperUnits();
      if (data && data.length > 0) {
        setUnits(data);
        setSelectedUnit(data[0]);
      }
    }
    loadUnits();
  }, []);

  // Distinct projects available
  const availableProjects = useMemo(() => {
    const list = Array.from(new Set(units.map(u => u.project_title)));
    return list.length > 0 ? list : ['Luxe Azure Palms - Tower A'];
  }, [units]);

  // Distinct towers for current project
  const availableTowers = useMemo(() => {
    const projectUnits = units.filter(u => u.project_title === selectedProject);
    const towers = Array.from(new Set(projectUnits.map(u => u.tower)));
    return towers.length > 0 ? towers : ['Tower A'];
  }, [units, selectedProject]);

  // Auto-adjust selected tower when project changes
  useEffect(() => {
    if (!availableTowers.includes(selectedTower)) {
      setSelectedTower(availableTowers[0] || 'Tower A');
    }
  }, [selectedProject, availableTowers, selectedTower]);

  // Distinct BHK configs for current project & tower
  const availableConfigs = useMemo(() => {
    const projectUnits = units.filter(u => u.project_title === selectedProject && u.tower === selectedTower);
    return Array.from(new Set(projectUnits.map(u => u.configuration)));
  }, [units, selectedProject, selectedTower]);

  // Aggregate stats for currently selected project
  const stats = useMemo(() => {
    const projectUnits = units.filter(u => u.project_title === selectedProject);
    const total = projectUnits.length;
    const available = projectUnits.filter(u => u.status === 'Available').length;
    const hold = projectUnits.filter(u => u.status === 'Hold').length;
    const token = projectUnits.filter(u => u.status === 'Token').length;
    const neg = projectUnits.filter(u => u.status === 'Negotiation').length;
    const booked = projectUnits.filter(u => u.status === 'Booked').length;
    const sold = projectUnits.filter(u => u.status === 'Sold').length;
    return { total, available, hold, token, neg, booked, sold };
  }, [units, selectedProject]);

  // Filtered unit matrix
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const matchesProject = u.project_title === selectedProject;
      const matchesTower = u.tower === selectedTower;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const matchesConfig = configFilter === 'All' || u.configuration === configFilter;
      const matchesSearch = !searchQuery || 
        u.unit_number.includes(searchQuery) ||
        u.configuration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.facing.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.buyer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesTower && matchesStatus && matchesConfig && matchesSearch;
    });
  }, [units, selectedProject, selectedTower, statusFilter, configFilter, searchQuery]);

  const handleUpdateUnitStatus = (unitId: string, newStatus: UnitStatus) => {
    const updated = units.map(u => u.id === unitId ? { ...u, status: newStatus } : u);
    setUnits(updated);
    saveDeveloperUnits(updated);
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
    <div className="space-y-5 pb-8 min-h-[calc(100vh-100px)]">
      
      {/* ── Top Executive Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-850 p-5 rounded-[14px] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#d4ad4d]/10 border border-[#d4ad4d]/20 text-[#d4ad4d] text-[10px] font-extrabold uppercase tracking-widest">
            <Building2 className="h-3.5 w-3.5" />
            <span>Real Estate Building Console</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Unit Inventory
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Granular building inventory grid, floor matrix, unit status controls & instant cost sheets.
          </p>
        </div>

        {/* Executive Stats Metric Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Available: {stats.available}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Hold: {stats.hold}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Token: {stats.token}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
            <span>Sold: {stats.sold + stats.booked}</span>
          </div>
        </div>
      </div>

      {/* ── Option 3: Modern Data Console 3-Pane Workstation ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ── PANE 1: Left Filter Drawer (3 Cols / 25%) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="bg-white border border-zinc-200 rounded-[14px] p-4 shadow-xs space-y-4">
            <div className="border-b border-zinc-100 pb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Inventory Filters</span>
              <span className="text-[10px] font-mono text-zinc-400">{filteredUnits.length} Units</span>
            </div>

            {/* 1. Project Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Project</label>
              <select
                aria-label="Select Landmark Property"
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-bold text-zinc-900 focus:bg-white cursor-pointer"
              >
                {availableProjects.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* 2. Tower Segment Switcher */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tower</label>
              <div className="grid grid-cols-2 gap-1.5">
                {availableTowers.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTower(t)}
                    className={`py-1.5 px-2 rounded-[7px] text-xs font-bold transition-all cursor-pointer ${
                      selectedTower === t
                        ? 'bg-zinc-950 text-white border border-zinc-950 shadow-xs'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Search Bar */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Search Unit</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Unit #, facing, buyer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-medium focus:bg-white"
                />
              </div>
            </div>

            {/* 4. BHK Config Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Layout Filter</label>
              <select
                aria-label="Filter by BHK Configuration"
                value={configFilter}
                onChange={(e) => setConfigFilter(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-semibold text-zinc-800 cursor-pointer"
              >
                <option value="All">All BHK Layouts</option>
                {availableConfigs.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 5. Status Filter */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Status Filter</label>
              <select
                aria-label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-semibold text-zinc-800 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Hold">Hold</option>
                <option value="Token">Token / EOI</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Booked">Booked</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

          </div>

        </div>

        {/* ── PANE 2: Center High-Density Data Grid (6 Cols / 50%) ── */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-[14px] shadow-xs overflow-hidden">
            
            {/* Table Header Strip */}
            <div className="bg-zinc-950 text-white px-4 py-3 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[#d4ad4d]">{selectedTower}</span>
                <span className="text-zinc-500">•</span>
                <span className="text-zinc-300 font-semibold">{selectedProject}</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">
                {filteredUnits.length} Units Listed
              </span>
            </div>

            {/* High Density Table */}
            <div className="max-h-[540px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Unit #</th>
                    <th className="p-3">Floor</th>
                    <th className="p-3">BHK Config</th>
                    <th className="p-3">Carpet</th>
                    <th className="p-3">Base Price</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-medium">
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-zinc-400 text-xs">
                        No units match your filter selection.
                      </td>
                    </tr>
                  ) : (
                    filteredUnits.map((u) => {
                      const isSelected = selectedUnit?.id === u.id;
                      const statusStyle = STATUS_COLORS[u.status];
                      return (
                        <tr
                          key={u.id}
                          onClick={() => setSelectedUnit(u)}
                          className={`cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-zinc-100/90 font-bold border-l-4 border-l-[#d4ad4d]' 
                              : 'hover:bg-zinc-50/80 text-zinc-800'
                          }`}
                        >
                          <td className="p-3 font-extrabold text-zinc-900">#{u.unit_number}</td>
                          <td className="p-3 text-zinc-500">Floor {u.floor}</td>
                          <td className="p-3 font-semibold text-zinc-800">{u.configuration}</td>
                          <td className="p-3 text-zinc-500">{u.carpet_area} sq ft</td>
                          <td className="p-3 font-extrabold text-[#b4882d]">{formatPriceShort(u.base_price)}</td>
                          <td className="p-3 text-right">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyle.badge}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                              {u.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* ── PANE 3: Right Unit Spec Inspector Drawer (3 Cols / 25%) ── */}
        <div className="lg:col-span-3 space-y-4">
          {selectedUnit ? (
            <div className="bg-white border border-zinc-200 rounded-[14px] p-4 shadow-xs space-y-4">
              
              <div className="border-b border-zinc-100 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-[#b4882d] tracking-wider">
                    Unit Specification
                  </span>
                  <h3 className="text-base font-extrabold text-zinc-900">
                    Unit #{selectedUnit.unit_number}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    {selectedUnit.tower}, Floor {selectedUnit.floor}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${STATUS_COLORS[selectedUnit.status].badge}`}>
                  {selectedUnit.status}
                </span>
              </div>

              {/* Specs Table */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-[10px] p-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">BHK Layout</span>
                  <span className="font-extrabold text-zinc-900">{selectedUnit.configuration}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">Carpet Area</span>
                  <span className="font-extrabold text-zinc-900">{selectedUnit.carpet_area} sq ft</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">Built-up Area</span>
                  <span className="font-bold text-zinc-800">{selectedUnit.built_up_area} sq ft</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">Facing</span>
                  <span className="font-bold text-zinc-800">{selectedUnit.facing}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-200/60">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">Base Valuation</span>
                  <span className="font-extrabold text-[#b4882d]">{formatPriceShort(selectedUnit.base_price)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">Possession</span>
                  <span className="font-bold text-zinc-800">{selectedUnit.possession_date}</span>
                </div>
              </div>

              {/* Status Switcher Controls */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Update Status
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Available', 'Hold', 'Token', 'Negotiation', 'Booked', 'Sold'] as UnitStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateUnitStatus(selectedUnit.id, st)}
                      className={`py-1.5 px-2 rounded-[7px] text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedUnit.status === st
                          ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cost Sheet Action Button */}
              <button
                type="button"
                onClick={() => openCostSheet(selectedUnit)}
                className="w-full py-2.5 px-3 rounded-[9px] bg-zinc-950 hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-zinc-800 hover:border-[#d4ad4d] transition-all cursor-pointer shadow-xs"
              >
                <Calculator className="h-3.5 w-3.5 text-[#d4ad4d]" />
                <span>1-Click Cost Sheet</span>
              </button>

            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-[14px] p-6 text-center text-xs text-zinc-400">
              Select a unit from the table to inspect details.
            </div>
          )}
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
