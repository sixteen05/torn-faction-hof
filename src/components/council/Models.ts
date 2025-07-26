
export interface WarPayFormValues {
  warPay: number;
  nonWarPay: number;
  warIncomingDeduction: number;
  nonWarIncomingDeduction: number;
  showAdvanced: boolean;
}

export interface WarMemberAggregate {
  id: number;
  name: string;
  warHits: number;
  nonWarHits: number;
  incomingWarHits: number;
  incomingNonWarHits: number;
  xanaxUsed: number;
  pointsUsed: number;
}

