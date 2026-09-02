import { NextResponse } from 'next/server';
import { queryD1, upsertD1Record } from '@/lib/db';

export const runtime = 'edge';

// GET /api/onboarding - Fetch registered onboarding profiles from Cloudflare D1
export async function GET(req: Request) {
  try {
    const sql = `SELECT * FROM onboarding_profiles ORDER BY created_at DESC LIMIT 100`;
    const { results, success } = await queryD1(sql);
    return NextResponse.json({ success, records: results || [] });
  } catch (err: any) {
    console.warn('Error querying onboarding_profiles from D1:', err);
    return NextResponse.json({ success: false, error: err.message, records: [] }, { status: 500 });
  }
}

// POST /api/onboarding - Store newly captured consumer onboarding profile into Cloudflare D1
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const { id, full_name, phone, email, city, persona_type, buyer_data, builder_data, broker_data, salesperson_data, created_at } = body;

    if (!full_name || !phone || !email || !persona_type) {
      return NextResponse.json({ error: 'full_name, phone, email, and persona_type are required' }, { status: 400 });
    }

    const recordId = id || `profile-${Date.now()}`;
    const timestamp = created_at || new Date().toISOString();

    const record = {
      id: recordId,
      full_name,
      phone,
      email,
      city: city || 'Pune',
      persona_type,
      metadata: JSON.stringify({
        buyer_data,
        builder_data,
        broker_data,
        salesperson_data
      }),
      created_at: timestamp
    };

    // 1. Store in onboarding_profiles table
    await upsertD1Record('onboarding_profiles', record);

    // 2. Downstream automated data enrichment:
    // If Buyer: Automatically enrich leads table for immediate AI matchmaking
    if (persona_type === 'Buyer' && buyer_data) {
      const budgetMax = buyer_data.budget_range?.includes('8 Cr+') ? 100000000 :
                        buyer_data.budget_range?.includes('4 Cr') ? 60000000 :
                        buyer_data.budget_range?.includes('2 Cr') ? 30000000 : 15000000;
      const budgetMin = Math.round(budgetMax * 0.6);

      const leadRecord = {
        id: `lead-onboard-${Date.now()}`,
        client_name: full_name,
        phone,
        email,
        budget_min: budgetMin,
        budget_max: budgetMax,
        preferred_location: Array.isArray(buyer_data.target_localities) ? buyer_data.target_localities.join(', ') : 'Kalyani Nagar',
        property_type: 'Apartment',
        configuration: Array.isArray(buyer_data.preferred_configurations) ? buyer_data.preferred_configurations.join(', ') : '3 BHK',
        category: 'Residential',
        transaction_type: 'Outright',
        purpose: buyer_data.purchase_purpose === 'Investment' ? 'Investment' : 'Self Use',
        lead_source_id: 'Onboarding Portal',
        status: 'Hot',
        stage_id: 'New inquiry',
        is_active: 1,
        created_at: timestamp
      };
      await upsertD1Record('leads', leadRecord);
    }

    // If Broker: Automatically enrich channel_partners table
    if (persona_type === 'Broker' && broker_data) {
      const partnerRecord = {
        id: `cp-onboard-${Date.now()}`,
        firm_name: broker_data.agency_name || `${full_name} Realty`,
        contact_person: full_name,
        phone,
        email,
        rera_number: broker_data.rera_number || 'A52100009999',
        tier: 'Registered',
        commission_rate: 2.0,
        active_leads: 0,
        site_visits: 0,
        negotiations: 0,
        bookings: 0,
        delivered_revenue: 0,
        accrued_commission: 0,
        paid_commission: 0
      };
      await upsertD1Record('channel_partners', partnerRecord);
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding profile successfully saved to Cloudflare D1 and enriched across CRM modules',
      record
    });
  } catch (err: any) {
    console.error('Error saving onboarding profile to D1:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
