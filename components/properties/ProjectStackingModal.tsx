"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Calculator, 
  Share2, 
  Compass, 
  Car, 
  X, 
  MapPin,
  TrendingUp,
  FileText,
  DollarSign
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

export const STATUS_COLORS: Record<UnitStatus, {
  badge: string;
  bg: string;
  border: string;
  text: string;
  dot: string;
}> = {
  Available: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bg: 'bg-white hover:bg-zinc-50',
    border: 'border-zinc-200 hover:border-emerald-300',
    text: 'text-zinc-900',
    dot: 'bg-emerald-500'
  },
  Hold: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bg: 'bg-amber-50/40 hover:bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-zinc-900',
    dot: 'bg-amber-500'
  },
  Token: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    bg: 'bg-blue-50/40 hover:bg-blue-50/70',
    border: 'border-blue-200',
    text: 'text-zinc-900',
    dot: 'bg-blue-500'
  },
  Negotiation: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    bg: 'bg-purple-50/40 hover:bg-purple-50/70',
    border: 'border-purple-200',
    text: 'text-zinc-900',
    dot: 'bg-purple-500'
  },
  Booked: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    bg: 'bg-zinc-100/80 hover:bg-zinc-200/80',
    border: 'border-zinc-300',
    text: 'text-zinc-700',
    dot: 'bg-rose-500'
  },
  Sold: {
    badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    bg: 'bg-zinc-100/50 hover:bg-zinc-100',
    border: 'border-zinc-200',
    text: 'text-zinc-500',
    dot: 'bg-zinc-600'
  }
};

interface ProjectStackingModalProps {
  project: Property;
  onClose: () => void;
}

export function ProjectStackingModal({ project, onClose }: ProjectStackingModalProps) {
  const [allUnits, setAllUnits] = useState<DeveloperUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTower, setSelectedTower] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [configFilter, setConfigFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<DeveloperUnit | null>(null);
  const [costSheetTargetUnit, setCostSheetTargetUnit] = useState<CostSheetUnit | null>(null);

  // Load project units
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchDeveloperUnits();
        // Match units for this project by property_id or project title
        let projectUnits = data.filter(u => 
          (u.property_id && u.property_id === project.id) ||
          u.project_title.trim().toLowerCase() === project.title.trim().toLowerCase()
        );

        // If no units exist in database yet, procedurally generate them from project specs
        if (projectUnits.length === 0) {
          const generated = generateProjectUnits({
            property_id: project.id,
            project_title: project.title,
            towers: ['Tower A', 'Tower B', 'Tower C', 'Tower D'],
            total_floors: 20,
            units_per_floor: 8,
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
        console.error('Error loading project units:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [project]);

  // Distinct towers
  const towers = useMemo(() => {
    const set = Array.from(new Set(allUnits.map(u => u.tower)));
    return set.length > 0 ? set : ['Tower A'];
  }, [allUnits]);

  useEffect(() => {
    if (towers.length > 0 && (!selectedTower || !towers.includes(selectedTower))) {
      setSelectedTower(towers[0]);
    }
  }, [towers, selectedTower]);

  // Distinct configurations for this tower
  const configs = useMemo(() => {
    const list = allUnits.filter(u => u.tower === selectedTower);
    return Array.from(new Set(list.map(u => u.configuration)));
  }, [allUnits, selectedTower]);

  // Filtered unit matrix for current tower view
  const currentTowerUnits = useMemo(() => {
    return allUnits.filter(u => u.tower === selectedTower);
  }, [allUnits, selectedTower]);

  const filteredUnits = useMemo(() => {
    return currentTowerUnits.filter(u => {
      const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
      const matchesConfig = configFilter === 'All' || u.configuration === configFilter;
      const matchesSearch = !searchQuery || 
        u.unit_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.configuration.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.facing.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesConfig && matchesSearch;
    });
  }, [currentTowerUnits, statusFilter, configFilter, searchQuery]);

  // Group by floor (descending from top floor to bottom)
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

  // Aggregate project statistics
  const stats = useMemo(() => {
    const total = allUnits.length;
    const available = allUnits.filter(u => u.status === 'Available').length;
    const hold = allUnits.filter(u => u.status === 'Hold').length;
    const token = allUnits.filter(u => u.status === 'Token').length;
    const booked = allUnits.filter(u => u.status === 'Booked').length;
    const sold = allUnits.filter(u => u.status === 'Sold').length;
    const totalValuation = allUnits.reduce((sum, u) => sum + (u.base_price || 0), 0);
    return { total, available, hold, token, booked, sold, totalValuation };
  }, [allUnits]);

  const handleUpdateStatus = async (unitId: string, newStatus: UnitStatus) => {
    const updated = allUnits.map(u => u.id === unitId ? { ...u, status: newStatus } : u);
    setAllUnits(updated);
    if (selectedUnit && selectedUnit.id === unitId) {
      setSelectedUnit({ ...selectedUnit, status: newStatus });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Top Header Card */}
        <div className="px-6 py-4 bg-zinc-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 border-b border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#d4ad4d]/20 text-[#d4ad4d] text-[10px] font-extrabold uppercase tracking-widest border border-[#d4ad4d]/30">
                🏢 Project Stacking Matrix & Inventory Console
              </span>
              <span className="text-[11px] font-mono text-zinc-400 font-bold">
                {project.property_code || 'PRJ-MASTER'}
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              {project.title}
              <span className="text-xs font-semibold text-zinc-400 font-normal">
                • {project.location || 'Pune'}
              </span>
            </h2>
          </div>

          {/* Quick Aggregate Stats Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Available: {stats.available}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Token / Hold: {stats.token + stats.hold}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Booked: {stats.booked + stats.sold}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 text-[#d4ad4d] font-bold">
              Total Units: {stats.total} ({formatPriceShort(stats.totalValuation)})
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors ml-2 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="px-6 py-3 bg-[#fafaf8] border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Tower Switcher Pill Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1 border border-zinc-200 rounded-xl shadow-2xs">
            {towers.map(tower => {
              const count = allUnits.filter(u => u.tower === tower).length;
              return (
                <button
                  key={tower}
                  onClick={() => setSelectedTower(tower)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTower === tower
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <Building2 className={`h-3.5 w-3.5 ${selectedTower === tower ? 'text-[#d4ad4d]' : 'text-zinc-400'}`} />
                  <span>{tower}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${selectedTower === tower ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls: Status, Config & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search unit #, BHK, view..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-8 pl-8 pr-3 bg-white border border-zinc-200 rounded-lg text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#d4ad4d]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-8 px-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 focus:outline-none focus:border-[#d4ad4d] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Token">Token</option>
              <option value="Hold">Hold</option>
              <option value="Booked">Booked</option>
              <option value="Sold">Sold</option>
            </select>

            {configs.length > 1 && (
              <select
                value={configFilter}
                onChange={e => setConfigFilter(e.target.value)}
                className="h-8 px-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-700 focus:outline-none focus:border-[#d4ad4d] cursor-pointer"
              >
                <option value="All">All Configurations</option>
                {configs.map(cfg => (
                  <option key={cfg} value={cfg}>{cfg}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Workstation Body: Stacking Matrix + Side Inspector */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Main Stacking Grid (8.5 Columns) */}
          <div className="lg:col-span-8 overflow-y-auto p-6 space-y-3 bg-[#fdfdfc] border-r border-zinc-200">
            {loading ? (
              <div className="p-8 text-center text-xs font-bold text-zinc-400">Loading project matrix...</div>
            ) : floorGroups.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-zinc-400 bg-white rounded-xl border border-zinc-200">
                No units match the selected filters.
              </div>
            ) : (
              floorGroups.map(group => (
                <div key={group.floor} className="flex items-center gap-3">
                  
                  {/* Floor Level Label */}
                  <div className="w-20 text-right pr-2 shrink-0">
                    <span className="text-[11px] font-mono font-extrabold text-zinc-700 block">
                      Floor {group.floor < 10 ? `0${group.floor}` : group.floor}
                    </span>
                    <span className="text-[9px] text-zinc-400 block font-medium">
                      {group.units.length} Units
                    </span>
                  </div>

                  {/* Units Row */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {group.units.map(unit => {
                      const color = STATUS_COLORS[unit.status] || STATUS_COLORS.Available;
                      const isSelected = selectedUnit?.id === unit.id;

                      return (
                        <button
                          key={unit.id}
                          onClick={() => setSelectedUnit(unit)}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all text-left min-w-[125px] cursor-pointer ${color.bg} ${color.border} ${
                            isSelected ? 'ring-2 ring-[#d4ad4d] shadow-sm font-bold' : 'shadow-2xs'
                          }`}
                        >
                          <div>
                            <span className="font-mono font-black text-xs text-zinc-900 block leading-tight">
                              {unit.unit_number}
                            </span>
                            <span className="text-[9.5px] font-semibold text-zinc-500 block">
                              {unit.configuration}
                            </span>
                            <span className="text-[10px] font-bold text-[#b8922e] block mt-0.5">
                              {formatPriceShort(unit.base_price)}
                            </span>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1">
                            <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                            <span className="text-[8.5px] font-bold uppercase text-zinc-400">
                              {unit.carpet_area} sf
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Unit Inspection & Action Sidebar (3.5 Columns) */}
          <div className="lg:col-span-4 bg-white p-5 overflow-y-auto space-y-5">
            {selectedUnit ? (
              <div className="space-y-4">
                <div className="border-b border-zinc-100 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#b8922e] font-mono">
                      {selectedUnit.tower} • Floor {selectedUnit.floor}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${STATUS_COLORS[selectedUnit.status]?.badge}`}>
                      {selectedUnit.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 font-mono">
                    Unit {selectedUnit.unit_number}
                  </h3>
                  <p className="text-xs font-medium text-zinc-500 mt-0.5">
                    {selectedUnit.configuration} • {selectedUnit.facing}
                  </p>
                </div>

                {/* Price & Area Specs Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-[#fafaf8] border border-zinc-200/80 rounded-xl text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Agreement Price</span>
                    <span className="text-sm font-extrabold text-zinc-900">{formatPriceShort(selectedUnit.base_price)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Carpet Area</span>
                    <span className="text-sm font-extrabold text-zinc-900">{selectedUnit.carpet_area} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Built-up Area</span>
                    <span className="text-xs font-bold text-zinc-700">{selectedUnit.built_up_area || Math.round(selectedUnit.carpet_area * 1.3)} sq.ft</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">Rate per Sq.Ft</span>
                    <span className="text-xs font-bold text-zinc-700">₹{Math.round(selectedUnit.base_price / selectedUnit.carpet_area).toLocaleString('en-IN')}/sf</span>
                  </div>
                </div>

                {/* Status Changer Actions */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Update Unit Status</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Available', 'Hold', 'Token', 'Negotiation', 'Booked', 'Sold'] as UnitStatus[]).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(selectedUnit.id, st)}
                        className={`py-1.5 px-2 rounded-lg text-[10.5px] font-bold border transition-all cursor-pointer ${
                          selectedUnit.status === st
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buyer / Agent details if booked */}
                {(selectedUnit.buyer_name || selectedUnit.agent_name) && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
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

                {/* Cost Sheet Generator Action */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openCostSheet(selectedUnit)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#d4ad4d] text-white text-xs font-bold hover:bg-[#b8922e] transition-all shadow-[0_2px_8px_rgba(212,173,77,.35)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Generate Instant Cost Sheet</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-semibold text-zinc-400">
                Click any unit in the matrix to view full specifications and generate cost sheets.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Cost Sheet Modal */}
      {costSheetTargetUnit && (
        <CostSheetModal 
          isOpen={true}
          unit={costSheetTargetUnit} 
          onClose={() => setCostSheetTargetUnit(null)} 
        />
      )}
    </div>
  );
}
