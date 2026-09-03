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
import { SocialAdPreview } from '@/components/creative-studio/SocialAdPreview';

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
    <div className="h-[calc(100vh-85px)] flex flex-col overflow-hidden space-y-3 pb-1">
      
      {/* ── Swiss Typographic (Clean Option 3) Top Header Bar ── */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-zinc-300 p-3 sm:px-5 rounded-lg shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-zinc-950 text-[#d4ad4d] flex items-center justify-center font-black text-xs shrink-0">
            <Sparkles className="h-4 w-4 text-[#d4ad4d]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-950 text-white text-[9px] font-black uppercase tracking-widest">
                Swiss Edition · Option 3
              </span>
              <span className="hidden md:inline-block text-[9px] font-mono text-zinc-400 font-bold uppercase">
                D1 Factual Grounded
              </span>
            </div>
            <h1 className="text-xs font-black uppercase tracking-widest text-zinc-900 mt-0.5">
              Creative Studio & AI Marketing Suite
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-100 border border-zinc-300 text-[10px] font-mono font-bold text-zinc-800">
            <Cpu className="h-3.5 w-3.5 text-[#b4882d]" />
            <span>MODEL: NEMOTRON-3-SUPER</span>
          </div>

          {variations.length > 0 && (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded bg-zinc-950 hover:bg-black text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 text-[#d4ad4d] ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate Copy</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Swiss Typographic (Clean Option 3) 3-Pane Workstation Grid (Fixed Viewport, No Page Scroll) ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white border border-zinc-300 rounded-lg overflow-hidden shadow-2xs">
        
        {/* ── PANE 1: Left Property Inventory & Channel Selection (3 Cols) ── */}
        <div className="lg:col-span-3 bg-white p-3.5 border-b lg:border-b-0 lg:border-r border-zinc-300 space-y-3.5 overflow-y-auto h-full">
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-1 block">
            1. PROPERTY INVENTORY
          </span>

          {/* Property Custom Dropdown */}
          <div className="relative">
            <div 
              onClick={() => setIsPropertyDropdownOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-zinc-50 border border-zinc-300 hover:border-[#d4ad4d] text-xs font-bold text-zinc-900 cursor-pointer transition-all"
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
              <div className="absolute z-30 mt-1 w-full bg-white border border-zinc-300 rounded shadow-xl p-2 space-y-2 animate-in fade-in duration-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search property..."
                    value={propertySearchQuery}
                    onChange={(e) => setPropertySearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-300 rounded text-xs font-bold focus:bg-white"
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
                        className={`p-2 rounded cursor-pointer transition-all flex items-center justify-between text-xs ${
                          selectedPropertyId === p.id 
                            ? 'bg-zinc-950 text-white font-bold' 
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
            <div className="p-3 rounded border border-zinc-300 bg-zinc-50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-black text-xs text-zinc-900 truncate pr-2">{selectedProperty.title}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-900 font-bold shrink-0">
                  {selectedProperty.property_code}
                </span>
              </div>
              <p className="text-[10px] text-zinc-600 font-medium">{selectedProperty.location}</p>
              <div className="flex flex-wrap gap-1 text-[9px] font-bold pt-1">
                {selectedProperty.configuration && (
                  <span className="px-2 py-0.5 rounded bg-white text-zinc-800 border border-zinc-300">
                    {selectedProperty.configuration}
                  </span>
                )}
                {selectedProperty.carpet_area && (
                  <span className="px-2 py-0.5 rounded bg-white text-zinc-800 border border-zinc-300">
                    {selectedProperty.carpet_area} sq.ft.
                  </span>
                )}
                {selectedProperty.price && (
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-[#d4ad4d] font-black">
                    ₹{(selectedProperty.price / 10000000).toFixed(2)} Cr
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Marketing Platform Selector */}
          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-200 pb-1 block pt-2">
            2. CHANNEL SELECTION
          </span>
          
          <div className="space-y-1 font-mono font-bold text-xs">
            {PLATFORMS.map((plat) => {
              const Icon = plat.icon;
              const isSelected = selectedPlatform === plat.id;
              return (
                <div
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`p-2 rounded cursor-pointer transition-all flex items-center justify-between uppercase text-[11px] ${
                    isSelected
                      ? 'bg-zinc-950 text-white font-black'
                      : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-[#d4ad4d]' : 'text-zinc-500'}`} />
                    <span>{plat.name}</span>
                  </div>
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d4ad4d]" />
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!selectedProperty || isGenerating}
            className="w-full mt-2 py-2.5 rounded bg-zinc-950 hover:bg-black text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-zinc-900 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#d4ad4d] animate-spin" />
                <span>Generating 3 Variations...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-[#d4ad4d]" />
                <span>Generate 3 Variations</span>
              </>
            )}
          </button>
        </div>

        {/* ── PANE 2: Center Primary Active Copy Workspace (5 Cols) ── */}
        <div className="lg:col-span-5 bg-white p-4 border-b lg:border-b-0 lg:border-r border-zinc-300 space-y-3.5 overflow-y-auto h-full">
          
          {/* Empty State */}
          {!isGenerating && variations.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 min-h-[450px]">
              <div className="h-10 w-10 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center text-zinc-400">
                <Sparkles className="h-5 w-5 text-[#d4ad4d]" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Ready to Generate Ad Copy</h3>
                <p className="text-[11px] text-zinc-500">
                  Select a target property and channel on the left, then click <span className="font-bold text-zinc-900 uppercase">Generate 3 Variations</span>.
                </p>
              </div>
            </div>
          )}

          {/* Loading Skeleton Workspace */}
          {isGenerating && (
            <div className="p-4 space-y-4 animate-pulse min-h-[450px]">
              <div className="p-3 bg-zinc-950 text-white rounded flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[#d4ad4d] animate-spin" />
                <p className="text-xs font-bold uppercase tracking-wider">NVIDIA Nemotron 3 Super is generating ad copy...</p>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 bg-zinc-200 rounded" />
                <div className="h-10 bg-zinc-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-zinc-200 rounded" />
                <div className="h-28 bg-zinc-100 rounded" />
              </div>
            </div>
          )}

          {/* Active Workstation Copy Editor */}
          {!isGenerating && variations.length > 0 && activeVariation && (
            <div className="space-y-4">
              
              {/* Active Workspace Header Bar */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-950 text-[#d4ad4d] text-[9px] font-black uppercase tracking-widest">
                    VARIATION {activeVariationIndex + 1}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                    FACT GROUNDED
                  </span>
                </div>

                <button
                  onClick={() => {
                    const fullCopy = `HEADLINE:\n${activeVariation.headline}\n\nPRIMARY COPY:\n${activeVariation.primary_copy}\n\nSHORT DESCRIPTION:\n${activeVariation.short_description}\n\nCALL TO ACTION:\n${activeVariation.cta}`;
                    copyToClipboard(fullCopy, `active-all-${activeVariationIndex}`, `Variation ${activeVariationIndex + 1}`);
                  }}
                  className="px-3 py-1 bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer"
                >
                  {copiedItem === `active-all-${activeVariationIndex}` ? (
                    <span className="text-emerald-400">Copied Package</span>
                  ) : (
                    <span>Copy Package</span>
                  )}
                </button>
              </div>

              {/* FIELD 1: Headline */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>1. AD HEADLINE ({activeVariation.headline.split(' ').filter(Boolean).length} WORDS)</span>
                  <button
                    onClick={() => copyToClipboard(activeVariation.headline, `headline-${activeVariationIndex}`, 'Headline')}
                    className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {copiedItem === `headline-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>COPY</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={activeVariation.headline}
                  onChange={(e) => handleFieldChange(activeVariationIndex, 'headline', e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded text-xs font-bold text-zinc-900 focus:bg-white focus:outline-none focus:border-zinc-500"
                />
              </div>

              {/* FIELD 2: Primary Ad Copy */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>2. PRIMARY AD COPY ({activeVariation.primary_copy.split(' ').filter(Boolean).length} WORDS)</span>
                  <button
                    onClick={() => copyToClipboard(activeVariation.primary_copy, `primary-${activeVariationIndex}`, 'Primary Copy')}
                    className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer font-mono"
                  >
                    {copiedItem === `primary-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    <span>COPY</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  value={activeVariation.primary_copy}
                  onChange={(e) => handleFieldChange(activeVariationIndex, 'primary_copy', e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border border-zinc-300 rounded text-xs font-medium text-zinc-800 leading-relaxed focus:bg-white focus:outline-none focus:border-zinc-500 min-h-[120px] resize-y"
                />
              </div>

              {/* FIELD 3 & 4: Short Description & Call to Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                
                {/* Short Description */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    <span>3. SHORT DESCRIPTION</span>
                    <button
                      onClick={() => copyToClipboard(activeVariation.short_description, `short-${activeVariationIndex}`, 'Short Description')}
                      className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copiedItem === `short-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>COPY</span>
                    </button>
                  </div>
                  <textarea
                  rows={3}
                  value={activeVariation.short_description}
                  onChange={(e) => handleFieldChange(activeVariationIndex, 'short_description', e.target.value)}
                  className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs font-medium text-zinc-800 leading-snug focus:bg-white focus:outline-none min-h-[82px] resize-y"
                />
                </div>

                {/* Call to Action */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                    <span>4. CALL-TO-ACTION</span>
                    <button
                      onClick={() => copyToClipboard(activeVariation.cta, `cta-${activeVariationIndex}`, 'CTA')}
                      className="hover:text-zinc-900 flex items-center gap-1 cursor-pointer font-mono"
                    >
                      {copiedItem === `cta-${activeVariationIndex}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      <span>COPY</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={activeVariation.cta}
                    onChange={(e) => handleFieldChange(activeVariationIndex, 'cta', e.target.value)}
                    className="w-full p-2 bg-zinc-50 border border-zinc-300 rounded text-xs font-bold text-[#b4882d] focus:bg-white focus:outline-none"
                  />
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ── PANE 3: Right Real-Time Platform Ad Preview Mockup (4 Cols) ── */}
        <div className="lg:col-span-4 bg-zinc-100/60 p-3.5 overflow-y-auto h-full">
          <SocialAdPreview
            property={selectedProperty}
            variations={variations}
            activeVariationIndex={activeVariationIndex}
            onSelectVariationIndex={setActiveVariationIndex}
            selectedPlatform={selectedPlatform}
          />
        </div>

      </div>

    </div>
  );
}
