"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import {
  getArtifactIconSources,
  getArtifactIconSourcesForSlot,
  getArtifactInitial,
} from "@/features/team-builder/artifactAssets";
import type { ArtifactSlot } from "@/simulation/character/equipment";

/**
 * Rendered size per variant. Every variant is a fixed square so the space is
 * RESERVED before the icon loads: the placeholder, the in-flight state and the
 * loaded image all occupy identical boxes, so nothing shifts on load or on
 * error. `sizePx` feeds `next/image` so it requests an appropriately sized
 * asset rather than the full-resolution file.
 */
const ARTIFACT_SIZES = {
  xs: { box: "h-8 w-8", text: "text-xs", sizePx: 32 },
  sm: { box: "h-9 w-9", text: "text-sm", sizePx: 36 },
  md: { box: "h-12 w-12", text: "text-base", sizePx: 48 },
  lg: { box: "h-24 w-24", text: "text-2xl", sizePx: 96 },
} as const;

export type ArtifactAvatarSize = keyof typeof ARTIFACT_SIZES;

interface Props {
  /** Project Amber icon identity from the generated data. */
  iconId?: string;
  nameZh: string;
  size?: ArtifactAvatarSize;
  /** Optional piece selection for the detailed artifact preview. */
  slot?: ArtifactSlot;
  className?: string;
}

/**
 * Artifact set icon with a mandatory failure path.
 *
 * These are third-party CDNs, so failure is a normal state, not an edge case:
 * ordered CDN source chain → a legible text placeholder. A set whose icon
 * cannot load still renders a filled, correctly-sized box.
 *
 * The icon is DECORATIVE (`alt=""`). Every caller renders the set's Chinese
 * name as adjacent visible text, so giving the image an accessible name would
 * make a screen reader announce the name twice. An icon is never the
 * accessible name for this component, and the picker stays fully usable with
 * every image blocked.
 */
export function ArtifactAvatar({ iconId, nameZh, size = "md", slot, className }: Props) {
  const sources = useMemo<readonly string[]>(() => {
    if (slot !== undefined) return getArtifactIconSourcesForSlot(iconId, slot);
    const base = getArtifactIconSources(iconId);
    return [base.primary, base.fallback].filter(
      (source): source is string => source !== null,
    );
  }, [iconId, slot]);

  // Sets with no usable icon id skip the network entirely.
  const sourceKey = `${iconId ?? ""}:${slot ?? ""}`;
  const [sourceIndex, setSourceIndex] = useState(0);
  const [sourceKeyForState, setSourceKeyForState] = useState(sourceKey);

  // Reset when the component is reused for a different set, without an effect:
  // deriving during render avoids a frame showing the previous set's icon.
  const activeSourceIndex = sourceKeyForState === sourceKey ? sourceIndex : 0;
  if (sourceKeyForState !== sourceKey) {
    setSourceKeyForState(sourceKey);
    setSourceIndex(0);
  }

  const variant = ARTIFACT_SIZES[size];
  const src = sources[activeSourceIndex] ?? null;

  function handleError() {
    setSourceIndex((current) => Math.min(current + 1, sources.length));
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-amber-500/30 bg-amber-500/10 text-amber-300",
        variant.box,
        className,
      )}
    >
      {src !== null ? (
        <Image
          src={src}
          alt=""
          width={variant.sizePx}
          height={variant.sizePx}
          loading="lazy"
          unoptimized
          onError={handleError}
          className="h-full w-full object-contain"
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn("font-semibold leading-none", variant.text)}
        >
          {getArtifactInitial(nameZh)}
        </span>
      )}
    </div>
  );
}
