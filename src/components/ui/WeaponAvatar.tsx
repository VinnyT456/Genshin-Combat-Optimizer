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

const SIZE_PIXELS = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
} as const;

export function WeaponAvatar({
  name,
  nameZh,
  rarity,
  iconUrl,
  size = "md",
  className,
}: Props) {
  const [loadFailed, setLoadFailed] = useState(false);

  const raritySurface =
    rarity === 5
      ? "border-amber-500/40 bg-amber-500/10"
      : "border-purple-500/40 bg-purple-500/10";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-sm border",
        raritySurface,
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
          width={SIZE_PIXELS[size]}
          height={SIZE_PIXELS[size]}
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
