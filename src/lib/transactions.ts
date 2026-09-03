// src/lib/transactions.ts - Deals & Transactions Data Access Layer
import { supabase } from '@/lib/supabaseClient';
import { loadEntity, saveEntityBatch, saveEntity } from '@/lib/dataStore';
import { Property, SEED_PROPERTIES } from '@/lib/queries';
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

/**
 * Dynamically queries and returns ONLY properties and units that are currently Booked or Sold or under Token.
 */
export async function fetchTransactions(): Promise<DealTransaction[]> {
  try {
    const properties = await loadEntity<Property>('properties', SEED_PROPERTIES);
    const units = await loadEntity<DeveloperUnit>('inventory', []);
    const storedTxs = await loadEntity<DealTransaction>('transactions', []);
    const storedMap = new Map<string, DealTransaction>();
    storedTxs.forEach(t => {
      if (t.property_id) storedMap.set(`prop-${t.property_id}`, t);
      if (t.unit_id) storedMap.set(`unit-${t.unit_id}`, t);
    });

    const results: DealTransaction[] = [];

    // 1. Process all properties that are currently in Booked, Sold, or Token status
    properties.forEach(p => {
      const isBooked = ['Booked', 'Sold', 'Done', 'Token', 'Under Offer'].includes(p.status_id || '');
      if (isBooked) {
        const val = p.price || 15000000;
        const tokenVal = Math.round(val * 0.05);
        const agreementVal = Math.round(val * 0.15);
        const milestoneVal = Math.round(val * 0.40);
        const balanceVal = val - tokenVal - agreementVal - milestoneVal;
        const isSold = p.status_id === 'Sold' || p.status_id === 'Done';

        const custom = storedMap.get(`prop-${p.id}`);

        results.push({
          id: `tx-prop-${p.id}`,
          property_id: p.id,
          client_name: custom?.client_name || p.owner_name || 'Booked Client',
          client_phone: custom?.client_phone || p.owner_contact || '+91 98220 54321',
          client_email: custom?.client_email || `${(p.owner_name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
          property_title: p.title,
          tower: custom?.tower || 'Main Tower',
          unit_number: p.unit_no || 'Unit #1',
          configuration: p.configuration || '3 BHK',
          deal_value: custom?.deal_value || val,
          token_amount: custom?.token_amount || tokenVal,
          booking_status: isSold ? 'Completed' : 'Confirmed',
          current_stage: isSold ? 'Possession' : (p.status_id === 'Token' ? 'Token / EOI' : 'Booking'),
          sales_agent: custom?.sales_agent || 'Rishi Mahboobani',
          channel_partner: p.source_type === 'Broker' ? (p.brokerage || 'Partner Channel') : 'Direct In-House',
          booking_date: custom?.booking_date || (p.created_at ? p.created_at.split('T')[0] : '2026-09-01'),
          expected_closure_date: custom?.expected_closure_date || '2026-09-30',
          payment_schedule: custom?.payment_schedule || [
            { id: `m-${p.id}-1`, name: 'Token / EOI (5%)', amount: tokenVal, dueDate: '2026-09-01', status: 'Paid', paidDate: '2026-09-01' },
            { id: `m-${p.id}-2`, name: 'Agreement (15%)', amount: agreementVal, dueDate: '2026-09-15', status: isSold ? 'Paid' : 'Pending' },
            { id: `m-${p.id}-3`, name: 'Construction Milestone (40%)', amount: milestoneVal, dueDate: '2026-10-30', status: isSold ? 'Paid' : 'Pending' },
            { id: `m-${p.id}-4`, name: 'Final Handover & Possession', amount: balanceVal, dueDate: '2026-12-31', status: isSold ? 'Paid' : 'Pending' }
          ],
          notes: custom?.notes || `Direct listing booking record for ${p.title} (${p.property_code || 'PRP'}).`
        });
      }
    });

    // 2. Process all developer units that are currently in Booked, Sold, or Token status
    units.forEach(u => {
      const isBooked = ['Booked', 'Sold', 'Token'].includes(u.status as any);
      if (isBooked) {
        const val = u.base_price || 20000000;
        const tokenVal = Math.round(val * 0.05);
        const agreementVal = Math.round(val * 0.15);
        const milestoneVal = Math.round(val * 0.40);
        const balanceVal = val - tokenVal - agreementVal - milestoneVal;
        const isSold = (u.status as any) === 'Sold';

        const custom = storedMap.get(`unit-${u.id}`);

        results.push({
          id: `tx-unit-${u.id}`,
          property_id: u.property_id,
          unit_id: u.id,
          client_name: u.buyer_name || custom?.client_name || 'Booked Client',
          client_phone: custom?.client_phone || '+91 98220 77889',
          client_email: custom?.client_email || `${(u.buyer_name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
          property_title: u.project_title,
          tower: u.tower,
          unit_number: u.unit_number,
          configuration: u.configuration,
          deal_value: custom?.deal_value || val,
          token_amount: custom?.token_amount || tokenVal,
          booking_status: isSold ? 'Completed' : 'Confirmed',
          current_stage: isSold ? 'Possession' : (u.status === 'Token' ? 'Token / EOI' : 'Booking'),
          sales_agent: u.agent_name || custom?.sales_agent || 'Rishi Mahboobani',
          channel_partner: custom?.channel_partner || 'In-House Developer Mandate',
          booking_date: custom?.booking_date || '2026-09-01',
          expected_closure_date: custom?.expected_closure_date || '2026-09-30',
          payment_schedule: custom?.payment_schedule || [
            { id: `m-${u.id}-1`, name: 'Token / EOI (5%)', amount: tokenVal, dueDate: '2026-09-01', status: 'Paid', paidDate: '2026-09-01' },
            { id: `m-${u.id}-2`, name: 'Agreement (15%)', amount: agreementVal, dueDate: '2026-09-15', status: isSold ? 'Paid' : 'Pending' },
            { id: `m-${u.id}-3`, name: 'Structure Milestone (40%)', amount: milestoneVal, dueDate: '2026-10-30', status: isSold ? 'Paid' : 'Pending' },
            { id: `m-${u.id}-4`, name: 'Final Handover & Registration', amount: balanceVal, dueDate: '2026-12-31', status: isSold ? 'Paid' : 'Pending' }
          ],
          notes: custom?.notes || `Building inventory unit booking for ${u.unit_number} in ${u.project_title}.`
        });
      }
    });

    return results;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    return [];
  }
}

export async function saveTransactions(txs: DealTransaction[]): Promise<void> {
  await saveEntityBatch('transactions', txs);
}

export async function saveTransaction(tx: DealTransaction): Promise<void> {
  await saveEntity('transactions', tx);
}

/**
 * Creates or updates a transaction when a Property is marked as Booked or Sold.
 */
export async function syncTransactionForProperty(property: Property, newStatus: string): Promise<void> {
  const isBooked = ['Booked', 'Sold', 'Done', 'Token', 'Under Offer'].includes(newStatus);
  const txId = `tx-prop-${property.id}`;
  const existing = await loadEntity<DealTransaction>('transactions', []);

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
      client_email: `${(property.owner_name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
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
  const existing = await loadEntity<DealTransaction>('transactions', []);

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
      client_email: `${(unit.buyer_name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
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
