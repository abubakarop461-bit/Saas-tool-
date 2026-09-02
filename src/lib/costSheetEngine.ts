// src/lib/costSheetEngine.ts - Deep Pure Domain Module for Real Estate Valuation & Cost Sheets

export interface CostSheetInput {
  project_title: string;
  tower: string;
  floor: number;
  unit_number: string;
  configuration: string;
  carpet_area: number;
  built_up_area: number;
  base_price: number;
  floor_rise_rate?: number;
  parking_charges?: number;
  amenities_charges?: number;
  other_charges?: number;
  gst_percentage?: number;
  stamp_duty_percentage?: number;
  registration_charges?: number;
}

export interface PaymentMilestone {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface CostSheetResult {
  unit: CostSheetInput;
  base_price: number;
  floor_rise_amount: number;
  parking_charges: number;
  amenities_charges: number;
  other_charges: number;
  gross_agreement_value: number;
  gst_percentage: number;
  gst_amount: number;
  stamp_duty_percentage: number;
  stamp_duty_amount: number;
  registration_charges: number;
  total_government_taxes: number;
  total_all_inclusive_cost: number;
  cost_per_sqft_carpet: number;
  milestones: PaymentMilestone[];
}

/**
 * Standard Construction Milestone Template (MahaRERA compliant)
 */
export const STANDARD_MILESTONE_DISTRIBUTION = [
  { id: 'm-1', name: 'Booking / Token Advance', percentage: 10, description: 'Earnest money deposit upon allotment confirmation' },
  { id: 'm-2', name: 'Agreement for Sale (Registration)', percentage: 10, description: 'Execution and legal registration of the sale agreement' },
  { id: 'm-3', name: 'Completion of Plinth / Foundation', percentage: 15, description: 'Foundation piling and substructure RCC milestone' },
  { id: 'm-4', name: 'Completion of Slabs (Mid-Construction)', percentage: 25, description: 'Casting of floor slabs up to the allocated unit tier' },
  { id: 'm-5', name: 'Completion of Brickwork, Plaster & MEP', percentage: 15, description: 'Internal walls, external plaster, plumbing and electrical conduits' },
  { id: 'm-6', name: 'Flooring, Lift Installation & Finishing', percentage: 10, description: 'Italian marble/vitrified tiles, elevator lobbies and facade' },
  { id: 'm-7', name: 'Notice of Possession & Handover', percentage: 15, description: 'Occupancy Certificate (OC) receipt and key handover' },
];

/**
 * Calculate complete all-inclusive cost sheet with taxes, floor rise, and milestone schedule
 */
export function computeCostSheet(input: CostSheetInput): CostSheetResult {
  const floorRiseRate = input.floor_rise_rate ?? 50;
  const floorRiseFloorCount = Math.max(0, input.floor - 5);
  const floorRiseAmount = floorRiseFloorCount * floorRiseRate * input.built_up_area;

  const basePrice = Number(input.base_price) || 0;
  const parkingCharges = input.parking_charges ?? 500000;
  const amenitiesCharges = input.amenities_charges ?? 300000;
  const otherCharges = input.other_charges ?? 150000;

  // Gross Agreement Value (Base + Floor Rise + Other Developer Charges)
  const grossAgreementValue = basePrice + floorRiseAmount + parkingCharges + amenitiesCharges + otherCharges;

  // Differential Tax Computation: 18% for Commercial Office, 5% for Luxury Residential
  const isCommercial = input.configuration.toLowerCase().includes('office') || input.configuration.toLowerCase().includes('commercial');
  const gstRate = input.gst_percentage ?? (isCommercial ? 18.0 : 5.0);
  const gstAmount = Math.round((grossAgreementValue * gstRate) / 100);

  // Government Stamp Duty & Registration
  const stampDutyRate = input.stamp_duty_percentage ?? 6.0;
  const stampDutyAmount = Math.round((grossAgreementValue * stampDutyRate) / 100);
  const registrationCharges = input.registration_charges ?? 30000;

  const totalGovernmentTaxes = gstAmount + stampDutyAmount + registrationCharges;
  const totalAllInclusiveCost = grossAgreementValue + totalGovernmentTaxes;

  const costPerSqftCarpet = input.carpet_area > 0 ? Math.round(totalAllInclusiveCost / input.carpet_area) : 0;

  // Generate Construction Milestone Schedule
  const milestones: PaymentMilestone[] = STANDARD_MILESTONE_DISTRIBUTION.map((m) => {
    const amount = Math.round((grossAgreementValue * m.percentage) / 100);
    return {
      id: m.id,
      name: m.name,
      percentage: m.percentage,
      amount,
      description: m.description
    };
  });

  return {
    unit: input,
    base_price: basePrice,
    floor_rise_amount: floorRiseAmount,
    parking_charges: parkingCharges,
    amenities_charges: amenitiesCharges,
    other_charges: otherCharges,
    gross_agreement_value: grossAgreementValue,
    gst_percentage: gstRate,
    gst_amount: gstAmount,
    stamp_duty_percentage: stampDutyRate,
    stamp_duty_amount: stampDutyAmount,
    registration_charges: registrationCharges,
    total_government_taxes: totalGovernmentTaxes,
    total_all_inclusive_cost: totalAllInclusiveCost,
    cost_per_sqft_carpet: costPerSqftCarpet,
    milestones
  };
}
