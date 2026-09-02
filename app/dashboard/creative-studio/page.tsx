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
  Home, 
  Copy, 
  Check, 
  RotateCcw, 
  Megaphone, 
  Camera, 
  MessageSquare, 
  Globe, 
  Search, 
  FileText, 
  Sliders, 
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Pencil
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
    description: 'Persuasive, storytelling, emotional & conversion-focused for social ads.'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Camera,
    description: 'Concise, visual-first, engaging & social-media friendly.'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageSquare,
    description: 'Conversational, personal, direct & punchy for direct messaging.'
  },
  {
    id: 'portal',
    name: 'Property Portal',
    icon: Globe,
    description: 'Factual, detailed, structured & search-optimized for listing portals.'
  },
  {
    id: 'general',
    name: 'General Marketing',
    icon: Sparkles,
    description: 'Balanced, professional & versatile across digital or print media.'
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

    try {
      const res = await fetch('/api/ad-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          platform: selectedPlatform
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate ad copy');
      }

      setVariations(data.variations || []);
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

  return (
    <div className="space-y-6 pb-12">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 border border-zinc-850 p-6 rounded-[14px] shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#d4ad4d]/10 border border-[#d4ad4d]/20 text-[#d4ad4d] text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Marketing Copy Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
            Creative Studio
          </h1>
          <p className="text-xs text-zinc-400 font-medium">
            Create professional property marketing copy using your existing property data.
          </p>
        </div>

        {variations.length > 0 && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[9px] bg-zinc-900 border border-zinc-800 hover:border-[#d4ad4d] text-white hover:text-[#d4ad4d] text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Regenerate All</span>
          </button>
        )}
      </div>

      {/* ── Main Configuration Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Property & Platform Selector Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* STEP 1: Property Selector Card */}
          <div className="bg-white border border-zinc-200 rounded-[14px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-900 text-white font-bold text-[10px]">1</span>
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Select Property</h2>
              </div>
              <span className="text-[10px] font-semibold text-zinc-500">{properties.length} Active Listings</span>
            </div>

            {/* Custom Dropdown with Search */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                Target Property Listing
              </label>

              <div 
                onClick={() => setIsPropertyDropdownOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[9px] bg-zinc-50 border border-zinc-200 hover:border-[#d4ad4d] text-xs font-semibold text-zinc-900 cursor-pointer transition-all"
              >
                {selectedProperty ? (
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-[#d4ad4d] shrink-0" />
                    <span className="truncate">{selectedProperty.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 font-bold shrink-0">
                      {selectedProperty.property_code}
                    </span>
                  </div>
                ) : (
                  <span className="text-zinc-400">Select a property...</span>
                )}
                <ChevronRight className={`h-4 w-4 text-zinc-400 transition-transform ${isPropertyDropdownOpen ? 'rotate-90' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isPropertyDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white border border-zinc-200 rounded-[12px] shadow-xl p-2 space-y-2 animate-in fade-in duration-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search title, location, or code..."
                      value={propertySearchQuery}
                      onChange={(e) => setPropertySearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-[7px] text-xs font-medium focus:bg-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                    {filteredProperties.length === 0 ? (
                      <p className="text-xs text-zinc-400 text-center py-3">No matching properties found</p>
                    ) : (
                      filteredProperties.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedPropertyId(p.id);
                            setIsPropertyDropdownOpen(false);
                            setPropertySearchQuery('');
                          }}
                          className={`p-2.5 rounded-[8px] cursor-pointer transition-all flex items-center justify-between text-xs ${
                            selectedPropertyId === p.id 
                              ? 'bg-zinc-900 text-white font-semibold' 
                              : 'hover:bg-zinc-100 text-zinc-800'
                          }`}
                        >
                          <div className="space-y-0.5 truncate pr-2">
                            <p className="font-bold truncate">{p.title}</p>
                            <p className={`text-[10px] ${selectedPropertyId === p.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              {p.location} • {p.configuration}
                            </p>
                          </div>
                          {p.price && (
                            <span className={`text-[10px] font-extrabold shrink-0 px-2 py-0.5 rounded ${
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

            {/* Selected Property Facts Summary Box */}
            {selectedProperty && (
              <div className="bg-zinc-50 border border-zinc-200 rounded-[10px] p-3.5 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900">{selectedProperty.title}</h3>
                    <p className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-[#d4ad4d]" />
                      <span>{selectedProperty.location}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-1 bg-zinc-900 text-[#d4ad4d] rounded-[6px]">
                    {selectedProperty.property_code}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedProperty.configuration && (
                    <span className="px-2 py-0.5 bg-white border border-zinc-200 text-zinc-800 text-[10px] font-bold rounded-[6px]">
                      {selectedProperty.configuration}
                    </span>
                  )}
                  {selectedProperty.carpet_area && (
                    <span className="px-2 py-0.5 bg-white border border-zinc-200 text-zinc-800 text-[10px] font-bold rounded-[6px]">
                      {selectedProperty.carpet_area} sq.ft.
                    </span>
                  )}
                  {selectedProperty.price && (
                    <span className="px-2 py-0.5 bg-[#d4ad4d]/15 border border-[#d4ad4d]/30 text-zinc-900 text-[10px] font-extrabold rounded-[6px]">
                      ₹{(selectedProperty.price / 10000000).toFixed(2)} Cr
                    </span>
                  )}
                  {selectedProperty.property_type && (
                    <span className="px-2 py-0.5 bg-white border border-zinc-200 text-zinc-700 text-[10px] font-medium rounded-[6px]">
                      {selectedProperty.property_type}
                    </span>
                  )}
                </div>

                {selectedProperty.description && (
                  <p className="text-[11px] text-zinc-600 line-clamp-2 italic pt-1 border-t border-zinc-200/60">
                    "{selectedProperty.description}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* STEP 2: Platform Selection Card */}
          <div className="bg-white border border-zinc-200 rounded-[14px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-zinc-900 text-white font-bold text-[10px]">2</span>
                <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Target Marketing Platform</h2>
              </div>
            </div>

            <div className="space-y-2">
              {PLATFORMS.map((plat) => {
                const Icon = plat.icon;
                const isSelected = selectedPlatform === plat.id;
                return (
                  <div
                    key={plat.id}
                    onClick={() => setSelectedPlatform(plat.id)}
                    className={`p-3 rounded-[10px] border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-zinc-950 border-zinc-950 text-white shadow-sm'
                        : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    <div className={`p-2 rounded-[8px] shrink-0 mt-0.5 ${
                      isSelected ? 'bg-[#d4ad4d] text-zinc-950' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold truncate">{plat.name}</p>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#d4ad4d] shrink-0" />
                        )}
                      </div>
                      <p className={`text-[10px] leading-snug ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {plat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedProperty || isGenerating}
              className="w-full mt-2 py-3 px-4 rounded-[9px] bg-zinc-950 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 border border-zinc-800 hover:border-[#d4ad4d] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 text-[#d4ad4d] animate-spin" />
                  <span>Generating 3 Variations...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-[#d4ad4d] group-hover:scale-110 transition-transform" />
                  <span>Generate Ad Copy (3 Variations)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Output Variations Display */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Empty State when no generation performed yet */}
          {!isGenerating && variations.length === 0 && (
            <div className="bg-white border border-dashed border-zinc-300 rounded-[14px] p-12 text-center flex flex-col items-center justify-center space-y-4 min-h-[460px]">
              <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                <Sparkles className="h-7 w-7 text-[#d4ad4d]" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-sm font-bold text-zinc-900">Ready to Generate Ad Copy</h3>
                <p className="text-xs text-zinc-500">
                  Select a property and target platform from the left panel, then click <span className="font-semibold text-zinc-800">Generate Ad Copy</span> to produce 3 tailored variations.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2 text-[10px] font-bold text-zinc-400">
                <span className="px-2.5 py-1 bg-zinc-100 rounded-full">✓ No Hallucinated Facts</span>
                <span className="px-2.5 py-1 bg-zinc-100 rounded-full">✓ 100% Editable</span>
                <span className="px-2.5 py-1 bg-zinc-100 rounded-full">✓ 5 Media Formats</span>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {isGenerating && (
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 text-white rounded-[12px] flex items-center gap-3 animate-pulse">
                <Sparkles className="h-5 w-5 text-[#d4ad4d] animate-spin" />
                <div>
                  <p className="text-xs font-bold">Cloudflare Workers AI is crafting copy...</p>
                  <p className="text-[10px] text-zinc-400">Processing real facts for {selectedProperty?.title}</p>
                </div>
              </div>

              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-[14px] p-5 space-y-4 animate-pulse">
                  <div className="h-4 w-32 bg-zinc-200 rounded" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-zinc-200 rounded" />
                    <div className="h-8 bg-zinc-100 rounded-[8px]" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-zinc-200 rounded" />
                    <div className="h-20 bg-zinc-100 rounded-[8px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-zinc-100 rounded-[8px]" />
                    <div className="h-10 bg-zinc-100 rounded-[8px]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results: 3 Variation Cards */}
          {!isGenerating && variations.length > 0 && (
            <div className="space-y-6">
              
              {/* Header Bar */}
              <div className="flex items-center justify-between bg-zinc-900 text-white px-4 py-3 rounded-[12px]">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-[#d4ad4d]">Target:</span>
                  <span className="capitalize font-semibold">{selectedPlatform} Ad</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-300 truncate max-w-[200px]">{selectedProperty?.title}</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-full">
                  3 Variations Generated
                </span>
              </div>

              {/* Variations Cards */}
              <div className="space-y-6">
                {variations.map((v, idx) => {
                  const cardId = `var-${idx}`;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.08 }}
                      className="bg-white border border-zinc-200 rounded-[14px] p-5 shadow-xs space-y-4 hover:border-zinc-300 transition-all"
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center px-2.5 py-0.5 rounded-full bg-zinc-950 text-[#d4ad4d] text-[10px] font-extrabold uppercase tracking-wider">
                            Variation {idx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-400">Editable</span>
                        </div>

                        {/* Copy All Button */}
                        <button
                          onClick={() => {
                            const fullCopy = `HEADLINE:\n${v.headline}\n\nPRIMARY COPY:\n${v.primary_copy}\n\nSHORT DESCRIPTION:\n${v.short_description}\n\nCALL TO ACTION:\n${v.cta}`;
                            copyToClipboard(fullCopy, `${cardId}-all`, `Variation ${idx + 1}`);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] bg-zinc-100 hover:bg-zinc-900 text-zinc-700 hover:text-white text-[11px] font-bold transition-all cursor-pointer"
                        >
                          {copiedItem === `${cardId}-all` ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="text-emerald-600">Copied All</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy All</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* FIELD 1: Headline */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                            <span>1. Ad Headline</span>
                          </label>
                          <button
                            onClick={() => copyToClipboard(v.headline, `${cardId}-headline`, 'Headline')}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                          >
                            {copiedItem === `${cardId}-headline` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>Copy</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={v.headline}
                          onChange={(e) => handleFieldChange(idx, 'headline', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-bold text-zinc-900 focus:bg-white"
                        />
                      </div>

                      {/* FIELD 2: Primary Ad Copy */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                            <span>2. Primary Ad Copy</span>
                          </label>
                          <button
                            onClick={() => copyToClipboard(v.primary_copy, `${cardId}-primary`, 'Primary Copy')}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                          >
                            {copiedItem === `${cardId}-primary` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            <span>Copy</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={v.primary_copy}
                          onChange={(e) => handleFieldChange(idx, 'primary_copy', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-medium text-zinc-800 leading-relaxed focus:bg-white resize-y"
                        />
                      </div>

                      {/* FIELD 3 & 4: Short Description & Call to Action Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        
                        {/* FIELD 3: Short Description */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                              <span>3. Short Description</span>
                            </label>
                            <button
                              onClick={() => copyToClipboard(v.short_description, `${cardId}-short`, 'Short Description')}
                              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                            >
                              {copiedItem === `${cardId}-short` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              <span>Copy</span>
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={v.short_description}
                            onChange={(e) => handleFieldChange(idx, 'short_description', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-medium text-zinc-800 focus:bg-white resize-y"
                          />
                        </div>

                        {/* FIELD 4: CTA */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                              <Pencil className="h-2.5 w-2.5 text-[#d4ad4d]" />
                              <span>4. Call-to-Action</span>
                            </label>
                            <button
                              onClick={() => copyToClipboard(v.cta, `${cardId}-cta`, 'CTA')}
                              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                            >
                              {copiedItem === `${cardId}-cta` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              <span>Copy</span>
                            </button>
                          </div>
                          <input
                            type="text"
                            value={v.cta}
                            onChange={(e) => handleFieldChange(idx, 'cta', e.target.value)}
                            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-[8px] text-xs font-bold text-zinc-900 focus:bg-white"
                          />
                        </div>
                      </div>

                    </motion.div>
                  );
                })}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
