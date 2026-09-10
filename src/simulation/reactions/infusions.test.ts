import { describe, expect, it } from "vitest";
import {
  DEFAULT_INFUSION_TARGETS,
  isInfusionActive,
  resolveInfusedElement,
  type InfusionDefinition,
} from "@/simulation/reactions/infusions";


// ============================================================================
// Weapon Infusions unit test suite.
//
// Verifies:
//  - Priority rules: non-overridable beats overridable; most recent beats earlier
//  - Damage type targeting (default normal/charged/plunge vs skill/burst, custom lists)
//  - Half-open time window activation and expiry
//  - Clean fallback to originalElement when no infusion applies
// ============================================================================

describe("DEFAULT_INFUSION_TARGETS", () => {
  it("defaults to normal, charged, and plunge", () => {
    expect(DEFAULT_INFUSION_TARGETS).toEqual(["normal", "charged", "plunge"]);
  });
});

describe("isInfusionActive", () => {
  const infusion: InfusionDefinition = {
    id: "test-infusion",
    element: "pyro",
    durationSeconds: 10,
    canBeOverridden: true,
  };

  it("is NOT active before startTime", () => {
    expect(isInfusionActive({ infusion, startTime: 5 }, 4.99)).toBe(false);
  });

  it("IS active at startTime (inclusive)", () => {
    expect(isInfusionActive({ infusion, startTime: 5 }, 5.0)).toBe(true);
  });

  it("IS active mid-window", () => {
    expect(isInfusionActive({ infusion, startTime: 5 }, 10.0)).toBe(true);
  });

  it("is NOT active at startTime + duration (exclusive)", () => {
    expect(isInfusionActive({ infusion, startTime: 5 }, 15.0)).toBe(false);
  });

  it("is NOT active after expiration", () => {
    expect(isInfusionActive({ infusion, startTime: 5 }, 16.0)).toBe(false);
  });

  it("remains active indefinitely for infinite duration", () => {
    const permInfusion: InfusionDefinition = {
      ...infusion,
      durationSeconds: Number.POSITIVE_INFINITY,
    };
    expect(isInfusionActive({ infusion: permInfusion, startTime: 5 }, 1000)).toBe(true);
  });

  it("is inert when duration <= 0", () => {
    const zeroInfusion: InfusionDefinition = {
      ...infusion,
      durationSeconds: 0,
    };
    expect(isInfusionActive({ infusion: zeroInfusion, startTime: 0 }, 0)).toBe(false);
  });
});

describe("resolveInfusedElement", () => {
  const overridableCryo: InfusionDefinition = {
    id: "chongyun-e",
    element: "cryo",
    durationSeconds: 10,
    canBeOverridden: true,
  };

  const overridablePyro: InfusionDefinition = {
    id: "bennett-c6",
    element: "pyro",
    durationSeconds: 15,
    canBeOverridden: true,
  };

  const nonOverridableElectro: InfusionDefinition = {
    id: "raiden-q",
    element: "electro",
    durationSeconds: 7,
    canBeOverridden: false,
  };

  const nonOverridableAnemo: InfusionDefinition = {
    id: "xiao-q",
    element: "anemo",
    durationSeconds: 15,
    canBeOverridden: false,
  };

  it("returns originalElement when activeInfusions is empty", () => {
    expect(resolveInfusedElement("physical", "normal", [], 0)).toBe("physical");
    expect(resolveInfusedElement("hydro", "skill", [], 0)).toBe("hydro");
  });

  it("infuses normal attack when an overridable infusion is active", () => {
    const active = [{ infusion: overridableCryo, startTime: 0 }];
    expect(resolveInfusedElement("physical", "normal", active, 5)).toBe("cryo");
  });

  describe("damage type targeting", () => {
    it("applies to normal, charged, and plunge by default", () => {
      const active = [{ infusion: overridablePyro, startTime: 0 }];
      expect(resolveInfusedElement("physical", "normal", active, 1)).toBe("pyro");
      expect(resolveInfusedElement("physical", "charged", active, 1)).toBe("pyro");
      expect(resolveInfusedElement("physical", "plunge", active, 1)).toBe("pyro");
    });

    it("does NOT apply to skill or burst by default", () => {
      const active = [{ infusion: overridablePyro, startTime: 0 }];
      expect(resolveInfusedElement("physical", "skill", active, 1)).toBe("physical");
      expect(resolveInfusedElement("physical", "burst", active, 1)).toBe("physical");
    });

    it("respects custom targets allowlist", () => {
      const normalOnly: InfusionDefinition = {
        id: "normal-only",
        element: "hydro",
        durationSeconds: 10,
        canBeOverridden: true,
        targets: ["normal"],
      };
      const active = [{ infusion: normalOnly, startTime: 0 }];
      expect(resolveInfusedElement("physical", "normal", active, 1)).toBe("hydro");
      expect(resolveInfusedElement("physical", "charged", active, 1)).toBe("physical");
      expect(resolveInfusedElement("physical", "plunge", active, 1)).toBe("physical");
    });
  });

  describe("priority rules", () => {
    it("non-overridable beats overridable even if overridable was cast later", () => {
      // Raiden Q at t=1 (non-overridable), Bennett C6 at t=2 (overridable)
      const active = [
        { infusion: nonOverridableElectro, startTime: 1 },
        { infusion: overridablePyro, startTime: 2 },
      ];
      // At t=3: non-overridable electro wins over pyro
      expect(resolveInfusedElement("physical", "normal", active, 3)).toBe("electro");
    });

    it("most recent beats earlier among overridable infusions", () => {
      // Chongyun at t=1, Bennett C6 at t=2
      const active = [
        { infusion: overridableCryo, startTime: 1 },
        { infusion: overridablePyro, startTime: 2 },
      ];
      // At t=3: Bennett (t=2) is more recent than Chongyun (t=1) -> Pyro
      expect(resolveInfusedElement("physical", "normal", active, 3)).toBe("pyro");

      // In reverse array order, result is still identical (order-independent)
      const reversed = [
        { infusion: overridablePyro, startTime: 2 },
        { infusion: overridableCryo, startTime: 1 },
      ];
      expect(resolveInfusedElement("physical", "normal", reversed, 3)).toBe("pyro");
    });

    it("most recent beats earlier among non-overridable infusions", () => {
      // Raiden at t=1, Xiao at t=3
      const active = [
        { infusion: nonOverridableElectro, startTime: 1 },
        { infusion: nonOverridableAnemo, startTime: 3 },
      ];
      // At t=4: Xiao (t=3) is more recent -> Anemo
      expect(resolveInfusedElement("physical", "normal", active, 4)).toBe("anemo");
    });

    it("reverts to earlier active infusion when more recent infusion expires", () => {
      // Chongyun (t=0, duration 15 -> expires 15)
      // Keqing (t=2, duration 5 -> expires 7)
      const keqingInfusion: InfusionDefinition = {
        id: "keqing-e",
        element: "electro",
        durationSeconds: 5,
        canBeOverridden: true,
      };
      const active = [
        { infusion: overridableCryo, startTime: 0 },
        { infusion: keqingInfusion, startTime: 2 },
      ];

      // At t=4: Keqing is active and more recent -> Electro
      expect(resolveInfusedElement("physical", "normal", active, 4)).toBe("electro");

      // At t=8: Keqing has expired (2+5=7), Chongyun is still active (0+15=15) -> Cryo
      expect(resolveInfusedElement("physical", "normal", active, 8)).toBe("cryo");

      // At t=16: both expired -> physical
      expect(resolveInfusedElement("physical", "normal", active, 16)).toBe("physical");
    });
  });

  it("is pure and does not mutate the input activeInfusions array", () => {
    const active = [
      { infusion: overridableCryo, startTime: 1 },
      { infusion: overridablePyro, startTime: 2 },
    ];
    const originalFirstId = active[0]!.infusion.id;
    resolveInfusedElement("physical", "normal", active, 3);
    expect(active[0]!.infusion.id).toBe(originalFirstId);
    expect(active.length).toBe(2);
  });
});
