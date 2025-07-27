
export interface AttackBreakdown {
  attacked?: number;
  hospitalized?: number;
  interrupted?: number;
  lost?: number;
  assist?: number;
  mugged?: number;
  escape?: number;
  stalemate?: number;
  timeout?: number;
}

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
  warAttackBreakdown: AttackBreakdown;
  nonWarAttackBreakdown: AttackBreakdown;
}

export interface ColumnDataTypesList {
  alphanumeric: string[];
  number: string[];
  boolean: string[];
}

