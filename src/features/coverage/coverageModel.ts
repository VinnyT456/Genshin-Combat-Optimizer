import type { CharacterCoverage, CoverageMatrix, SupportTier } from "@/tests/coverage/characterCoverage";

export type CoverageState = "sourced" | "represented" | "executable" | "live-wired" | "regression-tested" | "unknown";
export interface CoverageRow {
  readonly id: string;
  readonly name: string;
  readonly tier?: SupportTier;
  readonly states: Readonly<Record<CoverageState, boolean | "unknown">>;
}

export interface CoverageFilter { readonly query?: string; readonly state?: CoverageState; }

export function rowFromCharacterCoverage(character: CharacterCoverage): CoverageRow {
  const executable = character.tier !== "SPECIAL MECHANICS NOT YET IMPLEMENTED";
  return {
    id: character.id,
    name: character.name,
    tier: character.tier,
    states: {
      sourced: true,
      represented: character.abilities.length > 0,
      executable,
      "live-wired": executable,
      "regression-tested": character.tests.suiteIds.length > 0,
      unknown: false,
    },
  };
}

export function coverageRows(matrix: CoverageMatrix): readonly CoverageRow[] {
  return matrix.characters.map(rowFromCharacterCoverage);
}

export function filterCoverageRows(rows: readonly CoverageRow[], filter: CoverageFilter = {}): readonly CoverageRow[] {
  const query = filter.query?.trim().toLocaleLowerCase();
  return rows.filter((row) => {
    if (query && !row.id.toLocaleLowerCase().includes(query) && !row.name.toLocaleLowerCase().includes(query)) return false;
    return filter.state === undefined || row.states[filter.state] === true;
  });
}

export function coverageStateZh(state: CoverageState): string {
  return ({ sourced: "已找到来源", represented: "已建立表示", executable: "可执行", "live-wired": "已接入运行链路", "regression-tested": "已有回归测试", unknown: "状态未知" } satisfies Record<CoverageState, string>)[state];
}

export function coverageUnknownZh(value: unknown): string {
  return typeof value === "string" && value.trim().length > 0 ? value : "状态未知";
}
