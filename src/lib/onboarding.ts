// src/lib/onboarding.ts - 2-Step Adaptive Onboarding Gateway Data Layer with Cloudflare D1 Sync

export type PersonaType = 'Buyer' | 'Builder' | 'Broker' | 'Salesperson';

export interface BaseOnboardingProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  persona_type: PersonaType;
  created_at: string;
  d1_synced?: boolean;
}

export interface BuyerProfileData {
  budget_range: string;
  preferred_configurations: string[];
  target_localities: string[];
  purchase_purpose: 'Self-Use' | 'Investment';
  buying_timeline: string;
  funding_status: string;
}

export interface BuilderProfileData {
  company_name: string;
  active_projects: string;
  total_inventory_units: string;
  key_project_localities: string;
  primary_sales_channel: string;
  current_crm_tool: string;
}

export interface BrokerProfileData {
  agency_name: string;
  rera_number: string;
  core_localities: string[];
  monthly_client_visits: string;
  average_ticket_size: string;
}

export interface SalespersonProfileData {
  current_organization: string;
  designation: string;
  active_leads_managed: string;
  top_closing_obstacle: string[];
}

export type FullOnboardingData = BaseOnboardingProfile & {
  buyer_data?: BuyerProfileData;
  builder_data?: BuilderProfileData;
  broker_data?: BrokerProfileData;
  salesperson_data?: SalespersonProfileData;
};

const STORAGE_KEY = 'luxe_onboarding_profile';
const COMPLETED_KEY = 'luxe_onboarding_completed';

/**
 * Check if the onboarding has already been completed on this browser/session
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(COMPLETED_KEY) === 'true';
}

/**
 * Get current stored onboarding profile
 */
export function getStoredOnboardingProfile(): FullOnboardingData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save onboarding profile to Cloudflare D1 via /api/onboarding and persist locally
 */
export async function saveOnboardingProfile(
  profile: Omit<FullOnboardingData, 'id' | 'created_at'>
): Promise<{ success: boolean; id: string; d1_synced: boolean }> {
  const id = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const created_at = new Date().toISOString();
  const fullRecord: FullOnboardingData = {
    ...profile,
    id,
    created_at,
    d1_synced: false
  };

  // 1. Persist locally first for zero-latency client state
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullRecord));
    localStorage.setItem(COMPLETED_KEY, 'true');
  }

  // 2. Post to Cloudflare D1 server edge endpoint
  let d1_synced = false;
  try {
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullRecord)
    });

    if (res.ok) {
      const data = (await res.json()) as { success?: boolean };
      if (data.success) {
        d1_synced = true;
        fullRecord.d1_synced = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fullRecord));
        }
      }
    }
  } catch (err) {
    console.warn('D1 Edge sync deferred, stored locally:', err);
  }

  return { success: true, id, d1_synced };
}

/**
 * Reset onboarding state for testing / re-entry
 */
export function resetOnboardingState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(COMPLETED_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }
}
