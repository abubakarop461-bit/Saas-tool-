// src/lib/inventory.ts - Developer Unit Inventory Data Layer matching Properties Page
import { queryD1, upsertD1Record } from '@/lib/db';
import { SEED_PROPERTIES } from '@/lib/queries';

export type UnitStatus = 'Available' | 'Hold' | 'Token' | 'Negotiation' | 'Booked' | 'Sold';

export interface DeveloperUnit {
  id: string;
  property_id?: string;
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
  // ── 1. LUXE AZURE PALMS - TOWER A (Kalyani Nagar) ──
  {
    id: 'u-azure-1401',
    property_id: 'prop-001',
    project_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower A',
    floor: 14,
    unit_number: 'A-1401',
    configuration: '3 BHK',
    carpet_area: 1680,
    built_up_area: 2150,
    facing: 'East (Riverfront View)',
    base_price: 13900000,
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
    id: 'u-azure-1402',
    property_id: 'prop-001',
    project_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower A',
    floor: 14,
    unit_number: 'A-1402',
    configuration: '3.5 BHK',
    carpet_area: 1850,
    built_up_area: 2380,
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
    id: 'u-azure-1204',
    property_id: 'prop-001',
    project_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower A',
    floor: 12,
    unit_number: 'A-1204',
    configuration: '3 BHK',
    carpet_area: 1680,
    built_up_area: 2150,
    facing: 'East (Riverfront View)',
    base_price: 13500000,
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
    id: 'u-azure-1201',
    property_id: 'prop-001',
    project_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower A',
    floor: 12,
    unit_number: 'A-1201',
    configuration: '3 BHK',
    carpet_area: 1650,
    built_up_area: 2100,
    facing: 'North-East',
    base_price: 13400000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Hold',
    buyer_name: 'Vikramaditya Singhania',
    agent_name: 'Vikram Seth'
  },
  {
    id: 'u-azure-1001',
    property_id: 'prop-001',
    project_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower A',
    floor: 10,
    unit_number: 'A-1001',
    configuration: '3 BHK',
    carpet_area: 1650,
    built_up_area: 2100,
    facing: 'Garden Facing',
    base_price: 13200000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'December 2026',
    status: 'Sold',
    buyer_name: 'Rahul Agarwal',
    agent_name: 'Benazir Bhayani'
  },
  {
    id: 'u-azure-b-1401',
    property_id: 'prop-001',
    project_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower B',
    floor: 14,
    unit_number: 'B-1401',
    configuration: '3.5 BHK',
    carpet_area: 1880,
    built_up_area: 2420,
    facing: 'North-East',
    base_price: 15500000,
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
    id: 'u-azure-b-1201',
    property_id: 'prop-001',
    project_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower B',
    floor: 12,
    unit_number: 'B-1201',
    configuration: '3.5 BHK',
    carpet_area: 1880,
    built_up_area: 2420,
    facing: 'East Facing',
    base_price: 15300000,
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

  // ── 2. TRUMP TOWERS PUNE - WEST WING (Kalyani Nagar) ──
  {
    id: 'u-trump-2301',
    property_id: 'prop-002',
    project_title: 'Trump Towers Pune - West Wing',
    tower: 'West Wing',
    floor: 23,
    unit_number: 'TT-2301',
    configuration: '4.5 BHK',
    carpet_area: 3400,
    built_up_area: 4400,
    facing: '360 Skyline View',
    base_price: 49500000,
    floor_rise_rate: 100,
    parking_charges: 1500000,
    amenities_charges: 600000,
    other_charges: 300000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Available'
  },
  {
    id: 'u-trump-2201',
    property_id: 'prop-002',
    project_title: 'Trump Towers Pune - West Wing',
    tower: 'West Wing',
    floor: 22,
    unit_number: 'TT-2201',
    configuration: '4.5 BHK',
    carpet_area: 3400,
    built_up_area: 4400,
    facing: 'Private Elevator Foyer (East)',
    base_price: 48000000,
    floor_rise_rate: 100,
    parking_charges: 1500000,
    amenities_charges: 600000,
    other_charges: 300000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Hold',
    buyer_name: 'Sandesh Kulkarni',
    agent_name: 'Rishi Mahboobani'
  },
  {
    id: 'u-trump-2001',
    property_id: 'prop-002',
    project_title: 'Trump Towers Pune - West Wing',
    tower: 'West Wing',
    floor: 20,
    unit_number: 'TT-2001',
    configuration: '4.5 BHK',
    carpet_area: 3400,
    built_up_area: 4400,
    facing: 'Signature Park View',
    base_price: 47200000,
    floor_rise_rate: 100,
    parking_charges: 1500000,
    amenities_charges: 600000,
    other_charges: 300000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Booked',
    buyer_name: 'Adar Poonawalla',
    agent_name: 'Vikram Seth'
  },
  {
    id: 'u-trump-east-2201',
    property_id: 'prop-002',
    project_title: 'Trump Towers Pune - West Wing',
    tower: 'East Wing',
    floor: 22,
    unit_number: 'TTE-2201',
    configuration: '4.5 BHK',
    carpet_area: 3400,
    built_up_area: 4400,
    facing: 'Sunrise Boulevard',
    base_price: 48200000,
    floor_rise_rate: 100,
    parking_charges: 1500000,
    amenities_charges: 600000,
    other_charges: 300000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Available'
  },

  // ── 3. SOLITAIRE GRAND PENTHOUSE (Boat Club Road) ──
  {
    id: 'u-sol-ph01',
    property_id: 'prop-003',
    project_title: 'Solitaire Grand Penthouse',
    tower: 'Penthouse Deck',
    floor: 28,
    unit_number: 'SG-PH01',
    configuration: '5 BHK',
    carpet_area: 4200,
    built_up_area: 5500,
    facing: 'Waterfront Panoramic 360',
    base_price: 62000000,
    floor_rise_rate: 120,
    parking_charges: 2000000,
    amenities_charges: 800000,
    other_charges: 400000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'March 2027',
    status: 'Token',
    buyer_name: 'Rajiv & Meera Bajaj',
    agent_name: 'Benazir Bhayani'
  },
  {
    id: 'u-sol-ph02',
    property_id: 'prop-003',
    project_title: 'Solitaire Grand Penthouse',
    tower: 'Penthouse Deck',
    floor: 28,
    unit_number: 'SG-PH02',
    configuration: '5 BHK',
    carpet_area: 4200,
    built_up_area: 5500,
    facing: 'Skyline Terrace Jacuzzi',
    base_price: 63500000,
    floor_rise_rate: 120,
    parking_charges: 2000000,
    amenities_charges: 800000,
    other_charges: 400000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'March 2027',
    status: 'Available'
  },

  // ── 4. PANCHSHIL ONE NORTH RESIDENCES (Hadapsar) ──
  {
    id: 'u-on-802',
    property_id: 'prop-004',
    project_title: 'Panchshil One North Residences',
    tower: 'Tower C',
    floor: 8,
    unit_number: 'C-802',
    configuration: '3.5 BHK',
    carpet_area: 2250,
    built_up_area: 2900,
    facing: '70% Landscaped Greens',
    base_price: 24000000,
    floor_rise_rate: 60,
    parking_charges: 800000,
    amenities_charges: 400000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Available'
  },
  {
    id: 'u-on-1002',
    property_id: 'prop-004',
    project_title: 'Panchshil One North Residences',
    tower: 'Tower C',
    floor: 10,
    unit_number: 'C-1002',
    configuration: '3.5 BHK',
    carpet_area: 2250,
    built_up_area: 2900,
    facing: 'Squash Court View',
    base_price: 24600000,
    floor_rise_rate: 60,
    parking_charges: 800000,
    amenities_charges: 400000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Negotiation',
    buyer_name: 'Rohan Godbole',
    agent_name: 'Vikram Seth'
  },

  // ── 5. YOO PUNE DESIGNER RESIDENCES (Hadapsar) ──
  {
    id: 'u-yp-1403',
    property_id: 'prop-005',
    project_title: 'Yoo Pune Designer Residences',
    tower: 'Tower 1',
    floor: 14,
    unit_number: 'T-1403',
    configuration: '4 BHK',
    carpet_area: 2900,
    built_up_area: 3750,
    facing: 'Philippe Starck Rainforest Sanctuary',
    base_price: 36000000,
    floor_rise_rate: 80,
    parking_charges: 1200000,
    amenities_charges: 500000,
    other_charges: 250000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Negotiation',
    buyer_name: 'Farhan Merchant',
    agent_name: 'Pooja Hegde'
  },
  {
    id: 'u-yp-1601',
    property_id: 'prop-005',
    project_title: 'Yoo Pune Designer Residences',
    tower: 'Tower 1',
    floor: 16,
    unit_number: 'T-1601',
    configuration: '4 BHK',
    carpet_area: 2900,
    built_up_area: 3750,
    facing: 'Six Senses Sanctuary',
    base_price: 37200000,
    floor_rise_rate: 80,
    parking_charges: 1200000,
    amenities_charges: 500000,
    other_charges: 250000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Available'
  },

  // ── 6. BALEWADI SIGNATURE TOWERS (Balewadi) ──
  {
    id: 'u-bst-604',
    property_id: 'prop-006',
    project_title: 'Balewadi Signature Towers',
    tower: 'Tower B',
    floor: 6,
    unit_number: 'B-604',
    configuration: '3 BHK',
    carpet_area: 1550,
    built_up_area: 1980,
    facing: 'High Street Boulevard',
    base_price: 14500000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'June 2026',
    status: 'Available'
  },
  {
    id: 'u-bst-801',
    property_id: 'prop-006',
    project_title: 'Balewadi Signature Towers',
    tower: 'Tower B',
    floor: 8,
    unit_number: 'B-801',
    configuration: '3 BHK',
    carpet_area: 1550,
    built_up_area: 1980,
    facing: 'Clubhouse View',
    base_price: 14800000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'June 2026',
    status: 'Token',
    buyer_name: 'Amitav Ghosh',
    agent_name: 'Tanmay Deshpande'
  },

  // ── 7. KHARADI RIVERSIDE GRAND (Kharadi) ──
  {
    id: 'u-krg-1002',
    property_id: 'prop-007',
    project_title: 'Kharadi Riverside Grand',
    tower: 'Tower D',
    floor: 10,
    unit_number: 'D-1002',
    configuration: '2.5 BHK',
    carpet_area: 1280,
    built_up_area: 1650,
    facing: 'EON IT Park View',
    base_price: 11500000,
    floor_rise_rate: 45,
    parking_charges: 400000,
    amenities_charges: 250000,
    other_charges: 120000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'September 2026',
    status: 'Available'
  },
  {
    id: 'u-krg-1201',
    property_id: 'prop-007',
    project_title: 'Kharadi Riverside Grand',
    tower: 'Tower D',
    floor: 12,
    unit_number: 'D-1201',
    configuration: '2.5 BHK',
    carpet_area: 1280,
    built_up_area: 1650,
    facing: 'Rooftop Running Track View',
    base_price: 11800000,
    floor_rise_rate: 45,
    parking_charges: 400000,
    amenities_charges: 250000,
    other_charges: 120000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'September 2026',
    status: 'Hold',
    buyer_name: 'Priya & Abhishek Sharma',
    agent_name: 'Rishi Mahboobani'
  },

  // ── 8. BANER PINNACLE SKYLINE DUPLEX (Baner) ──
  {
    id: 'u-bps-1801',
    property_id: 'prop-008',
    project_title: 'Baner Pinnacle Skyline Duplex',
    tower: 'Pinnacle Tower',
    floor: 18,
    unit_number: 'P-1801',
    configuration: '4 BHK',
    carpet_area: 3100,
    built_up_area: 3950,
    facing: 'Baner Hills Sunset View',
    base_price: 32000000,
    floor_rise_rate: 75,
    parking_charges: 1000000,
    amenities_charges: 450000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Booked',
    buyer_name: 'Ananya Sharma',
    agent_name: 'Vikram Seth'
  },
  {
    id: 'u-bps-2001',
    property_id: 'prop-008',
    project_title: 'Baner Pinnacle Skyline Duplex',
    tower: 'Pinnacle Tower',
    floor: 20,
    unit_number: 'P-2001',
    configuration: '4 BHK',
    carpet_area: 3100,
    built_up_area: 3950,
    facing: 'Double Height Sunset Deck',
    base_price: 33500000,
    floor_rise_rate: 75,
    parking_charges: 1000000,
    amenities_charges: 450000,
    other_charges: 200000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Available'
  },

  // ── 9. PRISTINE KYRA LUXURY SUITES (Kalyani Nagar) ──
  {
    id: 'u-pk-402',
    property_id: 'prop-009',
    project_title: 'Pristine Kyra Luxury Suites',
    tower: 'Tower A',
    floor: 4,
    unit_number: 'A-402',
    configuration: '3 BHK',
    carpet_area: 1720,
    built_up_area: 2200,
    facing: 'Olympic Sized Pool View',
    base_price: 14200000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'October 2026',
    status: 'Available'
  },
  {
    id: 'u-pk-601',
    property_id: 'prop-009',
    project_title: 'Pristine Kyra Luxury Suites',
    tower: 'Tower A',
    floor: 6,
    unit_number: 'A-601',
    configuration: '3 BHK',
    carpet_area: 1720,
    built_up_area: 2200,
    facing: 'East Facing Sundeck',
    base_price: 14600000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'October 2026',
    status: 'Token',
    buyer_name: 'Sunita & Mahesh Agarwal',
    agent_name: 'Benazir Bhayani'
  },

  // ── 10. POWER HEIGHTS CORPORATE IT PARK (Kharadi) ──
  {
    id: 'u-ph-601',
    property_id: 'prop-010',
    project_title: 'Power Heights Corporate IT Park',
    tower: 'Tower 1',
    floor: 6,
    unit_number: 'T1-601',
    configuration: 'Office Space',
    carpet_area: 2400,
    built_up_area: 3100,
    facing: 'World Trade Center Facing',
    base_price: 28000000,
    floor_rise_rate: 70,
    parking_charges: 1000000,
    amenities_charges: 500000,
    other_charges: 250000,
    gst_rate: 18.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready for Fit-out',
    status: 'Available'
  },
  {
    id: 'u-ph-801',
    property_id: 'prop-010',
    project_title: 'Power Heights Corporate IT Park',
    tower: 'Tower 1',
    floor: 8,
    unit_number: 'T1-801',
    configuration: 'Office Space',
    carpet_area: 2400,
    built_up_area: 3100,
    facing: 'Corner Executive Floor',
    base_price: 29500000,
    floor_rise_rate: 70,
    parking_charges: 1000000,
    amenities_charges: 500000,
    other_charges: 250000,
    gst_rate: 18.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready for Fit-out',
    status: 'Hold',
    buyer_name: 'Vikram Malhotra',
    agent_name: 'Tanmay Deshpande'
  },

  // ── 11. VIVENCIA VILLA RESERVE (Koregaon Park) ──
  {
    id: 'u-vvr-08',
    property_id: 'prop-011',
    project_title: 'Vivencia Villa Reserve',
    tower: 'Villa Enclave',
    floor: 2,
    unit_number: 'Villa 08',
    configuration: '5 BHK',
    carpet_area: 5200,
    built_up_area: 6800,
    facing: 'Private Landscaped Lawn (East)',
    base_price: 75000000,
    floor_rise_rate: 0,
    parking_charges: 2500000,
    amenities_charges: 1000000,
    other_charges: 500000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Available'
  },
  {
    id: 'u-vvr-10',
    property_id: 'prop-011',
    project_title: 'Vivencia Villa Reserve',
    tower: 'Villa Enclave',
    floor: 2,
    unit_number: 'Villa 10',
    configuration: '5 BHK',
    carpet_area: 5200,
    built_up_area: 6800,
    facing: 'Private Swimming Pool Deck',
    base_price: 78000000,
    floor_rise_rate: 0,
    parking_charges: 2500000,
    amenities_charges: 1000000,
    other_charges: 500000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'Ready to Move',
    status: 'Token',
    buyer_name: 'Natasha Poonawalla',
    agent_name: 'Tanmay Deshpande'
  },

  // ── 12. NYATI EVOQUE PRIME RESIDENCES (Kalyani Nagar) ──
  {
    id: 'u-ne-903',
    property_id: 'prop-012',
    project_title: 'NYATI Evoque Prime Residences',
    tower: 'Tower 2',
    floor: 9,
    unit_number: 'T2-903',
    configuration: '3 BHK',
    carpet_area: 1780,
    built_up_area: 2300,
    facing: 'North Main Road Foyer',
    base_price: 15500000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'January 2027',
    status: 'Available'
  },
  {
    id: 'u-ne-1101',
    property_id: 'prop-012',
    project_title: 'NYATI Evoque Prime Residences',
    tower: 'Tower 2',
    floor: 11,
    unit_number: 'T2-1101',
    configuration: '3 BHK',
    carpet_area: 1780,
    built_up_area: 2300,
    facing: 'Club Lounge Facing',
    base_price: 15900000,
    floor_rise_rate: 50,
    parking_charges: 500000,
    amenities_charges: 300000,
    other_charges: 150000,
    gst_rate: 5.0,
    stamp_duty_rate: 6.0,
    registration_rate: 30000,
    possession_date: 'January 2027',
    status: 'Hold',
    buyer_name: 'Capt. Rajesh Nair',
    agent_name: 'Hamirr Jobnputra'
  }
];

import { loadEntity, saveEntityBatch, saveEntity } from '@/lib/dataStore';

/**
 * Procedurally project and generate developer units for any real estate project
 */
export function generateProjectUnits(params: {
  property_id?: string;
  project_title: string;
  towers: string[];
  total_floors: number;
  units_per_floor: number;
  configuration?: string;
  carpet_area?: number;
  built_up_area?: number;
  base_price?: number;
  possession_date?: string;
}): DeveloperUnit[] {
  const units: DeveloperUnit[] = [];
  const towersList = params.towers.length > 0 ? params.towers : ['Tower A'];
  const floorsCount = Math.max(1, Math.min(60, params.total_floors || 10));
  const unitsPerFloor = Math.max(1, Math.min(12, params.units_per_floor || 4));

  towersList.forEach(tower => {
    const towerPrefix = tower.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'T';
    for (let floor = 1; floor <= floorsCount; floor++) {
      for (let uIdx = 1; uIdx <= unitsPerFloor; uIdx++) {
        const unitSuffix = uIdx < 10 ? `0${uIdx}` : `${uIdx}`;
        const unitNumber = `${towerPrefix}-${floor}${unitSuffix}`;
        const id = `u-${params.property_id || 'proj'}-${towerPrefix.toLowerCase()}-${floor}${unitSuffix}`;

        units.push({
          id,
          property_id: params.property_id,
          project_title: params.project_title,
          tower,
          floor,
          unit_number: unitNumber,
          configuration: params.configuration || '3 BHK',
          carpet_area: params.carpet_area || 1450,
          built_up_area: params.built_up_area || Math.round((params.carpet_area || 1450) * 1.3),
          facing: uIdx % 2 === 0 ? 'Garden / Pool View' : 'City Skyline View',
          base_price: params.base_price || 13500000,
          floor_rise_rate: 50,
          parking_charges: 500000,
          amenities_charges: 300000,
          other_charges: 150000,
          gst_rate: 5.0,
          stamp_duty_rate: 6.0,
          registration_rate: 30000,
          possession_date: params.possession_date || 'December 2026',
          status: (floor === 1 && uIdx === 1) ? 'Booked' : (floor === 2 && uIdx === 1) ? 'Token' : 'Available'
        });
      }
    }
  });

  return units;
}

export async function syncPropertyInventoryUnits(params: {
  property_id?: string;
  project_title: string;
  towers: string[];
  total_floors: number;
  units_per_floor: number;
  configuration?: string;
  carpet_area?: number;
  built_up_area?: number;
  base_price?: number;
  possession_date?: string;
}): Promise<DeveloperUnit[]> {
  const currentUnits = await fetchDeveloperUnits();
  const newUnits = generateProjectUnits(params);

  // Filter out existing units for this project to prevent duplicates, then merge new projected units
  const otherUnits = currentUnits.filter(u => u.project_title.trim().toLowerCase() !== params.project_title.trim().toLowerCase());
  const combined = [...otherUnits, ...newUnits];

  await saveDeveloperUnits(combined);
  return combined;
}

export async function fetchDeveloperUnits(): Promise<DeveloperUnit[]> {
  return loadEntity<DeveloperUnit>('inventory', SEED_DEVELOPER_UNITS);
}

export async function saveDeveloperUnits(units: DeveloperUnit[]): Promise<void> {
  await saveEntityBatch('inventory', units);
}

export async function saveDeveloperUnit(unit: DeveloperUnit): Promise<void> {
  await saveEntity('inventory', unit);
}
