import { describe, expect, it } from "vitest";
import { findCharacter } from "./registry";
import {
  characterUsageStatus,
  withCharacterUsage,
} from "./usageProfile";

describe("text-derived character usage profiles", () => {
  it("resolves Skirk's skill gain and alternate burst resource", () => {
    const skirk = findCharacter("skirk");
    expect(skirk).toBeDefined();
    const resolved = withCharacterUsage(skirk!);
    const status = characterUsageStatus(skirk!);

    expect(resolved.maxEnergy).toBe(0);
    expect(resolved.skill.charges).toBeUndefined();
    expect(resolved.skill.effects).toContainEqual({
      resourceId: "serpents-subtlety",
      kind: "gain",
      amount: 45,
    });
    expect(
      resolved.skill.effects?.filter(
        (effect) =>
          effect.resourceId === "serpents-subtlety" &&
          effect.kind === "gain" &&
          effect.amount === 45,
      ),
    ).toHaveLength(1);
    expect(resolved.burst.cost).toEqual({
      resources: [
        { resourceId: "serpents-subtlety", amount: 50, consume: "all" },
      ],
    });
    expect(status.skill.inputVariants).toBe("tap-hold");
    expect(status.skill.canRecast).toBe(true);
    expect(status.burst).toMatchObject({
      kind: "alternate-resource",
      resourceName: "Serpent's Subtlety",
      minimumCost: 50,
      specialZeroCostVariant: true,
    });
  });

  it("derives explicit skill charge counts instead of using a character map", () => {
    const navia = findCharacter("navia");
    const nefer = findCharacter("nefer");
    const yae = findCharacter("yae-miko");
    const diona = findCharacter("diona");
    expect(characterUsageStatus(navia!).skill.maxUses).toBe(2);
    expect(characterUsageStatus(nefer!).skill.maxUses).toBe(2);
    expect(characterUsageStatus(yae!).skill.maxUses).toBe(3);
    expect(characterUsageStatus(diona!).skill.maxUses).toBe(1);
  });

  it("converts a percentage threshold using the verified resource cap", () => {
    const mavuika = findCharacter("mavuika");
    expect(mavuika).toBeDefined();
    const resolved = withCharacterUsage(mavuika!);
    const status = characterUsageStatus(mavuika!);
    expect(resolved.resources).toContainEqual({
      id: "fighting-spirit",
      name: "Fighting Spirit",
      initial: 0,
      max: 200,
      startAtMaxWithFullEnergy: true,
    });
    expect(resolved.burst.cost).toEqual({
      resources: [
        { resourceId: "fighting-spirit", amount: 100, consume: "all" },
      ],
    });
    expect(status.burst).toMatchObject({
      kind: "alternate-resource",
      minimumCost: 100,
    });
  });
});
