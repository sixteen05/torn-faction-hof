import type { WarMemberAggregate, WarPayFormValues } from "./Models";

export const XANAX_HITS_PER_HIT = 10;
export const POINTS_HITS_PER_HIT = 1 / 5;

export const DEFAULT_WAR_PAY = 300000;
export const DEFAULT_NON_WAR_PAY = 100000;
export const DEFAULT_NON_WAR_INCOMING_DEDUCTION = 10000;
export const DEFAULT_WAR_INCOMING_DEDUCTION = 10000;

export const isNonWarIncomingEnabled = (formValues: WarPayFormValues) => !!formValues.nonWarIncomingDeduction && formValues.nonWarIncomingDeduction > 0;
export const isWarIncomingEnabled = (formValues: WarPayFormValues) => !!formValues.warIncomingDeduction && formValues.warIncomingDeduction > 0;

export const getPay = (agg: WarMemberAggregate, formValues: WarPayFormValues) => {
  const { warPay, nonWarPay, warIncomingDeduction, nonWarIncomingDeduction } = formValues;
  let pay = agg.warHits * warPay + agg.nonWarHits * nonWarPay;
  let payCalcString = `${agg.warHits}×${warPay.toLocaleString()} + ${agg.nonWarHits}×${nonWarPay.toLocaleString()}`;
  if (isWarIncomingEnabled(formValues)) {
    pay -= agg.incomingWarHits * warIncomingDeduction;
    payCalcString += ` - ${agg.incomingWarHits}×${warIncomingDeduction.toLocaleString()}`;
  }

  if (isNonWarIncomingEnabled(formValues)) {
    pay -= agg.incomingNonWarHits * nonWarIncomingDeduction;
    payCalcString += ` - ${agg.incomingNonWarHits}×${nonWarIncomingDeduction.toLocaleString()}`;
  }

  return { pay, payCalcString };
};

export const getCalculations = (agg: WarMemberAggregate) => {
  const hitsMade = agg.warHits + agg.nonWarHits;
  const expectedHits = agg.xanaxUsed * XANAX_HITS_PER_HIT + agg.pointsUsed * POINTS_HITS_PER_HIT;
  const compliantCalcString = `Xanax: ${agg.xanaxUsed}×${XANAX_HITS_PER_HIT} + Points: ${agg.pointsUsed}×${POINTS_HITS_PER_HIT} = ${expectedHits} expected, Made: ${hitsMade}`;

  const compliant = hitsMade >= expectedHits;
  return { compliant, compliantCalcString };
}
