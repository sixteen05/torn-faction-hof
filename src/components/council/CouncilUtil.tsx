import { type ReactElement } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import type { AttackBreakdown, ColumnDataTypesList, WarMemberAggregate, WarPayFormValues } from "./Models";

// Forever constants
export const XANAX_HITS_PER_HIT = 10;
export const POINTS_HITS_PER_HIT = 1 / 5;
export const ALLOWED_HIT_TYPES_WAR = ["attacked", "hospitalized", "mugged"];
// Passcode obfuscation
// Original passcode: "con-council"
// ASCII codes: [99, 111, 110, 45, 99, 111, 117, 110, 99, 105, 108]
// Obfuscation: (((ascii ^ 42) * 13) + 97) ^ 314
export const OBFUSCATED_PASSCODE = [1324, 728, 751, 390, 1324, 728, 1038, 751, 1324, 754, 725];

// Defaults
export const DEFAULT_WAR_PAY = 300000;
export const DEFAULT_NON_WAR_PAY = 100000;
export const DEFAULT_NON_WAR_INCOMING_DEDUCTION = 10000;
export const DEFAULT_WAR_INCOMING_DEDUCTION = 10000;

// Generic render utility function
export const wrapWithTooltip = (
  content: ReactElement,
  tooltip: string[] | string,
) => (
  <OverlayTrigger
    key={tooltip.toString()}
    placement={"top"}
    trigger={["hover", "focus"]}
    overlay={
      <Tooltip>
        {Array.isArray(tooltip) ? tooltip.map((text, index) => <div key={index}>{text}</div>) : tooltip}
      </Tooltip>
    }
  >
    {content}
  </OverlayTrigger>
);

export const allTypeSortFunction = (a: any, b: any, sortCol: string, sortDir: "asc" | "desc", columnDataTypesList: ColumnDataTypesList) => {
  let aVal = a[sortCol as keyof typeof a];
  let bVal = b[sortCol as keyof typeof b];

  if (columnDataTypesList.alphanumeric.includes(sortCol)) {
    // For name, sort alphabetically
    aVal = (aVal as string).toLowerCase();
    bVal = (bVal as string).toLowerCase();
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  }

  if (columnDataTypesList.boolean.includes(sortCol)) {
    // For compliant, sort true > false
    return (aVal === bVal) ? 0 : aVal ? (sortDir === "asc" ? -1 : 1) : (sortDir === "asc" ? 1 : -1);
  }

  // For numbers
  if (columnDataTypesList.number.includes(sortCol)) {
    return sortDir === "asc" ? (Number(aVal) - Number(bVal)) : (Number(bVal) - Number(aVal));
  }

  return sortDir === "asc" ? (aVal > bVal ? -1 : 1) : (aVal < bVal ? -1 : 1);
};


// Format attack breakdown for tooltip display
export const formatAttackBreakdown = (breakdown: AttackBreakdown): string[] => {
  const result: string[] = [];

  // Define the order and display names for attack types, those with asterisks are not counted in total hits
  const attackTypes = [
    { key: 'attacked', label: 'Attacked' },
    { key: 'hospitalized', label: 'Hospitalized' },
    { key: 'lost', label: '*Lost' },
    { key: 'assist', label: '*Assist' },
    { key: 'mugged', label: 'Mugged' },
    { key: 'interrupted', label: '*Interrupted' },
    { key: 'escape', label: '*Escape' },
    { key: 'stalemate', label: '*Stalemate' },
    { key: 'timeout', label: '*Timeout' },
  ];

  attackTypes.forEach(({ key, label }) => {
    const value = breakdown[key as keyof AttackBreakdown];
    if (value && value > 0) {
      result.push(`${label}: ${value}`);
    }
  });

  return result.length > 0 ? result.sort() : ['No attacks'];
};

// War page utility functions
export const isNonWarIncomingEnabled = (formValues: WarPayFormValues) => !!formValues.nonWarIncomingDeduction && formValues.nonWarIncomingDeduction > 0;
export const isWarIncomingEnabled = (formValues: WarPayFormValues) => !!formValues.warIncomingDeduction && formValues.warIncomingDeduction > 0;

export const getPay = (agg: WarMemberAggregate, formValues: WarPayFormValues) => {
  const { warPay, nonWarPay, warIncomingDeduction, nonWarIncomingDeduction } = formValues;
  let pay = agg.warHits * warPay + agg.nonWarHits * nonWarPay;
  let payCalcString = [];
  payCalcString.push(`${agg.warHits} × ${warPay.toLocaleString()}`);
  payCalcString.push(`${agg.nonWarHits} × ${nonWarPay.toLocaleString()}`);
  if (isWarIncomingEnabled(formValues)) {
    pay -= agg.incomingWarHits * warIncomingDeduction;
    payCalcString.push(`- ${agg.incomingWarHits} × ${warIncomingDeduction.toLocaleString()}`);
  }

  if (isNonWarIncomingEnabled(formValues)) {
    pay -= agg.incomingNonWarHits * nonWarIncomingDeduction;
    payCalcString.push(`- ${agg.incomingNonWarHits} × ${nonWarIncomingDeduction.toLocaleString()}`);
  }

  return { pay, payCalcString };
};

export const getCalculations = (agg: WarMemberAggregate) => {
  const warAttacksMade = Object.values(agg.warAttackBreakdown).reduce((sum, val) => sum + val, 0);
  const nonWarAttacksMade = Object.values(agg.nonWarAttackBreakdown).reduce((sum, val) => sum + val, 0);
  const hitsMade = warAttacksMade + nonWarAttacksMade;

  const expectedHits = agg.xanaxUsed * XANAX_HITS_PER_HIT + agg.pointsUsed * POINTS_HITS_PER_HIT;
  const compliantCalcString: string[] = [];
  compliantCalcString.push(`Xanax: ${agg.xanaxUsed} × ${XANAX_HITS_PER_HIT}`);
  compliantCalcString.push(`+ Points: ${agg.pointsUsed} × ${POINTS_HITS_PER_HIT}`);
  compliantCalcString.push(`= ${expectedHits} expected,`);
  compliantCalcString.push(`(${hitsMade} made)`);

  const compliant = hitsMade >= expectedHits;
  return { compliant, compliantCalcString };
}

export const passcodeEncoder = (passcode: string): number[] => {
  return Array.from(passcode).map(char => {
    const ascii = char.charCodeAt(0);
    return (((ascii ^ 42) * 13) + 97) ^ 314;
  });
};

export const passcodeValidator = (input: string): boolean => {
  const encodedInput = passcodeEncoder(input);
  return encodedInput.length === OBFUSCATED_PASSCODE.length &&
    encodedInput.every((val, index) => val === OBFUSCATED_PASSCODE[index]);
};
