import { SupabaseClient } from '@supabase/supabase-js';

// Default built-in property types
export const DEFAULT_PROPERTY_TYPES = [
  'Apartment',
  'Duplex',
  'Terrace Apartment',
  'Garden Apartment',
  'Garden',
  'Penthouse',
  'Villa / Independent House',
  'Rowhouse',
  'Independent Building',
  'Office Space',
  'Shop / Retail',
  'Showroom',
  'Plot / Land',
  'Commercial Space',
  'Warehouse',
  'Triplex',
  'Bunglow',
  'Studio',
  'Restaurant',
];


// BHK-style configuration only makes sense for residential unit types. Commercial/other
// listings (Shop, Office Space, Plot, Showroom, etc.) don't have a BHK configuration --
// their "configuration" should just reflect the property type itself.
export const RESIDENTIAL_TYPES = [
  'Apartment',
  'Terrace Apartment',
  'Garden Apartment',
  'Penthouse',
  'Villa',
  'Villa / Independent House',
  'Duplex',
  'Triplex',
  'Bunglow',
  'Rowhouse',
  'Row House',
  'Independent Building',
  'Building',
  'Studio',
  'Farmhouse',
];

export function isResidentialType(propertyType: string | undefined | null): boolean {
  const t = (propertyType || '').toLowerCase();
  return RESIDENTIAL_TYPES.some(rt => t.includes(rt.toLowerCase()));
}

export function getConfigDisplay(prop: { property_type?: string; configuration?: string }): string {
  if (!isResidentialType(prop.property_type)) {
    return prop.property_type || prop.configuration || '—';
  }
  return prop.configuration || '—';
}

export const BHK_CONFIG_OPTIONS = [
  { value: '1 BHK', label: '1 BHK' },
  { value: '2 BHK', label: '2 BHK' },
  { value: '2.5 BHK', label: '2.5 BHK' },
  { value: '3 BHK', label: '3 BHK' },
  { value: '3.5 BHK', label: '3.5 BHK' },
  { value: '4 BHK', label: '4 BHK' },
  { value: '4.5 BHK', label: '4.5 BHK' },
  { value: '5 BHK', label: '5 BHK' },
  { value: '5.5 BHK', label: '5.5 BHK' },
  { value: '6 BHK', label: '6 BHK' },
  { value: '6.5 BHK', label: '6.5 BHK' },
  { value: 'Garden', label: 'Garden' },
];

export const COMMERCIAL_CONFIG_OPTIONS = [
  { value: 'Office Space', label: 'Office Space' },
  { value: 'Shop / Retail', label: 'Shop / Retail' },
  { value: 'Showroom', label: 'Showroom' },
  { value: 'Plot / Land', label: 'Plot / Land' },
  { value: 'Commercial Space', label: 'Commercial Space' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Preleased', label: 'Preleased' },
  { value: 'Bare Shell', label: 'Bare Shell' },
  { value: 'Furnished', label: 'Furnished' },
];

/**
 * Fetch all available property types (built-in + database custom additions).
 */
export async function fetchPropertyTypes(supabase: SupabaseClient): Promise<string[]> {
  try {
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'custom_property_types')
      .single();

    let customTypes: string[] = [];
    if (setting?.value) {
      try {
        customTypes = JSON.parse(setting.value);
      } catch {
        customTypes = [];
      }
    }

    const all = Array.from(new Set([...DEFAULT_PROPERTY_TYPES, ...(Array.isArray(customTypes) ? customTypes : [])]));
    return all.sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error('Error loading custom property types:', err);
    return DEFAULT_PROPERTY_TYPES;
  }
}

/**
 * Save a newly created property type to Supabase settings.
 */
export async function saveNewPropertyType(newType: string, supabase: SupabaseClient): Promise<string[]> {
  const trimmed = newType.trim();
  if (!trimmed) return DEFAULT_PROPERTY_TYPES;

  try {
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'custom_property_types')
      .single();

    let existing: string[] = [];
    if (setting?.value) {
      try {
        existing = JSON.parse(setting.value);
      } catch {
        existing = [];
      }
    }

    if (!existing.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      existing.push(trimmed);
      await supabase.from('settings').upsert({
        id: 'custom_property_types',
        value: JSON.stringify(existing),
        updated_at: new Date().toISOString()
      });
    }

    const all = Array.from(new Set([...DEFAULT_PROPERTY_TYPES, ...existing]));
    return all.sort((a, b) => a.localeCompare(b));
  } catch (err) {
    console.error('Error saving custom property type:', err);
    return DEFAULT_PROPERTY_TYPES;
  }
}

export const DEFAULT_CONFIG_OPTIONS = [
  '1 BHK',
  '2 BHK',
  '2.5 BHK',
  '3 BHK',
  '3.5 BHK',
  '4 BHK',
  '4.5 BHK',
  '5 BHK',
  '5.5 BHK',
  '6 BHK',
  '6.5 BHK',
  'Penthouse',
  'Studio',
  'Garden',
  'Office Space',
  'Plot',
  'Bunglow',
  'Restaurant',
  'Shop',
  'Rowhouse',
  'Showroom',
  'Duplex',
  'Triplex',
  'Building',
  'Preleased',
  'Bare Shell',
  'Furnished',
  'Warm Shell'
];


/**
 * Fetch all available configuration options (built-in + database custom additions).
 */
export async function fetchConfigurationOptions(supabase: SupabaseClient): Promise<string[]> {
  try {
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'custom_configurations')
      .single();

    let customConfigs: string[] = [];
    if (setting?.value) {
      try {
        customConfigs = JSON.parse(setting.value);
      } catch {
        customConfigs = [];
      }
    }

    const all = Array.from(new Set([...DEFAULT_CONFIG_OPTIONS, ...(Array.isArray(customConfigs) ? customConfigs : [])]));
    return all;
  } catch (err) {
    console.error('Error loading custom configurations:', err);
    return DEFAULT_CONFIG_OPTIONS;
  }
}

/**
 * Save a newly created configuration option to Supabase settings.
 */
export async function saveNewConfiguration(newConfig: string, supabase: SupabaseClient): Promise<string[]> {
  const trimmed = newConfig.trim();
  if (!trimmed) return DEFAULT_CONFIG_OPTIONS;

  try {
    const { data: setting } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'custom_configurations')
      .single();

    let existing: string[] = [];
    if (setting?.value) {
      try {
        existing = JSON.parse(setting.value);
      } catch {
        existing = [];
      }
    }

    if (!existing.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      existing.push(trimmed);
      await supabase.from('settings').upsert({
        id: 'custom_configurations',
        value: JSON.stringify(existing),
        updated_at: new Date().toISOString()
      });
    }

    const all = Array.from(new Set([...DEFAULT_CONFIG_OPTIONS, ...existing]));
    return all;
  } catch (err) {
    console.error('Error saving custom configuration:', err);
    return DEFAULT_CONFIG_OPTIONS;
  }
}

/**
 * Save a new location to the Supabase locations table.
 */
export async function saveNewLocation(newLocation: string, supabase: SupabaseClient): Promise<boolean> {
  const trimmed = newLocation.trim();
  if (!trimmed) return false;

  try {
    const { error } = await supabase
      .from('locations')
      .upsert({ name: trimmed }, { onConflict: 'name' });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error saving new location:', err);
    return false;
  }
}


