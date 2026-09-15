"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar";
import { LiveRegion } from "@/components/ui/LiveRegion";
import { cn } from "@/components/ui/cn";
import { FOCUS_RING, TRANSITION_COLORS } from "@/components/ui/tokens";
import { elementZh, charNameZh } from "@/lib/i18n";
import {
  isValidEnkaUid,
  type EnkaCommit,
  type EnkaImportResult,
  type EnkaImportPreview,
} from "./contracts";
import { isRefinementValue } from "@/features/team-builder/equipmentSelection";

interface Props {
  open: boolean;
  onClose: () => void;
  onCommit: (commit: EnkaCommit) => void;
  readonly presentation?: "inline" | "entry";
  readonly focusInputOnOpen?: boolean;
}

/**
 * Inline Enka import surface. It intentionally lives in the team section
 * instead of a modal: importing a roster is part of team setup, and the user
 * should be able to keep the team and the imported preview in context.
 */
export function EnkaImportDialog({ open, onClose, onCommit, presentation = "inline", focusInputOnOpen = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const [uid, setUid] = useState("");
  const [preview, setPreview] = useState<EnkaImportPreview | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (open) {
      setMessage("");
      setState("idle");
      setPreview(null);
      setSelected([]);
      setShowValidation(false);
      if (presentation === "inline" || focusInputOnOpen) inputRef.current?.focus();
      return () => requestRef.current?.abort();
    }
    requestRef.current?.abort();
    requestRef.current = null;
  }, [focusInputOnOpen, open, presentation]);

  const valid = isValidEnkaUid(uid);

  async function load() {
    if (!valid) {
      setShowValidation(true);
      inputRef.current?.focus();
      return;
    }
    setShowValidation(false);
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setState("loading");
    setMessage("正在读取公开角色数据…");
    try {
      const response = await fetch("/api/enka/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: uid.trim() }),
        signal: controller.signal,
      });
      const result = (await response.json()) as EnkaImportResult;
      if (!result.ok) {
        setState("error");
        setMessage(result.message);
        return;
      }
      setPreview(result.preview);
      const initial = result.preview.characters
        .filter((character) => character.selectable)
        .slice(0, 4)
        .map((character) => character.key);
      setSelected(initial);
      setState("idle");
      setMessage(
        result.preview.characters.length === 0
          ? "该 UID 没有可导入的公开角色。请确认游戏内已开启角色展示。"
          : `已读取 ${result.preview.characters.length} 个角色，可导入 ${initial.length} 个`,
      );
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setState("error");
      setMessage("网络请求失败，请稍后重试");
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }

  function toggle(key: string) {
    if (!preview?.characters.find((character) => character.key === key)?.selectable) {
      return;
    }
    setSelected((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : current.length >= 4
          ? current
          : [...current, key],
    );
  }

  function commit() {
    if (!preview) return;
    const chosen = selected
      .map((key) => preview.characters.find((character) => character.key === key))
      .filter(
        (character): character is NonNullable<typeof character> =>
          character?.character !== undefined,
      );
    const availableCharacters = preview.characters
      .filter((character) => character.selectable && character.character !== undefined)
      .map((character) => character.character!);

    onCommit({
      uid: preview.uid,
      characters: chosen.map((character) => character.character!),
      availableCharacters,
      equipment: Object.fromEntries(
        chosen
          .filter(
            (character) =>
              character.equipment &&
              (character.weapon === undefined ||
                isRefinementValue(character.weapon.refinement)),
          )
          .map((character) => [character.character!.id, character.equipment!]),
      ),
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div
      role="region"
      aria-labelledby={presentation === "inline" ? "enka-import-title" : undefined}
      aria-label={presentation === "entry" ? "公开角色读取" : undefined}
      className={cn(
        presentation === "inline"
          ? "mb-5 overflow-hidden rounded-sm border border-cyan-300/40 bg-surface-raised shadow-[inset_3px_0_0_rgba(34,211,238,0.55)]"
          : "",
      )}
    >
      {presentation === "inline" && <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border bg-[#0f1723] px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 rounded-sm border border-cyan-300/50 px-2 py-1 font-mono text-xs font-bold tracking-wider text-cyan-200"
          >
            ENKA // API
          </span>
          <div>
            <h3 id="enka-import-title" className="font-semibold text-slate-100">
              从公开 UID 同步你的角色
            </h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
              自动带入展示角色的等级、命座、天赋、武器与圣遗物属性；导入后仍可自由编辑装备。
            </p>
          </div>
        </div>
        <Button
          variant="quiet"
          size="sm"
          onClick={onClose}
          aria-label="收起 Enka 导入面板"
        >
          收起
        </Button>
      </div>}

      <div className={cn("space-y-4", presentation === "inline" ? "px-4 py-4 sm:px-5" : "")}>
        <LiveRegion message={state === "error" ? "" : message} />
        <form
          className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            void load();
          }}
        >
          <div className="min-w-0 border-l-2 border-cyan-300/50 pl-3">
            <div className="mb-1.5 flex items-baseline gap-2">
              <label className="text-xs font-semibold text-slate-200" htmlFor="enka-uid">公开 UID</label>
              <span className="text-micro text-slate-400"><span className="font-mono">9–10</span> 位数字</span>
            </div>
            <input
              ref={inputRef}
              id="enka-uid"
              name="enka-uid"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              value={uid}
              onChange={(event) => {
                setUid(event.target.value.replace(/\D/g, "").slice(0, 10));
                setShowValidation(false);
                if (state === "error") {
                  setState("idle");
                  setMessage("");
                }
              }}
              onBlur={() => {
                if (uid.length > 0 && !valid) setShowValidation(true);
              }}
              aria-invalid={showValidation && !valid}
              aria-describedby={`enka-help${showValidation && !valid ? " enka-invalid-error" : state === "error" ? " enka-error" : ""}`}
              placeholder="例如 987654321…"
              className={cn(
                "min-h-11 min-w-0 w-full rounded-sm border border-surface-border bg-surface px-3 py-2.5 font-mono text-slate-100 placeholder:text-slate-400",
                FOCUS_RING,
                "focus:border-cyan-300",
              )}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={state === "loading"}
            className="min-h-11 self-end px-5 lg:min-w-32"
          >
            {state === "loading" ? "读取中…" : "读取角色"}
          </Button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-border/70 pt-3">
          <p id="enka-help" className="text-xs text-slate-400">
            UID 用于读取公开角色，并暂存于本次浏览会话；不会写入网址。请先在游戏内开启角色展示。
          </p>
        </div>
        {showValidation && !valid && (
          <p id="enka-invalid-error" role="alert" className="border-l-2 border-amber-400/70 bg-amber-400/5 px-3 py-2 text-sm text-amber-200">
            请输入 9–10 位公开 UID。
          </p>
        )}
        {state === "error" && !(uid.length > 0 && !valid) && (
          <p id="enka-error" role="alert" className="border-l-2 border-red-400/70 bg-red-400/5 px-3 py-2 text-sm text-red-300">
            {message}
          </p>
        )}
        {preview && preview.characters.length === 0 && (
          <div
            role="status"
            className="rounded-sm border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-100"
          >
            该 UID 的角色展示为空或未公开，因此没有可导入的角色。
          </div>
        )}
        {preview && preview.characters.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-200">选择角色（最多 4 位）</p>
              <span className="text-xs text-slate-400">
                数据有效期约 {preview.ttlSeconds} 秒
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {preview.characters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  disabled={!item.selectable}
                  onClick={() => toggle(item.key)}
                  aria-pressed={selected.includes(item.key)}
                  className={cn(
                    "flex gap-3 rounded-sm border p-3 text-left",
                    TRANSITION_COLORS,
                    FOCUS_RING,
                    selected.includes(item.key)
                      ? "border-cyan-300/80 bg-cyan-300/10"
                      : "border-surface-border bg-surface hover:border-cyan-300/60 hover:bg-cyan-300/5",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {item.character ? (
                    <CharacterAvatar
                      characterId={item.portraitId}
                      characterName={item.character.name}
                      element={item.character.element}
                      size="lg"
                    />
                  ) : (
                    <div
                      className="h-12 w-12 rounded-full border border-surface-border"
                      aria-hidden="true"
                    />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="block truncate font-semibold">
                        {item.character ? charNameZh(item.character.name) : "未知角色"}
                      </span>
                      <span className={cn("shrink-0 text-micro", selected.includes(item.key) ? "text-cyan-200" : "text-slate-400")}>
                        {selected.includes(item.key) ? "已选择" : item.selectable ? "可选择" : "不可用"}
                      </span>
                    </span>
                    {item.character && (
                      <span className="block text-xs text-slate-400">
                        {elementZh(item.character.element)} · Lv.{item.character.level} · C
                        {item.constellation}
                      </span>
                    )}
                    <span className="block text-xs text-slate-400">
                      {item.talents
                        ? `天赋 ${item.talents.normal}/${item.talents.skill}/${item.talents.burst}`
                        : "天赋：暂不可用"}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {item.weapon
                        ? `武器：${item.weapon.name} Lv.${item.weapon.level} R${item.weapon.refinement}`
                        : "武器：未映射"}
                    </span>
                    <span className="block text-xs text-slate-400">{item.artifactSummary}</span>
                    {item.issues.map((issue) => (
                      <span key={issue} className="block text-xs text-amber-300">
                        {issue}
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" className="min-h-11" onClick={onClose}>
                取消
              </Button>
              <Button variant="primary" className="min-h-11" onClick={commit} disabled={selected.length === 0}>
                导入已选角色（{selected.length}）
              </Button>
            </div>
            {selected.length === 0 && (
              <p className="text-right text-xs text-amber-200" role="status">请至少选择 1 位角色。</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
