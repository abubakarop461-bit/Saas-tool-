"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useProfile } from '@/lib/auth';
import { fetchProperties, Property } from '@/lib/queries';
import { formatPriceShort } from '@/lib/formatters';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Building2, 
  MapPin, 
  Copy, 
  Check, 
  RotateCcw, 
  Megaphone, 
  Camera, 
  MessageSquare, 
  Globe, 
  Search, 
  ChevronRight,
  Pencil,
  CheckCircle2,
  Cpu
} from 'lucide-react';

interface Variation {
  headline: string;
  primary_copy: string;
  short_description: string;
  cta: string;
}

const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook Ad',
    icon: Megaphone,
    description: 'Persuasive, storytelling & conversion-focused.'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Camera,
    description: 'Visual-first, concise & social friendly.'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    description: 'Direct messaging, conversational & punchy.'
  },
  {
    id: 'portal',
    name: 'Property Portal',
    icon: Globe,
    description: 'Factual, detailed & listing optimized.'
  },
  {
    id: 'general',
    name: 'General Marketing',
    icon: Sparkles,
    description: 'Balanced & versatile across digital & print.'
  }
];

export default function CreativeStudioPage() {
  const profile = useProfile();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Form selections
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [propertySearchQuery, setPropertySearchQuery] = useState<string>('');
  const [isPropertyDropdownOpen, setIsPropertyDropdownOpen] = useState<boolean>(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('facebook');

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [activeVariationIndex, setActiveVariationIndex] = useState<number>(0);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Fetch properties on mount
  useEffect(() => {
    async function loadProperties() {
      setLoadingProperties(true);
      try {
        const data = await fetchProperties(profile);
        setProperties(data || []);
        if (data && data.length > 0) {
          setSelectedPropertyId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load properties for Creative Studio:', err);
        toast.error('Failed to load property inventory');
      } finally {
        setLoadingProperties(false);
      }
    }
    loadProperties();
  }, [profile]);

  // Selected property object
  const selectedProperty = useMemo(() => {
    return properties.find(p => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  // Clear previous variations when property or platform selection changes
  useEffect(() => {
    setVariations([]);
    setActiveVariationIndex(0);
  }, [selectedPropertyId, selectedPlatform]);

  // Filtered properties for dropdown search
  const filteredProperties = useMemo(() => {
    if (!propertySearchQuery.trim()) return properties;
    const q = propertySearchQuery.toLowerCase();
    return properties.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.property_code.toLowerCase().includes(q) ||
      p.configuration.toLowerCase().includes(q)
    );
  }, [properties, propertySearchQuery]);

  // Handle generation call
  const handleGenerate = async () => {
    if (!selectedProperty) {
      toast.error('Please select a property');
      return;
    }
    if (!selectedPlatform) {
      toast.error('Please select a marketing platform');
      return;
    }

    setIsGenerating(true);
    setVariations([]);
    setActiveVariationIndex(0);

    try {
      const res = await fetch('/api/ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          platform: selectedPlatform
        })
      });

      const data = (await res.json()) as any;
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate ad copy');
      }

      setVariations(data.variations || []);
      setActiveVariationIndex(0);
      toast.success('Generated 3 ad copy variations!');
    } catch (err: any) {
      console.error('Error generating copy:', err);
      toast.error(err.message || 'Unable to generate ad copy. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to copy text with feedback
  const copyToClipboard = (text: string, identifier: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(identifier);
    toast.success(`Copied ${label} to clipboard!`);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  // Helper to update individual field inside a variation
  const handleFieldChange = (index: number, field: keyof Variation, value: string) => {
    setVariations(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const activeVariation = variations[activeVariationIndex] || null;

  return (
    <div className="space-y-5 pb-8 min-h-[calc(100vh-100px)]">
      
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-850 p-5 rounded-[14px] shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#d4ad4d]/10 border border-[#d4ad4d]/20 text-[#d4ad4d] text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Marketing Copy Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Creative Studio
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Generate high-converting ad copy with NVIDIA Nemotron 3 Super & factual property data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300">
            <Cpu className="h-3.5 w-3.5 text-[#d4ad4d]" />
            <span>NVIDIA Nemotron 3 Super</span>
          </div>

          {variations.length > 0 && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[9px] bg-zinc-900 border border-zinc-800 hover:border-[#d4ad4d] text-white hover:text-[#d4ad4d] text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate All</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Option 3: Modern Data Console 3-Pane Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* ── PANE 1: Left Property & Channel Controls (3 Cols) ── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Property Selector Card */}
          <div className="bg-white border border-zinc-200 rounded-[14px] p-4 shadow-xs space-y-3">
            <div className="border-b border-zinc-100 pb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">1. Target Property</span>
              <span className="text-[10px] font-mono text-zinc-400">{properties.length} Active</span>
            </div>

            {/* Property Custom Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setIsPropertyDropdownOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-[9px] bg-zinc-50 border border-zinc-200 hover:border-[#d4ad4d] text-xs font-semibold text-zinc-900 cursor-pointer transition-all"
              >
                {selectedProperty ? (
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-3.5 w-3.5 text-[#d4ad4d] shrink-0" />
                    <span className="truncate">{selectedProperty.title}</span>
                  </div>
                ) : (
                  <span className="text-zinc-400">Select a property...</span>
                )}
                <ChevronRight className={`h-3.5 w-3.5 text-zinc-400 transition-transform ${isPropertyDropdownOpen ? 'rotate-90' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isPropertyDropdownOpen && (
                <div className="absolute z-30 mt-1 w-full bg-white border border-zinc-200 rounded-[12px] shadow-xl p-2 space-y-2 animate-in fade-in duration-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search property..."
                      value={propertySearchQuery}
                      onChange={(e) => setPropertySearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-[7px] text-xs font-medium focus:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                    {filteredProperties.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-3">No matching properties</p>
                    ) : (
                      filteredProperties.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPropertyId(p.id);
                            setIsPropertyDropdownOpen(false);
                            setPropertySearchQuery('');
                          }}
                          className={`p-2 rounded-[7px] cursor-pointer transition-all flex items-center justify-between text-xs ${
                            selectedPropertyId === p.id 
                              ? 'bg-zinc-900 text-white font-semibold' 
                              : 'hover:bg-zinc-100 text-zinc-800'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="font-bold truncate text-[11px]">{p.title}</p>
                            <p className={`text-[10px] ${selectedPropertyId === p.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {p.location}
                            </p>
                          </div>
                          {p.price && (
                            <span className={`text-[10px] font-extrabold shrink-0 px-1.5 py-0.5 rounded ${
                              selectedPropertyId === p.id ? 'bg-[#d4ad4d] text-zinc-950' : 'bg-zinc-100 text-zinc-900'
                            }`}>
                              {formatPriceShort(p.price)}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Property Facts Matrix */}
            {selectedProperty && (
              <div className="bg-zinc-950 text-white rounded-[10px] p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-zinc-850 pb-1.5">
                  <span className="font-bold text-[#d4ad4d] text-[11px]">Fact Matrix</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-zinc-300">
                    {selectedProperty.property_code}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {selectedProperty.configuration && (
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {selectedProperty.configuration}
                    </span>
                  )}
                  {selectedProperty.carpet_area && (
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                      {selectedProperty.carpet_area} sq.ft.
                    </span>
                  )}
                  {selectedProperty.price && (
                    <span className="px-2 py-0.5 rounded bg-[#d4ad4d]/20 text-[#d4ad4d] font-bold border border-[#d4ad4d]/30">
                      ₹{(selectedProperty.price / 10000000).toFixed(2)} Cr
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Marketing Platform Selector Card */}
          <div className="bg-white border border-zinc-200 rounded-[14px] p-4 shadow-xs space-y-3">
            <div className="border-b border-zinc-100 pb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">2. Target Platform</span>
            </div>

            <div className="space-y-1.5">
              {PLATFORMS.map((plat) => {
                const Icon = plat.icon;
                const isSelected = selectedPlatform === plat.id;
                return (
                  <div
                    key={plat.id}
                    onClick={() => setSelectedPlatform(plat.id)}
                    className={`p-2.5 rounded-[9px] border cursor-pointer transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-zinc-950 border-zinc-950 text-white shadow-xs'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`p-1.5 rounded-[6px] shrink-0 ${
                      isSelected ? 'bg-[#d4ad4d] text-zinc-950' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{plat.name}</p>
                    </div>
                    {isSelected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d4ad4d] shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleGenerate}
              disabled={!selectedProperty || isGenerating}
              className="w-full mt-2 py-2.5 px-3 rounded-[9px] bg-zinc-950 hover:bg-black text-white font-extrabold text-xs flex items-center justify-center gap-2 border border-zinc-800 hover:border-[#d4ad4d] transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#d4ad4d] animate-spin" />
                  <span>Generating 3 Variations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#d4ad4d]" />
                  <span>Generate 3 Ad Variations</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* ── PANE 2: Center Primary Active Workspace (6 Cols) ── */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Empty State */}
          {!isGenerating && variations.length === 0 && (
            <div className="bg-white border border-dashed border-zinc-300 rounded-[14px] p-10 text-center flex flex-col items-center justify-center space-y-3 min-h-[420px]">
              <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Sparkles className="h-6 w-6 text-[#d4ad4d]" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h3 className="text-sm font-bold text-zinc-900">Ready to Generate Ad Copy</h3>
                <p className="text-xs text-zinc-500">
                  Select a target property and channel on the left, then click <span className="font-semibold text-zinc-800">Generate 3 Ad Variations</span>.
                </p>
              </div>
            </div>
          )}

          {/* Loading Skeleton Workspace */}
          {isGenerating && (
            <div className="bg-white border border-zinc-200 rounded-[14px] p-5 space-y-4 animate-pulse min-h-[420px]">
              <div className="p-3 bg-zinc-950 text-white rounded-[10px] flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[#d4ad4d] animate-spin" />
                <p className="text-xs font-bold">NVIDIA Nemotron 3 Super is generating ad copy...</p>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-zinc-200 rounded" />
                <div className="h-10 bg-zinc-100 rounded-[8px]" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-zinc-200 rounded" />
                <div className="h-28 bg-zinc-100 rounded-[8px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-zinc-100 rounded-[8px]" />
                <div className="h-12 bg-zinc-100 rounded-[8px]" />
              </div>
            </div>
          )}

          {/* Active Workstation Copy Editor */}
          {!isGenerating && variations.length > 0 && activeVariation && (
            <div className="bg-white border border-zinc-200 rounded-[14px] p-5 shadow-xs space-y-4">
              
              {/* Active Workspace Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-zinc-950 text-[#d4ad4d] text-[10px] font-extrabold uppercase tracking-wider">
                    Variation {activeVariationIndex + 1}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span>Fact Grounded</span>
                  </span>
                </div>

                <button
                  onClick={() => {
                    const fullCopy = `HEADLINE:\n${activeVariation.headline}\n\nPRIMARY COPY:\n${activeVariation.primary_copy}\n\nSHORT DESCRIPTION:\n${activeVariation.short_description}\n\nCALL TO ACTION:\n${activeVariation.cta}`;
                    copyToClipboard(fullCopy, `active-all-${activeVariationIndex}`, `Variation ${activeVariationIndex + 1}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-zinc-900 hover:bg-black text-white text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                >
                  {copiedItem === `active-all-${activeVariationIndex}` ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Package</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Full Package</span>
                    </>
                  )}
                </button>
              </div>

              {/* FIELD 1: Headline */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                    <span>1. Ad Headline ({activeVariation.headline.split(' ').filter(Boolean).length} words)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeVariation.headline, `headline-${activeVariationIndex}`, 'Headline')}
                    className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedItem === `headline-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={activeVariation.headline}
                  onChange={(e) => handleFieldChange(activeVariationIndex, 'headline', e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-bold text-zinc-900 focus:bg-white"
                />
              </div>

              {/* FIELD 2: Primary Ad Copy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                    <span>2. Primary Ad Copy ({activeVariation.primary_copy.split(' ').filter(Boolean).length} words)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(activeVariation.primary_copy, `primary-${activeVariationIndex}`, 'Primary Copy')}
                    className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedItem === `primary-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>Copy</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={activeVariation.primary_copy}
                  onChange={(e) => handleFieldChange(activeVariationIndex, 'primary_copy', e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-medium text-zinc-800 leading-relaxed focus:bg-white resize-y"
                />
              </div>

              {/* FIELD 3 & 4: Short Description & Call to Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                
                {/* Short Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                      <span>3. Short Description</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeVariation.short_description, `short-${activeVariationIndex}`, 'Short Description')}
                      className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedItem === `short-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={activeVariation.short_description}
                    onChange={(e) => handleFieldChange(activeVariationIndex, 'short_description', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-medium text-zinc-800 focus:bg-white resize-y"
                  />
                </div>

                {/* Call to Action */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                      <span>4. Call-to-Action</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(activeVariation.cta, `cta-${activeVariationIndex}`, 'CTA')}
                      className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedItem === `cta-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={activeVariation.cta}
                    onChange={(e) => handleFieldChange(activeVariationIndex, 'cta', e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-bold text-[#b4882d] focus:bg-white"
                  />
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ── PANE 3: Right Variations Selector Stack (3 Cols) ── */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-2 px-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
              Variations Drawer ({variations.length})
            </span>
            {variations.length > 0 && (
              <span className="text-[10px] font-mono text-zinc-400">Click to Inspect</span>
            )}
          </div>

          {variations.length === 0 && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-[14px] p-6 text-center text-xs text-zinc-400 space-y-1">
              <p className="font-bold">No Variations Yet</p>
              <p className="text-[10px] text-zinc-400">Generated variations will appear here.</p>
            </div>
          )}

          {variations.map((v, idx) => {
            const isActive = activeVariationIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveVariationIndex(idx)}
                className={`p-3.5 rounded-[12px] border cursor-pointer transition-all space-y-2 ${
                  isActive
                    ? 'bg-white border-zinc-900 shadow-sm ring-1 ring-zinc-900'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 opacity-80 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-zinc-900">
                    Variation {idx + 1}
                  </span>
                  {isActive ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-900 text-[#d4ad4d]">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-zinc-400">
                      View
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-bold text-zinc-800 line-clamp-2 leading-snug">
                  "{v.headline}"
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-zinc-100 text-[10px] text-zinc-500">
                  <span>{v.primary_copy.split(' ').filter(Boolean).length} words</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const fullCopy = `HEADLINE:\n${v.headline}\n\nPRIMARY COPY:\n${v.primary_copy}\n\nSHORT DESCRIPTION:\n${v.short_description}\n\nCALL TO ACTION:\n${v.cta}`;
                      copyToClipboard(fullCopy, `stack-all-${idx}`, `Variation ${idx + 1}`);
                    }}
                    className="hover:text-zinc-900 font-bold flex items-center gap-1"
                  >
                    {copiedItem === `stack-all-${idx}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>Copy All</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
