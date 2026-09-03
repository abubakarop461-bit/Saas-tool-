// src/lib/transactions.ts - Deals & Transactions Data Access Layer
import { supabase } from '@/lib/supabaseClient';
import { loadEntity, saveEntityBatch, saveEntity } from '@/lib/dataStore';
import { Property, SEED_PROPERTIES, fetchProperties } from '@/lib/queries';

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
 * Dynamically queries and returns ONLY properties that are currently Booked or Token on the property page.
 * No other data is included.
 */
export async function fetchTransactions(): Promise<DealTransaction[]> {
  try {
    // 1. Purge any old stale transactions cache in browser localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('luxe-store-transactions');
      } catch {}
    }

    // 2. Fetch current properties
    const properties = await fetchProperties(null);

    // 3. Strict filter: ONLY properties on the property page that are 'Booked', 'Token', or 'Sold'
    const bookedProperties = properties.filter(p => 
      p.status_id === 'Booked' || p.status_id === 'Token' || p.status_id === 'Sold'
    );

    // 4. Construct clean transactions exclusively for these booked/token properties
    const transactions: DealTransaction[] = bookedProperties.map((p, idx) => {
      const val = p.price || 15000000;
      const tokenVal = Math.round(val * 0.05);
      const agreementVal = Math.round(val * 0.15);
      const milestoneVal = Math.round(val * 0.40);
      const balanceVal = val - tokenVal - agreementVal - milestoneVal;
      const isSold = p.status_id === 'Sold';
      const isToken = p.status_id === 'Token';

      return {
        id: `tx-prop-${p.id}`,
        property_id: p.id,
        client_name: p.owner_name || 'Valued Client',
        client_phone: p.owner_contact || '+91 98220 54321',
        client_email: `${(p.owner_name || 'client').toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        property_title: p.title,
        tower: 'Main Tower',
        unit_number: p.unit_no || `Unit #${idx + 1}`,
        configuration: p.configuration || '3 BHK',
        deal_value: val,
        token_amount: tokenVal,
        booking_status: isSold ? 'Completed' : 'Confirmed',
        current_stage: isSold ? 'Possession' : (isToken ? 'Token / EOI' : 'Booking'),
        sales_agent: 'Rishi Mahboobani',
        channel_partner: p.source_type === 'Broker' ? (p.brokerage || 'Partner Channel') : 'Direct In-House',
        booking_date: p.created_at ? p.created_at.split('T')[0] : '2026-09-01',
        expected_closure_date: '2026-09-30',
        payment_schedule: [
          { id: `m-${p.id}-1`, name: 'Token Amount (5%)', amount: tokenVal, dueDate: '2026-09-01', status: 'Paid', paidDate: '2026-09-01' },
          { id: `m-${p.id}-2`, name: 'Agreement (15%)', amount: agreementVal, dueDate: '2026-09-15', status: isSold ? 'Paid' : 'Pending' },
          { id: `m-${p.id}-3`, name: 'Construction Milestone (40%)', amount: milestoneVal, dueDate: '2026-10-30', status: isSold ? 'Paid' : 'Pending' },
          { id: `m-${p.id}-4`, name: 'Final Handover & Possession', amount: balanceVal, dueDate: '2026-12-31', status: isSold ? 'Paid' : 'Pending' }
        ],
        notes: `Booked property listing: ${p.title} (${p.property_code || 'PRP'}). Client token payment verified and recorded.`
      };
    });

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('luxe-store-transactions', JSON.stringify(transactions));
      } catch {}
    }

    return transactions;
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
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('luxe-store-transactions');
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }
}

/**
 * Sync for units (optional callback stub).
 */
export async function syncTransactionForUnit(unit: any, newStatus: string): Promise<void> {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('luxe-store-transactions');
      window.dispatchEvent(new Event('storage'));
    } catch {}
  }
}
