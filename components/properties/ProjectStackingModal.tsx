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
  Check,
  Table as TableIcon,
  Grid
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { CostSheetModal, CostSheetUnit } from '@/components/cost-sheet/CostSheetModal';
import {
  DeveloperUnit,
  UnitStatus,
  fetchDeveloperUnits,
  saveDeveloperUnits,
  generateProjectUnits
} from '@/lib/inventory';
import { Property } from '@/lib/queries';

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

interface ProjectStackingModalProps {
  project: Property;
  onClose: () => void;
}

export function ProjectStackingModal({ project, onClose }: ProjectStackingModalProps) {
  const [allUnits, setAllUnits] = useState<DeveloperUnit[]>([]);
  const [selectedTower, setSelectedTower] = useState('Tower A');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [configFilter, setConfigFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'stacking'>('table');
  const [selectedUnit, setSelectedUnit] = useState<DeveloperUnit | null>(null);
  const [costSheetTargetUnit, setCostSheetTargetUnit] = useState<CostSheetUnit | null>(null);
  const [loading, setLoading] = useState(true);

  // Load project units on mount
  useEffect(() => {
    async function loadUnits() {
      setLoading(true);
      try {
        const data = await fetchDeveloperUnits();
        let projectUnits = data.filter(u => 
          (u.property_id && u.property_id === project.id) ||
          u.project_title.trim().toLowerCase() === project.title.trim().toLowerCase()
        );

        if (projectUnits.length === 0) {
          const isKP = project.title.toLowerCase().includes('kuchu');
          const isTrump = project.title.toLowerCase().includes('trump');
          const isSolitaire = project.title.toLowerCase().includes('solitaire');
          const isNyati = project.title.toLowerCase().includes('nyati');

          const towers = isKP 
            ? ['Tower A', 'Tower B', 'Tower C', 'Tower D']
            : isTrump
            ? ['West Wing', 'East Wing']
            : isSolitaire
            ? ['Tower 1', 'Tower 2', 'Tower 3']
            : isNyati
            ? ['Tower 1', 'Tower 2']
            : ['Tower A', 'Tower B', 'Tower C', 'Tower D'];

          const totalFloors = isKP ? 20 : isTrump ? 23 : isSolitaire ? 20 : 10;
          const unitsPerFloor = isKP ? 8 : isTrump ? 1 : isSolitaire ? 2 : 4;

          const generated = generateProjectUnits({
            property_id: project.id,
            project_title: project.title,
            towers,
            total_floors: totalFloors,
            units_per_floor: unitsPerFloor,
            configuration: project.configuration || '3 BHK, 4 BHK',
            carpet_area: project.carpet_area || 2100,
            built_up_area: project.built_up_area || 2750,
            base_price: project.price || 20000000,
            possession_date: 'December 2027'
          });
          projectUnits = generated;
          const updatedAll = [...data.filter(u => u.project_title !== project.title), ...generated];
          saveDeveloperUnits(updatedAll);
        }

        setAllUnits(projectUnits);
        if (projectUnits.length > 0) {
          setSelectedUnit(projectUnits[0]);
        }
      } catch (err) {
        console.error('Error loading units:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUnits();
  }, [project]);

  // Distinct towers for current project
  const availableTowers = useMemo(() => {
    const towers = Array.from(new Set(allUnits.map(u => u.tower)));
    return towers.length > 0 ? towers : ['Tower A'];
  }, [allUnits]);

  // Auto-adjust selected tower
  useEffect(() => {
    if (availableTowers.length > 0 && !availableTowers.includes(selectedTower)) {
      setSelectedTower(availableTowers[0] || 'Tower A');
    }
  }, [availableTowers, selectedTower]);

  // Distinct BHK configs for current tower
  const availableConfigs = useMemo(() => {
    const towerUnits = allUnits.filter(u => u.tower === selectedTower);
    return Array.from(new Set(towerUnits.map(u => u.configuration)));
  }, [allUnits, selectedTower]);

  // Aggregate stats for currently selected project
  const stats = useMemo(() => {
    const total = allUnits.length;
    const available = allUnits.filter(u => u.status === 'Available').length;
    const hold = allUnits.filter(u => u.status === 'Hold').length;
    const token = allUnits.filter(u => u.status === 'Token').length;
    const neg = allUnits.filter(u => u.status === 'Negotiation').length;
    const booked = allUnits.filter(u => u.status === 'Booked').length;
    const sold = allUnits.filter(u => u.status === 'Sold').length;
    const totalValuation = allUnits.reduce((sum, u) => sum + (u.base_price || 0), 0);
    return { total, available, hold, token, neg, booked, sold, totalValuation };
  }, [allUnits]);

  // Filtered unit matrix
  const filteredUnits = useMemo(() => {
    return allUnits.filter(u => {
      const matchesTower = u.tower === selectedTower;
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const matchesConfig = configFilter === 'All' || u.configuration === configFilter;
      const matchesSearch = !searchQuery || 
        u.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.configuration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.facing.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.buyer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTower && matchesStatus && matchesConfig && matchesSearch;
    });
  }, [allUnits, selectedTower, statusFilter, configFilter, searchQuery]);

  // Group by floor for stacking grid view
  const floorGroups = useMemo(() => {
    const map = new Map<number, DeveloperUnit[]>();
    filteredUnits.forEach(u => {
      const list = map.get(u.floor) || [];
      list.push(u);
      map.set(u.floor, list);
    });

    const sortedFloors = Array.from(map.keys()).sort((a, b) => b - a);
    return sortedFloors.map(floor => ({
      floor,
      units: map.get(floor)!.sort((a, b) => a.unit_number.localeCompare(b.unit_number, undefined, { numeric: true }))
    }));
  }, [filteredUnits]);

  const handleUpdateUnitStatus = async (unitId: string, newStatus: UnitStatus) => {
    const updated = allUnits.map(u => u.id === unitId ? { ...u, status: newStatus } : u);
    setAllUnits(updated);
    if (selectedUnit && selectedUnit.id === unitId) {
      setSelectedUnit(prev => prev ? { ...prev, status: newStatus } : null);
    }
    try {
      const fullData = await fetchDeveloperUnits();
      const merged = fullData.map(u => u.id === unitId ? { ...u, status: newStatus } : u);
      saveDeveloperUnits(merged);
    } catch {
      // ignore
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-zinc-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-[1400px] bg-[#fafaf8] border border-zinc-200 rounded-[18px] shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-left">
        
        {/* ── Top Executive Header Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border-b border-zinc-850 p-5 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 text-[#d4ad4d] text-[10px] font-extrabold uppercase tracking-widest">
              <Building2 className="h-3.5 w-3.5" />
              <span>Real Estate Building Console • {project.property_code || 'PRJ-MASTER'}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              {project.title}
              <span className="text-xs font-semibold text-zinc-400 font-normal">
                • {project.location || 'Pune'}
              </span>
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
            <div className="px-3 py-1.5 rounded-lg bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 text-[#d4ad4d] font-bold">
              {stats.total} Total Units ({formatPriceShort(stats.totalValuation)})
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors ml-1 cursor-pointer"
              title="Close Console"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Option 3: Modern Data Console 3-Pane Workstation ── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 overflow-y-auto">
          
          {/* ── PANE 1: Left Filter Drawer (3 Cols / 25%) ── */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white border border-zinc-200 rounded-[14px] p-4 shadow-xs space-y-4">
              <div className="border-b border-zinc-100 pb-2.5 flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">Inventory Filters</span>
                <span className="text-[10px] font-mono font-bold text-[#b8922e] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{filteredUnits.length} Units</span>
              </div>

              {/* 1. Project Info Card */}
              <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-[10px] space-y-1">
                <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block font-mono">Current Landmark Project</span>
                <h4 className="text-xs font-black text-zinc-900">{project.title}</h4>
                <p className="text-[10px] text-zinc-500">{project.location} • {availableTowers.length} Active Towers</p>
              </div>

              {/* 2. Tower Segment Switcher */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Tower Switcher</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {availableTowers.map((t) => {
                    const count = allUnits.filter(u => u.tower === t).length;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTower(t)}
                        className={`py-2 px-2.5 rounded-[8px] text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          selectedTower === t
                            ? 'bg-zinc-950 text-white border border-zinc-950 shadow-xs'
                            : 'bg-zinc-50 border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <span>{t}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${selectedTower === t ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-600'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
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
                    className="w-full pl-8 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-medium focus:bg-white focus:outline-none focus:border-[#d4ad4d]"
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
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-semibold text-zinc-800 focus:bg-white cursor-pointer"
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
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-semibold text-zinc-800 focus:bg-white cursor-pointer"
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

          {/* ── PANE 2: Center High-Density Data Grid & Stacking Matrix (6 Cols / 50%) ── */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white border border-zinc-200 rounded-[14px] shadow-xs overflow-hidden">
              
              {/* Table Header Strip */}
              <div className="bg-zinc-950 text-white px-4 py-3 border-b border-zinc-850 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#d4ad4d]">{selectedTower}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300 font-semibold">{project.title}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle: Table vs Stacking Matrix */}
                  <div className="inline-flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        viewMode === 'table' ? 'bg-[#d4ad4d] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <TableIcon className="h-3 w-3" />
                      <span>Table</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('stacking')}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        viewMode === 'stacking' ? 'bg-[#d4ad4d] text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Grid className="h-3 w-3" />
                      <span>Stacking</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-zinc-400">
                    {filteredUnits.length} Units Listed
                  </span>
                </div>
              </div>

              {/* View 1: High Density Table */}
              {viewMode === 'table' ? (
                <div className="max-h-[560px] overflow-y-auto">
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
                          <td colSpan={6} className="text-center py-12 text-zinc-400 text-xs font-semibold">
                            No units match your filter selection.
                          </td>
                        </tr>
                      ) : (
                        filteredUnits.map((u) => {
                          const isSelected = selectedUnit?.id === u.id;
                          const statusStyle = STATUS_COLORS[u.status] || STATUS_COLORS.Available;
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
              ) : (
                /* View 2: Visual Floor Stacking Grid Matrix */
                <div className="max-h-[560px] overflow-y-auto p-4 space-y-2.5 bg-[#fdfdfc]">
                  {floorGroups.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400 text-xs font-semibold">
                      No units match your filter selection.
                    </div>
                  ) : (
                    floorGroups.map(group => (
                      <div key={group.floor} className="flex items-center gap-3">
                        <div className="w-16 text-right pr-2 shrink-0">
                          <span className="text-[11px] font-mono font-extrabold text-zinc-700 block">
                            Floor {group.floor < 10 ? `0${group.floor}` : group.floor}
                          </span>
                          <span className="text-[9px] text-zinc-400 block font-medium">
                            {group.units.length} Units
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          {group.units.map(unit => {
                            const color = STATUS_COLORS[unit.status] || STATUS_COLORS.Available;
                            const isSelected = selectedUnit?.id === unit.id;
                            return (
                              <button
                                key={unit.id}
                                onClick={() => setSelectedUnit(unit)}
                                className={`flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-left min-w-[110px] cursor-pointer ${color.bg} ${color.border} ${
                                  isSelected ? 'ring-2 ring-[#d4ad4d] shadow-sm font-bold' : 'shadow-2xs'
                                }`}
                              >
                                <div>
                                  <span className="font-mono font-black text-[11px] text-zinc-900 block leading-tight">
                                    {unit.unit_number}
                                  </span>
                                  <span className="text-[9px] text-[#b8922e] font-bold block">
                                    {formatPriceShort(unit.base_price)}
                                  </span>
                                </div>
                                <span className={`w-2 h-2 rounded-full ${color.dot} shrink-0`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

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
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${STATUS_COLORS[selectedUnit.status]?.badge}`}>
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
                    <span className="font-bold text-zinc-800">{selectedUnit.built_up_area || Math.round(selectedUnit.carpet_area * 1.3)} sq ft</span>
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
                    <span className="font-bold text-zinc-800">{selectedUnit.possession_date || 'Ready to Move'}</span>
                  </div>
                </div>

                {/* Buyer & Agent Details if present */}
                {(selectedUnit.buyer_name || selectedUnit.agent_name) && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-[10px] space-y-1 text-xs">
                    {selectedUnit.buyer_name && (
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Allotted Buyer</span>
                        <span className="font-extrabold text-zinc-900">{selectedUnit.buyer_name}</span>
                      </div>
                    )}
                    {selectedUnit.agent_name && (
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Assigned Sales Agent</span>
                        <span className="font-semibold text-zinc-700">{selectedUnit.agent_name}</span>
                      </div>
                    )}
                  </div>
                )}

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
              <div className="bg-white border border-zinc-200 rounded-[14px] p-6 text-center text-xs text-zinc-400 font-semibold">
                Select a unit from the table or stacking grid to inspect details.
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
