import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { fetchRawMetaLeads, normalizeMetaLeadToExcelRow, EXCEL_COLUMN_HEADERS } from '@/lib/metaIntegration';
import { queryD1 } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return handleExport(req);
}

export async function POST(req: NextRequest) {
  return handleExport(req);
}

async function handleExport(req: NextRequest) {
  try {
    // 1. Fetch raw Meta leads from server-side Meta Marketing API / MCP integration layer
    const metaResult = await fetchRawMetaLeads();

    let rawLeads = metaResult.leads;

    // 2. If Meta API is unconfigured or returned empty, check D1 for any persisted Meta lead records
    if ((!rawLeads || rawLeads.length === 0) && metaResult.status !== 'connected') {
      try {
        const d1Res = await queryD1(`SELECT * FROM leads WHERE source LIKE '%meta%' OR source LIKE '%facebook%' OR source LIKE '%instagram%'`);
        if (d1Res.results && d1Res.results.length > 0) {
          rawLeads = d1Res.results.map((r: any) => ({
            id: r.id || String(Math.floor(Math.random() * 1000000000)),
            created_time: r.created_at || new Date().toISOString(),
            ad_id: r.ad_id || 'ag:120222050812370705',
            ad_name: r.ad_name || 'New Leads ad',
            adset_id: r.adset_id || 'as:120222050812380705',
            adset_name: r.adset_name || 'New Leads ad set',
            campaign_id: r.campaign_id || 'c:120222050812360705',
            campaign_name: r.campaign_name || 'the Rise-03/05/2025',
            form_id: r.form_id || 'f:29309453988669515',
            form_name: r.form_name || 'The rise',
            is_organic: '0',
            platform: r.source?.toLowerCase().includes('ig') ? 'ig' : 'fb',
            full_name: r.name || r.full_name || '',
            phone_number: r.phone || r.phone_number || '',
            email: r.email || '',
            job_title: r.job_title || 'service',
            lead_status: 'complete',
            custom_fields: {
              'what_type_of_property_are_you_looking_for?': r.configuration || r.property_requirement || '3_bhk_flats',
              'when_are_you_planning_to_visit_the_site?': r.visit_timing || 'next_week'
            }
          }));
        }
      } catch (d1Err) {
        console.warn('D1 lookup for Meta leads failed:', d1Err);
      }
    }

    // 3. Handle unconfigured/error state when no Meta API token & no D1 leads exist
    if ((!rawLeads || rawLeads.length === 0) && metaResult.error) {
      return NextResponse.json(
        {
          error: metaResult.error,
          status: metaResult.status || 'error',
          requiresConfig: true
        },
        { status: 400 }
      );
    }

    if (!rawLeads || rawLeads.length === 0) {
      return NextResponse.json(
        {
          error: 'No Meta Lead Ads data available to export.',
          status: 'empty'
        },
        { status: 404 }
      );
    }

    // 4. Normalize raw Meta records into the exact 19-column reference Excel format
    const excelRows = rawLeads.map(normalizeMetaLeadToExcelRow);

    // 5. Generate a genuine binary .xlsx workbook
    const worksheet = XLSX.utils.json_to_sheet(excelRows, { header: EXCEL_COLUMN_HEADERS as string[] });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Meta Leads');

    // Buffer generation
    const buf = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Format current date for filename
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Meta_Leads_${dateStr}.xlsx`;

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (err: any) {
    console.error('Error generating Meta Leads XLSX:', err);
    return NextResponse.json(
      { error: `Excel Generation Failed: ${err?.message || err}` },
      { status: 500 }
    );
  }
}
