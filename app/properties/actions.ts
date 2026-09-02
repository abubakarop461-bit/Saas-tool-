// app/properties/actions.ts – server actions for Property CRUD
'use server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Profile } from '@/lib/auth';

async function createSupabaseServerClient(): Promise<any> {
  const stub: any = {
    from: () => stub,
    select: () => stub,
    insert: () => stub,
    update: () => stub,
    delete: () => stub,
    eq: () => stub,
    single: async () => ({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  };
  return stub;
}

async function getProfile(_supabase?: any): Promise<Profile | null> {
  return {
    id: 'local-admin-id',
    role: 'SuperAdmin',
    full_name: 'Admin User',
    email: 'admin@luxerealty.com',
  };
}

export async function createPropertyAction(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const profile = await getProfile(supabase);
  const data: Record<string, unknown> = {
    title: formData.get('title'),
    // property_code has a unique constraint; submitting '' (rather than null) collides
    // with any other property that was also left blank, since Postgres only treats NULLs
    // as distinct from each other -- empty strings are a real, comparable value.
    property_code: String(formData.get('property_code') || '').trim() || null,
    location: formData.get('location'),
    address: formData.get('address'),
    property_type: formData.get('property_type'),
    configuration: formData.get('configuration'),
    carpet_area: formData.get('carpet_area') || null,
    built_up_area: formData.get('built_up_area') || null,
    price: formData.get('price') || null,
    status_id: formData.get('status_id') || 'Available',
    listing_type: formData.get('listing_type'),
    source_type: formData.get('source_type') || 'Direct',
    owner_name: formData.get('owner_name'),
    owner_contact: formData.get('owner_contact'),
    alternate_owner_contacts: (formData.getAll('alternate_owner_contacts') as string[]).map(p => p.trim()).filter(Boolean),
    unit_no: formData.get('unit_no'),
    brokerage: formData.get('brokerage'),
    description: formData.get('description'),
    internal_notes: formData.get('internal_notes'),
    is_active: true,
    created_at: new Date().toISOString()
  };

  const { data: inserted, error } = await supabase
    .from('properties')
    .insert([data])
    .select()
    .single();

  if (error) {
    console.error("Insert property error:", error);
    return { error: error.message };
  }

  // Insert property images
  const imageUrls = formData.getAll('image_urls') as string[];
  if (imageUrls.length > 0) {
    const imgData = imageUrls.map((url, idx) => ({
      property_id: inserted.id,
      url,
      sort_order: idx,
      created_at: new Date().toISOString()
    }));
    const { error: imgError } = await supabase.from('property_images').insert(imgData);
    if (imgError) console.error("Error inserting property images:", imgError);
  }

  // Auto-generate / sync developer units for unit inventory matrix
  try {
    const towersRaw = String(formData.get('towers_list') || 'Tower A, Tower B');
    const towers = towersRaw.split(',').map(t => t.trim()).filter(Boolean);
    const totalFloors = Math.max(1, Number(formData.get('total_floors')) || 14);
    const unitsPerFloor = Math.max(1, Number(formData.get('units_per_floor')) || 4);
    const possessionDate = String(formData.get('possession_date') || 'December 2026');

    const { syncPropertyInventoryUnits } = await import('@/lib/inventory');
    await syncPropertyInventoryUnits({
      property_id: inserted?.id || 'prop-' + Date.now(),
      project_title: String(data.title || 'Landmark Project'),
      towers: towers.length > 0 ? towers : ['Tower A'],
      total_floors: totalFloors,
      units_per_floor: unitsPerFloor,
      configuration: String(data.configuration || '3 BHK'),
      carpet_area: Number(data.carpet_area) || 1450,
      built_up_area: Number(data.built_up_area) || 1900,
      base_price: Number(data.price) || 13500000,
      possession_date: possessionDate
    });
  } catch (err) {
    console.error("Error generating inventory units for property:", err);
  }

  await supabase
    .from('audit_logs')
    .insert({ user_id: profile?.id, event: 'Property created', changes: data });

  return { success: true, data: inserted };
}


export async function updatePropertyAction(prevState: any, formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const id = formData.get('id') as string;
  if (!id) return { error: "Missing property ID" };

  const profile = await getProfile(supabase);
  // PropertyForm has no status_id field — status is changed via the inline
  // dropdown/detail page instead. Only touch status_id if it was actually submitted,
  // otherwise this would silently wipe the existing status back to null on every edit.
  const statusId = formData.get('status_id') as string | null;

  const data: Record<string, unknown> = {
    title: formData.get('title'),
    // property_code has a unique constraint; submitting '' (rather than null) collides
    // with any other property that was also left blank, since Postgres only treats NULLs
    // as distinct from each other -- empty strings are a real, comparable value.
    property_code: String(formData.get('property_code') || '').trim() || null,
    location: formData.get('location'),
    address: formData.get('address'),
    property_type: formData.get('property_type'),
    configuration: formData.get('configuration'),
    carpet_area: formData.get('carpet_area') || null,
    built_up_area: formData.get('built_up_area') || null,
    price: formData.get('price') || null,
    listing_type: formData.get('listing_type'),
    source_type: formData.get('source_type') || 'Direct',
    owner_name: formData.get('owner_name'),
    owner_contact: formData.get('owner_contact'),
    alternate_owner_contacts: (formData.getAll('alternate_owner_contacts') as string[]).map(p => p.trim()).filter(Boolean),
    unit_no: formData.get('unit_no'),
    brokerage: formData.get('brokerage'),
    description: formData.get('description'),
    internal_notes: formData.get('internal_notes'),
    ...(statusId ? { status_id: statusId, ...(statusId === 'Sold' ? { is_active: false } : {}) } : {})
  };

  const { data: updated, error } = await supabase
    .from('properties')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Update property error:", error);
    return { error: error.message };
  }

  // Update property images: delete old ones and insert new ones
  const imageUrls = formData.getAll('image_urls') as string[];
  const { error: delError } = await supabase.from('property_images').delete().eq('property_id', id);
  if (delError) console.error("Error deleting old property images:", delError);
  
  if (imageUrls.length > 0) {
    const imgData = imageUrls.map((url, idx) => ({
      property_id: id,
      url,
      sort_order: idx,
      created_at: new Date().toISOString()
    }));
    const { error: imgError } = await supabase.from('property_images').insert(imgData);
    if (imgError) console.error("Error updating property images:", imgError);
  }

  // Auto-generate / sync developer units for unit inventory matrix
  try {
    const towersRaw = String(formData.get('towers_list') || '');
    if (towersRaw) {
      const towers = towersRaw.split(',').map(t => t.trim()).filter(Boolean);
      const totalFloors = Math.max(1, Number(formData.get('total_floors')) || 14);
      const unitsPerFloor = Math.max(1, Number(formData.get('units_per_floor')) || 4);
      const possessionDate = String(formData.get('possession_date') || 'December 2026');

      const { syncPropertyInventoryUnits } = await import('@/lib/inventory');
      await syncPropertyInventoryUnits({
        property_id: id,
        project_title: String(data.title || 'Landmark Project'),
        towers: towers.length > 0 ? towers : ['Tower A'],
        total_floors: totalFloors,
        units_per_floor: unitsPerFloor,
        configuration: String(data.configuration || '3 BHK'),
        carpet_area: Number(data.carpet_area) || 1450,
        built_up_area: Number(data.built_up_area) || 1900,
        base_price: Number(data.price) || 13500000,
        possession_date: possessionDate
      });
    }
  } catch (err) {
    console.error("Error updating inventory units for property:", err);
  }

  // Auto-add new locations to the locations table
  if (data.location) {
    const locations = String(data.location).split(',').map(l => l.trim()).filter(Boolean);
    for (const loc of locations) {
      await supabase.from('locations').upsert({ name: loc }, { onConflict: 'name' });
    }
  }

  await supabase
    .from('audit_logs')
    .insert({ user_id: profile?.id, event: 'Property updated', changes: data });

  return { success: true, data: updated };
}


