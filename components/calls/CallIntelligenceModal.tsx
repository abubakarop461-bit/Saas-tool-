"use client";

import React, { useState } from 'react';
import { 
  PhoneCall, 
  Sparkles, 
  X, 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  Calendar,
  FileText,
  Send,
  MessageSquare
} from 'lucide-react';

interface CallIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName?: string;
  leadPhone?: string;
  onSaveInsights?: (insights: any) => void;
}

export function CallIntelligenceModal({
  isOpen,
  onClose,
  leadName = "Sandesh Kulkarni",
  leadPhone = "+91 98200 44556",
  onSaveInsights
}: CallIntelligenceModalProps) {
  const [callNotes, setCallNotes] = useState(
    "Client called regarding 3 BHK in Kharadi/Baner. Budget around 2.2-2.5 Cr. Wants commercial office and residential options. Main objection is price per sqft compared to Project XYZ. Requested revised cost sheet by Sep 3."
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(true);

  // Extracted AI insights
  const [extractedBudget, setExtractedBudget] = useState('₹2.0 – ₹2.5 Cr');
  const [extractedReq, setExtractedReq] = useState('3 BHK / Commercial Office');
  const [extractedLocation, setExtractedLocation] = useState('Kharadi / Baner');
  const [extractedInterest, setExtractedInterest] = useState<'High' | 'Medium' | 'Low'>('High');
  const [extractedObjection, setExtractedObjection] = useState('Price per sq ft vs competitor');
  const [extractedCompetitor, setExtractedCompetitor] = useState('Project XYZ / Kolte Patil');
  const [extractedNextAction, setExtractedNextAction] = useState('Send revised cost sheet with floor rise discount');
  const [extractedFollowup, setExtractedFollowup] = useState('2026-09-03');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRunAIAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasExtracted(true);
    }, 800);
  };

  const handleSave = () => {
    if (onSaveInsights) {
      onSaveInsights({
        budget: extractedBudget,
        requirement: extractedReq,
        location: extractedLocation,
        interest: extractedInterest,
        objection: extractedObjection,
        competitor: extractedCompetitor,
        nextAction: extractedNextAction,
        followupDate: extractedFollowup
      });
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-[#e8e7e4] overflow-hidden text-zinc-900 flex flex-col max-h-[90vh]">
        
        {/* Editorial Porcelain Header */}
        <div className="px-6 py-4 bg-[#fafaf8] border-b border-[#ebebeb] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 flex items-center justify-center text-[#99771f]">
              <PhoneCall className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-zinc-900">
                  AI Call Intelligence
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4ad4d] text-white font-extrabold uppercase">
                  CRM Entity Extraction
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">
                Client: {leadName} • {leadPhone}
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Audio / Raw Notes Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              Call Transcript / Audio Voice Notes
            </label>
            <textarea 
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              rows={3}
              placeholder="Paste raw call notes or audio transcript..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-900 focus:bg-white focus:border-[#d4ad4d] focus:ring-2 focus:ring-[#d4ad4d]/15"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleRunAIAnalysis}
              disabled={isAnalyzing}
              className="dc-btn font-bold flex items-center gap-1.5 text-xs text-zinc-800"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#d4ad4d]" />
              {isAnalyzing ? 'Extracting CRM Entities...' : 'Re-Run AI Extraction'}
            </button>
          </div>

          {/* Structured CRM Entities Form */}
          {hasExtracted && (
            <div className="p-4 bg-[#fafaf8] border border-[#e8e7e4] rounded-xl space-y-3">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Extracted CRM Fields (Auto-Sync to Lead Record)
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Verified Budget</span>
                  <input 
                    type="text" 
                    value={extractedBudget}
                    onChange={(e) => setExtractedBudget(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs font-bold text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Configuration Requirement</span>
                  <input 
                    type="text" 
                    value={extractedReq}
                    onChange={(e) => setExtractedReq(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs font-bold text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Preferred Location</span>
                  <input 
                    type="text" 
                    value={extractedLocation}
                    onChange={(e) => setExtractedLocation(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs font-semibold text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Purchase Urgency / Interest</span>
                  <select 
                    value={extractedInterest}
                    onChange={(e) => setExtractedInterest(e.target.value as any)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2 text-xs font-bold text-zinc-900"
                  >
                    <option value="High">🔥 High (Hot Lead)</option>
                    <option value="Medium">🟡 Medium (Warm)</option>
                    <option value="Low">❄️ Low (Cold)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">Client Objections / Concerns</span>
                <input 
                  type="text" 
                  value={extractedObjection}
                  onChange={(e) => setExtractedObjection(e.target.value)}
                  className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs text-zinc-800"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase block">Competitor Mentions</span>
                <input 
                  type="text" 
                  value={extractedCompetitor}
                  onChange={(e) => setExtractedCompetitor(e.target.value)}
                  className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs text-zinc-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Recommended Next Action</span>
                  <input 
                    type="text" 
                    value={extractedNextAction}
                    onChange={(e) => setExtractedNextAction(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs font-semibold text-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase block">Next Follow-Up Date</span>
                  <input 
                    type="date" 
                    value={extractedFollowup}
                    onChange={(e) => setExtractedFollowup(e.target.value)}
                    className="w-full h-8 bg-white border border-[#e8e7e4] rounded-lg px-2.5 text-xs text-zinc-900"
                  />
                </div>
              </div>
            </div>
          )}
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
            {savedSuccess ? 'CRM Record Updated!' : 'Auto-Update CRM Lead'}
          </button>
        </div>

      </div>
    </div>
  );
}
