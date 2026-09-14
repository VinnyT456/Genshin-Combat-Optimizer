import { NextResponse } from "next/server";
import { isValidEnkaUid } from "@/features/enka-import/contracts";
import { normalizeEnkaPayload } from "@/features/enka-import/normalize";
import { mapEnkaPayload } from "@/features/enka-import/mapper";
import type { EnkaImportResult } from "@/features/enka-import/contracts";

const ENKA_URL = "https://enka.network/api/uid/";
const TIMEOUT_MS = 8_000;
const cache = new Map<string, { expires: number; value: EnkaImportResult }>();
const inflight = new Map<string, Promise<EnkaImportResult>>();

function error(code: Extract<EnkaImportResult, { ok: false }>['code'], message: string, retryAfterSeconds?: number): EnkaImportResult {
  return { ok: false, code, message, ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }) };
}

function headerSeconds(value: string | null): number | undefined {
  if (value === null) return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : undefined;
}

async function fetchUid(uid: string): Promise<EnkaImportResult> {
  const cached = cache.get(uid);
  if (cached && cached.expires > Date.now()) return cached.value;
  const pending = inflight.get(uid);
  if (pending) return pending;
  const promise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(`${ENKA_URL}${uid}/`, { headers: { "User-Agent": "GenshinCombatOptimizer/0.1.0" }, signal: controller.signal, cache: "no-store" });
      if (response.status === 429) return error("rate-limited", "Enka.Network 请求频率受限，请稍后重试", headerSeconds(response.headers.get("retry-after")));
      if (response.status === 404) return error("not-found", "未找到该公开 UID，或角色数据尚未公开");
      if (response.status === 403) return error("private", "该 UID 未公开角色数据");
      if (!response.ok) return error("upstream", "Enka.Network 暂时无法提供数据");
      let payload: unknown;
      try { payload = await response.json(); } catch { return error("invalid-response", "上游返回了无法读取的数据"); }
      const fetchedAt = new Date().toISOString();
      const normalized = normalizeEnkaPayload(payload);
      // `ttl` is part of the successful JSON body, not a rate-limit header.
      // Bound it so a malformed upstream value cannot create an unbounded
      // server cache or a misleadingly long UI expiry.
      const ttlSeconds = Math.min(Math.max(normalized.ttlSeconds ?? 60, 0), 300);
      const result: EnkaImportResult = { ok: true, preview: mapEnkaPayload(normalized, uid, fetchedAt, ttlSeconds) };
      if (ttlSeconds > 0) cache.set(uid, { expires: Date.now() + ttlSeconds * 1000, value: result });
      return result;
    } catch (cause) {
      return error(cause instanceof DOMException && cause.name === "AbortError" ? "timeout" : "upstream", "Enka.Network 请求失败，请稍后重试");
    } finally { clearTimeout(timer); inflight.delete(uid); }
  })();
  inflight.set(uid, promise);
  return promise;
}

export async function POST(request: Request) {
  let uid: unknown;
  try { uid = (await request.json() as { uid?: unknown }).uid; } catch { uid = undefined; }
  if (typeof uid !== "string" || !isValidEnkaUid(uid)) {
    return NextResponse.json(error("invalid-uid", "请输入 9–10 位公开 UID"), { status: 400, headers: { "Cache-Control": "private, no-store" } });
  }
  const result = await fetchUid(uid.trim());
  const status = result.ok ? 200 : result.code === "not-found" ? 404 : result.code === "private" ? 403 : result.code === "rate-limited" ? 429 : result.code === "timeout" ? 504 : 502;
  return NextResponse.json(result, { status, headers: { "Cache-Control": "private, no-store" } });
}
