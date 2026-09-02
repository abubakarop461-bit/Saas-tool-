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

export interface SalesPersonProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  designation?: string;
}

// ─────────────────────────────────────────────────────────────
// 4 SALESPEOPLE ROSTER
// ─────────────────────────────────────────────────────────────
export const SEED_SALESPEOPLE: SalesPersonProfile[] = [
  {
    id: 'agent-rishi-01',
    full_name: 'Rishi Mahboobani',
    email: 'rishi@luxerealtypune.com',
    role: 'SalesPerson',
    designation: 'Senior Sales Executive'
  },
  {
    id: 'agent-benazir-02',
    full_name: 'Benazir Bhayani',
    email: 'benazir@luxerealtypune.com',
    role: 'SalesPerson',
    designation: 'Luxury Property Consultant'
  },
  {
    id: 'agent-hamirr-03',
    full_name: 'Hamirr Jobnputra',
    email: 'hamirr@luxerealtypune.com',
    role: 'SalesPerson',
    designation: 'Commercial & Residential Specialist'
  },
  {
    id: 'agent-vikram-04',
    full_name: 'Vikram Seth',
    email: 'vikram@luxerealtypune.com',
    role: 'Admin',
    designation: 'Luxury Sales Manager'
  },
  {
    id: 'agent-pooja-05',
    full_name: 'Pooja Hegde',
    email: 'pooja@luxerealtypune.com',
    role: 'SalesPerson',
    designation: 'Client Relationship Manager'
  },
  {
    id: 'agent-tanmay-06',
    full_name: 'Tanmay Deshpande',
    email: 'tanmay@luxerealtypune.com',
    role: 'SalesPerson',
    designation: 'Commercial & Luxury Specialist'
  }
];

// ─────────────────────────────────────────────────────────────
// POPULATED PROPERTY LEADS MATCHING EXACT SPECIFICATION
// ─────────────────────────────────────────────────────────────
export const SEED_LEADS: Lead[] = [
  // ── CORE REFERENCED BUYERS ──
  {
    id: 'lead-001',
    client_name: 'Sandesh Kulkarni',
    phone: '+91-7838556636',
    email: 'sandesh.kulkarni@techcorp.in',
    lead_source_id: '99acres',
    budget_min: 15000000,
    budget_max: 22000000,
    preferred_location: 'Boat Club Road, Bund Garden',
    property_type: 'Commercial',
    configuration: 'Office Space',
    category: 'Commercial',
    transaction_type: 'Outright',
    required_area: 1650,
    purpose: 'Corporate Office',
    stage_id: 'New inquiry',
    status: 'New',
    is_active: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-002',
    client_name: 'Gaurav soho showroom',
    phone: '+91 86004 44718',
    email: 'gaurav.showroom@retail.in',
    lead_source_id: '99acres',
    budget_min: 25000000,
    budget_max: 38000000,
    preferred_location: 'Kharadi',
    property_type: 'Commercial',
    configuration: 'Showroom',
    category: 'Commercial',
    transaction_type: 'Outright',
    required_area: 2800,
    purpose: 'Retail Showroom',
    stage_id: 'Contacted',
    status: 'Contacted',
    is_active: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-003',
    client_name: 'Sedhu Madhavan',
    phone: '+91-9152038058',
    email: 'sedhu.m@consulting.com',
    lead_source_id: '99acres',
    budget_min: 11000000,
    budget_max: 14500000,
    preferred_location: 'Mumbai',
    property_type: 'Apartment',
    configuration: '2 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1150,
    purpose: 'Self Use',
    assigned_to: 'agent-benazir-02',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-02',
    status: 'Contacted',
    is_active: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-004',
    client_name: 'Vijay Bajaj',
    phone: '+91-9890264185',
    email: 'vijay.bajaj@automotive.in',
    lead_source_id: '99acres',
    budget_min: 12000000,
    budget_max: 15500000,
    preferred_location: 'Vadodara',
    property_type: 'Apartment',
    configuration: '2 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1200,
    purpose: 'Investment',
    assigned_to: 'agent-benazir-02',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-02',
    status: 'Contacted',
    is_active: true,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-005',
    client_name: 'Tushar Parekh',
    phone: '+91-9960708499',
    email: 'tushar.parekh@infra.com',
    lead_source_id: '99acres',
    budget_min: 40000000,
    budget_max: 60000000,
    preferred_location: 'Pune',
    property_type: 'Plot',
    configuration: 'Plot',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 5000,
    purpose: 'Bungalow Construction',
    assigned_to: 'agent-rishi-01',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-02',
    status: 'Contacted',
    is_active: true,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-006',
    client_name: 'Anup Sharma',
    phone: '+91 98232 61976',
    email: 'anup.sharma@pharma.org',
    lead_source_id: 'Direct Referral',
    budget_min: 17500000,
    budget_max: 23000000,
    preferred_location: 'Bangalore Airport Road',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1780,
    purpose: 'Self Use',
    assigned_to: 'agent-hamirr-03',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-02',
    status: 'Contacted',
    is_active: true,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-007',
    client_name: 'Prakash',
    phone: '8087418120',
    email: 'prakash.dev@tech.com',
    lead_source_id: '99acres',
    budget_min: 16000000,
    budget_max: 21000000,
    preferred_location: 'Viman Nagar',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1650,
    purpose: 'Self Use',
    assigned_to: 'agent-hamirr-03',
    stage_id: 'Follow up',
    status: 'Hot',
    is_active: true,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-008',
    client_name: 'Sneha',
    phone: '9167055885',
    email: 'sneha.kulkarni@design.in',
    lead_source_id: '99acres',
    budget_min: 16500000,
    budget_max: 22000000,
    preferred_location: 'Viman Nagar',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1700,
    purpose: 'Family Home',
    assigned_to: 'agent-hamirr-03',
    stage_id: 'New inquiry',
    status: 'Hot',
    is_active: true,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-009',
    client_name: 'Raviraj Gupta',
    phone: '9897938393',
    email: 'raviraj.gupta@steelcorp.in',
    lead_source_id: 'Magicbricks',
    budget_min: 17000000,
    budget_max: 22500000,
    preferred_location: 'Viman Nagar',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1720,
    purpose: 'Upgrade',
    assigned_to: 'agent-hamirr-03',
    stage_id: 'Site visit',
    status: 'Hot',
    is_active: true,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-010',
    client_name: 'Shivraj Kumar Desai',
    phone: '+91-8983672406',
    email: 'shivraj.desai@ventures.com',
    lead_source_id: '99acres',
    budget_min: 22000000,
    budget_max: 32000000,
    preferred_location: 'Kharadi',
    property_type: 'Commercial',
    configuration: 'Office Space',
    category: 'Commercial',
    transaction_type: 'Outright',
    required_area: 2400,
    purpose: 'IT Operations',
    assigned_to: 'agent-hamirr-03',
    stage_id: 'New inquiry',
    status: 'Hot',
    is_active: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },

  // ── EXPANDED HIGH-VALUE MATCHMAKER BUYERS ──
  {
    id: 'lead-011',
    client_name: 'Vikramaditya Singhania',
    phone: '+91 99224 88710',
    email: 'vikram.singhania@singhaniaholdings.com',
    lead_source_id: 'Direct Referral',
    budget_min: 42000000,
    budget_max: 55000000,
    preferred_location: 'Kalyani Nagar',
    property_type: 'Sky Villa',
    configuration: '4.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 3400,
    purpose: 'Luxury Upgrade',
    assigned_to: 'agent-vikram-04',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-04',
    status: 'Hot',
    is_active: true,
    notes: 'Looking for top-tier amenities at Trump Towers or Solitaire. Private pool preferred.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-012',
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
    assigned_to: 'agent-rishi-01',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-05',
    status: 'Hot',
    is_active: true,
    notes: 'Strict Vastu East-facing requirement. HDFC pre-approved loan in place.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-013',
    client_name: 'Rohan & Sneha Godbole',
    phone: '+91 99701 33445',
    email: 'rohan.godbole@architects.in',
    lead_source_id: 'Walk-in',
    budget_min: 22000000,
    budget_max: 28000000,
    preferred_location: 'Hadapsar',
    property_type: 'Apartment',
    configuration: '3.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 2250,
    purpose: 'Upgrade',
    assigned_to: 'agent-vikram-04',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-06',
    status: 'Hot',
    is_active: true,
    notes: 'Evaluating between One North and Yoo Pune. Requested comparative payment milestones.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-014',
    client_name: 'Natasha Poonawalla',
    phone: '+91 98229 00111',
    email: 'natasha.p@poonawallagroup.com',
    lead_source_id: 'Direct Referral',
    budget_min: 55000000,
    budget_max: 85000000,
    preferred_location: 'Boat Club Road',
    property_type: 'Penthouse',
    configuration: '5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 4800,
    purpose: 'Luxury Residence',
    assigned_to: 'agent-tanmay-06',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-08',
    status: 'Hot',
    is_active: true,
    notes: 'Ultra High Net Worth client. Requesting duplex terrace with 4 dedicated parking slots.',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-015',
    client_name: 'Amitav Ghosh',
    phone: '+91 98900 11223',
    email: 'amitav@ghoshcapital.com',
    lead_source_id: 'Channel Partner',
    budget_min: 25000000,
    budget_max: 35000000,
    preferred_location: 'Balewadi',
    property_type: 'Commercial',
    configuration: 'Office Space',
    category: 'Commercial',
    transaction_type: 'Outright',
    required_area: 2500,
    purpose: 'Investment Yield',
    assigned_to: 'agent-tanmay-06',
    stage_id: 'Closure',
    next_followup_date: '2026-09-10',
    status: 'Closed',
    is_active: true,
    notes: 'Targeting minimum 8.5% rental yield. Deal finalized on corporate office floor.',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-016',
    client_name: 'Priya & Abhishek Sharma',
    phone: '+91 98811 44552',
    email: 'priya.sharma@cybertech.org',
    lead_source_id: '99acres',
    budget_min: 10500000,
    budget_max: 13000000,
    preferred_location: 'Kharadi',
    property_type: 'Apartment',
    configuration: '2.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1280,
    purpose: 'First Home',
    assigned_to: 'agent-rishi-01',
    stage_id: 'New inquiry',
    next_followup_date: '2026-09-03',
    status: 'Warm',
    is_active: true,
    notes: 'IT professionals at EON Free Zone. Looking for quick possession with modular fittings.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-017',
    client_name: 'Farhan & Zeenat Merchant',
    phone: '+91 98810 77889',
    email: 'farhan.merchant@logistics.com',
    lead_source_id: 'Direct Referral',
    budget_min: 32000000,
    budget_max: 42000000,
    preferred_location: 'Hadapsar',
    property_type: 'Apartment',
    configuration: '4 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 2900,
    purpose: 'Upgrade',
    assigned_to: 'agent-pooja-05',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-07',
    status: 'Hot',
    is_active: true,
    notes: 'Highly interested in Yoo Pune Starck design. Cheque ready for token advance.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-018',
    client_name: 'Neha & Rahul Verma',
    phone: '+91 98220 44556',
    email: 'rahul.verma@finconsult.in',
    lead_source_id: 'Website',
    budget_min: 12500000,
    budget_max: 16000000,
    preferred_location: 'Kalyani Nagar',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1680,
    purpose: 'Primary Residence',
    assigned_to: 'agent-benazir-02',
    stage_id: 'New inquiry',
    next_followup_date: '2026-09-04',
    status: 'Hot',
    is_active: true,
    notes: 'Looking for riverfront facing unit with 2 covered car parks in Kalyani Nagar.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-019',
    client_name: 'Capt. Rajesh Nair',
    phone: '+91 98223 33112',
    email: 'rajesh.nair@aviation.in',
    lead_source_id: 'Website',
    budget_min: 15500000,
    budget_max: 19500000,
    preferred_location: 'Viman Nagar',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1750,
    purpose: 'Self Use',
    assigned_to: 'agent-pooja-05',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-05',
    status: 'Hot',
    is_active: true,
    notes: 'Airline commander requesting proximity to Pune airport and gated community.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-020',
    client_name: 'Dr. Cyrus & Pervin Mistry',
    phone: '+91 98230 11990',
    email: 'cyrus.mistry@puneheart.org',
    lead_source_id: 'Direct Referral',
    budget_min: 65000000,
    budget_max: 95000000,
    preferred_location: 'Koregaon Park',
    property_type: 'Villa',
    configuration: '5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 5200,
    purpose: 'Luxury Estate',
    assigned_to: 'agent-vikram-04',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-09',
    status: 'Hot',
    is_active: true,
    notes: 'Senior cardiologist seeking private standalone bungalow with lush garden frontage.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-021',
    client_name: 'Harshwardhan Patil',
    phone: '+91 98901 22334',
    email: 'patil.enterprises@sugarcorp.in',
    lead_source_id: 'Magicbricks',
    budget_min: 30000000,
    budget_max: 48000000,
    preferred_location: 'Kharadi',
    property_type: 'Commercial',
    configuration: 'Showroom',
    category: 'Commercial',
    transaction_type: 'Outright',
    required_area: 3200,
    purpose: 'Automotive Dealership',
    assigned_to: 'agent-hamirr-03',
    stage_id: 'New inquiry',
    next_followup_date: '2026-09-06',
    status: 'Hot',
    is_active: true,
    notes: 'Main road frontage showroom with 40ft clear glass facade required.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-022',
    client_name: 'Aditi & Kunal Singhal',
    phone: '+91 97654 33221',
    email: 'kunal.singhal@fintech.co',
    lead_source_id: 'Instagram',
    budget_min: 10500000,
    budget_max: 13500000,
    preferred_location: 'Kharadi',
    property_type: 'Apartment',
    configuration: '2.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1250,
    purpose: 'First Home',
    assigned_to: 'agent-rishi-01',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-03',
    status: 'Warm',
    is_active: true,
    notes: 'Interested in clubhouse amenities and swimming pool for children.',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-023',
    client_name: 'Siddharth Malhotra',
    phone: '+91 97663 88990',
    email: 'siddharth.m@aerospace.com',
    lead_source_id: 'Website',
    budget_min: 14000000,
    budget_max: 18000000,
    preferred_location: 'Baner',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1600,
    purpose: 'Self Use',
    assigned_to: 'agent-pooja-05',
    stage_id: 'Follow up',
    next_followup_date: '2026-09-05',
    status: 'Hot',
    is_active: true,
    notes: 'High floor apartment with balcony view towards Baner hills.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-024',
    client_name: 'Sunita & Mahesh Agarwal',
    phone: '+91 98902 55443',
    email: 'mahesh.agarwal@textiles.in',
    lead_source_id: 'Direct Referral',
    budget_min: 14500000,
    budget_max: 18500000,
    preferred_location: 'Kalyani Nagar',
    property_type: 'Apartment',
    configuration: '3 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1700,
    purpose: 'Family Residence',
    assigned_to: 'agent-benazir-02',
    stage_id: 'Closure',
    next_followup_date: '2026-09-12',
    status: 'Closed',
    is_active: true,
    notes: 'Agreement signed. Loan disbursement completed through ICICI Bank.',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-025',
    client_name: 'Kabir & Tanya Oberoi',
    phone: '+91 98229 77889',
    email: 'kabir.oberoi@oberoihospitality.com',
    lead_source_id: 'Instagram',
    budget_min: 44000000,
    budget_max: 56000000,
    preferred_location: 'Kalyani Nagar',
    property_type: 'Sky Villa',
    configuration: '4.5 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 3450,
    purpose: 'Luxury Upgrade',
    assigned_to: 'agent-rishi-01',
    stage_id: 'Site visit',
    next_followup_date: '2026-09-06',
    status: 'Hot',
    is_active: true,
    notes: 'Interested in Trump Towers East Wing. VIP site tour confirmed.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lead-026',
    client_name: 'Ketan & Shweta Parekh',
    phone: '+91 98231 66778',
    email: 'ketan.parekh@fintech.co',
    lead_source_id: '99acres',
    budget_min: 8500000,
    budget_max: 11500000,
    preferred_location: 'Kharadi',
    property_type: 'Apartment',
    configuration: '2 BHK',
    category: 'Residential',
    transaction_type: 'Outright',
    required_area: 1100,
    purpose: 'First Home',
    assigned_to: 'agent-pooja-05',
    stage_id: 'New inquiry',
    next_followup_date: '2026-09-07',
    status: 'Warm',
    is_active: true,
    notes: 'Budget conscious tech couple. Ready to close upon good construction milestone discount.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
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
  },
  {
    id: 'prop-009',
    title: 'Pristine Kyra Luxury Suites',
    property_code: 'PK-402',
    location: 'Kalyani Nagar',
    address: 'Central Kalyani Nagar, Pune',
    property_type: 'Apartment',
    configuration: '3 BHK',
    carpet_area: 1720,
    built_up_area: 2200,
    price: 14200000,
    status_id: 'Available',
    listing_type: 'Exclusive',
    source_type: 'Developer Direct',
    owner_name: 'Pristine Properties',
    owner_contact: '+91 20 6700 1200',
    unit_no: 'A-402',
    brokerage: '2%',
    description: 'Ultra-modern 3 BHK with smart home automation, expansive sundecks, and Olympic sized pool.',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-010',
    title: 'Power Heights Corporate IT Park',
    property_code: 'PH-601',
    location: 'Kharadi',
    address: 'World Trade Center Annex, Kharadi, Pune',
    property_type: 'Commercial',
    configuration: 'Office Space',
    carpet_area: 2400,
    built_up_area: 3100,
    price: 28000000,
    status_id: 'Available',
    listing_type: 'Exclusive',
    source_type: 'Developer Direct',
    owner_name: 'Power Group Infrastructure',
    owner_contact: '+91 20 6700 8800',
    unit_no: 'Tower 1 - 601',
    brokerage: '2%',
    description: 'Grade-A LEED Platinum certified commercial office space with 100% power backup and cafeteria.',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-011',
    title: 'Vivencia Villa Reserve',
    property_code: 'VVR-08',
    location: 'Koregaon Park',
    address: 'Lane 5, Koregaon Park, Pune',
    property_type: 'Villa',
    configuration: '5 BHK',
    carpet_area: 5200,
    built_up_area: 6800,
    price: 75000000,
    status_id: 'Available',
    listing_type: 'Exclusive',
    source_type: 'Mandate',
    owner_name: 'Vivencia Luxury Estates',
    owner_contact: '+91 20 6700 9900',
    unit_no: 'Villa 08',
    brokerage: '2.5%',
    description: 'Custom architectural masterpiece villa with private landscaped garden, servant quarters, and home cinema.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'prop-012',
    title: 'NYATI Evoque Prime Residences',
    property_code: 'NE-903',
    location: 'Kalyani Nagar',
    address: 'North Main Road Extension, Pune',
    property_type: 'Apartment',
    configuration: '3 BHK',
    carpet_area: 1780,
    built_up_area: 2300,
    price: 15500000,
    status_id: 'Available',
    listing_type: 'Exclusive',
    source_type: 'Developer Direct',
    owner_name: 'Nyati Group',
    owner_contact: '+91 20 6700 7700',
    unit_no: 'T2-903',
    brokerage: '2%',
    description: 'Bespoke residences with private elevator foyer, EV-ready car parks, and club lounge access.',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
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
    // fallback
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('luxe-leads-store');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length >= SEED_LEADS.length) {
          return parsed;
        } else if (Array.isArray(parsed)) {
          // Merge newly added seed leads with user's local edits
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const newSeeds = SEED_LEADS.filter(s => !existingIds.has(s.id));
          const merged = [...parsed, ...newSeeds];
          localStorage.setItem('luxe-leads-store', JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        // use default seed
      }
    }
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
    // fallback
  }

  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('luxe-properties-store');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length >= SEED_PROPERTIES.length) {
          return parsed;
        } else if (Array.isArray(parsed)) {
          const existingIds = new Set(parsed.map((p: any) => p.id));
          const newSeeds = SEED_PROPERTIES.filter(s => !existingIds.has(s.id));
          const merged = [...parsed, ...newSeeds];
          localStorage.setItem('luxe-properties-store', JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        // use default seed
      }
    }
    localStorage.setItem('luxe-properties-store', JSON.stringify(SEED_PROPERTIES));
  }

  return SEED_PROPERTIES;
}

export async function fetchSalesPeople(): Promise<SalesPersonProfile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role');
    if (!error && data && data.length > 0) return data as SalesPersonProfile[];
  } catch {
    // fallback
  }
  return SEED_SALESPEOPLE;
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
