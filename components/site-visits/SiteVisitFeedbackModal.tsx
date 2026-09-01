"use client";

import React, { useState } from 'react';
import { 
  Star, 
  X, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Clock, 
  Check, 
  ArrowRight, 
  Sparkles,
  Building
} from 'lucide-react';
import { formatCurrency, formatPriceShort } from '@/lib/formatters';

interface SiteVisitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitData?: {
    id: string;
    client_name: string;
    property_title: string;
    location: string;
  };
  onSaveFeedback?: (feedback: any) => void;
}

export function SiteVisitFeedbackModal({
  isOpen,
  onClose,
  visitData = {
    id: 'sv-1',
    client_name: 'Sandesh Kulkarni',
    property_title: 'Vivencia Luxury Residences',
    location: 'Kalyani Nagar, Pune'
  },
  onSaveFeedback
}: SiteVisitFeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [likedFeatures, setLikedFeatures] = useState<string[]>(['Location', 'Layout', 'Amenities']);
  const [concerns, setConcerns] = useState<string[]>(['Price per sqft']);
  const [competitorMentioned, setCompetitorMentioned] = useState('Kolte Patil / Godrej');
  const [verifiedBudget, setVerifiedBudget] = useState('23000000'); // ₹2.3 Cr
  const [purchaseTimeline, setPurchaseTimeline] = useState('0–3 Months');
  const [nextAction, setNextAction] = useState<'Negotiation' | 'Send Cost Sheet' | 'Second Visit' | 'Follow up'>('Negotiation');
  const [detailedNotes, setDetailedNotes] = useState('Client brought his architect. Loved the master layout and deck. Ready for negotiation if token discount is applied.');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleLikedFeature = (item: string) => {
    setLikedFeatures(prev => 
      prev.includes(item) ? prev.filter(f => f !== item) : [...prev, item]
    );
  };

  const toggleConcern = (item: string) => {
    setConcerns(prev => 
      prev.includes(item) ? prev.filter(c => c !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    if (onSaveFeedback) {
      onSaveFeedback({
        rating,
        likedFeatures,
        concerns,
        competitorMentioned,
        verifiedBudget: Number(verifiedBudget),
        purchaseTimeline,
        nextAction,
        detailedNotes
      });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const ALL_FEATURES = ['Location', 'Layout', 'Amenities', 'Floor Rise View', 'Pricing', 'Vastu', 'Brand Name'];
  const ALL_CONCERNS = ['Price per sqft', 'Possession Timeline', 'High Maintenance', 'Road Noise', 'Floor Plan Layout'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#e8e7e4] overflow-hidden text-zinc-900 flex flex-col max-h-[90vh]">
        
        {/* Editorial Porcelain Header */}
        <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 flex items-center justify-center text-[#99771f]">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-zinc-900">
                  Site Visit Feedback Intelligence
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4ad4d] text-white font-extrabold uppercase">
                  Intent Capture
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Client: {visitData.client_name} • {visitData.property_title}
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Buyer Intent Rating */}
          <div className="p-4 bg-[#fafaf8] border border-[#e8e7e4] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Buyer Intent Level
              </span>
              <p className="text-xs font-bold text-zinc-800 mt-0.5">
                {rating === 5 ? '🔥 High Intent (Ready to Close / Negotiate)' : rating >= 3 ? '🟡 Moderate Fit (Needs Follow-up)' : '❄️ Low Interest'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1.5 rounded-lg transition-all ${
                    star <= rating 
                      ? 'text-[#d4ad4d] bg-[#d4ad4d]/10' 
                      : 'text-zinc-300 hover:text-zinc-400'
                  }`}
                >
                  <Star className={`h-5 w-5 ${star <= rating ? 'fill-[#d4ad4d]' : ''}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Liked Features Checklist */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              What the Client Liked (Key USPs)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_FEATURES.map(f => {
                const isSelected = likedFeatures.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleLikedFeature(f)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      isSelected 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                        : 'bg-white border-[#e8e7e4] text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Concerns */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Client Concerns / Objections
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CONCERNS.map(c => {
                const isSelected = concerns.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConcern(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                      isSelected 
                        ? 'bg-rose-50 border-rose-300 text-rose-800' 
                        : 'bg-white border-[#e8e7e4] text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {isSelected ? '✕ ' : ''}{c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Financial & Timeline Form Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#ebebeb]">
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Verified Buyer Budget (₹)</span>
              <input 
                type="number"
                value={verifiedBudget}
                onChange={(e) => setVerifiedBudget(e.target.value)}
                className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs font-bold text-zinc-900"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Purchase Timeline</span>
              <select
                value={purchaseTimeline}
                onChange={(e) => setPurchaseTimeline(e.target.value)}
                className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-bold text-zinc-900"
              >
                <option value="0–30 Days">Immediate (0–30 Days)</option>
                <option value="0–3 Months">0–3 Months</option>
                <option value="3–6 Months">3–6 Months</option>
                <option value="6+ Months">6+ Months (Long term)</option>
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Competitor Benchmarked</span>
              <input 
                type="text"
                value={competitorMentioned}
                onChange={(e) => setCompetitorMentioned(e.target.value)}
                placeholder="e.g. Godrej, Panchshil"
                className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs text-zinc-800"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 uppercase block">Next Pipeline Action</span>
              <select
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value as any)}
                className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-extrabold text-[#99771f]"
              >
                <option value="Negotiation">Advance to Negotiation</option>
                <option value="Send Cost Sheet">Generate & Send Cost Sheet</option>
                <option value="Second Visit">Schedule 2nd Family Visit</option>
                <option value="Follow up">Routine Follow up</option>
              </select>
            </div>
          </div>

          {/* Detailed Observations */}
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-zinc-400 uppercase block">Detailed Agent Observations</span>
            <textarea
              rows={2}
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:bg-white focus:border-[#d4ad4d]"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[#fafaf8] border-t border-[#ebebeb] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="dc-btn font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="dc-btn gold font-bold flex items-center gap-1.5"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {savedSuccess ? 'Feedback Captured!' : 'Save Visit Feedback'}
          </button>
        </div>

      </div>
    </div>
  );
}
