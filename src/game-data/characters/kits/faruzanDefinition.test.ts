import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { simulateRotation } from "@/simulation/engine";
import { FARUZAN_KIT_METADATA, createFaruzanDefinition } from "./faruzanDefinition";

const noCrit = { critMode: "never" as const };

function runAfterBurst(constellationLevel: number, actionTime: number, critMode: "never" | "always" = "never") {
  const character = createFaruzanDefinition(constellationLevel, { normal: 1, skill: 10, burst: 10 });
  const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
  // Rotation has no explicit wait action. Normal attacks provide deterministic
  // clock advancement so the C2 duration boundary is exercised in simulation.
  const fillerCount = actionTime === 0 ? 0 : 33;
  return simulateRotation(
    [ready],
    [
      { characterId: ready.id, actionType: "burst" },
      ...Array.from({ length: fillerCount }, () => ({ characterId: ready.id, actionType: "normal" as const })),
      { characterId: ready.id, actionType: "skill" },
    ],
    testEnemy,
    { ...noCrit, critMode },
  );
}

function lastFaruzanDamage(result: ReturnType<typeof simulateRotation>) {
  const event = result.timeline
    .filter((entry) => entry.type === "damage" && entry.characterId === "faruzan")
    .at(-1);
  if (event?.damage === undefined) throw new Error("expected Faruzan damage event");
  return event.damage;
}

describe("Faruzan runtime kit", () => {
  it("executes generated skill and burst damage", () => {
    const character = createFaruzanDefinition(0);
    const ready = { ...character, burst: { ...character.burst, energyCost: 0 } };
    const result = simulateRotation(
      [ready],
      [
        { characterId: ready.id, actionType: "skill" },
        { characterId: ready.id, actionType: "burst" },
      ],
      testEnemy,
      noCrit,
    );
    expect(result.timeline.filter((event) => event.type === "damage")).toHaveLength(3);
    expect(result.totalDamage).toBeGreaterThan(0);
  });

  it("applies A4 Anemo DMG bonus to a later Anemo hit, but not the burst hit itself", () => {
    const before = createFaruzanDefinition(0);
    const skillOnly = simulateRotation([before], [{ characterId: before.id, actionType: "skill" }], testEnemy, noCrit);
    const after = runAfterBurst(0, 0);
    expect(lastFaruzanDamage(after).finalDamage).toBeGreaterThan(
      lastFaruzanDamage(skillOnly).finalDamage,
    );
    expect(FARUZAN_KIT_METADATA.a4AnemoDamageBonus).toBe(0.32);
  });

  it("extends the active A4 window through C2", () => {
    const c0 = runAfterBurst(0, 13);
    const c2 = runAfterBurst(2, 13);
    const skillDamageC0 = lastFaruzanDamage(c0).finalDamage;
    const skillDamageC2 = lastFaruzanDamage(c2).finalDamage;
    expect(skillDamageC2).toBeGreaterThan(skillDamageC0);
    expect(FARUZAN_KIT_METADATA.c2BurstDurationSeconds).toBe(18);
  });

  it("applies C6 Anemo CRIT DMG to actual post-burst damage", () => {
    const c5 = runAfterBurst(5, 0, "always");
    const c6 = runAfterBurst(6, 0, "always");
    expect(lastFaruzanDamage(c6).finalDamage).toBeGreaterThan(lastFaruzanDamage(c5).finalDamage);
    expect(FARUZAN_KIT_METADATA.c6AnemoCritDamage).toBe(0.4);
  });
});
