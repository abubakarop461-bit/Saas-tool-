// src/lib/inventory.ts - Developer Unit Inventory Data Layer with Cloudflare D1 Sync
import { queryD1, upsertD1Record } from '@/lib/db';

export type UnitStatus = 'Available' | 'Hold' | 'Token' | 'Negotiation' | 'Booked' | 'Sold';

export interface DeveloperUnit {
  id: string;
  project_title: string;
  tower: string;
  floor: number;
  unit_number: string;
  configuration: string;
  carpet_area: number; // sq ft
  built_up_area: number; // sq ft
  facing: string;
  base_price: number;
  floor_rise_rate: number;
  parking_charges: number;
  amenities_charges: number;
  other_charges: number;
  gst_rate: number;
  stamp_duty_rate: number;
  registration_rate: number;
  possession_date: string;
  status: UnitStatus;
  buyer_name?: string;
  agent_name?: string;
}

export const SEED_DEVELOPER_UNITS: DeveloperUnit[] = [
  // Floor 14
  {
    id: 'u-1401',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 14,
    unit_number: '1401',
    configuration: '3 BHK',
    carpet_area: 1650,
    built_up_area: 2150,
    facing: 'East (Sunrise View)',
    base_price: 14800000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Available'
  },
  {
    id: 'u-1402',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 14,
    unit_number: '1402',
    configuration: '3 BHK',
    carpet_area: 1680,
    built_up_area: 2200,
    facing: 'Garden Facing',
    base_price: 15200000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Token',
    buyer_name: 'Anil Deshmukh',
    agent_name: 'Rishi M.'
  },
  {
    id: 'u-1403',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 14,
    unit_number: '1403',
    configuration: '4.5 BHK',
    carpet_area: 2450,
    built_up_area: 3200,
    facing: 'North-East (Vastu Compliant)',
    base_price: 24500000,
    floor_rise_rate: 60,
    parking_charges: 1000000,
    amenities_charges: 400000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Hold',
    buyer_name: 'Vikramaditya Singhania',
    agent_name: 'Vikram Seth'
  },
  {
    id: 'u-1404',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 14,
    unit_number: '1404',
    configuration: '4.5 BHK',
    carpet_area: 2450,
    built_up_area: 3200,
    facing: 'Clubhouse View',
    base_price: 24800000,
    floor_rise_rate: 60,
    parking_charges: 1000000,
    amenities_charges: 400000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Booked',
    buyer_name: 'Rahul Agarwal',
    agent_name: 'Benazir Bhayani'
  },
  // Floor 12
  {
    id: 'u-1201',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 12,
    unit_number: '1201',
    configuration: '3 BHK',
    carpet_area: 1650,
    built_up_area: 2150,
    facing: 'East (Sunrise View)',
    base_price: 14400000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Available'
  },
  {
    id: 'u-1202',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 12,
    unit_number: '1202',
    configuration: '3 BHK',
    carpet_area: 1680,
    built_up_area: 2200,
    facing: 'Garden Facing',
    base_price: 14750000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Negotiation',
    buyer_name: 'Sunil Mehta',
    agent_name: 'Hamirr Jobnputra'
  },
  {
    id: 'u-1203',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 12,
    unit_number: '1203',
    configuration: '4.5 BHK',
    carpet_area: 2450,
    built_up_area: 3200,
    facing: 'North-East (Vastu Compliant)',
    base_price: 23800000,
    floor_rise_rate: 60,
    parking_charges: 1000000,
    amenities_charges: 400000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Sold',
    buyer_name: 'Pooja Hegde Client',
    agent_name: 'Pooja Hegde'
  },
  {
    id: 'u-1204',
    project_title: 'Panchshil Silverwoods',
    tower: 'Tower A',
    floor: 12,
    unit_number: '1204',
    configuration: '4.5 BHK',
    carpet_area: 2450,
    built_up_area: 3200,
    facing: 'Clubhouse View',
    base_price: 24100000,
    floor_rise_rate: 60,
    parking_charges: 1000000,
    amenities_charges: 400000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Available'
  }
];

export async function fetchDeveloperUnits(): Promise<DeveloperUnit[]> {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('luxe-inventory-units-store');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('luxe-inventory-units-store', JSON.stringify(SEED_DEVELOPER_UNITS));
  }
  return SEED_DEVELOPER_UNITS;
}

export async function saveDeveloperUnits(units: DeveloperUnit[]): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('luxe-inventory-units-store', JSON.stringify(units));
  }
}
