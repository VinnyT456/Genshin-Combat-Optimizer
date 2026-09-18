import { describe, expect, it } from "vitest";
import { testEnemy } from "@/game-data";
import { attachEngineDefinition } from "@/features/team-builder/rosterModel";
import { runSimulation } from "@/features/simulation/simulationAdapter";
import { isValidEnkaUid } from "./contracts";
import { normalizeEnkaPayload } from "./normalize";
import { mapEnkaPayload } from "./mapper";
import { charNameZh } from "@/lib/i18n";

function importedAvatar(avatarId: number, constellation: number) {
  return {
    avatarId,
    propMap: { "4001": { val: "90" } },
    skillLevelMap: { "1": 10, "2": 10, "3": 10 },
    talentIdList: Array.from({ length: constellation }, (_, index) => index + 1),
    equipList: [],
  };
}

describe("Enka import", () => {
  it("uses the current official Chinese name for Escoffier", () => {
    expect(charNameZh("escoffier")).toBe("爱可菲");
    expect(charNameZh("Escoffier")).toBe("爱可菲");
  });

  it("keeps imported constellations on the runtime path for the Skirk ship", () => {
    const preview = mapEnkaPayload(normalizeEnkaPayload({
      avatarInfoList: [
        importedAvatar(10000114, 2),
        importedAvatar(10000089, 2),
        importedAvatar(10000060, 6),
        importedAvatar(10000112, 0),
      ],
    }), "123456789", "2026-01-01T00:00:00.000Z");
    const importedTeam = preview.characters
      .map((entry) => entry.character)
      .filter((character): character is NonNullable<typeof character> => character !== undefined)
      .map(attachEngineDefinition);

    expect(importedTeam.map((character) => [character.id, character.constellation])).toEqual([
      ["skirk", 2],
      ["furina", 2],
      ["yelan", 6],
      ["escoffier", 0],
    ]);

    const result = runSimulation({
      team: importedTeam,
      rotation: [
        { characterId: "skirk", actionType: "skill", skillVariant: "hold" },
        { characterId: "furina", actionType: "swap" },
        { characterId: "furina", actionType: "skill" },
        { characterId: "furina", actionType: "burst" },
        { characterId: "escoffier", actionType: "swap" },
        { characterId: "escoffier", actionType: "skill" },
        { characterId: "escoffier", actionType: "burst" },
        { characterId: "yelan", actionType: "swap" },
        { characterId: "yelan", actionType: "skill" },
        { characterId: "yelan", actionType: "skill" },
        { characterId: "yelan", actionType: "burst" },
        { characterId: "yelan", actionType: "normal" },
        { characterId: "skirk", actionType: "swap" },
        { characterId: "skirk", actionType: "burst" },
      ],
      enemy: testEnemy,
      config: { critMode: "never" },
    }).result;

    expect(result.errors).toEqual([]);
    expect(result.structuredWarnings).toEqual([]);
    expect(result.totalDamage).toBeGreaterThan(0);
    expect(new Set(result.timeline
      .filter((event) => event.type === "damage")
      .map((event) => event.characterId))).toEqual(
      new Set(["skirk", "furina", "yelan", "escoffier"]),
    );
    expect(result.timeline.some((event) => event.type === "damage" && event.damage?.abilityId === "yelan-c2-water-arrow")).toBe(true);
    expect(result.timeline.some((event) => event.type === "damage" && event.damage?.abilityId === "yelan-c6-breakthrough-barb")).toBe(true);
  });

  it("accepts nine- or ten-digit UIDs without leading zeroes", () => {
    expect(isValidEnkaUid("123456789")).toBe(true);
    expect(isValidEnkaUid("012345678")).toBe(false);
    expect(isValidEnkaUid("12345678")).toBe(false);
    expect(isValidEnkaUid("1234567890")).toBe(true);
    expect(isValidEnkaUid("12345678901")).toBe(false);
  });

  it("treats missing avatarInfoList as an empty private response", () => {
    expect(normalizeEnkaPayload({ uid: "123456789" })).toEqual({ characters: [] });
  });

  it("reads the documented nested fields and maps only explicit character IDs", () => {
    const normalized = normalizeEnkaPayload({ avatarInfoList: [
      { avatarId: 10000032, propMap: { "4001": { type: 4001, ival: "90", val: "90" } }, skillLevelMap: { "1": 8, "2": 9, "3": 10 }, talentIdList: [1, 2], equipList: [
        { itemId: 11503, weapon: { level: 90, affixMap: { "111503": 2 } } },
        { reliquary: { level: 21 } },
      ] },
      { avatarId: 99999999, propMap: { "4001": 999 }, equipList: [] },
    ], ttl: 31 });
    const preview = mapEnkaPayload(normalized, "123456789", "2026-01-01T00:00:00.000Z", 60);
    expect(preview.characters[0]?.character?.id).toBe("bennett");
    expect(preview.characters[0]?.character?.level).toBe(90);
    expect(preview.characters[0]?.constellation).toBe(2);
    expect(normalized.ttlSeconds).toBe(31);
    expect(normalized.characters[0]?.talents).toEqual({ normal: 8, skill: 9, burst: 10 });
    expect(normalized.characters[0]?.weapon).toEqual({ itemId: 11503, level: 90, refinement: 3 });
    expect(preview.characters[0]?.weapon).toMatchObject({ id: "freedomsworn", refinement: 3 });
    expect(normalized.characters[0]?.artifactCount).toBe(1);
    expect(preview.characters[1]?.selectable).toBe(false);
    expect(preview.characters[1]?.character).toBeUndefined();

    const lowLevel = mapEnkaPayload(
      normalizeEnkaPayload({ avatarInfoList: [{ avatarId: 10000032, propMap: { "4001": { val: "20" } }, equipList: [] }] }),
      "123456789",
    );
    expect(lowLevel.characters[0]?.character?.level).toBe(20);
    expect(lowLevel.characters[0]?.character?.baseStats.atk).toBe(41);
  });

  it("reconstructs supported artifact stats from a real equip entry", () => {
    const normalized = normalizeEnkaPayload({ avatarInfoList: [{
      avatarId: 10000032,
      propMap: { "4001": { val: "90" } },
      skillLevelMap: { "10321": 8, "10322": 9, "10323": 10 },
      equipList: [{
        flat: {
          setId: 15001,
          equipType: "EQUIP_BRACER",
          reliquaryMainstat: { mainPropId: "FIGHT_PROP_HP", statValue: 4780 },
          reliquarySubstats: [
            { appendPropId: "FIGHT_PROP_CRITICAL", statValue: 6.2 },
            { appendPropId: "FIGHT_PROP_CRITICAL_HURT", statValue: 7.8 },
          ],
        },
        reliquary: { level: 21 },
      }],
    }] });

    const preview = mapEnkaPayload(normalized, "123456789");
    const entry = normalized.characters[0]!;
    const piece = preview.characters[0]?.equipment?.artifactLoadout?.flower;

    expect(entry.talents).toEqual({ normal: 8, skill: 9, burst: 10 });
    expect(entry.artifacts).toHaveLength(1);
    expect(entry.artifacts[0]?.level).toBe(21);
    expect(piece?.slot).toBe("flower");
    expect(piece?.mainStat).toEqual({ stat: "hpFlat", value: 4780 });
    expect(piece?.substats).toEqual([
      { stat: "critRate", value: 0.062 },
      { stat: "critDmg", value: 0.078 },
    ]);
    expect(preview.characters[0]?.artifactSummary).toContain("主/副词条已导入");
  });

  it("accepts documented propValue payloads and derives a missing set id from the icon", () => {
    const normalized = normalizeEnkaPayload({ avatarInfoList: [{
      avatarId: 10000032,
      propMap: { "4001": { val: "90" } },
      equipList: [{
        flat: {
          icon: "UI_RelicIcon_15007_3",
          equipType: "EQUIP_DRESS",
          reliquaryMainstat: { mainPropId: "FIGHT_PROP_CRITICAL_HURT", propValue: "62.2" },
          reliquarySubstats: [
            { appendPropId: "FIGHT_PROP_CRITICAL", propValue: "9.7" },
            { appendPropID: "FIGHT_PROP_CHARGE_EFFICIENCY", propValue: "6.5" },
          ],
        },
        reliquary: { level: 21 },
      }],
    }] });

    const preview = mapEnkaPayload(normalized, "123456789");
    const entry = normalized.characters[0]!;
    const piece = preview.characters[0]?.equipment?.artifactLoadout?.circlet;

    expect(entry.artifacts[0]).toMatchObject({ setId: 15007, slot: "circlet", level: 21 });
    expect(piece?.mainStat).toEqual({ stat: "critDmg", value: 0.622 });
    expect(piece?.substats).toEqual([
      { stat: "critRate", value: 0.097 },
      { stat: "energyRecharge", value: 0.065 },
    ]);
  });
});
