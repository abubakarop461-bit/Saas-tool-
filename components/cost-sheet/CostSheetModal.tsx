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
  DollarSign,
  MessageSquare
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
    const text = `REALTYOS - OFFICIAL COST SHEET ESTIMATE

Project: ${unit.project_title}
Unit: ${unit.unit_number} (Tower ${unit.tower}, Floor ${unit.floor})
Configuration: ${unit.configuration} (${unit.carpet_area} sq ft)
Client: ${clientName}

────────────────────────
• Base Price: ₹${(basePrice / 100000).toFixed(2)} L
• Floor Rise: ₹${(floorRise / 100000).toFixed(2)} L
• Car Parking: ₹${(parking / 100000).toFixed(2)} L
• Amenities & Club: ₹${(amenities / 100000).toFixed(2)} L
• Other Charges: ₹${(otherCharges / 100000).toFixed(2)} L
────────────────────────
Agreement Value: ₹${(agreementValue / 10000000).toFixed(2)} Cr
• GST (${gstPercent}%): ₹${(gstAmount / 100000).toFixed(2)} L
• Stamp Duty (${stampDutyPercent}%): ₹${(stampDutyAmount / 100000).toFixed(2)} L
• Registration: ₹${registration.toLocaleString('en-IN')}
────────────────────────
TOTAL ALL-INCLUSIVE: ₹${(totalAllInclusive / 10000000).toFixed(2)} Cr
(₹${totalAllInclusive.toLocaleString('en-IN')})

Generated via RealtyOS ERP`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-[#e8e7e4] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Editorial Porcelain Header */}
        <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 flex items-center justify-center text-[#99771f]">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-zinc-900">
                  Smart Cost Sheet Generator
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4ad4d] text-white font-extrabold uppercase">
                  Live Quotation
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                {unit.project_title} • Unit #{unit.unit_number} (Tower {unit.tower}, Floor {unit.floor})
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-800">
          
          {/* Quick Specs Pill */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-[#fafaf8] border border-[#ebebeb] rounded-xl text-center">
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Configuration</span>
              <span className="font-extrabold text-zinc-900">{unit.configuration}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Carpet Area</span>
              <span className="font-extrabold text-zinc-900">{unit.carpet_area} sq ft</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Base Price</span>
              <span className="font-extrabold text-[#b8922e]">{formatPriceShort(basePrice)}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Client Name</span>
              <span className="font-bold text-zinc-800 truncate block">{clientName}</span>
            </div>
          </div>

          {/* Breakdown Form */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Itemized Cost Breakdown & Surcharges
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-700">Base Unit Value</span>
                <input 
                  type="number" 
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-36 h-7 text-right font-bold bg-white border border-[#e8e7e4] rounded px-2 text-xs text-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-700">Floor Rise Charges</span>
                <input 
                  type="number" 
                  value={floorRise}
                  onChange={(e) => setFloorRise(Number(e.target.value))}
                  className="w-36 h-7 text-right font-bold bg-white border border-[#e8e7e4] rounded px-2 text-xs text-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-700">Covered Car Parking (1 Bay)</span>
                <input 
                  type="number" 
                  value={parking}
                  onChange={(e) => setParking(Number(e.target.value))}
                  className="w-36 h-7 text-right font-bold bg-white border border-[#e8e7e4] rounded px-2 text-xs text-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-700">Clubhouse & Amenities Development</span>
                <input 
                  type="number" 
                  value={amenities}
                  onChange={(e) => setAmenities(Number(e.target.value))}
                  className="w-36 h-7 text-right font-bold bg-white border border-[#e8e7e4] rounded px-2 text-xs text-zinc-900"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-bold text-zinc-700">Legal, Infrastructure & Other Charges</span>
                <input 
                  type="number" 
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Number(e.target.value))}
                  className="w-36 h-7 text-right font-bold bg-white border border-[#e8e7e4] rounded px-2 text-xs text-zinc-900"
                />
              </div>
            </div>

            {/* Subtotal Agreement Value */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#fafaf8] border border-[#ebebeb] font-extrabold text-xs">
              <span className="text-zinc-900">Total Agreement Value (A)</span>
              <span className="text-base text-zinc-900">{formatCurrency(agreementValue)}</span>
            </div>

            {/* Statutory Taxes & Duties */}
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pt-2">
              Government Statutory Taxes & Registration
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-medium text-zinc-700">GST ({gstPercent}%)</span>
                <span className="font-bold text-zinc-900">{formatCurrency(gstAmount)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-medium text-zinc-700">Stamp Duty ({stampDutyPercent}%)</span>
                <span className="font-bold text-zinc-900">{formatCurrency(stampDutyAmount)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 border border-zinc-200">
                <span className="font-medium text-zinc-700">Government Registration Charges</span>
                <span className="font-bold text-zinc-900">{formatCurrency(registration)}</span>
              </div>
            </div>

            {/* Total Grand All-Inclusive Package */}
            <div className="p-4 rounded-xl bg-zinc-900 text-white flex items-center justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-bold text-[#d4ad4d] uppercase tracking-wider block">
                  Grand Total All-Inclusive (A + Taxes)
                </span>
                <span className="text-lg font-black text-white">
                  {formatPriceShort(totalAllInclusive)}
                </span>
              </div>
              <span className="text-xs font-medium text-zinc-300">
                {formatCurrency(totalAllInclusive)}
              </span>
            </div>

            {/* MahaRERA Construction Payment Milestone Schedule */}
            <div className="pt-2 space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                MahaRERA Construction Payment Milestones
              </h4>
              <div className="border border-[#e8e7e4] rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fafaf8] border-b border-[#ebebeb] text-[9.5px] font-bold uppercase text-zinc-400">
                    <tr>
                      <th className="py-2 px-3">Stage / Milestone</th>
                      <th className="py-2 px-3 text-center">% Share</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f5f5f3] text-[11px]">
                    {[
                      { name: 'Token Advance', pct: 10 },
                      { name: 'Agreement Registration', pct: 10 },
                      { name: 'Plinth Foundation', pct: 15 },
                      { name: 'Slabs (Mid-Construction)', pct: 25 },
                      { name: 'Brickwork & MEP', pct: 15 },
                      { name: 'Flooring & Finishing', pct: 10 },
                      { name: 'Possession & Handover', pct: 15 },
                    ].map((m, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50">
                        <td className="py-1.5 px-3 font-semibold text-zinc-800">{m.name}</td>
                        <td className="py-1.5 px-3 text-center font-bold text-zinc-500">{m.pct}%</td>
                        <td className="py-1.5 px-3 text-right font-extrabold text-zinc-900">
                          {formatPriceShort(Math.round((agreementValue * m.pct) / 100))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Direction C Actions */}
        <div className="px-6 py-3.5 bg-[#fafaf8] border-t border-[#ebebeb] flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrint}
            className="dc-btn font-semibold flex items-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-zinc-500" />
            Print PDF
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="dc-btn font-semibold flex items-center gap-1.5 text-emerald-800 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              WhatsApp Pitch
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="dc-btn gold font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {copied ? 'Saved to Deal!' : 'Save to Deal'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
