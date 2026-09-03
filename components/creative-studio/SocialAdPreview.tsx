"use client";

import React, { useState } from 'react';
import { Property } from '@/lib/queries';
import { 
  Camera, 
  Megaphone, 
  MessageSquare, 
  Globe, 
  Sparkles, 
  Heart, 
  Share2, 
  Bookmark, 
  MoreHorizontal, 
  ThumbsUp, 
  Check, 
  Copy,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  Building2,
  MapPin,
  Tag,
  Clock,
  Send,
  Eye,
  Layers
} from 'lucide-react';
import { formatPriceShort } from '@/lib/formatters';

export interface Variation {
  headline: string;
  primary_copy: string;
  short_description: string;
  cta: string;
}

export type PreviewPlatform = 'instagram' | 'facebook' | 'whatsapp' | 'portal';

interface SocialAdPreviewProps {
  property: Property | null;
  variations: Variation[];
  activeVariationIndex: number;
  onSelectVariationIndex: (index: number) => void;
  selectedPlatform: string; // The initial form platform
}

export function SocialAdPreview({
  property,
  variations,
  activeVariationIndex,
  onSelectVariationIndex,
  selectedPlatform
}: SocialAdPreviewProps) {
  // Local state for active mockup platform (defaults to selected form platform if supported)
  const initialPlatform: PreviewPlatform = 
    selectedPlatform === 'instagram' ? 'instagram' :
    selectedPlatform === 'whatsapp' ? 'whatsapp' :
    selectedPlatform === 'portal' ? 'portal' : 'facebook';

  const [activePreviewPlatform, setActivePreviewPlatform] = useState<PreviewPlatform>(initialPlatform);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const activeVariation = variations[activeVariationIndex] || null;

  // Helper for quick copy feedback
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Property Image Helper (Tasteful neutral fallback if missing)
  const propertyImageUrl = (property as any)?.image_url || (property as any)?.image || null;

  const defaultImagePlaceholder = (
    <div className="w-full h-48 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 text-white p-4 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#d4ad4d_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
      
      <div className="flex justify-between items-start z-10">
        <span className="px-2 py-0.5 rounded bg-[#d4ad4d] text-zinc-950 text-[9px] font-black uppercase tracking-wider">
          LUXE EXCLUSIVE
        </span>
        <span className="text-[10px] font-mono text-zinc-400">
          {property?.property_code || 'PROP-DIRECT'}
        </span>
      </div>

      <div className="z-10 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-[#d4ad4d] font-extrabold">
          <Building2 className="h-3.5 w-3.5" />
          <span>{property?.title || 'Luxury Residence'}</span>
        </div>
        <p className="text-[10px] text-zinc-300 font-medium">
          {property?.location || 'Pune'} • {property?.configuration || 'Luxury Unit'} {property?.carpet_area ? `• ${property.carpet_area} sq.ft.` : ''}
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-[14px] p-4 shadow-xs space-y-4">
      
      {/* ── Top Header Strip ── */}
      <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-[#d4ad4d]" />
          <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
            Ad Preview Mockup
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[9px] font-bold border border-zinc-200">
          Preview — Not Live
        </span>
      </div>

      {/* ── Variation Selector Switcher (if variations exist) ── */}
      {variations.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-[#d4ad4d]" />
              <span>Variation</span>
            </span>
            <span className="font-mono text-zinc-400">{activeVariationIndex + 1} of {variations.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {variations.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onSelectVariationIndex(idx)}
                className={`py-1.5 text-xs font-bold rounded-[7px] border transition-all cursor-pointer ${
                  activeVariationIndex === idx
                    ? 'bg-zinc-950 text-[#d4ad4d] border-zinc-950 shadow-xs'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                Var {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Preview Platform Switcher Pills ── */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">
          Preview Platform
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            onClick={() => setActivePreviewPlatform('instagram')}
            className={`py-1.5 px-2 rounded-[8px] border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePreviewPlatform === 'instagram'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Camera className={`h-3.5 w-3.5 ${activePreviewPlatform === 'instagram' ? 'text-[#d4ad4d]' : 'text-zinc-500'}`} />
            <span>Instagram</span>
          </button>

          <button
            onClick={() => setActivePreviewPlatform('facebook')}
            className={`py-1.5 px-2 rounded-[8px] border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePreviewPlatform === 'facebook'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Megaphone className={`h-3.5 w-3.5 ${activePreviewPlatform === 'facebook' ? 'text-[#d4ad4d]' : 'text-zinc-500'}`} />
            <span>Facebook</span>
          </button>

          <button
            onClick={() => setActivePreviewPlatform('whatsapp')}
            className={`py-1.5 px-2 rounded-[8px] border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePreviewPlatform === 'whatsapp'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <MessageSquare className={`h-3.5 w-3.5 ${activePreviewPlatform === 'whatsapp' ? 'text-[#d4ad4d]' : 'text-zinc-500'}`} />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => setActivePreviewPlatform('portal')}
            className={`py-1.5 px-2 rounded-[8px] border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activePreviewPlatform === 'portal'
                ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs'
                : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
            }`}
          >
            <Globe className={`h-3.5 w-3.5 ${activePreviewPlatform === 'portal' ? 'text-[#d4ad4d]' : 'text-zinc-500'}`} />
            <span>Portal</span>
          </button>
        </div>
      </div>

      {/* ── Empty State if no variations generated yet ── */}
      {!activeVariation && (
        <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-[12px] p-8 text-center space-y-2">
          <Eye className="h-6 w-6 text-zinc-400 mx-auto" />
          <p className="text-xs font-bold text-zinc-700">No Copy Generated Yet</p>
          <p className="text-[10px] text-zinc-400 max-w-xs mx-auto">
            Select a property on the left and click <span className="font-semibold text-zinc-700">Generate 3 Ad Variations</span> to see the realistic social mockup.
          </p>
        </div>
      )}

      {/* ── Dynamic Mockup Canvas ── */}
      {activeVariation && (
        <div className="pt-1">
          {/* 1. INSTAGRAM MOCKUP */}
          {activePreviewPlatform === 'instagram' && (
            <div className="bg-white border border-zinc-200 rounded-[14px] shadow-sm overflow-hidden text-xs space-y-0 max-w-sm mx-auto">
              {/* Instagram Header */}
              <div className="p-3 border-b border-zinc-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] shrink-0">
                    <div className="h-full w-full rounded-full bg-zinc-950 text-[#d4ad4d] font-black text-[9px] flex items-center justify-center">
                      LR
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-zinc-900 text-[11px]">luxerealty.pune</span>
                      <CheckCircle2 className="h-3 w-3 text-blue-500 fill-blue-500/10 shrink-0" />
                    </div>
                    <p className="text-[9px] text-zinc-400">{property?.location || 'Pune'} • Sponsored</p>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-zinc-400" />
              </div>

              {/* Instagram Image Container */}
              <div className="relative bg-zinc-900">
                {propertyImageUrl ? (
                  <img 
                    src={propertyImageUrl} 
                    alt={property?.title || 'Property'} 
                    className="w-full h-52 object-cover"
                  />
                ) : (
                  defaultImagePlaceholder
                )}
                {/* Sponsored Banner Action */}
                <div className="bg-zinc-900/90 backdrop-blur-xs text-white px-3 py-2 flex items-center justify-between text-[11px] font-bold border-t border-zinc-800">
                  <span className="text-[#d4ad4d]">{activeVariation.cta || 'Learn More'}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-[#d4ad4d]" />
                </div>
              </div>

              {/* Instagram Action Row */}
              <div className="px-3 pt-2.5 flex items-center justify-between text-zinc-700">
                <div className="flex items-center gap-3">
                  <Heart className="h-4 w-4 text-zinc-700 hover:text-rose-500 transition cursor-pointer" />
                  <MessageSquare className="h-4 w-4 text-zinc-700 hover:text-zinc-900 transition cursor-pointer" />
                  <Send className="h-4 w-4 text-zinc-700 hover:text-zinc-900 transition cursor-pointer" />
                </div>
                <Bookmark className="h-4 w-4 text-zinc-700 hover:text-zinc-900 transition cursor-pointer" />
              </div>

              {/* Instagram Likes */}
              <div className="px-3 pt-1.5 text-[10px] font-bold text-zinc-900">
                Liked by <span className="font-black">luxury_homes_pune</span> and <span className="font-black">1,420 others</span>
              </div>

              {/* Instagram Caption */}
              <div className="p-3 pt-1 space-y-1 text-[11px] text-zinc-800">
                <p className="leading-snug">
                  <span className="font-extrabold text-zinc-900 mr-1.5">luxerealty.pune</span>
                  <span className="font-bold text-zinc-900">{activeVariation.headline}</span> — {activeVariation.primary_copy}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium">
                  #{property?.location?.replace(/\s+/g, '') || 'Pune'} #LuxeRealty #LuxuryProperty #RealEstatePune
                </p>
              </div>
            </div>
          )}

          {/* 2. FACEBOOK MOCKUP */}
          {activePreviewPlatform === 'facebook' && (
            <div className="bg-white border border-zinc-200 rounded-[14px] shadow-sm overflow-hidden text-xs space-y-2.5 max-w-sm mx-auto p-3">
              {/* Facebook Page Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    LR
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-zinc-900 text-xs">Luxe Realty Pune</span>
                      <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                    </div>
                    <p className="text-[9px] text-zinc-400 font-medium flex items-center gap-1">
                      <span>Sponsored</span> • <span>🌐</span>
                    </p>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-zinc-400" />
              </div>

              {/* Primary Copy Text */}
              <p className="text-[11px] text-zinc-800 leading-relaxed font-medium">
                {activeVariation.primary_copy}
              </p>

              {/* Facebook Link Card */}
              <div className="rounded-[10px] border border-zinc-200 overflow-hidden bg-zinc-50">
                {propertyImageUrl ? (
                  <img 
                    src={propertyImageUrl} 
                    alt={property?.title || 'Property'} 
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  defaultImagePlaceholder
                )}
                <div className="p-3 bg-zinc-100/90 border-t border-zinc-200 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[9px] uppercase font-mono text-zinc-400 block font-bold">LUXEREALTY.IN</span>
                    <p className="text-[11px] font-extrabold text-zinc-900 truncate">{activeVariation.headline}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{activeVariation.short_description}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-[6px] bg-zinc-900 text-white text-[10px] font-extrabold shrink-0">
                    {activeVariation.cta || 'Learn More'}
                  </button>
                </div>
              </div>

              {/* Reactions & Engagement Counter */}
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-100">
                <div className="flex items-center gap-1">
                  <span className="bg-blue-500 text-white rounded-full p-0.5 text-[8px] font-bold">👍</span>
                  <span className="bg-rose-500 text-white rounded-full p-0.5 text-[8px] font-bold">❤️</span>
                  <span className="font-bold text-zinc-700">1.2K</span>
                </div>
                <div className="flex gap-2">
                  <span>84 Comments</span>
                  <span>32 Shares</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. WHATSAPP MOCKUP */}
          {activePreviewPlatform === 'whatsapp' && (
            <div className="bg-[#efeae2] border border-zinc-300 rounded-[14px] shadow-sm overflow-hidden text-xs max-w-sm mx-auto">
              {/* WhatsApp Emerald Header */}
              <div className="bg-[#075e54] text-white p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-emerald-700 font-bold text-[10px] flex items-center justify-center border border-emerald-500 shrink-0">
                    LR
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs">Luxe Realty Business</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-300 shrink-0" />
                    </div>
                    <span className="text-[9px] text-emerald-200">Online</span>
                  </div>
                </div>
                <MoreHorizontal className="h-4 w-4 text-emerald-100" />
              </div>

              {/* WhatsApp Chat Message Container */}
              <div className="p-3 space-y-2">
                <div className="bg-white rounded-lg p-2.5 border border-zinc-200 shadow-2xs space-y-2 text-[11px] text-zinc-800 relative">
                  {/* Photo attachment if available */}
                  {propertyImageUrl ? (
                    <img 
                      src={propertyImageUrl} 
                      alt={property?.title || 'Property'} 
                      className="w-full h-36 object-cover rounded"
                    />
                  ) : (
                    defaultImagePlaceholder
                  )}

                  {/* Headline & Body */}
                  <div className="space-y-1">
                    <p className="font-extrabold text-zinc-900 text-xs">*{activeVariation.headline}*</p>
                    <p className="leading-snug text-zinc-700">{activeVariation.primary_copy}</p>
                  </div>

                  {/* Property Specs Block */}
                  {property && (
                    <div className="p-2 rounded bg-emerald-50/60 border border-emerald-100 space-y-0.5 text-[10px] text-zinc-700 font-medium">
                      <p><span className="font-bold">📍 Location:</span> {property.location}</p>
                      <p><span className="font-bold">🏡 Configuration:</span> {property.configuration} ({property.property_type})</p>
                      {property.carpet_area && <p><span className="font-bold">📐 Carpet Area:</span> {property.carpet_area} sq.ft.</p>}
                      {property.price && <p><span className="font-bold">💰 Price:</span> ₹{(property.price / 10000000).toFixed(2)} Cr</p>}
                    </div>
                  )}

                  {/* Quick Action Button */}
                  <div className="pt-1 border-t border-zinc-100 flex items-center justify-between text-[10px] font-bold text-emerald-700">
                    <span className="flex items-center gap-1">
                      <Send className="h-3 w-3 text-emerald-600" />
                      <span>{activeVariation.cta || 'Reply: Schedule Site Visit'}</span>
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono flex items-center gap-0.5">
                      10:42 AM <span className="text-blue-500">✓✓</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. PROPERTY PORTAL MOCKUP */}
          {activePreviewPlatform === 'portal' && (
            <div className="bg-white border border-zinc-200 rounded-[14px] shadow-sm overflow-hidden text-xs max-w-sm mx-auto p-3 space-y-2.5">
              {/* Portal Verified Tag */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-extrabold border border-emerald-200 uppercase tracking-wider">
                  VERIFIED DIRECT LISTING
                </span>
                <span className="text-[10px] font-mono text-zinc-400">{property?.property_code || 'PROP-01'}</span>
              </div>

              {/* Portal Image & Title */}
              <div className="rounded-[10px] border border-zinc-200 overflow-hidden relative">
                {propertyImageUrl ? (
                  <img 
                    src={propertyImageUrl} 
                    alt={property?.title || 'Property'} 
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  defaultImagePlaceholder
                )}
                {property?.price && (
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-zinc-950/90 backdrop-blur-xs text-[#d4ad4d] font-black text-xs">
                    ₹{(property.price / 10000000).toFixed(2)} Cr
                  </div>
                )}
              </div>

              {/* Portal Content */}
              <div className="space-y-1">
                <h3 className="font-extrabold text-zinc-900 text-xs">{property?.title || 'Luxury Property'}</h3>
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold">
                  <span>{property?.location || 'Pune'}</span>
                  <span>•</span>
                  <span>{property?.configuration}</span>
                  {property?.carpet_area && (
                    <>
                      <span>•</span>
                      <span>{property.carpet_area} sq.ft.</span>
                    </>
                  )}
                </div>
              </div>

              {/* Generated Copy Listing Body */}
              <div className="p-2.5 bg-zinc-50 border border-zinc-100 rounded-[8px] space-y-1">
                <p className="font-bold text-zinc-900 text-[11px]">{activeVariation.headline}</p>
                <p className="text-[10px] text-zinc-600 leading-relaxed">{activeVariation.primary_copy}</p>
              </div>

              {/* Portal CTA Action Button */}
              <button className="w-full py-2 rounded-[8px] bg-zinc-950 hover:bg-black text-[#d4ad4d] font-extrabold text-xs flex items-center justify-center gap-1.5 border border-zinc-800 transition">
                <PhoneCall className="h-3.5 w-3.5 text-[#d4ad4d]" />
                <span>{activeVariation.cta || 'Contact Sales Desk'}</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
