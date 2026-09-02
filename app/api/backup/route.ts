import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    const format = searchParams.get('format') || 'json';

    // List of core tables to backup
    const tables = [
      'leads',
      'properties',
      'property_images',
      'locations',
      'settings',
      'profiles',
      'site_visits',
      'audit_logs'
    ];

    if (table) {
      if (!tables.includes(table)) {
        return NextResponse.json({ error: 'Invalid table requested' }, { status: 400 });
      }

      const { data, error } = await supabase.from(table).select('*');
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (format === 'csv') {
        const rows = data || [];
        if (rows.length === 0) {
          return new Response('', {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${table}-backup.csv"`
            }
          });
        }

        const headers = Object.keys(rows[0]);
        const csvContent = [
          headers.join(','),
          ...rows.map((row: any) =>
            headers
              .map(field => {
                const val = (row as any)[field];
                if (val === null || val === undefined) return '';
                const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
                return `"${str.replace(/"/g, '""')}"`;
              })
              .join(',')
          )
        ].join('\n');

        return new Response(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${table}-backup-${new Date().toISOString().slice(0, 10)}.csv"`
          }
        });
      }

      return NextResponse.json({
        table,
        count: data?.length || 0,
        exported_at: new Date().toISOString(),
        data
      });
    }

    // Full system backup across all tables
    const backup: Record<string, any> = {
      system: 'RealtyOS ERP',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      counts: {},
      tables: {}
    };

    for (const t of tables) {
      try {
        const { data, error } = await supabase.from(t).select('*');
        if (!error && data) {
          backup.tables[t] = data;
          backup.counts[t] = data.length;
        } else {
          backup.tables[t] = [];
          backup.counts[t] = 0;
        }
      } catch {
        backup.tables[t] = [];
        backup.counts[t] = 0;
      }
    }

    const filename = `luxe-erp-full-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;

    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    console.error('Backup generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate backup' }, { status: 500 });
  }
}
