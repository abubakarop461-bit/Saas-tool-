// app/leads/actions.ts – server actions for Leads CRUD with Cloudflare D1 Backend
'use server';
import { upsertD1Record, deleteD1Record, getD1Record, queryD1 } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { Profile } from '@/lib/auth';

async function getProfile(): Promise<Profile | null> {
  return {
    id: 'local-admin-id',
    role: 'SuperAdmin',
    full_name: 'Admin User',
    email: 'admin@luxerealty.com',
  };
}

export async function createLeadAction(prevState: any, formData: FormData) {
  try {
    const profile = await getProfile();
    const phoneRaw = String(formData.get('phone') || '').trim();
    const cleanPhone = phoneRaw.replace(/[^0-9]/g, '').slice(-10);
    const altPhonesRaw = (formData.getAll('alternate_phones') as string[]).map(p => p.trim()).filter(Boolean);
    const cleanAltPhones = altPhonesRaw.map(p => p.replace(/[^0-9]/g, '').slice(-10)).filter(p => p.length >= 7);
    const allSubmittedClean = [cleanPhone, ...cleanAltPhones].filter(p => p.length >= 7);

    // Duplicate detection in Cloudflare D1
    if (allSubmittedClean.length > 0) {
      const { results: existingLeads } = await queryD1('SELECT id, client_name, phone, alternate_phones, assigned_to FROM leads');
      const matched = existingLeads?.find((l: any) => {
        const existingClean = [l.phone, ...(Array.isArray(l.alternate_phones) ? l.alternate_phones : [])]
          .map((p: string) => String(p || '').replace(/[^0-9]/g, '').slice(-10))
          .filter((p: string) => p.length >= 7);
        return existingClean.some((p: string) => allSubmittedClean.includes(p));
      });

      if (matched) {
        return {
          success: false,
          duplicate: true,
          error: `DUPLICATE_LEAD`,
          existingLead: {
            id: matched.id,
            client_name: matched.client_name,
            phone: matched.phone,
            assigneeName: matched.assigned_to || 'Unassigned'
          },
          data: null
        };
      }
    }

    const assignedTo = String(formData.get('assigned_to') || '').trim() || profile?.id || null;
    const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const data: Record<string, any> = {
      id,
      client_name: String(formData.get('client_name') || 'New Lead').trim(),
      phone: phoneRaw,
      alternate_phones: altPhonesRaw,
      email: String(formData.get('email') || '').trim() || null,
      lead_source_id: String(formData.get('lead_source_id') || 'Direct Inbound'),
      budget_min: Number(formData.get('budget_min')) || null,
      budget_max: Number(formData.get('budget_max')) || null,
      preferred_location: String(formData.get('preferred_location') || ''),
      property_type: String(formData.get('property_type') || 'Apartment'),
      configuration: String(formData.get('configuration') || '3 BHK'),
      category: String(formData.get('category') || 'Residential'),
      transaction_type: String(formData.get('transaction_type') || 'Outright'),
      required_area: Number(formData.get('required_area')) || null,
      purpose: String(formData.get('purpose') || 'Self-Use'),
      assigned_to: assignedTo,
      stage_id: String(formData.get('stage_id') || 'New inquiry'),
      next_followup_date: String(formData.get('next_followup_date') || ''),
      status: String(formData.get('status') || 'Hot'),
      notes: String(formData.get('notes') || ''),
      is_active: true,
      created_at: new Date().toISOString()
    };

    await upsertD1Record('leads', data);
    revalidatePath('/leads');
    return { success: true, data };
  } catch (err: any) {
    console.error("Create lead error:", err);
    return { success: false, error: err.message || 'Failed to create lead in database', duplicate: false, existingLead: null, data: null };
  }
}

export async function updateLeadAction(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: "Missing lead ID" };

    const phoneRaw = String(formData.get('phone') || '').trim();
    const altPhonesRaw = (formData.getAll('alternate_phones') as string[]).map(p => p.trim()).filter(Boolean);

    const data: Record<string, any> = {
      id,
      client_name: String(formData.get('client_name') || '').trim(),
      phone: phoneRaw,
      alternate_phones: altPhonesRaw,
      email: String(formData.get('email') || '').trim() || null,
      lead_source_id: String(formData.get('lead_source_id') || ''),
      budget_min: Number(formData.get('budget_min')) || null,
      budget_max: Number(formData.get('budget_max')) || null,
      preferred_location: String(formData.get('preferred_location') || ''),
      property_type: String(formData.get('property_type') || ''),
      configuration: String(formData.get('configuration') || ''),
      category: String(formData.get('category') || 'Residential'),
      transaction_type: String(formData.get('transaction_type') || 'Outright'),
      required_area: Number(formData.get('required_area')) || null,
      purpose: String(formData.get('purpose') || ''),
      assigned_to: String(formData.get('assigned_to') || ''),
      stage_id: String(formData.get('stage_id') || ''),
      status: String(formData.get('status') || 'Hot'),
      next_followup_date: String(formData.get('next_followup_date') || ''),
      notes: String(formData.get('notes') || ''),
      is_active: formData.get('is_active') === 'true',
      updated_at: new Date().toISOString()
    };

    await upsertD1Record('leads', data);
    revalidatePath('/leads');
    return { success: true, data };
  } catch (err: any) {
    console.error("Update lead error:", err);
    return { success: false, error: err.message || 'Failed to update lead in database' };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    if (!id) return { success: false, error: 'Missing ID' };
    await deleteD1Record('leads', id);
    revalidatePath('/leads');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
