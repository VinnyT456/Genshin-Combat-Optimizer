import { describe, expect, it } from "vitest";
import { generatedWeaponsById } from "./generated";
import {
  allWeapons,
  findGeneratedWeapon,
  findWeapon,
} from "./registry";
import { weaponPassiveBuffsById } from "./weaponBuffs";

describe("weapon registry — generated combat source", () => {
  it("publishes only records backed by a generated row", () => {
    expect(allWeapons.length).toBeGreaterThan(0);

    for (const weapon of allWeapons) {
      expect(weapon.dataSource).toBe("generated");
      expect(weapon.generatedId).toBe(weapon.id);

      const generated = generatedWeaponsById.get(weapon.generatedId!);
      expect(generated, weapon.id).toBeDefined();
      expect(weapon.baseAtk).toBe(generated!.baseAtkByLevel[90]);
      expect(weapon.subStat.type === "none").toBe(!generated!.substat);
      if (generated!.substat) {
        expect(weapon.subStat.value).toBe(generated!.substat.valueByLevel[90]);
      }
    }
  });

  it("keeps the old normalized ID lookup on the generated record", () => {
    const selected = findWeapon("Staff-of-Homa");
    expect(selected?.id).toBe("staffofhoma");
    expect(findGeneratedWeapon("Staff-of-Homa")?.id).toBe("staffofhoma");
    expect(findWeapon("weapon-that-does-not-exist")).toBeUndefined();
    expect(findGeneratedWeapon("weapon-that-does-not-exist")).toBeUndefined();
  });

  it("does not expose generated low-rarity rows through the 4/5-star website catalog", () => {
    expect(allWeapons.every((weapon) => weapon.rarity === 4 || weapon.rarity === 5)).toBe(true);
    expect(
      [...generatedWeaponsById.values()].some((weapon) => weapon.rarity < 4),
    ).toBe(true);
  });

  it("maps the generated dmgBonus substat channel to physicalDmg", () => {
    const generated = [...generatedWeaponsById.values()].find(
      (weapon) => weapon.substat?.stat === "dmgBonus",
    );
    expect(generated).toBeDefined();

    const published = findWeapon(generated!.id);
    expect(published, generated!.id).toBeDefined();
    expect(published!.subStat.type).toBe("physicalDmg");
    expect(published!.subStat.value).toBe(
      generated!.substat!.valueByLevel[90],
    );
  });

  it("uses generated passive buckets for combat publication", () => {
    const expressible = [...generatedWeaponsById.values()].find((weapon) =>
      weapon.passive?.refinements.some((row) => row.bucket === "expressible"),
    );
    expect(expressible).toBeDefined();

    const generatedPassive = weaponPassiveBuffsById(expressible!.id);
    expect(generatedPassive).toBeDefined();
    expect(
      Object.values(generatedPassive!.buffsByRefinement).some(
        (buffs) => buffs.length > 0,
      ),
    ).toBe(true);

    const unsupported = [...generatedWeaponsById.values()].find((weapon) =>
      weapon.passive?.refinements.some((row) => row.bucket !== "expressible"),
    );
    expect(unsupported).toBeDefined();
    const unsupportedRows = unsupported!.passive!.refinements.filter(
      (row) => row.bucket !== "expressible",
    );
    const unsupportedPassive = weaponPassiveBuffsById(unsupported!.id);
    for (const row of unsupportedRows) {
      expect(unsupportedPassive?.buffsByRefinement[row.refinement]).toBeUndefined();
    }
  });
});
