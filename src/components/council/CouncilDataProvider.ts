import { ALLOWED_HIT_TYPES_WAR } from "./CouncilUtil";
import type { AttackBreakdown, FactionWarSummary, WarMemberAggregate, WarReportFile } from "./Models";

export class CouncilDataProvider {
  public async fetchWarDetails(warFileName: string): Promise<WarMemberAggregate[]> {
    let data: WarReportFile;

    try {
      const response = await fetch(`/public/${warFileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch war report: ${response.statusText}`);
      }

      data = await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch war report: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return data.memberIdList.map((userId, idx) => {
      const actions = data.memberActions[userId];

      const warAttackBreakdown = actions.hits?.attacks?.war ?? {};
      const nonWarAttackBreakdown = actions.hits?.attacks?.['non-war'] ?? {};
      const warHits = ALLOWED_HIT_TYPES_WAR.reduce((sum: number, type: string) => sum + (warAttackBreakdown[type as keyof AttackBreakdown] || 0), 0);
      const nonWarHits = ALLOWED_HIT_TYPES_WAR.reduce((sum: number, type: string) => sum + (nonWarAttackBreakdown[type as keyof AttackBreakdown] || 0), 0);

      const warDefends = actions.hits?.defends?.war ?? {};
      const nonWarDefends = actions.hits?.defends?.['non-war'] ?? {};
      const incomingWarHits = Object.values(warDefends ?? {}).reduce((a: number, b: number) => a + b, 0);
      const incomingNonWarHits = Object.values(nonWarDefends ?? {}).reduce((a: number, b: number) => a + b, 0);

      // Armory usage extraction
      let xanaxUsed = 0;
      let pointsUsed = 0;
      if (actions.armory) {
        for (const [item, count] of Object.entries(actions.armory)) {
          if (item === `used one of the faction's Xanax items`) xanaxUsed += count;
          if (item === `used 30 of the faction's points to refill their energy`) pointsUsed += count;
        }
      }

      return {
        id: idx + 1,
        name: actions.userTag || userId,
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

  public async fetchWarsList(): Promise<FactionWarSummary[]> {
    try {
      const response = await fetch('/public/wars.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch wars list: ${response.statusText}`);
      }
      const json = await response.json();
      if (!json.data || !Array.isArray(json.data)) {
        throw new Error('Invalid wars.json format');
      }
      return json.data.map((w: any) => ({
        rankedWarId: w.rankedWarId,
        enemyFactionId: w.enemyFactionId,
        enemyFactionName: w.enemyFactionName,
        warStartTs: w.warStartTs,
        warEndTs: w.warEndTs,
        warReportFile: w.warReportFile,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch wars list: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
}
