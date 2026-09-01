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
  Send
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden text-zinc-900 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#d4ad4d]/20 border border-[#d4ad4d]/40 flex items-center justify-center text-[#d4ad4d]">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4ad4d] text-zinc-950 font-black uppercase">
                  AI Call Intelligence
                </span>
              </div>
              <h3 className="font-bold text-sm text-white mt-0.5">
                Call Completed — Auto CRM Extraction
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Client Header Info */}
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Customer</span>
              <p className="font-bold text-zinc-900 text-sm">{leadName}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Contact</span>
              <p className="font-medium text-zinc-600">{leadPhone}</p>
            </div>
          </div>

          {/* Unstructured Call Transcript / Agent Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-700 uppercase text-[10px] tracking-wider">
                Call Notes / Transcript Input
              </label>
              <button 
                onClick={handleRunAIAnalysis}
                className="text-[11px] font-bold text-[#b38f2d] hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Re-parse with AI
              </button>
            </div>
            <textarea
              rows={3}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-zinc-300 font-medium text-zinc-800 bg-zinc-50/50 focus:ring-1 focus:ring-[#d4ad4d]"
              placeholder="Paste call notes or audio transcript..."
            />
          </div>

          {/* AI Structured Extraction Panel */}
          {hasExtracted && (
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="font-black text-[11px] text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#b38f2d]" />
                  AI Structured Insights
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Ready to Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Budget Target</label>
                  <input 
                    type="text" 
                    value={extractedBudget}
                    onChange={(e) => setExtractedBudget(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-bold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Requirement</label>
                  <input 
                    type="text" 
                    value={extractedReq}
                    onChange={(e) => setExtractedReq(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-bold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Preferred Location</label>
                  <input 
                    type="text" 
                    value={extractedLocation}
                    onChange={(e) => setExtractedLocation(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-bold text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Interest Level</label>
                  <select 
                    value={extractedInterest}
                    onChange={(e) => setExtractedInterest(e.target.value as any)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-bold text-emerald-700"
                  >
                    <option value="High">🔥 High Intent</option>
                    <option value="Medium">Warm</option>
                    <option value="Low">Cold</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Key Objection</label>
                  <input 
                    type="text" 
                    value={extractedObjection}
                    onChange={(e) => setExtractedObjection(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-medium text-rose-700"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Competitor Mentioned</label>
                  <input 
                    type="text" 
                    value={extractedCompetitor}
                    onChange={(e) => setExtractedCompetitor(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-medium text-zinc-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Next Action</label>
                <input 
                  type="text" 
                  value={extractedNextAction}
                  onChange={(e) => setExtractedNextAction(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Scheduled Follow-up Date</label>
                <input 
                  type="date" 
                  value={extractedFollowup}
                  onChange={(e) => setExtractedFollowup(e.target.value)}
                  className="w-full bg-white border border-zinc-300 rounded-lg p-2 font-bold text-zinc-900"
                />
              </div>
            </div>
          )}

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
            {savedSuccess ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Sparkles className="h-4 w-4" />}
            {savedSuccess ? 'Auto-Updated Lead Record!' : 'Sync to Lead CRM'}
          </button>
        </div>

      </div>
    </div>
  );
}
