// src/lib/attributionEngine.ts - Deep Pure Domain Module for Real Estate Marketing & Ad Attribution
import type { Lead, Property } from '@/lib/queries';
import type { DealTransaction } from '@/lib/transactions';

export interface SiteVisitRecord {
  id: string;
  lead_id?: string;
  property_id?: string;
  status?: string;
}

export interface SourceMetrics {
  source: string;
  category: 'Paid Digital' | 'Paid Social' | 'Search / PPC' | 'Portals' | 'Channel Partners' | 'Organic / Direct' | 'Other';
  spend: number;
  leadsCount: number;
  qualifiedCount: number;
  visitsCount: number;
  dealsCount: number;
  revenue: number;
  cpl: number | null;
  cac: number | null;
  roas: number | null;
  roi: number | null;
}

export interface ComputedAttributionResult {
  rows: SourceMetrics[];
  filteredLeads: Lead[];
  filteredVisits: SiteVisitRecord[];
  filteredTransactions: DealTransaction[];
  totalUnattributedRevenue: number;
  totalUnattributedDeals: number;
}

export function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^(dr\.|mr\.|mrs\.|ms\.|prof\.)\s+/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

export function categorizeSource(source: string): SourceMetrics['category'] {
  const s = source.toLowerCase();
  if (s.includes('instagram') || s.includes('google') || s.includes('facebook') || s.includes('meta') || s.includes('ad') || s.includes('campaign')) {
    return 'Paid Digital';
  }
  if (s.includes('99acres') || s.includes('housing') || s.includes('magicbricks') || s.includes('portal')) {
    return 'Portals';
  }
  if (s.includes('channel partner') || s.includes('broker') || s.includes('cp') || s.includes('realty') || s.includes('knight frank')) {
    return 'Channel Partners';
  }
  if (s.includes('referral') || s.includes('walk-in') || s.includes('direct') || s.includes('vip') || s.includes('organic')) {
    return 'Organic / Direct';
  }
  return 'Other';
}

/**
 * Match a lead against a target property using visits, keywords, and location filters
 */
export function leadMatchesProperty(
  lead: Lead,
  targetProperty: Property | null,
  siteVisits: SiteVisitRecord[] = []
): boolean {
  if (!targetProperty) return true;

  // 1. Explicit SiteVisit match
  const hasDirectVisit = siteVisits.some(sv => sv.lead_id === lead.id && sv.property_id === targetProperty.id);
  if (hasDirectVisit) return true;

  // 2. Notes match on property title or property code keywords
  const notesLower = (lead.notes || '').toLowerCase();
  const titleLower = targetProperty.title.toLowerCase();
  const codeLower = (targetProperty.property_code || '').toLowerCase();
  
  const titleKeywords = titleLower
    .split(' ')
    .filter(w => w.length > 3 && !['tower', 'towers', 'grand', 'residences', 'west', 'wing', 'skyline', 'duplex'].includes(w));
  const matchesKeywords = titleKeywords.length > 0 && titleKeywords.every(kw => notesLower.includes(kw));

  if (notesLower.includes(titleLower) || (codeLower && notesLower.includes(codeLower)) || matchesKeywords) {
    return true;
  }

  // 3. Location & Property Type / Configuration match
  const locMatches = Boolean(lead.preferred_location && lead.preferred_location.toLowerCase() === targetProperty.location.toLowerCase());
  const typeMatches = Boolean(lead.property_type && lead.property_type.toLowerCase() === targetProperty.property_type.toLowerCase());
  const configMatches = Boolean(lead.configuration && lead.configuration.toLowerCase() === targetProperty.configuration.toLowerCase());

  return Boolean(locMatches && (typeMatches || configMatches));
}

/**
 * Match a deal transaction to a property
 */
export function transactionMatchesProperty(
  tx: DealTransaction,
  targetProperty: Property | null,
  filteredLeads: Lead[] = []
): boolean {
  if (!targetProperty) return true;
  const txTitleLower = (tx.property_title || '').toLowerCase();
  const targetTitleLower = targetProperty.title.toLowerCase();
  
  const titleKeywords = targetTitleLower
    .split(' ')
    .filter(w => w.length > 3 && !['tower', 'towers', 'grand', 'residences', 'west', 'wing', 'skyline', 'duplex'].includes(w));
  const matchesKeywords = titleKeywords.length > 0 && titleKeywords.every(kw => txTitleLower.includes(kw));

  if (txTitleLower.includes(targetTitleLower) || matchesKeywords) return true;

  const normClient = normalizeName(tx.client_name);
  return filteredLeads.some(l => normalizeName(l.client_name) === normClient);
}

/**
 * Compute comprehensive ad attribution, funnel conversion, and ROI metrics
 */
export function computeAdPerformanceMetrics(
  leads: Lead[],
  properties: Property[],
  siteVisits: SiteVisitRecord[],
  transactions: DealTransaction[],
  adSpendMap: Record<string, number>,
  selectedPropertyId: string = 'All'
): ComputedAttributionResult {
  const targetProperty = selectedPropertyId === 'All'
    ? null
    : properties.find(p => p.id === selectedPropertyId) || null;

  // 1. Filter leads by target property
  const filteredLeads = selectedPropertyId === 'All'
    ? leads
    : leads.filter(l => leadMatchesProperty(l, targetProperty, siteVisits));

  const filteredLeadIds = new Set(filteredLeads.map(l => l.id));

  // 2. Filter visits by target property
  const filteredVisits = selectedPropertyId === 'All'
    ? siteVisits
    : siteVisits.filter(sv => 
        sv.property_id === selectedPropertyId || (sv.lead_id && filteredLeadIds.has(sv.lead_id))
      );

  // 3. Filter transactions
  const filteredTransactions = selectedPropertyId === 'All'
    ? transactions
    : transactions.filter(tx => transactionMatchesProperty(tx, targetProperty, filteredLeads));

  // 4. Detect unique sources
  const sourceSet = new Set<string>();
  filteredLeads.forEach(l => {
    if (l.lead_source_id && l.lead_source_id.trim()) {
      sourceSet.add(l.lead_source_id.trim());
    }
  });

  if (selectedPropertyId === 'All') {
    Object.keys(adSpendMap).forEach(s => sourceSet.add(s));
  }

  const sourceList = Array.from(sourceSet);

  // Map lead ID -> Lead object
  const leadMap = new Map<string, Lead>();
  filteredLeads.forEach(l => leadMap.set(l.id, l));

  // Group visits by source
  const visitCountBySource: Record<string, number> = {};
  filteredVisits.forEach(sv => {
    if (sv.lead_id) {
      const lead = leadMap.get(sv.lead_id) || leads.find(l => l.id === sv.lead_id);
      if (lead && lead.lead_source_id) {
        const src = lead.lead_source_id.trim();
        if (selectedPropertyId === 'All' || sourceSet.has(src)) {
          visitCountBySource[src] = (visitCountBySource[src] || 0) + 1;
        }
      }
    }
  });

  // Match closed transactions to source
  const txBySource: Record<string, { count: number; revenue: number }> = {};
  let totalUnattributedRevenue = 0;
  let totalUnattributedDeals = 0;

  const completedTxs = filteredTransactions.filter(t => 
    t.booking_status === 'Completed' || 
    ['Possession', 'Booking', 'Agreement'].includes(t.current_stage)
  );

  completedTxs.forEach(tx => {
    const normTxClient = normalizeName(tx.client_name);
    const matchedLeads = filteredLeads.filter(l => normalizeName(l.client_name) === normTxClient);

    if (matchedLeads.length === 1 && matchedLeads[0].lead_source_id) {
      const src = matchedLeads[0].lead_source_id.trim();
      if (!txBySource[src]) txBySource[src] = { count: 0, revenue: 0 };
      txBySource[src].count += 1;
      txBySource[src].revenue += Number(tx.deal_value) || 0;
    } else {
      totalUnattributedDeals += 1;
      totalUnattributedRevenue += Number(tx.deal_value) || 0;
    }
  });

  // Calculate metrics per source
  const rows: SourceMetrics[] = sourceList.map(source => {
    const category = categorizeSource(source);

    let spend = adSpendMap[source] ?? 0;
    if (selectedPropertyId !== 'All') {
      const totalLeadsForSource = leads.filter(l => l.lead_source_id === source).length;
      const propertyLeadsForSource = filteredLeads.filter(l => l.lead_source_id === source).length;
      if (totalLeadsForSource > 0) {
        spend = (spend * propertyLeadsForSource) / totalLeadsForSource;
      } else if (propertyLeadsForSource === 0) {
        spend = 0;
      }
    }

    const sourceLeads = filteredLeads.filter(l => l.lead_source_id === source);
    const leadsCount = sourceLeads.length;

    const qualifiedCount = sourceLeads.filter(l => 
      l.status === 'Hot' || (l.stage_id && l.stage_id !== 'New inquiry')
    ).length;

    const visitsCount = visitCountBySource[source] || 0;
    const txData = txBySource[source] || { count: 0, revenue: 0 };
    const dealsCount = txData.count;
    const revenue = txData.revenue;

    const cpl = leadsCount > 0 ? spend / leadsCount : null;
    const cac = dealsCount > 0 ? spend / dealsCount : null;
    const roas = spend > 0 ? revenue / spend : null;
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : null;

    return {
      source,
      category,
      spend,
      leadsCount,
      qualifiedCount,
      visitsCount,
      dealsCount,
      revenue,
      cpl,
      cac,
      roas,
      roi
    };
  });

  return {
    rows,
    filteredLeads,
    filteredVisits,
    filteredTransactions,
    totalUnattributedRevenue,
    totalUnattributedDeals
  };
}
