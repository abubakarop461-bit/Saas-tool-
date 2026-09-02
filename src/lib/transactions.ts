// src/lib/transactions.ts - Deals & Transactions Data Access Layer
import { supabase } from '@/lib/supabaseClient';

export type TransactionStage = 
  | 'Lead'
  | 'Qualified'
  | 'Site Visit'
  | 'Follow-up'
  | 'Negotiation'
  | 'Token / EOI'
  | 'Booking'
  | 'Agreement'
  | 'Payment'
  | 'Registration'
  | 'Possession';

export const ALL_TRANSACTION_STAGES: TransactionStage[] = [
  'Lead',
  'Qualified',
  'Site Visit',
  'Follow-up',
  'Negotiation',
  'Token / EOI',
  'Booking',
  'Agreement',
  'Payment',
  'Registration',
  'Possession'
];

export interface PaymentMilestone {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidDate?: string;
}

export interface DealTransaction {
  id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  property_title: string;
  tower: string;
  unit_number: string;
  configuration: string;
  deal_value: number;
  token_amount: number;
  booking_status: 'Confirmed' | 'Draft' | 'Under Legal Review' | 'Completed';
  current_stage: TransactionStage;
  sales_agent: string;
  channel_partner: string;
  booking_date: string;
  expected_closure_date: string;
  payment_schedule: PaymentMilestone[];
  notes?: string;
}

export const SEED_TRANSACTIONS: DealTransaction[] = [
  {
    id: 'tx-1',
    client_name: 'Sandesh Kulkarni',
    client_phone: '+91 98200 44556',
    client_email: 'sandesh.k@kulkarnigroup.in',
    property_title: 'Luxe Azure Palms - Tower A',
    tower: 'A',
    unit_number: 'A-1204',
    configuration: '3 BHK',
    deal_value: 13500000, // ₹1.35 Cr
    token_amount: 500000,  // ₹5 L
    booking_status: 'Confirmed',
    current_stage: 'Booking',
    sales_agent: 'Rishi Mahboobani',
    channel_partner: 'ABC Realty',
    booking_date: '2026-09-01',
    expected_closure_date: '2026-09-15',
    payment_schedule: [
      { id: 'm-1', name: 'Token / EOI', amount: 500000, dueDate: '2026-09-01', status: 'Paid', paidDate: '2026-09-01' },
      { id: 'm-2', name: 'Agreement (15%)', amount: 2000000, dueDate: '2026-09-15', status: 'Pending' },
      { id: 'm-3', name: '1st Installment (Plinth)', amount: 3000000, dueDate: '2026-10-15', status: 'Pending' },
      { id: 'm-4', name: 'Final Handover & Registration', amount: 8000000, dueDate: '2026-12-30', status: 'Pending' }
    ],
    notes: 'Customer requires agreement draft before Sep 10. Home loan pre-approved with HDFC.'
  },
  {
    id: 'tx-2',
    client_name: 'Ananya Sharma',
    client_phone: '+91 98200 11223',
    client_email: 'ananya.s@gmail.com',
    property_title: 'Pristine Kyra',
    tower: 'B',
    unit_number: 'B-1602',
    configuration: '4 BHK',
    deal_value: 31000000, // ₹3.10 Cr
    token_amount: 1000000, // ₹10 L
    booking_status: 'Confirmed',
    current_stage: 'Agreement',
    sales_agent: 'Vikram Seth',
    channel_partner: 'ANAROCK Property Consultants',
    booking_date: '2026-08-20',
    expected_closure_date: '2026-09-05',
    payment_schedule: [
      { id: 'm-1', name: 'Token Amount', amount: 1000000, dueDate: '2026-08-20', status: 'Paid', paidDate: '2026-08-20' },
      { id: 'm-2', name: 'Agreement Stamp Duty', amount: 4500000, dueDate: '2026-09-05', status: 'Paid', paidDate: '2026-09-04' },
      { id: 'm-3', name: 'Structure Milestone', amount: 10000000, dueDate: '2026-11-15', status: 'Pending' },
      { id: 'm-4', name: 'Possession Balance', amount: 15500000, dueDate: '2027-03-31', status: 'Pending' }
    ],
    notes: 'Stamp duty completed. Agreement signed and registered.'
  },
  {
    id: 'tx-3',
    client_name: 'Vikram Malhotra',
    client_phone: '+91 99100 55443',
    client_email: 'vikram.m@corporatespace.in',
    property_title: 'Power Heights',
    tower: 'East Tower',
    unit_number: 'E-0801',
    configuration: '3 BHK',
    deal_value: 14800000, // ₹1.48 Cr
    token_amount: 500000,
    booking_status: 'Draft',
    current_stage: 'Token / EOI',
    sales_agent: 'Rishi Mahboobani',
    channel_partner: 'Direct In-House',
    booking_date: '2026-09-01',
    expected_closure_date: '2026-09-20',
    payment_schedule: [
      { id: 'm-1', name: 'Token Amount', amount: 500000, dueDate: '2026-09-01', status: 'Paid', paidDate: '2026-09-01' },
      { id: 'm-2', name: 'Agreement (20%)', amount: 2460000, dueDate: '2026-09-20', status: 'Pending' },
      { id: 'm-3', name: 'Possession Balance', amount: 11840000, dueDate: '2027-01-31', status: 'Pending' }
    ],
    notes: 'Token cheque deposited in escrow.'
  },
  {
    id: 'tx-4',
    client_name: 'Rajiv & Meera Bajaj',
    client_phone: '+91 98220 99123',
    client_email: 'rajiv.bajaj@automotive-pune.com',
    property_title: 'Baner Pinnacle Skyline Duplex',
    tower: 'Pinnacle Tower',
    unit_number: 'P-1801',
    configuration: '5 BHK Villa',
    deal_value: 62000000, // ₹6.20 Cr
    token_amount: 2500000,
    booking_status: 'Completed',
    current_stage: 'Possession',
    sales_agent: 'Tanmay Deshpande',
    channel_partner: 'MagicBricks Luxury',
    booking_date: '2026-05-10',
    expected_closure_date: '2026-08-30',
    payment_schedule: [
      { id: 'm-1', name: 'Token Amount', amount: 2500000, dueDate: '2026-05-10', status: 'Paid', paidDate: '2026-05-10' },
      { id: 'm-2', name: 'Agreement (15%)', amount: 7200000, dueDate: '2026-05-30', status: 'Paid', paidDate: '2026-05-28' },
      { id: 'm-3', name: 'Stage Payments', amount: 42300000, dueDate: '2026-07-30', status: 'Paid', paidDate: '2026-07-25' },
      { id: 'm-4', name: 'Final Handover', amount: 10000000, dueDate: '2026-08-30', status: 'Paid', paidDate: '2026-08-30' }
    ],
    notes: 'Possession certificate and keys handed over. Attributed to MagicBricks Luxury lead Rajiv & Meera Bajaj.'
  }
];

import { loadEntity, saveEntityBatch, saveEntity } from '@/lib/dataStore';

export async function fetchTransactions(): Promise<DealTransaction[]> {
  return loadEntity<DealTransaction>('transactions', SEED_TRANSACTIONS);
}

export async function saveTransactions(txs: DealTransaction[]): Promise<void> {
  await saveEntityBatch('transactions', txs);
}

export async function saveTransaction(tx: DealTransaction): Promise<void> {
  await saveEntity('transactions', tx);
}
