"use client";

import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Download, 
  Send, 
  CheckCircle2, 
  Building, 
  Calculator, 
  FileText,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';

export interface CostSheetUnit {
  id?: string;
  project_title: string;
  tower: string;
  floor: number;
  unit_number: string;
  configuration: string;
  carpet_area: number; // sq ft
  built_up_area?: number; // sq ft
  base_rate_per_sqft?: number;
  base_price: number;
  floor_rise_per_sqft?: number;
  parking_charges?: number;
  amenities_charges?: number;
  infrastructure_charges?: number;
  other_charges?: number;
  gst_percentage?: number;
  stamp_duty_percentage?: number;
  registration_charges?: number;
}

interface CostSheetModalProps {
  unit: CostSheetUnit;
  clientName?: string;
  clientPhone?: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveToDeal?: (costSheetData: any) => void;
}

export function CostSheetModal({
  unit,
  clientName = "Valued Client",
  clientPhone = "",
  isOpen,
  onClose,
  onSaveToDeal
}: CostSheetModalProps) {
  // Configurable cost parameters
  const [basePrice, setBasePrice] = useState(unit.base_price || 12000000);
  const [floorRise, setFloorRise] = useState(unit.floor_rise_per_sqft ? unit.floor_rise_per_sqft * unit.floor * (unit.carpet_area || 1000) : (unit.floor * 25000));
  const [parking, setParking] = useState(unit.parking_charges ?? 500000);
  const [amenities, setAmenities] = useState(unit.amenities_charges ?? 200000);
  const [otherCharges, setOtherCharges] = useState(unit.other_charges ?? 150000);
  const [gstPercent, setGstPercent] = useState(unit.gst_percentage ?? 5.0);
  const [stampDutyPercent, setStampDutyPercent] = useState(unit.stamp_duty_percentage ?? 6.0);
  const [registration, setRegistration] = useState(unit.registration_charges ?? 30000);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Subtotal before taxes
  const agreementValue = basePrice + floorRise + parking + amenities + otherCharges;
  const gstAmount = Math.round((agreementValue * gstPercent) / 100);
  const stampDutyAmount = Math.round((agreementValue * stampDutyPercent) / 100);
  const totalAllInclusive = agreementValue + gstAmount + stampDutyAmount + registration;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `*OFFICIAL COST SHEET ESTIMATE*
*Project:* ${unit.project_title}
*Unit:* ${unit.unit_number} (Tower ${unit.tower}, Floor ${unit.floor})
*Configuration:* ${unit.configuration} (${unit.carpet_area} sq ft)
*Client:* ${clientName}

────────────────────────
• *Base Price:* ₹${(basePrice / 100000).toFixed(2)} L
• *Floor Rise:* ₹${(floorRise / 100000).toFixed(2)} L
• *Car Parking:* ₹${(parking / 100000).toFixed(2)} L
• *Amenities & Club:* ₹${(amenities / 100000).toFixed(2)} L
• *Other Charges:* ₹${(otherCharges / 100000).toFixed(2)} L
────────────────────────
*Agreement Value:* ₹${(agreementValue / 10000000).toFixed(2)} Cr
• *GST (${gstPercent}%):* ₹${(gstAmount / 100000).toFixed(2)} L
• *Stamp Duty (${stampDutyPercent}%):* ₹${(stampDutyAmount / 100000).toFixed(2)} L
• *Registration:* ₹${registration.toLocaleString('en-IN')}
────────────────────────
*TOTAL ALL-INCLUSIVE:* ₹${(totalAllInclusive / 10000000).toFixed(2)} Cr
*(₹${totalAllInclusive.toLocaleString('en-IN')})*

Generated via Luxe Realty ERP`;

    const url = clientPhone 
      ? `https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSave = () => {
    if (onSaveToDeal) {
      onSaveToDeal({
        unit,
        clientName,
        agreementValue,
        gstAmount,
        stampDutyAmount,
        registration,
        totalAllInclusive,
        generatedAt: new Date().toISOString()
      });
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#d4ad4d]/20 border border-[#d4ad4d]/40 flex items-center justify-center text-[#d4ad4d]">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Smart Cost Sheet Generator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4ad4d] text-zinc-950 font-black uppercase">
                  Live Quotation
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                {unit.project_title} • Unit {unit.unit_number} (Tower {unit.tower}, Floor {unit.floor})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-zinc-900">
          
          {/* Unit Overview Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Client Name</span>
              <span className="text-xs font-bold text-zinc-900">{clientName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Configuration</span>
              <span className="text-xs font-bold text-zinc-900">{unit.configuration}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Carpet Area</span>
              <span className="text-xs font-bold text-zinc-900">{unit.carpet_area} sq ft</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Unit No.</span>
              <span className="text-xs font-black text-[#b38f2d]">{unit.unit_number}</span>
            </div>
          </div>

          {/* Section A: Agreement Components */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              <span>1. Agreement Value Breakdown</span>
              <span className="text-[#b38f2d] font-bold">₹{agreementValue.toLocaleString('en-IN')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Base Price (₹)</label>
                <input 
                  type="number" 
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 font-bold text-zinc-900 focus:ring-1 focus:ring-[#d4ad4d]"
                />
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Floor Rise (₹)</label>
                <input 
                  type="number" 
                  value={floorRise}
                  onChange={(e) => setFloorRise(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 font-bold text-zinc-900 focus:ring-1 focus:ring-[#d4ad4d]"
                />
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Covered Car Parking (₹)</label>
                <input 
                  type="number" 
                  value={parking}
                  onChange={(e) => setParking(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 font-bold text-zinc-900 focus:ring-1 focus:ring-[#d4ad4d]"
                />
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Amenities & Club (₹)</label>
                <input 
                  type="number" 
                  value={amenities}
                  onChange={(e) => setAmenities(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 font-bold text-zinc-900 focus:ring-1 focus:ring-[#d4ad4d]"
                />
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1 sm:col-span-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase block">Infra & Other Charges (₹)</label>
                <input 
                  type="number" 
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2.5 py-1.5 font-bold text-zinc-900 focus:ring-1 focus:ring-[#d4ad4d]"
                />
              </div>
            </div>
          </div>

          {/* Section B: Statutory Taxes & Government Duties */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
              <span>2. Government Taxes & Duties</span>
              <span className="text-zinc-700 font-bold">₹{(gstAmount + stampDutyAmount + registration).toLocaleString('en-IN')}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">GST ({gstPercent}%)</label>
                  <span className="text-[10px] font-bold text-zinc-700">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  value={gstPercent}
                  onChange={(e) => setGstPercent(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2 py-1 font-semibold text-zinc-900"
                />
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Stamp Duty ({stampDutyPercent}%)</label>
                  <span className="text-[10px] font-bold text-zinc-700">₹{stampDutyAmount.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="number" 
                  step="0.1"
                  value={stampDutyPercent}
                  onChange={(e) => setStampDutyPercent(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2 py-1 font-semibold text-zinc-900"
                />
              </div>

              <div className="p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Registration</label>
                  <span className="text-[10px] font-bold text-zinc-700">₹{registration.toLocaleString('en-IN')}</span>
                </div>
                <input 
                  type="number" 
                  value={registration}
                  onChange={(e) => setRegistration(Number(e.target.value))}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-2 py-1 font-semibold text-zinc-900"
                />
              </div>
            </div>
          </div>

          {/* Section C: Grand Total Card */}
          <div className="p-5 bg-gradient-to-r from-zinc-900 to-zinc-950 text-white rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-[#d4ad4d] uppercase tracking-widest block">Total All-Inclusive Package</span>
              <p className="text-2xl sm:text-3xl font-black text-white">
                ₹{totalAllInclusive.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                ≈ ₹{(totalAllInclusive / 10000000).toFixed(2)} Crores (All taxes & registration included)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
              >
                <Printer className="h-4 w-4" /> Print PDF
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Share2 className="h-4 w-4" /> Send to WhatsApp
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-[#d4ad4d] text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <FileText className="h-4 w-4" />}
              {copied ? 'Saved to Deal!' : 'Save to Deal'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
