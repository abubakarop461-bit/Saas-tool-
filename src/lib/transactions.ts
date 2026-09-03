// src/lib/transactions.ts - Deals & Transactions Data Access Layer
import { supabase } from '@/lib/supabaseClient';
import { loadEntity, saveEntityBatch, saveEntity } from '@/lib/dataStore';
import type { Property } from '@/lib/queries';
import type { DeveloperUnit } from '@/lib/inventory';

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
  property_id?: string;
  unit_id?: string;
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
    property_id: 'prop-001',
    client_name: 'Sandesh Kulkarni',
    client_phone: '+91-7838556636',
    client_email: 'sandesh.kulkarni@techcorp.in',
    property_title: 'Luxe Azure Palms - Tower A',
    tower: 'Tower A',
    unit_number: 'A-1204',
    configuration: '3 BHK',
    deal_value: 13500000,
    token_amount: 500000,
    booking_status: 'Confirmed',
    current_stage: 'Booking',
    sales_agent: 'Rishi Mahboobani',
    channel_partner: 'ABC Realty Consultants',
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
    property_id: 'prop-004',
    client_name: 'Ananya Sharma',
    client_phone: '+91 98200 11223',
    client_email: 'ananya.s@infotech.in',
    property_title: 'Pristine Kyra Luxury Suites',
    tower: 'Tower B',
    unit_number: 'B-1602',
    configuration: '4 BHK',
    deal_value: 31000000,
    token_amount: 1000000,
    booking_status: 'Confirmed',
    current_stage: 'Agreement',
    sales_agent: 'Vikram Seth',
    channel_partner: 'ANAROCK Property Consultants',
    booking_date: '2026-08-20',
    expected_closure_date: '2026-09-05',
    payment_schedule: [
      { id: 'm-1', name: 'Token Amount', amount: 1000000, dueDate: '2026-08-20', status: 'Paid', paidDate: '2026-08-20' },
      { id: 'm-2', name: 'Agreement & Stamp Duty (15%)', amount: 4500000, dueDate: '2026-09-05', status: 'Paid', paidDate: '2026-09-04' },
      { id: 'm-3', name: 'Structure Milestone (32%)', amount: 10000000, dueDate: '2026-11-15', status: 'Pending' },
      { id: 'm-4', name: 'Possession & Handover Balance', amount: 15500000, dueDate: '2027-03-31', status: 'Pending' }
    ],
    notes: 'Stamp duty completed. Agreement signed and registered.'
  }
];

export async function fetchTransactions(): Promise<DealTransaction[]> {
  const loaded = await loadEntity<DealTransaction>('transactions', SEED_TRANSACTIONS);
  return loaded;
}

export async function saveTransactions(txs: DealTransaction[]): Promise<void> {
  await saveEntityBatch('transactions', txs);
}

export async function saveTransaction(tx: DealTransaction): Promise<void> {
  await saveEntity('transactions', tx);
}

/**
 * Creates or updates a transaction when a Property is marked as Booked or Sold.
 * If status is changed back to Available/Hold, it cleanly removes it from the Transactions pipeline.
 */
export async function syncTransactionForProperty(property: Property, newStatus: string): Promise<void> {
  const isBooked = ['Booked', 'Sold', 'Done', 'Token', 'Under Offer'].includes(newStatus);
  const txId = `tx-prop-${property.id}`;
  const existing = await fetchTransactions();

  if (isBooked) {
    const val = property.price || 15000000;
    const tokenVal = Math.round(val * 0.05);
    const agreementVal = Math.round(val * 0.15);
    const milestoneVal = Math.round(val * 0.40);
    const balanceVal = val - tokenVal - agreementVal - milestoneVal;
    const isSold = newStatus === 'Sold' || newStatus === 'Done';

    const tx: DealTransaction = {
      id: txId,
      property_id: property.id,
      client_name: property.owner_name || 'Booked Client',
      client_phone: property.owner_contact || '+91 98220 54321',
      property_title: property.title,
      tower: 'Main Tower',
      unit_number: property.unit_no || 'Unit #1',
      configuration: property.configuration || '3 BHK',
      deal_value: val,
      token_amount: tokenVal,
      booking_status: isSold ? 'Completed' : 'Confirmed',
      current_stage: isSold ? 'Possession' : (newStatus === 'Token' ? 'Token / EOI' : 'Booking'),
      sales_agent: 'Rishi Mahboobani',
      channel_partner: property.source_type === 'Broker' ? (property.brokerage || 'Partner Channel') : 'Direct In-House',
      booking_date: new Date().toISOString().split('T')[0],
      expected_closure_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      payment_schedule: [
        { id: `m-${txId}-1`, name: 'Token / EOI (5%)', amount: tokenVal, dueDate: new Date().toISOString().split('T')[0], status: 'Paid', paidDate: new Date().toISOString().split('T')[0] },
        { id: `m-${txId}-2`, name: 'Agreement (15%)', amount: agreementVal, dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], status: isSold ? 'Paid' : 'Pending' },
        { id: `m-${txId}-3`, name: 'Construction Milestone (40%)', amount: milestoneVal, dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0], status: isSold ? 'Paid' : 'Pending' },
        { id: `m-${txId}-4`, name: 'Final Handover & Possession', amount: balanceVal, dueDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0], status: isSold ? 'Paid' : 'Pending' }
      ],
      notes: `Direct property listing booking generated from Properties Console.`
    };

    const updated = [tx, ...existing.filter(t => t.id !== txId && t.property_id !== property.id)];
    await saveTransactions(updated);
  } else {
    // If not booked/sold, remove from active transactions
    const filtered = existing.filter(t => t.id !== txId && t.property_id !== property.id);
    await saveTransactions(filtered);
  }
}

/**
 * Creates or updates a transaction when a Unit in a Project is marked as Booked or Token.
 */
export async function syncTransactionForUnit(unit: DeveloperUnit, newStatus: string): Promise<void> {
  const isBooked = ['Booked', 'Sold', 'Token', 'Done'].includes(newStatus);
  const txId = `tx-unit-${unit.id}`;
  const existing = await fetchTransactions();

  if (isBooked) {
    const val = unit.base_price || 20000000;
    const tokenVal = Math.round(val * 0.05);
    const agreementVal = Math.round(val * 0.15);
    const milestoneVal = Math.round(val * 0.40);
    const balanceVal = val - tokenVal - agreementVal - milestoneVal;
    const isSold = newStatus === 'Sold' || newStatus === 'Done';

    const tx: DealTransaction = {
      id: txId,
      property_id: unit.property_id,
      unit_id: unit.id,
      client_name: unit.buyer_name || 'Booked Client',
      client_phone: '+91 98220 77889',
      property_title: unit.project_title,
      tower: unit.tower,
      unit_number: unit.unit_number,
      configuration: unit.configuration,
      deal_value: val,
      token_amount: tokenVal,
      booking_status: isSold ? 'Completed' : 'Confirmed',
      current_stage: isSold ? 'Possession' : (newStatus === 'Token' ? 'Token / EOI' : 'Booking'),
      sales_agent: unit.agent_name || 'Rishi Mahboobani',
      channel_partner: 'In-House Developer Mandate',
      booking_date: new Date().toISOString().split('T')[0],
      expected_closure_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      payment_schedule: [
        { id: `m-${txId}-1`, name: 'Token / EOI (5%)', amount: tokenVal, dueDate: new Date().toISOString().split('T')[0], status: 'Paid', paidDate: new Date().toISOString().split('T')[0] },
        { id: `m-${txId}-2`, name: 'Agreement (15%)', amount: agreementVal, dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], status: isSold ? 'Paid' : 'Pending' },
        { id: `m-${txId}-3`, name: 'Structure Milestone (40%)', amount: milestoneVal, dueDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0], status: isSold ? 'Paid' : 'Pending' },
        { id: `m-${txId}-4`, name: 'Final Handover & Registration', amount: balanceVal, dueDate: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0], status: isSold ? 'Paid' : 'Pending' }
      ],
      notes: `Project unit booking synced from Building Inventory Console.`
    };

    const updated = [tx, ...existing.filter(t => t.id !== txId && t.unit_id !== unit.id)];
    await saveTransactions(updated);
  } else {
    // If not booked/sold, remove from active transactions
    const filtered = existing.filter(t => t.id !== txId && t.unit_id !== unit.id);
    await saveTransactions(filtered);
  }
}
