import { describe, expect, it } from "vitest";
import {
  buildBreakdownRows,
  buildBreakdownTables,
  composeRowText,
  resolveLabel,
  type BreakdownLabels,
} from "./breakdownModel";

describe("resolveLabel", () => {
  it("returns the display name when the id is present", () => {
    expect(resolveLabel("pyro-skill", { "pyro-skill": "Searing Onslaught" })).toBe(
      "Searing Onslaught",
    );
  });

  // The regression this module exists to prevent: rendering the key when a
  // label WAS available would put raw ids in front of the user.
  it("never renders the raw id when a label exists", () => {
    const labels: BreakdownLabels = { "a-q": "Elemental Burst" };
    expect(resolveLabel("a-q", labels)).not.toBe("a-q");
  });

  // DELIBERATE: an unmapped id falls back to the raw id, not a placeholder.
  it("falls back to the raw id when the id is missing from labels", () => {
    expect(resolveLabel("unmapped-id", { other: "Other" })).toBe("unmapped-id");
  });

  it("falls back to the raw id when no labels map is supplied at all", () => {
    expect(resolveLabel("Pyro")).toBe("Pyro");
    expect(resolveLabel("Pyro", undefined)).toBe("Pyro");
  });

  it("falls back to the raw id when the mapped label is empty", () => {
    // A blank row is unusable, so an empty string counts as missing.
    expect(resolveLabel("a-e", { "a-e": "" })).toBe("a-e");
  });

  it("does not inherit labels from Object.prototype", () => {
    // A key like "constructor" must not resolve to a function via the chain.
    expect(resolveLabel("constructor", {})).toBe("constructor");
    expect(resolveLabel("toString", {})).toBe("toString");
  });
});

describe("buildBreakdownRows", () => {
  const total = 1000;

  it("keeps the id as the row key while displaying the name", () => {
    const rows = buildBreakdownRows(
      { "pyro-skill": 600, "pyro-burst": 400 },
      total,
      { "pyro-skill": "Searing Onslaught", "pyro-burst": "Dough-Fu" },
    );
    expect(rows.map((r) => r.key)).toEqual(["pyro-skill", "pyro-burst"]);
    expect(rows.map((r) => r.label)).toEqual([
      "Searing Onslaught",
      "Dough-Fu",
    ]);
  });

  it("labels only the ids it can, falling back for the rest", () => {
    const rows = buildBreakdownRows({ known: 600, missing: 400 }, total, {
      known: "Known Ability",
    });
    expect(rows.map((r) => r.label)).toEqual(["Known Ability", "missing"]);
    // The unlabelled row is still fully attributable and keeps its value.
    expect(rows[1]).toMatchObject({ key: "missing", value: 400 });
  });

  it("distinguishes two abilities that share a display name", () => {
    // The whole reason the map is id-keyed: same name, different buckets.
    const rows = buildBreakdownRows({ "a-e": 300, "a-q": 700 }, total, {
      "a-e": "Shared Name",
      "a-q": "Shared Name",
    });
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.label)).toEqual(["Shared Name", "Shared Name"]);
    expect(rows.map((r) => r.key)).toEqual(["a-q", "a-e"]);
    expect(rows.map((r) => r.value)).toEqual([700, 300]);
  });

  it("uses the key as the label when no labels map is given", () => {
    // The by-character / by-element tables: already human-readable keys.
    const rows = buildBreakdownRows({ Pyro: 750, Hydro: 250 }, total);
    expect(rows.map((r) => r.label)).toEqual(["Pyro", "Hydro"]);
    expect(rows.map((r) => r.key)).toEqual(["Pyro", "Hydro"]);
  });

  it("sorts by value descending", () => {
    const rows = buildBreakdownRows({ a: 1, b: 300, c: 20 }, total);
    expect(rows.map((r) => r.key)).toEqual(["b", "c", "a"]);
  });

  it("breaks value ties on key ascending, deterministically", () => {
    const rows = buildBreakdownRows({ z: 100, a: 100, m: 100 }, total);
    expect(rows.map((r) => r.key)).toEqual(["a", "m", "z"]);
  });

  it("computes percent as a share of the supplied total", () => {
    const rows = buildBreakdownRows({ a: 250, b: 750 }, total);
    expect(rows.map((r) => r.percent)).toEqual([75, 25]);
  });

  it("yields zero percent rather than NaN when the total is zero", () => {
    const rows = buildBreakdownRows({ a: 0, b: 0 }, 0);
    for (const row of rows) {
      expect(row.percent).toBe(0);
      expect(Number.isNaN(row.percent)).toBe(false);
    }
  });

  it("yields zero percent for a negative total", () => {
    const rows = buildBreakdownRows({ a: 5 }, -10);
    expect(rows[0]?.percent).toBe(0);
  });

  it("returns no rows for empty data", () => {
    expect(buildBreakdownRows({}, total)).toEqual([]);
  });

  it("does not mutate its inputs", () => {
    const data = { a: 1, b: 2 };
    const labels = { a: "A" };
    buildBreakdownRows(data, total, labels);
    expect(data).toEqual({ a: 1, b: 2 });
    expect(labels).toEqual({ a: "A" });
  });
});

describe("buildBreakdownTables", () => {
  const source = {
    totalDamage: 1000,
    damageByAbility: { "pyro-e": 600, "hydro-e": 400 },
    abilityNamesById: { "pyro-e": "Flame Strike", "hydro-e": "Tidal Surge" },
    damageByCharacter: { Amber: 600, Xingqiu: 400 },
    damageByElement: { Pyro: 600, Hydro: 400 },
  };

  it("builds the three tables in display order", () => {
    expect(buildBreakdownTables(source).map((t) => t.title)).toEqual([
      "By Ability",
      "By Character",
      "By Element",
    ]);
  });

  it("uses Chinese action labels instead of engine ability names", () => {
    const ability = buildBreakdownTables(source)[0];
    expect(ability?.rows.map((r) => r.label)).toEqual([
      "元素战技",
      "元素战技",
    ]);
  });

  it("keeps the By Ability table keyed by ability id, not name", () => {
    const ability = buildBreakdownTables(source)[0];
    expect(ability?.rows.map((r) => r.key)).toEqual(["pyro-e", "hydro-e"]);
  });

  it("renders no raw ability id as a label when every id is mapped", () => {
    for (const row of buildBreakdownTables(source)[0]?.rows ?? []) {
      expect(row.label).not.toBe(row.key);
    }
  });

  it("does not label the character or element tables", () => {
    const [, character, element] = buildBreakdownTables(source);
    for (const row of character?.rows ?? []) expect(row.label).toBe(row.key);
    for (const row of element?.rows ?? []) expect(row.label).toBe(row.key);
  });

  it("uses a Chinese fallback when an ability name is missing", () => {
    const tables = buildBreakdownTables({
      ...source,
      abilityNamesById: { "pyro-e": "Flame Strike" },
    });
    expect(tables[0]?.rows.map((r) => r.label)).toEqual([
      "元素战技",
      "元素战技",
    ]);
  });

  it("tolerates an entirely empty result", () => {
    const tables = buildBreakdownTables({
      totalDamage: 0,
      damageByAbility: {},
      abilityNamesById: {},
      damageByCharacter: {},
      damageByElement: {},
    });
    expect(tables).toHaveLength(3);
    for (const t of tables) expect(t.rows).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// WIRING guards (TASK #033).
//
// These exist because both defects below shipped while every pure test of the
// underlying helpers passed: `applyCollisionQualifiers` was correct and tested,
// but `DamageBreakdown` called `buildBreakdownTables(result)` with no team and
// never rendered `row.qualifier`. Testing the helper could not catch either.
// ---------------------------------------------------------------------------
describe("owner qualifier wiring", () => {
  // Two abilities that share a display name and belong to different owners —
  // the situation §10 exists for.
  const collidingSource = {
    totalDamage: 1000,
    damageByAbility: { "a-skill": 600, "b-skill": 400 },
    abilityNamesById: { "a-skill": "Elemental Skill", "b-skill": "Elemental Skill" },
    damageByCharacter: {},
    damageByElement: {},
    timeline: [
      { type: "damage", damage: { abilityId: "a-skill", sourceCharacterId: "amber" } },
      { type: "damage", damage: { abilityId: "b-skill", sourceCharacterId: "xingqiu" } },
    ],
  };
  const team = [
    { id: "amber", name: "Amber" },
    { id: "xingqiu", name: "Xingqiu" },
  ];

  it("qualifies colliding rows by owner NAME when the team is passed", () => {
    const rows = buildBreakdownTables(collidingSource, team)[0]?.rows ?? [];
    expect(rows.map((r) => r.qualifier)).toEqual(["安柏", "行秋"]);
  });

  it("degrades to raw character ids when the team is omitted", () => {
    // Documents the cost of the dropped argument: §10.3 reserves the raw id as
    // the MISSING-label signal, so this output is a defect, not a variant.
    const rows = buildBreakdownTables(collidingSource)[0]?.rows ?? [];
    expect(rows.map((r) => r.qualifier)).toEqual(["amber", "xingqiu"]);
  });

  it("qualifies rows that become colliding under Chinese action labels", () => {
    const rows =
      buildBreakdownTables(
        {
          ...collidingSource,
          abilityNamesById: { "a-skill": "Flame Strike", "b-skill": "Tidal Surge" },
        },
        team,
      )[0]?.rows ?? [];
    expect(rows.map((r) => r.qualifier)).toEqual(["安柏", "行秋"]);
  });
});

describe("composeRowText", () => {
  it("appends the qualifier so colliding rows read differently", () => {
    const rows = buildBreakdownTables(
      {
        totalDamage: 1000,
        damageByAbility: { "a-skill": 600, "b-skill": 400 },
        abilityNamesById: { "a-skill": "Elemental Skill", "b-skill": "Elemental Skill" },
        damageByCharacter: {},
        damageByElement: {},
        timeline: [
          { type: "damage", damage: { abilityId: "a-skill", sourceCharacterId: "amber" } },
          { type: "damage", damage: { abilityId: "b-skill", sourceCharacterId: "xingqiu" } },
        ],
      },
      [
        { id: "amber", name: "Amber" },
        { id: "xingqiu", name: "Xingqiu" },
      ],
    )[0]?.rows ?? [];

    const texts = rows.map((r) => composeRowText(r.label, r.qualifier));
    // The whole point of §10: no two rendered rows read identically.
    expect(new Set(texts).size).toBe(texts.length);
    expect(texts).toEqual(["元素战技 · 安柏", "元素战技 · 行秋"]);
  });

  it("returns the label unchanged when there is no qualifier", () => {
    expect(composeRowText("Flame Strike", undefined)).toBe("Flame Strike");
  });
});
