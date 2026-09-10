"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { Element } from "@/types";
import { cn } from "@/components/ui/cn";
import {
  AVATAR_PLACEHOLDER_STYLES,
  getAvatarInitials,
  getAvatarSources,
} from "@/features/team-builder/characterAssets";

/**
 * Rendered size per variant. Every variant is a fixed square so the space is
 * RESERVED before the portrait loads: the placeholder, the loading state and
 * the loaded image all occupy identical boxes, so nothing shifts on load or on
 * error. `sizePx` feeds `next/image` so it requests an appropriately sized
 * asset rather than the full-resolution file.
 */
const AVATAR_SIZES = {
  sm: { box: "h-6 w-6", text: "text-micro", sizePx: 24 },
  md: { box: "h-9 w-9", text: "text-micro", sizePx: 36 },
  lg: { box: "h-12 w-12", text: "text-label", sizePx: 48 },
  xl: { box: "h-16 w-16", text: "text-body", sizePx: 64 },
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZES;

interface Props {
  characterId: string;
  characterName: string;
  element?: Element;
  size?: AvatarSize;
  className?: string;
}

/** Which source the component is currently attempting. */
type SourceStage = "primary" | "fallback" | "placeholder";

/**
 * Character portrait with a mandatory failure path.
 *
 * The portrait is DECORATIVE (`alt=""`): every caller renders the character's
 * name as adjacent visible text, so giving the image an accessible name would
 * make screen readers announce the name twice. An icon is never the accessible
 * name for this component.
 */
export function CharacterAvatar({
  characterId,
  characterName,
  element = "physical",
  size = "md",
  className,
}: Props) {
  const sources = useMemo(
    () => getAvatarSources(characterId, characterName),
    [characterId, characterName],
  );

  // Characters with no published portrait skip the network entirely.
  const initialStage: SourceStage = sources.primary === null ? "placeholder" : "primary";
  const [stage, setStage] = useState<SourceStage>(initialStage);
  const [stageForId, setStageForId] = useState(characterId);

  // Reset when the component is reused for a different character, without an
  // effect: deriving during render avoids a frame showing the old portrait.
  const activeStage = stageForId === characterId ? stage : initialStage;
  if (stageForId !== characterId) {
    setStageForId(characterId);
    setStage(initialStage);
  }

  const variant = AVATAR_SIZES[size];
  const src = activeStage === "primary" ? sources.primary : sources.fallback;

  function handleError() {
    setStage((current) => (current === "primary" ? "fallback" : "placeholder"));
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border",
        variant.box,
        AVATAR_PLACEHOLDER_STYLES[element],
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
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true" className={cn("font-semibold leading-none", variant.text)}>
          {getAvatarInitials(characterName)}
        </span>
      )}
    </div>
  );
}
