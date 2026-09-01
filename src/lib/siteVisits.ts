// src/lib/siteVisits.ts – site visit CRUD with populated test data
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from './auth';

export interface SiteVisit {
  id: string;
  lead_id?: string;
  property_id?: string;
  assigned_to?: string;
  visit_date?: string;
  visit_time?: string;
  status?: string;
  outcome?: string;
  client_feedback?: string;
  next_action?: string;
  created_at?: string;
  leads?: { client_name: string } | null;
  properties?: { title: string } | null;
}

export const SEED_VISITS: SiteVisit[] = [
  {
    id: 'visit-001',
    lead_id: 'lead-001',
    property_id: 'prop-001',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5', // Rishi Mahboobani
    visit_date: '2026-09-02',
    visit_time: '11:00 AM',
    status: 'Scheduled',
    outcome: 'Second tour requested with interior designer',
    client_feedback: 'Loved the 12th floor layout. Requested custom floor plan modifications.',
    next_action: 'Prepare Cost Sheet and Token Agreement',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    leads: { client_name: 'Sandesh Kulkarni' },
    properties: { title: 'Luxe Azure Palms - Tower A' }
  },
  {
    id: 'visit-002',
    lead_id: 'lead-002',
    property_id: 'prop-003',
    assigned_to: 'd1b4e702-1400-3427-9652-570c6168a3d6', // Vikram Seth
    visit_date: '2026-08-31',
    visit_time: '04:30 PM',
    status: 'Completed',
    outcome: 'Very positive. Client requested EOI document.',
    client_feedback: '5/5 rating. Impressed with double-height ceiling and private elevator.',
    next_action: 'Send Token Booking terms to family office',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    leads: { client_name: 'Vikramaditya Singhania' },
    properties: { title: 'Solitaire Grand Penthouse' }
  },
  {
    id: 'visit-003',
    lead_id: 'lead-003',
    property_id: 'prop-006',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5',
    visit_date: '2026-08-29',
    visit_time: '02:00 PM',
    status: 'Completed',
    outcome: 'Vastu compliance verified by client consultant.',
    client_feedback: 'Liked living room ventilation. Concerned about delivery timeline.',
    next_action: 'Share RERA possession certificate',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    leads: { client_name: 'Dr. Ananya Deshmukh' },
    properties: { title: 'Balewadi Signature Towers' }
  },
  {
    id: 'visit-004',
    lead_id: 'lead-008',
    property_id: 'prop-007',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5',
    visit_date: '2026-09-03',
    visit_time: '03:00 PM',
    status: 'Confirmed',
    outcome: 'First physical site inspection',
    client_feedback: '',
    next_action: 'Pickup from Pune Airport and arrange site golf cart tour',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    leads: { client_name: 'Siddharth Malhotra' },
    properties: { title: 'Kharadi Riverside Grand' }
  }
];

export async function fetchSiteVisits(profile: Profile | null): Promise<SiteVisit[]> {
  try {
    const { data, error } = await supabase
      .from('site_visits')
      .select('*, leads(client_name), properties(title)');
    if (!error && data && data.length > 0) return data as SiteVisit[];
  } catch {
    // fallback
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('luxe-visits-store');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // use default seed
      }
    }
    localStorage.setItem('luxe-visits-store', JSON.stringify(SEED_VISITS));
  }

  return SEED_VISITS;
}

export async function createSiteVisitAction(formData: FormData) {
  const profile = await getProfile();
  const data: Record<string, unknown> = {
    id: `visit-${Date.now()}`,
    lead_id: formData.get('lead_id'),
    property_id: formData.get('property_id'),
    assigned_to: profile?.id,
    visit_date: formData.get('visit_date'),
    visit_time: formData.get('visit_time'),
    status: 'Scheduled',
    outcome: formData.get('outcome'),
    client_feedback: formData.get('client_feedback'),
    next_action: formData.get('next_action'),
    created_at: new Date().toISOString()
  };

  try {
    const { data: inserted } = await supabase
      .from('site_visits')
      .insert([data])
      .select()
      .single();
    if (inserted) return inserted;
  } catch {
    // fallback local
  }

  if (typeof window !== 'undefined') {
    const current = await fetchSiteVisits(null);
    const updated = [data as any, ...current];
    localStorage.setItem('luxe-visits-store', JSON.stringify(updated));
  }

  return data;
}

async function getProfile(): Promise<Profile | null> {
  return {
    id: 'local-admin-id',
    role: 'SuperAdmin',
    full_name: 'Admin User',
    email: 'admin@luxerealty.com',
  };
}
