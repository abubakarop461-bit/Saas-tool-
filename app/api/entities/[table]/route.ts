import { NextResponse } from 'next/server';
import { queryD1, upsertD1Record } from '@/lib/db';

export const runtime = 'edge';

const ALLOWED_TABLES = new Set([
  'leads',
  'properties',
  'inventory',
  'transactions',
  'channel_partners',
  'commissions',
  'site_visits',
  'ad_spend',
  'onboarding_profiles',
  'users',
  'settings'
]);

type RouteContext = {
  params: Promise<{ table: string }> | { table: string };
};

// GET /api/entities/[table]
export async function GET(req: Request, context: RouteContext) {
  try {
    const rawParams = await context.params;
    const table = rawParams.table?.toLowerCase().trim();

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ success: false, error: `Invalid entity table: ${table}`, records: [] }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const sql = `SELECT * FROM ${table} WHERE id = ? LIMIT 1`;
      const { results, success } = await queryD1(sql, [id]);
      return NextResponse.json({ success, record: results?.[0] || null });
    }

    const sql = `SELECT * FROM ${table}`;
    const { results, success } = await queryD1(sql);

    return NextResponse.json({
      success,
      table,
      count: results?.length || 0,
      records: results || []
    });
  } catch (err: any) {
    console.error('Error in GET /api/entities/[table]:', err);
    return NextResponse.json({ success: false, error: err.message, records: [] }, { status: 500 });
  }
}

// POST /api/entities/[table]
export async function POST(req: Request, context: RouteContext) {
  try {
    const rawParams = await context.params;
    const table = rawParams.table?.toLowerCase().trim();

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ success: false, error: `Invalid entity table: ${table}` }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, any>;
    const recordsToSave: any[] = Array.isArray(body.records) 
      ? body.records 
      : body.record 
        ? [body.record] 
        : Object.keys(body).length > 0 ? [body] : [];

    if (recordsToSave.length === 0) {
      return NextResponse.json({ success: false, error: 'No records provided to save' }, { status: 400 });
    }

    let savedCount = 0;
    for (const rec of recordsToSave) {
      if (!rec.id) {
        rec.id = `${table}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      }
      const ok = await upsertD1Record(table, rec);
      if (ok) savedCount++;
    }

    return NextResponse.json({
      success: true,
      table,
      saved_count: savedCount,
      total_requested: recordsToSave.length
    });
  } catch (err: any) {
    console.error('Error in POST /api/entities/[table]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE /api/entities/[table]
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const rawParams = await context.params;
    const table = rawParams.table?.toLowerCase().trim();

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ success: false, error: `Invalid entity table: ${table}` }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = (await req.json().catch(() => ({}))) as Record<string, any>;
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Record ID is required for deletion' }, { status: 400 });
    }

    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const { success } = await queryD1(sql, [id]);

    return NextResponse.json({ success, deleted_id: id });
  } catch (err: any) {
    console.error('Error in DELETE /api/entities/[table]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
