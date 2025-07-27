import { ALLOWED_HIT_TYPES_WAR } from "./CouncilUtil";
import type { WarMemberAggregate } from "./Models";

export class CouncilDataProvider {
  public async fetchWarDetails(warId: string): Promise<WarMemberAggregate[]> {
    let data: any;

    try {
      const response = await fetch(`/war-report-${warId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch war report: ${response.statusText}`);
      }

      data = await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch war report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return Object.entries(data).map(([name, stats], idx) => {
      const s = stats as {
        attacks: { war: Record<string, number>; 'non-war': Record<string, number> };
        defends: { war: Record<string, number>; 'non-war': Record<string, number> };
      };

      const warAttackBreakdown = s.attacks?.war ?? {};
      const nonWarAttackBreakdown = s.attacks?.['non-war'] ?? {};

      const warHits = ALLOWED_HIT_TYPES_WAR.reduce((sum, type) => sum + (warAttackBreakdown[type] || 0), 0);
      const nonWarHits = ALLOWED_HIT_TYPES_WAR.reduce((sum, type) => sum + (nonWarAttackBreakdown[type] || 0), 0);
      const incomingWarHits = Object.values(s.defends?.war ?? {}).reduce((a: number, b: number) => a + b, 0);
      const incomingNonWarHits = Object.values(s.defends?.['non-war'] ?? {}).reduce((a: number, b: number) => a + b, 0);

      return {
        id: idx + 1,
        name,
        warHits,
        nonWarHits,
        incomingWarHits,
        incomingNonWarHits,
        xanaxUsed: 0,
        pointsUsed: 0,
        warAttackBreakdown,
        nonWarAttackBreakdown,
      } as WarMemberAggregate;
    });
  }
}
