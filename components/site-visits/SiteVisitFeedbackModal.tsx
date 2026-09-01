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
        detailedNotes,
        completedAt: new Date().toISOString()
      });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden text-zinc-900 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#d4ad4d]/20 border border-[#d4ad4d]/40 flex items-center justify-center text-[#d4ad4d]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4ad4d] text-zinc-950 font-black uppercase">
                Post-Visit Intelligence
              </span>
              <h3 className="font-bold text-sm text-white mt-0.5">
                Site Visit Completed — Capture Client Feedback
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Visit Context Header */}
          <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Customer</span>
              <p className="font-bold text-zinc-900 text-sm">{visitData.client_name}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Property Viewed</span>
              <p className="font-bold text-zinc-800">{visitData.property_title}</p>
              <p className="text-[10px] text-zinc-500">{visitData.location}</p>
            </div>
          </div>

          {/* Star Rating / Purchase Interest */}
          <div className="space-y-1.5 text-center p-3 bg-zinc-50/70 border border-zinc-200 rounded-xl">
            <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block">
              Buyer Purchase Intent Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-7 w-7 ${
                      star <= rating ? 'fill-[#d4ad4d] text-[#d4ad4d]' : 'text-zinc-300'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] font-bold text-[#b38f2d] block mt-1">
              {rating === 5 ? '🔥 High Intent (Ready to Close)' : rating >= 3 ? 'Warm Interest' : 'Low Alignment'}
            </span>
          </div>

          {/* Liked Features Multi-Tags */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block">
              What did the client like?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Location', 'Layout & Floor Plan', 'Clubhouse & Amenities', 'Carpet Area', 'Deck / Views', 'Builder Reputation'].map((feat) => {
                const isSelected = likedFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => toggleLikedFeature(feat)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                      isSelected 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300' 
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{feat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Concerns / Objections */}
          <div className="space-y-1.5">
            <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block">
              Client Concerns / Objections
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Price per sqft', 'Floor Rise Charges', 'Possession Timeline', 'Vastu Non-Compliance', 'Road Noise', 'Financing'].map((c) => {
                const isSelected = concerns.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleConcern(c)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
                      isSelected 
                        ? 'bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-300' 
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {isSelected ? '✕ ' : '+ '}{c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Competitor Mentioned & Verified Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block mb-1">
                Competitors Mentioned
              </label>
              <input 
                type="text" 
                value={competitorMentioned}
                onChange={(e) => setCompetitorMentioned(e.target.value)}
                placeholder="e.g. Kolte Patil, Panchshil"
                className="w-full p-2.5 rounded-xl border border-zinc-300 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block mb-1">
                Verified Budget (₹)
              </label>
              <input 
                type="number" 
                value={verifiedBudget}
                onChange={(e) => setVerifiedBudget(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-300 font-bold text-zinc-900"
              />
            </div>
          </div>

          {/* Timeline & Next Stage Transition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block mb-1">
                Purchase Timeline
              </label>
              <select
                value={purchaseTimeline}
                onChange={(e) => setPurchaseTimeline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-zinc-300 font-bold bg-white"
              >
                <option value="0–3 Months">🔥 0–3 Months (Immediate)</option>
                <option value="3–6 Months">3–6 Months</option>
                <option value="6–12 Months">6–12 Months</option>
                <option value="1+ Year">Long term / Exploring</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block mb-1">
                Next Stage Transition
              </label>
              <select
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-zinc-300 font-bold bg-white text-[#b38f2d]"
              >
                <option value="Negotiation">Advance to Negotiation</option>
                <option value="Send Cost Sheet">Generate & Send Cost Sheet</option>
                <option value="Second Visit">Schedule 2nd Site Visit</option>
                <option value="Follow up">Follow up next week</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider block mb-1">
              Detailed Agent Feedback Notes
            </label>
            <textarea
              rows={2}
              value={detailedNotes}
              onChange={(e) => setDetailedNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-zinc-300 font-medium"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 font-bold text-zinc-600 hover:bg-zinc-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-zinc-900 text-[#d4ad4d] font-bold hover:bg-zinc-800 shadow-md flex items-center gap-2"
          >
            {savedSuccess ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Check className="h-4 w-4" />}
            {savedSuccess ? 'Feedback Saved & Lead Advanced!' : 'Save Feedback & Advance Lead'}
          </button>
        </div>

      </div>
    </div>
  );
}
