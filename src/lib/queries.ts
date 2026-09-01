// src/lib/queries.ts
import { supabase } from '@/lib/supabaseClient';
import type { Profile } from './auth';

export interface Lead {
  id: string;
  client_name: string;
  phone: string;
  alternate_phones?: string[];
  email: string;
  lead_source_id: string;
  budget_min: number;
  budget_max: number;
  preferred_location: string;
  property_type: string;
  configuration: string;
  category: string; // 'Commercial' | 'Residential'
  transaction_type: string; // 'Rent' | 'Outright'
  required_area?: number;
  purpose?: string;
  assigned_to?: string;
  stage_id?: string;
  next_followup_date?: string;
  status?: string;
  is_active?: boolean;
  notes?: string;
  created_at?: string;
}

export interface Property {
  id: string;
  title: string;
  property_code: string;
  location: string;
  address: string;
  property_type: string;
  configuration: string;
  carpet_area?: number;
  built_up_area?: number;
  price?: number;
  status_id?: string;
  listing_type: string;
  source_type?: string;
  owner_name?: string;
  owner_contact?: string;
  alternate_owner_contacts?: string[];
  unit_no?: string;
  brokerage?: string;
  description?: string;
  internal_notes?: string;
  is_active?: boolean;
  created_at?: string;
}

// ─────────────────────────────────────────────────────────────
// POPULATED PROPERTY LEADS DATASET FOR FEATURE ANALYSIS & TESTING
// ─────────────────────────────────────────────────────────────
export const SEED_LEADS: Lead[] = [
  {
    id: 'lead-001',
    client_name: 'Sandesh Kulkarni',
    phone: '+91 98230 45612',
    email: 'sandesh.kulkarni@techcorp.in',
    lead_source_id: 'Channel Partner (ABC Realty)',
    budget_min: 12000000,
    budget_max: 14500000,
    preferred_location: 'Kalyani Nagar',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1650,
    purpose: 'Self Use',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5', // Rishi Mahboobani
    stage_id: 'Negotiation',
    next_followup_date: '2026-09-03',
    status: 'Hot',
    is_active: true,
    notes: 'Token amount of ₹5L ready. Requested smart cost sheet quotation for Tower A Unit 1204 with 2 car parks.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-002',
    client_name: 'Vikramaditya Singhania',
    phone: '+91 99224 88710',
    email: 'vikram.singhania@singhaniaholdings.com',
    lead_source_id: 'Direct Referral',
    budget_min: 35000000,
    budget_max: 50000000,
    preferred_location: 'Boat Club Road',
    property_type: 'Penthouse',
    configuration: '4.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 3400,
    purpose: 'Luxury Upgrade',
    assigned_to: 'd1b4e702-1400-3427-9652-570c6168a3d6', // Vikram Seth
    stage_id: 'Site visit',
    next_followup_date: '2026-09-02',
    status: 'Hot',
    is_active: true,
    notes: 'Attended VIP site tour at Solitaire Grand. Highly interested in top-floor private plunge pool unit.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-003',
    client_name: 'Dr. Ananya Deshmukh',
    phone: '+91 97645 12098',
    email: 'ananya.deshmukh@rubyclinic.com',
    lead_source_id: 'Instagram Campaign',
    budget_min: 13500000,
    budget_max: 17500000,
    preferred_location: 'Baner',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1550,
    purpose: 'Family Residence',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5',
    stage_id: 'Follow up',
    next_followup_date: '2026-08-30', // Overdue for risk demo
    status: 'Hot',
    is_active: true,
    notes: 'Strict Vastu East-facing requirement. HDFC home loan sanction letter available for ₹1.2 Cr.',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-004',
    client_name: 'Rajiv & Meera Bajaj',
    phone: '+91 98220 99123',
    email: 'rajiv.bajaj@automotive-pune.com',
    lead_source_id: 'MagicBricks Luxury',
    budget_min: 45000000,
    budget_max: 65000000,
    preferred_location: 'Koregaon Park',
    property_type: 'Villa',
    configuration: '5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 4200,
    purpose: 'Primary Residence',
    assigned_to: 'e2c5f803-2500-4538-a763-680d7279b4e7', // Rahul Sharma
    stage_id: 'Closure',
    next_followup_date: '2026-09-10',
    status: 'Closed',
    is_active: true,
    notes: 'Deal closed for ₹6.2 Cr. Agreement registration milestone scheduled for Sept 15.',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-005',
    client_name: 'Priya & Abhishek Sharma',
    phone: '+91 98811 44552',
    email: 'priya.sharma@cybertech.org',
    lead_source_id: '99acres',
    budget_min: 9500000,
    budget_max: 12500000,
    preferred_location: 'Kharadi',
    property_type: 'Apartment',
    configuration: '2.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1280,
    purpose: 'First Home',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5',
    stage_id: 'New inquiry',
    next_followup_date: '2026-09-02',
    status: 'Warm',
    is_active: true,
    notes: 'IT professionals working at EON Free Zone. Looking for clubhouse amenities and school transport connectivity.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-006',
    client_name: 'Rohan & Sneha Godbole',
    phone: '+91 99701 33445',
    email: 'rohan.godbole@architects.in',
    lead_source_id: 'Walk-in',
    budget_min: 20000000,
    budget_max: 26000000,
    preferred_location: 'Kalyani Nagar',
    property_type: 'Apartment',
    configuration: '3.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 2100,
    purpose: 'Upgrade',
    assigned_to: 'd1b4e702-1400-3427-9652-570c6168a3d6',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-04',
    status: 'Hot',
    is_active: true,
    notes: 'Evaluating between Luxe Azure Palms and Yoo Pune. Requested comparative payment milestones.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-007',
    client_name: 'Amitav Ghosh',
    phone: '+91 98900 11223',
    email: 'amitav@ghoshcapital.com',
    lead_source_id: 'Channel Partner (Knight Frank)',
    budget_min: 25000000,
    budget_max: 35000000,
    preferred_location: 'Baner',
    property_type: 'Commercial Office',
    configuration: 'Grade-A Office',
    category: 'Commercial',
    transaction_type: 'Outright',
    required_area: 2500,
    purpose: 'Investment / Rental Yield',
    assigned_to: 'e2c5f803-2500-4538-a763-680d7279b4e7',
    stage_id: 'Negotiation',
    next_followup_date: '2026-09-05',
    status: 'Hot',
    is_active: true,
    notes: 'Targeting minimum 8.5% rental yield. Examining leased corporate spaces on Balewadi High Street.',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-008',
    client_name: 'Siddharth Malhotra',
    phone: '+91 97663 88990',
    email: 'siddharth.m@aerospace.com',
    lead_source_id: 'Google Search Ads',
    budget_min: 16000000,
    budget_max: 21000000,
    preferred_location: 'Viman Nagar',
    property_type: 'Penthouse',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1950,
    purpose: 'Self Use',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-03',
    status: 'Hot',
    is_active: true,
    notes: 'Pilot with Pune International Airport connectivity requirement. Site tour confirmed.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-009',
    client_name: 'Natasha Poonawalla',
    phone: '+91 98229 00111',
    email: 'natasha.p@poonawallagroup.com',
    lead_source_id: 'VIP Direct',
    budget_min: 60000000,
    budget_max: 90000000,
    preferred_location: 'Kalyani Nagar',
    property_type: 'Sky Villa',
    configuration: '5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 4800,
    purpose: 'Luxury Upgrade',
    assigned_to: 'e2c5f803-2500-4538-a763-680d7279b4e7',
    stage_id: 'Negotiation',
    next_followup_date: '2026-09-06',
    status: 'Hot',
    is_active: true,
    notes: 'Ultra High Net Worth client. Requesting customized duplex design and 4 parking slots.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-010',
    client_name: 'Ketan & Shweta Parekh',
    phone: '+91 98231 66778',
    email: 'ketan.parekh@fintech.co',
    lead_source_id: 'Housing.com',
    budget_min: 7500000,
    budget_max: 9200000,
    preferred_location: 'Hinjewadi',
    property_type: 'Apartment',
    configuration: '2 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 980,
    purpose: 'First Home',
    assigned_to: 'c0a3d601-0300-2316-8541-460b505792c5',
    stage_id: 'New inquiry',
    next_followup_date: '2026-09-04',
    status: 'Cold',
    is_active: true,
    notes: 'Looking for under-construction tower with possession by 2027.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-011',
    client_name: 'Sunita & Mahesh Agarwal',
    phone: '+91 98902 55443',
    email: 'mahesh.agarwal@textiles.in',
    lead_source_id: 'Channel Partner',
    budget_min: 15000000,
    budget_max: 19000000,
    preferred_location: 'Aundh',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1750,
    purpose: 'Family Residence',
    assigned_to: 'd1b4e702-1400-3427-9652-570c6168a3d6',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-03',
    status: 'Hot',
    is_active: true,
    notes: 'Tour scheduled. Focus on senior citizen friendly amenities and landscape podium.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-012',
    client_name: 'Farhan & Zeenat Merchant',
    phone: '+91 98810 77889',
    email: 'farhan.merchant@logistics.com',
    lead_source_id: 'Referral',
    budget_min: 22000000,
    budget_max: 29000000,
    preferred_location: 'Koregaon Park',
    property_type: 'Apartment',
    configuration: '4 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 2600,
    purpose: 'Upgrade',
    assigned_to: 'e2c5f803-2500-4538-a763-680d7279b4e7',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-07',
    status: 'Warm',
    is_active: true,
    notes: 'Requested customized payment schedule tied to construction slabs.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// ─────────────────────────────────────────────────────────────
// POPULATED LUXURY PROPERTY INVENTORY DATASET
// ─────────────────────────────────────────────────────────────
export const SEED_PROPERTIES: Property[] = [
  {
    id: 'prop-001',
    title: 'Luxe Azure Palms - Tower A',
    property_code: 'A-1204',
    location: 'Kalyani Nagar',
    address: 'East Avenue, Kalyani Nagar, Pune',
    property_type: 'Apartment',
    configuration: '3 BHK',
    carpet_area: 1680,
    built_up_area: 2150,
    price: 13500000,
    status_id: 'Available',
    listing_type: 'Exclusive',
    source_type: 'Developer Direct',
    owner_name: 'Luxe Realty In-House Inventory',
    owner_contact: '+91 20 6789 0000',
    unit_no: 'A-1204',
    brokerage: '2%',
    description: 'Luxury 3 BHK with panoramic riverfront view, Italian marble flooring, and modular German kitchen.',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-002',
    title: 'Trump Towers Pune - West Wing',
    property_code: 'TT-2201',
    location: 'Kalyani Nagar',
    address: 'Trump Towers, Central Kalyani Nagar, Pune',
    property_type: 'Sky Villa',
    configuration: '4.5 BHK',
    carpet_area: 3400,
    built_up_area: 4400,
    price: 48000000,
    status_id: 'Hold',
    listing_type: 'Exclusive',
    source_type: 'Mandate',
    owner_name: 'Panchshil Developers',
    owner_contact: '+91 20 6600 1100',
    unit_no: 'B-2201',
    brokerage: '2.5%',
    description: 'Iconic black glass tower with signature concierge, private elevator lobby, and heated infinity pool.',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-003',
    title: 'Solitaire Grand Penthouse',
    property_code: 'SG-PH01',
    location: 'Boat Club Road',
    address: 'Boat Club Road Waterfront, Pune',
    property_type: 'Penthouse',
    configuration: '5 BHK',
    carpet_area: 4200,
    built_up_area: 5500,
    price: 62000000,
    status_id: 'Token',
    listing_type: 'Exclusive',
    source_type: 'Developer Direct',
    owner_name: 'Solitaire Group',
    owner_contact: '+91 20 4400 8800',
    unit_no: 'PH-01',
    brokerage: '2%',
    description: 'Ultra luxury duplex penthouse with private terrace jacuzzi, 360-degree skyline views, and 4 automated parkings.',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-004',
    title: 'Panchshil One North Residences',
    property_code: 'ON-802',
    location: 'Hadapsar',
    address: 'One North, Magarpatta Road, Pune',
    property_type: 'Apartment',
    configuration: '3.5 BHK',
    carpet_area: 2250,
    built_up_area: 2900,
    price: 24000000,
    status_id: 'Available',
    listing_type: 'Exclusive',
    source_type: 'Developer Direct',
    owner_name: 'Panchshil Realty',
    owner_contact: '+91 20 6600 2200',
    unit_no: 'C-802',
    brokerage: '2%',
    description: 'Surrounded by 70% landscaped greens with clubhouse, squash courts, and round-the-clock security.',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-005',
    title: 'Yoo Pune Designer Residences',
    property_code: 'YP-1403',
    location: 'Hadapsar',
    address: 'Yoo Pune, Adjacent to Magarpatta, Pune',
    property_type: 'Apartment',
    configuration: '4 BHK',
    carpet_area: 2900,
    built_up_area: 3750,
    price: 36000000,
    status_id: 'Negotiation',
    listing_type: 'Exclusive',
    source_type: 'Mandate',
    owner_name: 'Philippe Starck Designs',
    owner_contact: '+91 20 6600 3300',
    unit_no: 'T-1403',
    brokerage: '2%',
    description: 'Interiors by world-renowned Philippe Starck, rainforest sanctuary, Six Senses spa on site.',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-006',
    title: 'Balewadi Signature Towers',
    property_code: 'BST-604',
    location: 'Balewadi',
    address: 'Balewadi High Street Extension, Pune',
    property_type: 'Apartment',
    configuration: '3 BHK',
    carpet_area: 1550,
    built_up_area: 1980,
    price: 14500000,
    status_id: 'Available',
    listing_type: 'Direct',
    source_type: 'Developer Direct',
    owner_name: 'Signature Landmark',
    owner_contact: '+91 20 5500 4400',
    unit_no: 'B-604',
    brokerage: '2%',
    description: 'Prime Balewadi location with 200m walking distance to High Street cafes and metro station.',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-007',
    title: 'Kharadi Riverside Grand',
    property_code: 'KRG-1002',
    location: 'Kharadi',
    address: 'Near EON IT Park, Kharadi, Pune',
    property_type: 'Apartment',
    configuration: '2.5 BHK',
    carpet_area: 1280,
    built_up_area: 1650,
    price: 11500000,
    status_id: 'Available',
    listing_type: 'Direct',
    source_type: 'Developer Direct',
    owner_name: 'Riverside Developers',
    owner_contact: '+91 20 7700 9900',
    unit_no: 'D-1002',
    brokerage: '2%',
    description: 'Ideal IT professional residence. Modern amenities including rooftop running track and EV charging.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-008',
    title: 'Baner Pinnacle Skyline Duplex',
    property_code: 'BPS-1801',
    location: 'Baner',
    address: 'Pinnacle Way, Baner Hills, Pune',
    property_type: 'Apartment',
    configuration: '4 BHK',
    carpet_area: 3100,
    built_up_area: 3950,
    price: 32000000,
    status_id: 'Booked',
    listing_type: 'Exclusive',
    source_type: 'Developer Direct',
    owner_name: 'Pinnacle Group',
    owner_contact: '+91 20 8800 6600',
    unit_no: 'P-1801',
    brokerage: '2%',
    description: 'Hillside duplex with double-height living room and uninterrupted sunset view.',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function fetchLeads(profile: Profile | null): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error && data && data.length > 0) return data as Lead[];
  } catch {
    // fallback to populated demo leads
  }

  // Check localStorage for local modifications
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('luxe-leads-store');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // use default seed
      }
    }
    // Initialize store
    localStorage.setItem('luxe-leads-store', JSON.stringify(SEED_LEADS));
  }

  return SEED_LEADS;
}

export async function fetchProperties(profile: Profile | null): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (!error && data && data.length > 0) return data as Property[];
  } catch {
    // fallback to populated demo properties
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('luxe-properties-store');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // use default seed
      }
    }
    localStorage.setItem('luxe-properties-store', JSON.stringify(SEED_PROPERTIES));
  }

  return SEED_PROPERTIES;
}

export async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return data as Property;
  } catch {
    // check local
  }

  const all = await fetchProperties(null);
  return all.find(p => p.id === id) || null;
}

export async function fetchSetting(id: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', id)
      .single();
    if (!error && data) return data.value;
  } catch {
    // disconnected mode
  }
  return '';
}

export async function updateSetting(id: string, value: string) {
  try {
    await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('id', id);
  } catch {
    // disconnected mode
  }
}
