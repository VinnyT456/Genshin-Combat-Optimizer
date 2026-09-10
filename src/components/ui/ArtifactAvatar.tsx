"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/components/ui/cn";
import {
  getArtifactIconSources,
  getArtifactInitial,
} from "@/features/team-builder/artifactAssets";

/**
 * Rendered size per variant. Every variant is a fixed square so the space is
 * RESERVED before the icon loads: the placeholder, the in-flight state and the
 * loaded image all occupy identical boxes, so nothing shifts on load or on
 * error. `sizePx` feeds `next/image` so it requests an appropriately sized
 * asset rather than the full-resolution file.
 */
const ARTIFACT_SIZES = {
  sm: { box: "h-9 w-9", text: "text-sm", sizePx: 36 },
  md: { box: "h-12 w-12", text: "text-base", sizePx: 48 },
} as const;

export type ArtifactAvatarSize = keyof typeof ARTIFACT_SIZES;

/** Which source the component is currently attempting. */
type SourceStage = "primary" | "fallback" | "placeholder";

interface Props {
  /** Project Amber icon identity from the generated data. */
  iconId?: string;
  nameZh: string;
  size?: ArtifactAvatarSize;
  className?: string;
}

/**
 * Artifact set icon with a mandatory failure path.
 *
 * These are third-party CDNs, so failure is a normal state, not an edge case:
 * primary → fallback host → a legible glyph placeholder. A set whose icon
 * cannot load still renders a filled, correctly-sized box.
 *
 * The icon is DECORATIVE (`alt=""`). Every caller renders the set's Chinese
 * name as adjacent visible text, so giving the image an accessible name would
 * make a screen reader announce the name twice. An icon is never the
 * accessible name for this component, and the picker stays fully usable with
 * every image blocked.
 */
export function ArtifactAvatar({ iconId, nameZh, size = "md", className }: Props) {
  const sources = useMemo(() => getArtifactIconSources(iconId), [iconId]);

  // Sets with no usable icon id skip the network entirely.
  const initialStage: SourceStage = sources.primary === null ? "placeholder" : "primary";
  const [stage, setStage] = useState<SourceStage>(initialStage);
  const [stageForIcon, setStageForIcon] = useState(iconId);

  // Reset when the component is reused for a different set, without an effect:
  // deriving during render avoids a frame showing the previous set's icon.
  const activeStage = stageForIcon === iconId ? stage : initialStage;
  if (stageForIcon !== iconId) {
    setStageForIcon(iconId);
    setStage(initialStage);
  }

  const variant = ARTIFACT_SIZES[size];
  const src = activeStage === "primary" ? sources.primary : sources.fallback;

  function handleError() {
    setStage((current) => (current === "primary" ? "fallback" : "placeholder"));
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300",
        variant.box,
        className,
      )}
    >
      {activeStage !== "placeholder" && src !== null ? (
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
