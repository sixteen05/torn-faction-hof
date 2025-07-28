import { ALLOWED_HIT_TYPES_WAR } from "./CouncilUtil";
import type { AttackBreakdown, WarMemberAggregate, WarReportFile } from "./Models";

export class CouncilDataProvider {
  public async fetchWarDetails(warId: string): Promise<WarMemberAggregate[]> {
    let data: WarReportFile;

    try {
      const response = await fetch(`/src/assets/faction_war_and_armory_${warId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch war report: ${response.statusText}`);
      }

      data = await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch war report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return Object.entries(data).map(([userId, stats], idx) => {
      const s = stats;

      const warAttackBreakdown = s.attacks?.war ?? {};
      const nonWarAttackBreakdown = s.attacks?.['non-war'] ?? {};

      const warHits = ALLOWED_HIT_TYPES_WAR.reduce((sum: number, type: string) => sum + (warAttackBreakdown[type as keyof AttackBreakdown] || 0), 0);
      const nonWarHits = ALLOWED_HIT_TYPES_WAR.reduce((sum: number, type: string) => sum + (nonWarAttackBreakdown[type as keyof AttackBreakdown] || 0), 0);
      const incomingWarHits = Object.values(s.defends?.war ?? {}).reduce((a: number, b: number) => a + b, 0);
      const incomingNonWarHits = Object.values(s.defends?.['non-war'] ?? {}).reduce((a: number, b: number) => a + b, 0);

      // Armory usage extraction
      let xanaxUsed = 0;
      let pointsUsed = 0;
      if (s.armory) {
        for (const [item, count] of Object.entries(s.armory)) {
          if (item.includes("Xanax")) xanaxUsed += count;
          if (item.includes("point")) pointsUsed += count;
        }
      }

      return {
        id: idx + 1,
        name: s.userTag || userId,
        warHits,
        nonWarHits,
        incomingWarHits,
        incomingNonWarHits,
        xanaxUsed,
        pointsUsed,
        warAttackBreakdown,
        nonWarAttackBreakdown,
      } as WarMemberAggregate;
    });
  }
}
