// src/lib/partners.ts - Channel Partners & Commission Data Layer with Cloudflare D1 Sync
import { queryD1, upsertD1Record } from '@/lib/db';

export interface ChannelPartner {
  id: string;
  firm_name: string;
  contact_person: string;
  phone: string;
  email: string;
  rera_number: string;
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Registered';
  commission_rate: number;
  active_leads: number;
  site_visits: number;
  negotiations: number;
  bookings: number;
  delivered_revenue: number;
  accrued_commission: number;
  paid_commission: number;
}

export interface CommissionEntry {
  id: string;
  deal_id: string;
  client_name: string;
  property_title: string;
  unit_number: string;
  booking_value: number;
  commission_rate: number;
  total_commission: number;
  paid_amount: number;
  pending_amount: number;
  recipient_type: 'Channel Partner' | 'Sales Executive';
  recipient_name: string;
  status: 'Fully Paid' | 'Partially Paid' | 'Pending Approval';
  last_payout_date?: string;
}

export const SEED_CHANNEL_PARTNERS: ChannelPartner[] = [
  {
    id: 'cp-1',
    firm_name: 'ABC Realty Consultants',
    contact_person: 'Anil Agarwal',
    phone: '+91 98200 77889',
    email: 'anil@abcrealty.in',
    rera_number: 'A52100001234',
    tier: 'Diamond',
    commission_rate: 2.0,
    active_leads: 24,
    site_visits: 13,
    negotiations: 6,
    bookings: 3,
    delivered_revenue: 48000000, // ₹4.8 Cr
    accrued_commission: 960000,   // ₹9.6 L
    paid_commission: 500000
  },
  {
    id: 'cp-2',
    firm_name: 'ANAROCK Property Consultants',
    contact_person: 'Siddharth Rao',
    phone: '+91 99100 88990',
    email: 'siddharth.r@anarock.com',
    rera_number: 'A52100009876',
    tier: 'Platinum',
    commission_rate: 2.0,
    active_leads: 42,
    site_visits: 28,
    negotiations: 12,
    bookings: 8,
    delivered_revenue: 102000000, // ₹10.2 Cr
    accrued_commission: 2040000,   // ₹20.4 L
    paid_commission: 1500000
  },
  {
    id: 'cp-3',
    firm_name: 'Knight Frank India',
    contact_person: 'Kavita Chawla',
    phone: '+91 97100 33445',
    email: 'kavita.c@knightfrank.com',
    rera_number: 'A52100004567',
    tier: 'Platinum',
    commission_rate: 2.0,
    active_leads: 31,
    site_visits: 19,
    negotiations: 8,
    bookings: 5,
    delivered_revenue: 78000000, // ₹7.8 Cr
    accrued_commission: 1560000,  // ₹15.6 L
    paid_commission: 1000000
  },
  {
    id: 'cp-4',
    firm_name: 'Square Yards Premier',
    contact_person: 'Deepak Saxena',
    phone: '+91 98400 11223',
    email: 'deepak.s@squareyards.co.in',
    rera_number: 'A52100003322',
    tier: 'Gold',
    commission_rate: 1.75,
    active_leads: 18,
    site_visits: 9,
    negotiations: 3,
    bookings: 2,
    delivered_revenue: 29000000, // ₹2.9 Cr
    accrued_commission: 507500,
    paid_commission: 300000
  }
];

export const SEED_COMMISSIONS: CommissionEntry[] = [
  {
    id: 'comm-1',
    deal_id: 'tx-1',
    client_name: 'Sandesh Kulkarni',
    property_title: 'Luxe Azure Palms - Tower A',
    unit_number: 'A-1204',
    booking_value: 13500000, // ₹1.35 Cr
    commission_rate: 2.0,
    total_commission: 270000, // ₹2.70 L
    paid_amount: 150000,
    pending_amount: 120000,
    recipient_type: 'Channel Partner',
    recipient_name: 'ABC Realty Consultants',
    status: 'Partially Paid',
    last_payout_date: '2026-09-01'
  },
  {
    id: 'comm-2',
    deal_id: 'tx-2',
    client_name: 'Ananya Sharma',
    property_title: 'Pristine Kyra Luxury Suites',
    unit_number: 'B-1602',
    booking_value: 31000000, // ₹3.10 Cr
    commission_rate: 2.0,
    total_commission: 620000, // ₹6.20 L
    paid_amount: 620000,
    pending_amount: 0,
    recipient_type: 'Channel Partner',
    recipient_name: 'ANAROCK Property Consultants',
    status: 'Fully Paid',
    last_payout_date: '2026-08-25'
  },
  {
    id: 'comm-3',
    deal_id: 'tx-3',
    client_name: 'Vikram Malhotra',
    property_title: 'Power Heights Corporate IT Park',
    unit_number: 'E-0801',
    booking_value: 14800000, // ₹1.48 Cr
    commission_rate: 1.0,
    total_commission: 148000,
    paid_amount: 0,
    pending_amount: 148000,
    recipient_type: 'Sales Executive',
    recipient_name: 'Rishi Mahboobani (In-House)',
    status: 'Pending Approval'
  },
  {
    id: 'comm-4',
    deal_id: 'tx-4',
    client_name: 'Rajesh & Sunita Gupta',
    property_title: 'Vivencia Villa Reserve',
    unit_number: 'V-08',
    booking_value: 48000000, // ₹4.80 Cr
    commission_rate: 2.0,
    total_commission: 960000, // ₹9.60 L
    paid_amount: 960000,
    pending_amount: 0,
    recipient_type: 'Channel Partner',
    recipient_name: 'Knight Frank India',
    status: 'Fully Paid',
    last_payout_date: '2026-09-02'
  },
  {
    id: 'comm-5',
    deal_id: 'tx-5',
    client_name: 'Rajiv & Meera Bajaj',
    property_title: 'Baner Pinnacle Skyline Duplex',
    unit_number: 'P-1801',
    booking_value: 32000000, // ₹3.20 Cr
    commission_rate: 1.75,
    total_commission: 560000, // ₹5.60 L
    paid_amount: 560000,
    pending_amount: 0,
    recipient_type: 'Channel Partner',
    recipient_name: 'Square Yards Premier',
    status: 'Fully Paid',
    last_payout_date: '2026-08-30'
  },
  {
    id: 'comm-6',
    deal_id: 'tx-6',
    client_name: 'Dr. K. S. Venkataraman',
    property_title: 'Solitaire Grand Penthouse',
    unit_number: 'PH-01',
    booking_value: 62000000, // ₹6.20 Cr
    commission_rate: 1.0,
    total_commission: 620000, // ₹6.20 L
    paid_amount: 0,
    pending_amount: 620000,
    recipient_type: 'Sales Executive',
    recipient_name: 'Pooja Hegde (In-House)',
    status: 'Pending Approval'
  }
];

import { loadEntity, saveEntityBatch, saveEntity } from '@/lib/dataStore';

export async function fetchChannelPartners(): Promise<ChannelPartner[]> {
  return loadEntity<ChannelPartner>('channel_partners', SEED_CHANNEL_PARTNERS);
}

export async function saveChannelPartners(data: ChannelPartner[]): Promise<void> {
  await saveEntityBatch('channel_partners', data);
}

export async function saveChannelPartner(partner: ChannelPartner): Promise<void> {
  await saveEntity('channel_partners', partner);
}

export async function fetchCommissions(): Promise<CommissionEntry[]> {
  return loadEntity<CommissionEntry>('commissions', SEED_COMMISSIONS);
}

export async function saveCommissions(data: CommissionEntry[]): Promise<void> {
  await saveEntityBatch('commissions', data);
}

export async function saveCommission(comm: CommissionEntry): Promise<void> {
  await saveEntity('commissions', comm);
}
