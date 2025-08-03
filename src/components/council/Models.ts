export interface WarReportFile {
  warStartTs: number;
  warEndTs: number;
  armoryOpenTs: number;
  rankedWarId: string;
  generatedAtIST: string;
  memberIdList: string[];
  memberActions: { [memberId: string]: WarReportFileMember };
}

export interface WarReportFileMember {
  userId: string;
  userTag: string;
  hits: { attacks: WarReportFileAttackSummary; defends: WarReportFileAttackSummary };
  armory?: WarReportFileArmory;
}

export interface WarReportFileAttackSummary {
  war: AttackBreakdown;
  'non-war': AttackBreakdown;
}

export interface WarReportFileArmory {
  [item: string]: number;
}

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

export interface FactionWarSummary {
  rankedWarId: string;
  enemyFactionId: string;
  enemyFactionName: string;
  warStartTs: number;
  warEndTs: number;
  warReportFile: string;
}
