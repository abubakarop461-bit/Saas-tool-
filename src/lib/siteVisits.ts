// src/lib/siteVisits.ts – site visit CRUD
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

import { getPermissions } from './permissions';

export async function fetchSiteVisits(profile: Profile | null): Promise<SiteVisit[]> {
  try {
    const { data, error } = await supabase.from('site_visits').select('*, leads(client_name), properties(title)');
    if (error || !data) return [];
    return data as SiteVisit[];
  } catch {
    return [];
  }
}

export async function createSiteVisitAction(formData: FormData) {
  const profile = await getProfile();
  const data: Record<string, unknown> = {
    lead_id: formData.get('lead_id'),
    property_id: formData.get('property_id'),
    assigned_to: profile?.id,
    visit_date: formData.get('visit_date'),
    visit_time: formData.get('visit_time'),
    status: 'Scheduled',
    outcome: formData.get('outcome'),
    client_feedback: formData.get('client_feedback'),
    next_action: formData.get('next_action')
  };

  try {
    const { data: inserted } = await supabase
      .from('site_visits')
      .insert([data])
      .select()
      .single();
    return inserted || { id: 'local-visit-id', ...data };
  } catch {
    return { id: 'local-visit-id', ...data };
  }
}

async function getProfile(): Promise<Profile | null> {
  return {
    id: 'local-admin-id',
    role: 'SuperAdmin',
    full_name: 'Admin User',
    email: 'admin@luxerealty.com',
  };
}
