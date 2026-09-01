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
  Plus
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';
import { CostSheetModal, CostSheetUnit } from '@/components/cost-sheet/CostSheetModal';

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
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bg: 'bg-emerald-50/60 hover:bg-emerald-100/80',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    dot: 'bg-emerald-500'
  },
  Hold: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bg: 'bg-amber-50/60 hover:bg-amber-100/80',
    border: 'border-amber-200',
    text: 'text-amber-900',
    dot: 'bg-amber-500'
  },
  Token: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    bg: 'bg-blue-50/60 hover:bg-blue-100/80',
    border: 'border-blue-200',
    text: 'text-blue-900',
    dot: 'bg-blue-500'
  },
  Negotiation: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    bg: 'bg-orange-50/60 hover:bg-orange-100/80',
    border: 'border-orange-200',
    text: 'text-orange-900',
    dot: 'bg-orange-500'
  },
  Booked: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    bg: 'bg-rose-50/60 hover:bg-rose-100/80',
    border: 'border-rose-200',
    text: 'text-rose-900',
    dot: 'bg-rose-500'
  },
  Sold: {
    badge: 'bg-zinc-800 text-zinc-100 border-zinc-900',
    bg: 'bg-zinc-100/80 hover:bg-zinc-200/80',
    border: 'border-zinc-300',
    text: 'text-zinc-800',
    dot: 'bg-zinc-900'
  }
};

export default function UnitInventoryPage() {
  const [selectedProject, setSelectedProject] = useState('Panchshil Silverwoods');
  const [selectedTower, setSelectedTower] = useState('Tower A');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [configFilter, setConfigFilter] = useState<string>('All');
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
      status: 'Hold',
      buyer_name: 'Dr. Amit Deshmukh',
      agent_name: 'Rishi Mahboobani'
    },
    {
      id: 'u-1403',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 14,
      unit_number: '1403',
      configuration: '4 BHK',
      carpet_area: 2250,
      built_up_area: 2900,
      facing: 'North-East Vastu',
      base_price: 19800000,
      floor_rise_rate: 50,
      parking_charges: 600000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Sold',
      buyer_name: 'Ketan Patel'
    },
    {
      id: 'u-1404',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 14,
      unit_number: '1404',
      configuration: '3 BHK',
      carpet_area: 1650,
      built_up_area: 2150,
      facing: 'Clubhouse View',
      base_price: 15100000,
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
      facing: 'East Facing',
      base_price: 14500000,
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
      carpet_area: 1650,
      built_up_area: 2150,
      facing: 'Garden Facing',
      base_price: 14800000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Hold',
      buyer_name: 'Sameer Verma'
    },
    {
      id: 'u-1203',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 12,
      unit_number: '1203',
      configuration: '4 BHK',
      carpet_area: 2200,
      built_up_area: 2850,
      facing: 'North Facing',
      base_price: 19200000,
      floor_rise_rate: 50,
      parking_charges: 600000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Booked',
      buyer_name: 'Sandesh Kulkarni',
      agent_name: 'Rishi Mahboobani'
    },
    {
      id: 'u-1204',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 12,
      unit_number: '1204',
      configuration: '3 BHK',
      carpet_area: 1680,
      built_up_area: 2180,
      facing: 'East Facing',
      base_price: 15100000,
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
      facing: 'East Facing',
      base_price: 14200000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Token',
      buyer_name: 'Pooja Hegde'
    },
    {
      id: 'u-1002',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 10,
      unit_number: '1002',
      configuration: '3 BHK',
      carpet_area: 1650,
      built_up_area: 2150,
      facing: 'Garden Facing',
      base_price: 14400000,
      floor_rise_rate: 50,
      parking_charges: 500000,
      amenities_charges: 300000,
      other_charges: 150000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Negotiation',
      buyer_name: 'Rajiv Mathur'
    },
    {
      id: 'u-1003',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 10,
      unit_number: '1003',
      configuration: '4 BHK',
      carpet_area: 2200,
      built_up_area: 2850,
      facing: 'North Facing',
      base_price: 18800000,
      floor_rise_rate: 50,
      parking_charges: 600000,
      amenities_charges: 400000,
      other_charges: 200000,
      gst_rate: 5.0,
      stamp_duty_rate: 6.0,
      registration_rate: 30000,
      possession_date: 'December 2026',
      status: 'Sold',
      buyer_name: 'Ananya Sharma'
    },
    {
      id: 'u-1004',
      project_title: 'Panchshil Silverwoods',
      tower: 'Tower A',
      floor: 10,
      unit_number: '1004',
      configuration: '3 BHK',
      carpet_area: 1680,
      built_up_area: 2180,
      facing: 'East Facing',
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
    }
  ]);

  // Unique floors sorted descending
  const floors = useMemo(() => {
    const floorSet = Array.from(new Set(units.map(u => u.floor)));
    return floorSet.sort((a, b) => b - a);
  }, [units]);

  // Inventory summary counts
  const availableCount = units.filter(u => u.status === 'Available').length;
  const holdCount = units.filter(u => u.status === 'Hold').length;
  const tokenCount = units.filter(u => u.status === 'Token').length;
  const negotiationCount = units.filter(u => u.status === 'Negotiation').length;
  const bookedCount = units.filter(u => u.status === 'Booked').length;
  const soldCount = units.filter(u => u.status === 'Sold').length;

  const handleUpdateUnitStatus = (unitId: string, newStatus: UnitStatus) => {
    setUnits(prev => prev.map(u => u.id === unitId ? { ...u, status: newStatus } : u));
    if (selectedUnit?.id === unitId) {
      setSelectedUnit(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleGenerateCostSheet = (unit: DeveloperUnit) => {
    setCostSheetTargetUnit({
      project_title: unit.project_title,
      tower: unit.tower,
      floor: unit.floor,
      unit_number: unit.unit_number,
      configuration: unit.configuration,
      carpet_area: unit.carpet_area,
      base_price: unit.base_price,
      floor_rise_per_sqft: unit.floor_rise_rate,
      parking_charges: unit.parking_charges,
      amenities_charges: unit.amenities_charges,
      other_charges: unit.other_charges,
      gst_percentage: unit.gst_rate,
      stamp_duty_percentage: unit.stamp_duty_rate,
      registration_charges: unit.registration_rate
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-zinc-900">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#d4ad4d]/20 text-[#99771f]">
              Developer Building Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Unit-Level Inventory Management
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Real-time tower and floor availability grid with live booking statuses, pricing, and cost sheet generation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Project Selector */}
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800"
          >
            <option value="Panchshil Silverwoods">Panchshil Silverwoods</option>
            <option value="Vivencia Residences">Vivencia Residences</option>
            <option value="Power Heights">Power Heights</option>
          </select>

          {/* Tower Selector */}
          <select 
            value={selectedTower}
            onChange={(e) => setSelectedTower(e.target.value)}
            className="bg-zinc-900 text-[#d4ad4d] border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold"
          >
            <option value="Tower A">Tower A</option>
            <option value="Tower B">Tower B</option>
            <option value="Tower C">Tower C</option>
          </select>
        </div>
      </div>

      {/* Legend & Quick Filter Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-1">Status Legend:</span>
          
          <button 
            onClick={() => setStatusFilter(statusFilter === 'Available' ? 'All' : 'Available')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === 'Available' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            Available ({availableCount})
          </button>

          <button 
            onClick={() => setStatusFilter(statusFilter === 'Hold' ? 'All' : 'Hold')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === 'Hold' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            Hold ({holdCount})
          </button>

          <button 
            onClick={() => setStatusFilter(statusFilter === 'Token' ? 'All' : 'Token')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === 'Token' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
            Token ({tokenCount})
          </button>

          <button 
            onClick={() => setStatusFilter(statusFilter === 'Negotiation' ? 'All' : 'Negotiation')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === 'Negotiation' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-orange-500"></span>
            Negotiation ({negotiationCount})
          </button>

          <button 
            onClick={() => setStatusFilter(statusFilter === 'Booked' ? 'All' : 'Booked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === 'Booked' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            Booked ({bookedCount})
          </button>

          <button 
            onClick={() => setStatusFilter(statusFilter === 'Sold' ? 'All' : 'Sold')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              statusFilter === 'Sold' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-zinc-900"></span>
            Sold ({soldCount})
          </button>
        </div>

        {statusFilter !== 'All' && (
          <button 
            onClick={() => setStatusFilter('All')} 
            className="text-xs font-bold text-zinc-500 hover:text-zinc-900 underline"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Main Floor-by-Floor Matrix Grid */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[#b38f2d]" />
            {selectedProject} — {selectedTower}
          </h3>
          <span className="text-xs text-zinc-400 font-medium">
            Total {units.length} Units on Floor Matrix
          </span>
        </div>

        {/* Floor Rows */}
        <div className="space-y-6">
          {floors.map((floorNum) => {
            const floorUnits = units.filter(u => u.floor === floorNum);

            return (
              <div key={floorNum} className="space-y-2.5">
                {/* Floor Header Badge */}
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-zinc-900 text-[#d4ad4d] text-xs font-black tracking-wider">
                    FLOOR {floorNum}
                  </span>
                  <div className="h-px flex-1 bg-zinc-100"></div>
                </div>

                {/* Floor Units Matrix Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {floorUnits.map((unit) => {
                    const styling = STATUS_COLORS[unit.status];
                    const matchesFilter = statusFilter === 'All' || unit.status === statusFilter;
                    const isSelected = selectedUnit?.id === unit.id;

                    return (
                      <div
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                          styling.bg
                        } ${
                          styling.border
                        } ${
                          !matchesFilter ? 'opacity-30' : 'opacity-100'
                        } ${
                          isSelected ? 'ring-2 ring-zinc-900 shadow-md scale-[1.02]' : 'hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-sm font-black text-zinc-900">{unit.unit_number}</span>
                            <span className="text-xs font-bold text-zinc-600 block">{unit.configuration}</span>
                          </div>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${styling.badge}`}>
                            {unit.status}
                          </span>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-zinc-200/50 flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-900">
                            {formatPriceShort(unit.base_price)}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-bold">
                            {unit.carpet_area} sq ft
                          </span>
                        </div>

                        {unit.buyer_name && (
                          <p className="text-[10px] text-zinc-600 font-semibold mt-1 truncate">
                            Client: {unit.buyer_name}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Unit Details Slide-over / Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 text-zinc-900 animate-in slide-in-from-right duration-300">
            
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Unit Details</span>
                <h3 className="text-xl font-bold text-zinc-900">
                  Unit {selectedUnit.unit_number} (Floor {selectedUnit.floor})
                </h3>
              </div>
              <button 
                onClick={() => setSelectedUnit(null)} 
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status Quick Switcher */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Update Unit Status</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Available', 'Hold', 'Token', 'Negotiation', 'Booked', 'Sold'] as UnitStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateUnitStatus(selectedUnit.id, st)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                      selectedUnit.status === st 
                        ? 'bg-zinc-900 text-[#d4ad4d] border-zinc-900 shadow-sm' 
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3 text-xs">
              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider">Unit Specifications</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Configuration</span>
                  <span className="font-bold text-zinc-900">{selectedUnit.configuration}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Facing / Orientation</span>
                  <span className="font-bold text-zinc-900">{selectedUnit.facing}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Carpet Area</span>
                  <span className="font-bold text-zinc-900">{selectedUnit.carpet_area} sq ft</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Built-up Area</span>
                  <span className="font-bold text-zinc-900">{selectedUnit.built_up_area} sq ft</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Possession</span>
                  <span className="font-bold text-zinc-900">{selectedUnit.possession_date}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Base Price</span>
                  <span className="font-black text-[#b38f2d] text-sm">{formatCurrency(selectedUnit.base_price)}</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown Summary */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-zinc-900 uppercase text-[10px] tracking-wider">Estimated Pricing Breakdown</h4>
              <div className="space-y-1.5 text-zinc-600 bg-zinc-50/50 p-3 rounded-xl border border-zinc-200">
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(selectedUnit.base_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Car Parking Charges</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(selectedUnit.parking_charges)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amenities & Club</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(selectedUnit.amenities_charges)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Taxes (GST + Stamp Duty)</span>
                  <span className="font-bold text-zinc-900">≈ 11%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-zinc-100">
              <button
                onClick={() => handleGenerateCostSheet(selectedUnit)}
                className="w-full py-3 rounded-xl bg-zinc-900 text-[#d4ad4d] text-xs font-bold hover:bg-zinc-800 flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Calculator className="h-4 w-4" />
                Generate Smart Cost Sheet
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cost Sheet Modal Connector */}
      {costSheetTargetUnit && (
        <CostSheetModal 
          isOpen={!!costSheetTargetUnit}
          onClose={() => setCostSheetTargetUnit(null)}
          unit={costSheetTargetUnit}
        />
      )}

    </div>
  );
}
