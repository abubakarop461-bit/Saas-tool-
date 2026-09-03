// app/properties/actions.ts – server actions for Property CRUD with Cloudflare D1 Primary Backend
'use server';
import { upsertD1Record, deleteD1Record, getD1Record } from '@/lib/db';
import { syncPropertyInventoryUnits } from '@/lib/inventory';
import { revalidatePath } from 'next/cache';

export async function createPropertyAction(prevState: any, formData: FormData) {
  try {
    const id = `prop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const listingNature = String(formData.get('listing_nature') || 'standalone');
    const isStandalone = listingNature === 'standalone';

    const data: Record<string, any> = {
      id,
      title: String(formData.get('title') || 'Untitled Property').trim(),
      property_code: String(formData.get('property_code') || '').trim() || `PRP-${Date.now().toString(36).toUpperCase()}`,
      location: String(formData.get('location') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      property_type: String(formData.get('property_type') || (isStandalone ? 'Apartment' : 'Residential Project')).trim(),
      configuration: String(formData.get('configuration') || '3 BHK').trim(),
      carpet_area: Number(formData.get('carpet_area')) || 1680,
      built_up_area: Number(formData.get('built_up_area')) || 2150,
      price: Number(formData.get('price')) || 13500000,
      status_id: String(formData.get('status_id') || 'Available'),
      listing_type: String(formData.get('listing_type') || 'Sale'),
      listing_nature: listingNature,
      source_type: String(formData.get('source_type') || 'Direct'),
      owner_name: String(formData.get('owner_name') || '').trim(),
      owner_contact: String(formData.get('owner_contact') || '').trim(),
      alternate_owner_contacts: (formData.getAll('alternate_owner_contacts') as string[]).map(p => p.trim()).filter(Boolean),
      unit_no: String(formData.get('unit_no') || '').trim() || 'A-1204',
      floor_number: Number(formData.get('floor_number')) || 12,
      total_floors: Number(formData.get('total_floors')) || 20,
      facing: String(formData.get('facing') || 'East (Riverfront & Sunrise View)').trim(),
      furnishing: String(formData.get('furnishing') || 'Semi-Furnished').trim(),
      parking: String(formData.get('parking') || '2 Covered Parking Slots').trim(),
      possession_status: String(formData.get('possession_status') || 'Ready to Move').trim(),
      maintenance: String(formData.get('maintenance') || '5500').trim(),
      brokerage: String(formData.get('brokerage') || '2%').trim(),
      description: String(formData.get('description') || '').trim(),
      internal_notes: String(formData.get('internal_notes') || '').trim(),
      is_active: true,
      created_at: new Date().toISOString()
    };

    // 1. Save directly to Cloudflare D1
    await upsertD1Record('properties', data);

    // 2. Auto-generate & synchronize unit inventory
    try {
      const towersRaw = String(formData.get('towers_list') || 'Tower A, Tower B');
      const towers = towersRaw.split(',').map(t => t.trim()).filter(Boolean);
      const totalFloors = Math.max(1, Number(formData.get('total_floors')) || 14);
      const unitsPerFloor = Math.max(1, Number(formData.get('units_per_floor')) || 4);
      const possessionDate = String(formData.get('possession_date') || data.possession_status || 'December 2026');

      await syncPropertyInventoryUnits({
        property_id: id,
        project_title: data.title,
        is_standalone: isStandalone,
        unit_number: data.unit_no,
        floor_number: data.floor_number,
        facing: data.facing,
        towers: towers.length > 0 ? towers : ['Tower A'],
        total_floors: isStandalone ? 1 : totalFloors,
        units_per_floor: isStandalone ? 1 : unitsPerFloor,
        configuration: data.configuration,
        carpet_area: data.carpet_area,
        built_up_area: data.built_up_area,
        base_price: data.price,
        possession_date: possessionDate
      });
    } catch (invErr) {
      console.warn("Inventory unit sync deferred:", invErr);
    }

    revalidatePath('/properties');
    revalidatePath('/inventory');
    return { success: true, data };
  } catch (err: any) {
    console.error("Create property error:", err);
    return { success: false, error: err.message || 'Failed to create property in Cloudflare database' };
  }
}

export async function updatePropertyAction(prevState: any, formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) return { success: false, error: "Missing property ID" };

    const listingNature = String(formData.get('listing_nature') || 'standalone');
    const isStandalone = listingNature === 'standalone';

    const data: Record<string, any> = {
      id,
      title: String(formData.get('title') || 'Untitled Property').trim(),
      property_code: String(formData.get('property_code') || '').trim() || id,
      location: String(formData.get('location') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      property_type: String(formData.get('property_type') || (isStandalone ? 'Apartment' : 'Residential Project')).trim(),
      configuration: String(formData.get('configuration') || '3 BHK').trim(),
      carpet_area: Number(formData.get('carpet_area')) || 1680,
      built_up_area: Number(formData.get('built_up_area')) || 2150,
      price: Number(formData.get('price')) || 13500000,
      listing_type: String(formData.get('listing_type') || 'Sale'),
      listing_nature: listingNature,
      source_type: String(formData.get('source_type') || 'Direct'),
      owner_name: String(formData.get('owner_name') || '').trim(),
      owner_contact: String(formData.get('owner_contact') || '').trim(),
      alternate_owner_contacts: (formData.getAll('alternate_owner_contacts') as string[]).map(p => p.trim()).filter(Boolean),
      unit_no: String(formData.get('unit_no') || '').trim() || 'A-1204',
      floor_number: Number(formData.get('floor_number')) || 12,
      total_floors: Number(formData.get('total_floors')) || 20,
      facing: String(formData.get('facing') || 'East (Riverfront & Sunrise View)').trim(),
      furnishing: String(formData.get('furnishing') || 'Semi-Furnished').trim(),
      parking: String(formData.get('parking') || '2 Covered Parking Slots').trim(),
      possession_status: String(formData.get('possession_status') || 'Ready to Move').trim(),
      maintenance: String(formData.get('maintenance') || '5500').trim(),
      brokerage: String(formData.get('brokerage') || '2%').trim(),
      description: String(formData.get('description') || '').trim(),
      internal_notes: String(formData.get('internal_notes') || '').trim(),
      updated_at: new Date().toISOString()
    };

    // 1. Update in Cloudflare D1
    await upsertD1Record('properties', data);

    // 2. Synchronize unit inventory
    try {
      const towersRaw = String(formData.get('towers_list') || '');
      const towers = towersRaw ? towersRaw.split(',').map(t => t.trim()).filter(Boolean) : ['Tower A'];
      const totalFloors = Math.max(1, Number(formData.get('total_floors')) || 14);
      const unitsPerFloor = Math.max(1, Number(formData.get('units_per_floor')) || 4);
      const possessionDate = String(formData.get('possession_date') || data.possession_status || 'December 2026');

      await syncPropertyInventoryUnits({
        property_id: id,
        project_title: data.title,
        is_standalone: isStandalone,
        unit_number: data.unit_no,
        floor_number: data.floor_number,
        facing: data.facing,
        towers: towers.length > 0 ? towers : ['Tower A'],
        total_floors: isStandalone ? 1 : totalFloors,
        units_per_floor: isStandalone ? 1 : unitsPerFloor,
        configuration: data.configuration,
        carpet_area: data.carpet_area,
        built_up_area: data.built_up_area,
        base_price: data.price,
        possession_date: possessionDate
      });
    } catch (invErr) {
      console.warn("Inventory update sync deferred:", invErr);
    }

    revalidatePath('/properties');
    revalidatePath('/inventory');
    return { success: true, data };
  } catch (err: any) {
    console.error("Update property error:", err);
    return { success: false, error: err.message || 'Failed to update property in Cloudflare database' };
  }
}

export async function deletePropertyAction(id: string) {
  try {
    if (!id) return { success: false, error: 'Missing ID' };
    await deleteD1Record('properties', id);
    revalidatePath('/properties');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
