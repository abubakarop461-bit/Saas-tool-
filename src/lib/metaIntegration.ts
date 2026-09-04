/**
 * Meta Integration Service & Normalizer Layer
 * 
 * Provides:
 * 1. Interface for normalized Meta Lead record mapping.
 * 2. Meta Marketing API / MCP lead fetcher with server-side security.
 * 3. Exact 19-column mapping layer matching the reference Excel schema:
 *    C:\Users\HP\OneDrive\Documents\New Leads ad_Leads_2025-05-03_2026-09-02 (1).csv.xlsx
 */

export interface MetaLeadRawField {
  name: string;
  values: string[];
}

export interface MetaLeadRawResponse {
  id: string;
  created_time: string;
  ad_id?: string;
  ad_name?: string;
  adset_id?: string;
  adset_name?: string;
  campaign_id?: string;
  campaign_name?: string;
  form_id?: string;
  form_name?: string;
  is_organic?: string | boolean | number;
  platform?: string;
  field_data?: MetaLeadRawField[];
  custom_fields?: Record<string, string>;
  full_name?: string;
  phone_number?: string;
  email?: string;
  job_title?: string;
  lead_status?: string;
}

/**
 * Exact 19-column Record matching reference Excel schema
 */
export interface ExcelLeadRow {
  'id': string;
  'created_time': string;
  'ad_id': string;
  'ad_name': string;
  'adset_id': string;
  'adset_name': string;
  'campaign_id': string;
  'campaign_name': string;
  'form_id': string;
  'form_name': string;
  'is_organic': string;
  'platform': string;
  'what_type_of_property_are_you_looking_for?': string;
  'when_are_you_planning_to_visit_the_site?': string;
  'full_name': string;
  'phone_number': string;
  'email': string;
  'job_title': string;
  'lead_status': string;
}

export const EXCEL_COLUMN_HEADERS: (keyof ExcelLeadRow)[] = [
  'id',
  'created_time',
  'ad_id',
  'ad_name',
  'adset_id',
  'adset_name',
  'campaign_id',
  'campaign_name',
  'form_id',
  'form_name',
  'is_organic',
  'platform',
  'what_type_of_property_are_you_looking_for?',
  'when_are_you_planning_to_visit_the_site?',
  'full_name',
  'phone_number',
  'email',
  'job_title',
  'lead_status'
];

/**
 * Normalizes raw Meta API / D1 lead response into the exact 19-column reference Excel format.
 */
export function normalizeMetaLeadToExcelRow(lead: MetaLeadRawResponse): ExcelLeadRow {
  // Extract custom question responses from field_data array or custom_fields map
  const fieldsMap: Record<string, string> = {};

  if (lead.field_data && Array.isArray(lead.field_data)) {
    for (const field of lead.field_data) {
      const key = (field.name || '').toLowerCase().trim();
      const val = field.values && field.values.length > 0 ? field.values[0] : '';
      fieldsMap[key] = val;
    }
  }

  if (lead.custom_fields) {
    for (const [k, v] of Object.entries(lead.custom_fields)) {
      fieldsMap[k.toLowerCase().trim()] = v;
    }
  }

  // Extract answers for specific custom questions in reference schema
  const propertyReq = 
    fieldsMap['what_type_of_property_are_you_looking_for?'] ||
    fieldsMap['what type of property are you looking for?'] ||
    fieldsMap['property_requirement'] ||
    fieldsMap['requirement'] ||
    '';

  const visitTiming = 
    fieldsMap['when_are_you_planning_to_visit_the_site?'] ||
    fieldsMap['when are you planning to visit the site?'] ||
    fieldsMap['visit_timing'] ||
    fieldsMap['visit_time'] ||
    '';

  const fullName = 
    fieldsMap['full_name'] ||
    fieldsMap['full name'] ||
    lead.full_name ||
    '';

  const rawPhone = 
    fieldsMap['phone_number'] ||
    fieldsMap['phone number'] ||
    fieldsMap['phone'] ||
    lead.phone_number ||
    '';

  const phone = rawPhone ? (rawPhone.startsWith('p:') ? rawPhone : `p:${rawPhone}`) : '';

  const email = 
    fieldsMap['email'] ||
    lead.email ||
    '';

  const jobTitle = 
    fieldsMap['job_title'] ||
    fieldsMap['job title'] ||
    lead.job_title ||
    '';

  return {
    'id': lead.id ? (lead.id.startsWith('l:') ? lead.id : `l:${lead.id}`) : '',
    'created_time': lead.created_time || new Date().toISOString(),
    'ad_id': lead.ad_id ? (lead.ad_id.startsWith('ag:') ? lead.ad_id : `ag:${lead.ad_id}`) : '',
    'ad_name': lead.ad_name || '',
    'adset_id': lead.adset_id ? (lead.adset_id.startsWith('as:') ? lead.adset_id : `as:${lead.adset_id}`) : '',
    'adset_name': lead.adset_name || '',
    'campaign_id': lead.campaign_id ? (lead.campaign_id.startsWith('c:') ? lead.campaign_id : `c:${lead.campaign_id}`) : '',
    'campaign_name': lead.campaign_name || '',
    'form_id': lead.form_id ? (lead.form_id.startsWith('f:') ? lead.form_id : `f:${lead.form_id}`) : '',
    'form_name': lead.form_name || '',
    'is_organic': lead.is_organic !== undefined ? String(lead.is_organic) : '0',
    'platform': lead.platform || 'fb',
    'what_type_of_property_are_you_looking_for?': propertyReq,
    'when_are_you_planning_to_visit_the_site?': visitTiming,
    'full_name': fullName,
    'phone_number': phone,
    'email': email,
    'job_title': jobTitle,
    'lead_status': lead.lead_status || 'complete'
  };
}

/**
 * Backend Meta Integration Service
 * Securely calls Meta Marketing API or fetches D1 persisted Meta leads when credentials exist.
 */
export async function fetchRawMetaLeads(
  accessToken?: string,
  adAccountId?: string
): Promise<{ leads: MetaLeadRawResponse[]; error?: string; status?: 'connected' | 'unconfigured' | 'expired' | 'empty' }> {
  // Read server-side secret tokens (never exposed to browser)
  const token = accessToken || process.env.META_USER_ACCESS_TOKEN || process.env.META_PAGE_ACCESS_TOKEN;
  const actId = adAccountId || process.env.META_AD_ACCOUNT_ID;

  if (!token || !actId) {
    return {
      leads: [],
      status: 'unconfigured',
      error: 'Meta Marketing API access token or Ad Account ID is not configured in server environment (META_USER_ACCESS_TOKEN / META_AD_ACCOUNT_ID).'
    };
  }

  try {
    const url = `https://graph.facebook.com/v20.0/${actId}/leads?fields=id,created_time,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,form_id,form_name,is_organic,platform,field_data&access_token=${encodeURIComponent(token)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || 'Meta Marketing API authorization failed or expired.';
      return {
        leads: [],
        status: 'expired',
        error: `Meta Connection Error: ${errMsg}`
      };
    }

    const rawLeads: MetaLeadRawResponse[] = data.data || [];
    if (rawLeads.length === 0) {
      return {
        leads: [],
        status: 'empty',
        error: 'No Meta Lead Ads data found for the connected account.'
      };
    }

    return {
      leads: rawLeads,
      status: 'connected'
    };
  } catch (err: any) {
    return {
      leads: [],
      status: 'expired',
      error: `Failed to connect to Meta API: ${err?.message || err}`
    };
  }
}
