import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("POST /api/enka/import", () => {
  it("rejects an invalid UID before contacting Enka", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(new Request("http://localhost/api/enka/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: "012345678" }),
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, code: "invalid-uid" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps a real Enka-shaped response and uses its body TTL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      avatarInfoList: [{
        avatarId: 10000032,
        propMap: { "4001": { type: 4001, ival: "90", val: "90" } },
        talentIdList: [321, 322, 323],
        equipList: [],
      }],
      ttl: 31,
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(new Request("http://localhost/api/enka/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: "987654321" }),
    }));
    const result = await response.json() as {
      ok: boolean;
      preview?: { ttlSeconds: number; characters: Array<{ character?: { id: string } }> };
    };

    expect(response.status).toBe(200);
    expect(result).toMatchObject({
      ok: true,
      preview: { ttlSeconds: 31, characters: [{ character: { id: "bennett" } }] },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://enka.network/api/uid/987654321/",
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({ "User-Agent": expect.stringContaining("GenshinCombatOptimizer") }),
      }),
    );
  });
});
