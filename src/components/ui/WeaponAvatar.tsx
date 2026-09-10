"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { cn } from "@/components/ui/cn";
import type { WeaponRarity, WeaponType } from "@/game-data/weapons/types";

interface Props {
  name: string;
  nameZh?: string;
  weaponType?: WeaponType;
  rarity: WeaponRarity;
  iconUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
};

export function WeaponAvatar({
  name,
  nameZh,
  rarity,
  iconUrl,
  size = "md",
  className,
}: Props) {
  const [loadFailed, setLoadFailed] = useState(false);

  const rarityGradient =
    rarity === 5
      ? "from-amber-500/25 to-amber-950/40 border-amber-500/40"
      : "from-purple-500/25 to-purple-950/40 border-purple-500/40";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-b shadow-sm",
        rarityGradient,
        SIZE_CLASSES[size],
        className,
      )}
    >
      {!loadFailed && iconUrl ? (
        <img
          src={iconUrl}
          alt={nameZh || name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setLoadFailed(true)}
          className="h-full w-full object-contain p-0.5"
        />
      ) : (
        <span
          className={cn(
            "font-bold",
            rarity === 5 ? "text-amber-300" : "text-purple-300",
          )}
        >
          {nameZh ? nameZh.charAt(0) : name.charAt(0)}
        </span>
      )}
    </div>
  );
}
