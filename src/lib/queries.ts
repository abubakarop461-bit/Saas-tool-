// src/lib/queries.ts
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from './auth';

export interface Lead {
  id: string;
  client_name: string;
  phone: string;
  alternate_phones?: string[];
  email: string;
  lead_source_id: string;
  budget_min: number;
  budget_max: number;
  preferred_location: string;
  property_type: string;
  configuration: string;
  category: string; // 'Commercial' | 'Residential'
  transaction_type: string; // 'Rent' | 'Outright'
  required_area?: number;
  purpose?: string;
  assigned_to?: string;
  stage_id?: string;
  next_followup_date?: string;
  status?: string;
  is_active?: boolean;
  notes?: string;
  created_at?: string;
}

import { getPermissions } from './permissions';

export async function fetchLeads(profile: Profile | null): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return data as Lead[];
  } catch {
    return [];
  }
}

export interface Property {
  id: string;
  title: string;
  property_code: string;
  location: string;
  address: string;
  property_type: string;
  configuration: string;
  carpet_area?: number;
  built_up_area?: number;
  price?: number;
  status_id?: string;
  listing_type: string;
  source_type?: string;
  owner_name?: string;
  owner_contact?: string;
  alternate_owner_contacts?: string[];
  unit_no?: string;
  brokerage?: string;
  description?: string;
  internal_notes?: string;
  is_active?: boolean;
  created_at?: string;
}

export async function fetchProperties(profile: Profile | null): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error || !data) return [];
    return data as Property[];
  } catch {
    return [];
  }
}

export async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) return null;
    return data as Property;
  } catch {
    return null;
  }
}

export async function fetchSetting(id: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', id)
      .single();
    if (error || !data) return '';
    return data.value;
  } catch {
    return '';
  }
}

export async function updateSetting(id: string, value: string) {
  try {
    await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch {
    // disconnected mode
  }
}
