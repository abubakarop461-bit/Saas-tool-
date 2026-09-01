// src/lib/matchmaking.ts – Enhanced Multi-Dimensional Property Matching & AI Lead Intent Engine
import { supabase } from '@/lib/supabaseClient';

export interface Lead {
  id: string;
  client_name?: string;
  phone?: string;
  email?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  property_type?: string;
  configuration?: string;
  required_area?: number;
  purpose?: string;
  category?: string;
  transaction_type?: string;
  status?: string;
  stage_id?: string;
  next_followup_date?: string;
  notes?: string;
  created_at?: string;
}

export interface Property {
  id: string;
  title?: string;
  price?: number;
  location?: string;
  property_type?: string;
  configuration?: string;
  carpet_area?: number;
  listing_type?: string;
  status_id?: string;
  tower?: string;
  unit_no?: string;
}

export interface MatchReason {
  category: 'budget' | 'location' | 'config' | 'area' | 'type';
  label: string;
  points: number;
  maxPoints: number;
  matched: boolean;
}

export interface AILeadIntentScore {
  score: number; // 0 - 100
  tier: 'HIGH INTENT' | 'WARM' | 'COLD';
  badgeColor: string;
  reasons: string[];
}

// Micro-market proximity groupings
const LOCALITY_CLUSTERS: Record<string, string[]> = {
  'kalyani nagar': ['koregaon park', 'viman nagar', 'boat club road'],
  'koregaon park': ['kalyani nagar', 'boat club road', 'dhole patil road'],
  'baner': ['balewadi', 'pashan', 'aundh', 'mahalunge'],
  'kharadi': ['wagholi', 'viman nagar', 'hadapsar', 'magarpatta'],
  'hinjewadi': ['wakad', 'punawale', 'tathawade', 'baner']
};

// Configuration layout flexibility weights
const CONFIG_HIERARCHY: Record<string, Record<string, number>> = {
  '3 BHK': { '3 BHK': 1.0, '3.5 BHK': 0.9, '3 BHK + Study': 0.95, '2.5 BHK': 0.65, '4 BHK': 0.7 },
  '4 BHK': { '4 BHK': 1.0, '4.5 BHK': 0.95, '5 BHK': 0.85, '3.5 BHK': 0.75, '3 BHK': 0.4 },
  '2 BHK': { '2 BHK': 1.0, '2.5 BHK': 0.9, '3 BHK': 0.65, '1.5 BHK': 0.5 }
};

/**
 * 1. Calculate Multi-Dimensional Fit Score between Lead and Property
 */
export function computeMatchScore(lead: Lead, prop: Property): { score: number; reasons: MatchReason[] } {
  let score = 0;
  const reasons: MatchReason[] = [];

  // A. Budget match (30 pts) with 10% elasticity stretch
  let budgetScore = 0;
  let budgetLabel = '';
  const minB = lead.budget_min || 0;
  const maxB = lead.budget_max || Infinity;

  if (prop.price && prop.price >= minB && prop.price <= maxB) {
    budgetScore = 30;
    budgetLabel = 'Budget fully aligns within target range';
  } else if (prop.price && prop.price > maxB && prop.price <= maxB * 1.10) {
    const diff = ((prop.price - maxB) / maxB) * 100;
    budgetScore = Math.round(30 * (1 - diff / 20));
    budgetLabel = `Within 10% stretch budget (+${diff.toFixed(1)}%)`;
  } else if (prop.price && prop.price < minB && prop.price >= minB * 0.85) {
    budgetScore = 24;
    budgetLabel = 'Below target budget (high-value upside)';
  } else {
    budgetLabel = 'Price outside budget threshold';
  }
  score += budgetScore;
  reasons.push({ category: 'budget', label: budgetLabel, points: budgetScore, maxPoints: 30, matched: budgetScore >= 20 });

  // B. Location match (25 pts) with proximity clustering
  let locScore = 0;
  let locLabel = '';
  const lLoc = (lead.preferred_location || '').toLowerCase().trim();
  const pLoc = (prop.location || '').toLowerCase().trim();

  if (lLoc && pLoc) {
    if (lLoc === pLoc || pLoc.includes(lLoc) || lLoc.includes(pLoc)) {
      locScore = 25;
      locLabel = `Direct location match in ${prop.location}`;
    } else if (LOCALITY_CLUSTERS[lLoc]?.some(near => pLoc.includes(near))) {
      locScore = 18;
      locLabel = `Adjacent micro-market cluster (${prop.location})`;
    } else {
      locLabel = `Different neighborhood (${prop.location})`;
    }
  }
  score += locScore;
  reasons.push({ category: 'location', label: locLabel, points: locScore, maxPoints: 25, matched: locScore >= 18 });

  // C. Configuration match (20 pts)
  let cfgScore = 0;
  let cfgLabel = '';
  const lCfg = (lead.configuration || '').trim();
  const pCfg = (prop.configuration || '').trim();

  if (lCfg && pCfg) {
    if (lCfg === pCfg) {
      cfgScore = 20;
      cfgLabel = `Exact layout match (${pCfg})`;
    } else if (CONFIG_HIERARCHY[lCfg]?.[pCfg]) {
      const mul = CONFIG_HIERARCHY[lCfg][pCfg];
      cfgScore = Math.round(20 * mul);
      cfgLabel = `Compatible layout variant (${pCfg})`;
    } else {
      cfgLabel = `Different configuration (${pCfg} vs ${lCfg})`;
    }
  }
  score += cfgScore;
  reasons.push({ category: 'config', label: cfgLabel, points: cfgScore, maxPoints: 20, matched: cfgScore >= 14 });

  // D. Property Type match (15 pts)
  let typeScore = 0;
  let typeLabel = '';
  if (lead.property_type && prop.property_type) {
    if (lead.property_type.toLowerCase() === prop.property_type.toLowerCase()) {
      typeScore = 15;
      typeLabel = `Property type match (${prop.property_type})`;
    } else {
      typeLabel = `Different type (${prop.property_type})`;
    }
  }
  score += typeScore;
  reasons.push({ category: 'type', label: typeLabel, points: typeScore, maxPoints: 15, matched: typeScore >= 12 });

  // E. Area match (10 pts)
  let areaScore = 0;
  let areaLabel = '';
  if (lead.required_area && prop.carpet_area) {
    const diffPct = Math.abs(prop.carpet_area - lead.required_area) / lead.required_area;
    if (diffPct <= 0.08) {
      areaScore = 10;
      areaLabel = `Carpet area fits within ±8% (${prop.carpet_area} sq ft)`;
    } else if (diffPct <= 0.20) {
      areaScore = 7;
      areaLabel = `Area within 20% tolerance (${prop.carpet_area} sq ft)`;
    } else {
      areaLabel = `Area mismatch (${prop.carpet_area} sq ft)`;
    }
  } else {
    areaScore = 8;
    areaLabel = 'Standard carpet area for layout';
  }
  score += areaScore;
  reasons.push({ category: 'area', label: areaLabel, points: areaScore, maxPoints: 10, matched: areaScore >= 7 });

  return { score: Math.min(Math.round(score), 100), reasons };
}

/**
 * 2. Calculate AI Purchase Intent Score for Leads ("Why is this lead hot?")
 */
export function calculateLeadIntentScore(lead: Lead, completedVisitsCount: number = 0): AILeadIntentScore {
  let score = 40; // Base score
  const reasons: string[] = [];

  if (lead.status === 'Hot') {
    score += 25;
    reasons.push('Tagged as Hot lead by sales representative');
  }

  if (lead.budget_max && lead.budget_max > 10000000) {
    score += 15;
    reasons.push('High budget capacity verified (> ₹1 Cr)');
  }

  if (completedVisitsCount >= 1 || lead.stage_id === 'Site visit' || lead.stage_id === 'Follow up') {
    score += 20;
    reasons.push(`Active engagement: ${completedVisitsCount > 0 ? `${completedVisitsCount} site visit(s) conducted` : 'Scheduled site visit'}`);
  }

  if (lead.notes && (lead.notes.toLowerCase().includes('cost sheet') || lead.notes.toLowerCase().includes('quote'))) {
    score += 10;
    reasons.push('Requested smart cost sheet quotation');
  }

  if (lead.notes && lead.notes.toLowerCase().includes('loan') || lead.notes?.toLowerCase().includes('approved')) {
    score += 10;
    reasons.push('Financing pre-approved / proof of funds');
  }

  if (lead.stage_id === 'Negotiation' || lead.stage_id === 'Closure') {
    score += 15;
    reasons.push('Deal in advanced closing negotiation stage');
  }

  const finalScore = Math.min(score, 98);
  const tier = finalScore >= 80 ? 'HIGH INTENT' : finalScore >= 60 ? 'WARM' : 'COLD';
  const badgeColor = finalScore >= 80 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : finalScore >= 60 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200';

  return {
    score: finalScore,
    tier,
    badgeColor,
    reasons: reasons.slice(0, 5)
  };
}

export async function findMatchesForLead(leadId: string) {
  try {
    const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
    if (!lead) return [];
    const { data: properties } = await supabase.from('properties').select('*');
    if (!properties) return [];

    const results = (properties as any[]).map((prop: any) => {
      const { score, reasons } = computeMatchScore(lead as Lead, prop as Property);
      return {
        ...prop,
        match_score: score,
        match_reasons: reasons.filter((r: any) => r.matched).map((r: any) => r.label)
      };
    });

    results.sort((a: any, b: any) => b.match_score - a.match_score);
    return results;
  } catch {
    return [];
  }
}

export async function findMatchesForProperty(propertyId: string) {
  try {
    const { data: property } = await supabase.from('properties').select('*').eq('id', propertyId).single();
    if (!property) return [];
    const { data: leads } = await supabase.from('leads').select('*');
    if (!leads) return [];

    const results = (leads as any[]).map((lead: any) => {
      const { score, reasons } = computeMatchScore(lead as Lead, property as Property);
      return {
        ...lead,
        match_score: score,
        match_reasons: reasons.filter((r: any) => r.matched).map((r: any) => r.label)
      };
    });

    results.sort((a: any, b: any) => b.match_score - a.match_score);
    return results;
  } catch {
    return [];
  }
}
