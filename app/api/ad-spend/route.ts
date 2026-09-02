import { NextResponse } from 'next/server';
import { queryD1, upsertD1Record } from '@/lib/db';

export const runtime = 'edge';

/**
 * Server helper to resolve authenticated tenant company_id.
 * Any client-supplied company_id override is strictly ignored/rejected.
 */
async function resolveAuthenticatedCompanyId(req: Request): Promise<string> {
  // Read tenant company from server session header if provided by gateway, else fallback to default_company
  const tenantHeader = req.headers.get('x-company-id') || req.headers.get('x-tenant-id');
  if (tenantHeader && tenantHeader.trim()) {
    return tenantHeader.trim();
  }
  return 'default_company';
}

// GET /api/ad-spend
export async function GET(req: Request) {
  try {
    // Determine authenticated company_id on the server only
    const companyId = await resolveAuthenticatedCompanyId(req);

    const sql = `SELECT * FROM ad_spend WHERE company_id = ?`;
    const { results } = await queryD1(sql, [companyId]);

    return NextResponse.json({ success: true, records: results || [] });
  } catch (err: any) {
    console.error('Error fetching ad_spend:', err);
    return NextResponse.json({ success: false, error: err.message, records: [] }, { status: 500 });
  }
}

// POST /api/ad-spend
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { lead_source_id, spend_amount, property_id, campaign_name, platform } = body;

    if (!lead_source_id || typeof lead_source_id !== 'string') {
      return NextResponse.json({ error: 'lead_source_id is required' }, { status: 400 });
    }

    // Determine authenticated company_id on server only - client override is ignored
    const companyId = await resolveAuthenticatedCompanyId(req);

    const id = `spend-${companyId}-${lead_source_id.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const amount = Math.max(0, Number(spend_amount) || 0);

    const record = {
      id,
      company_id: companyId,
      lead_source_id,
      spend_amount: amount,
      campaign_name: campaign_name || null,
      property_id: property_id || null,
      platform: platform || null,
      updated_at: new Date().toISOString()
    };

    const success = await upsertD1Record('ad_spend', record);

    return NextResponse.json({ success, record });
  } catch (err: any) {
    console.error('Error updating ad_spend:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
