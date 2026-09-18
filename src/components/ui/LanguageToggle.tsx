"use client";

import { useLanguage } from "./LanguageProvider";
import { FOCUS_RING, TRANSITION_COLORS } from "./tokens";
import { cn } from "./cn";

export function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage();
  const nextLanguage = locale === "zh" ? "English" : "中文";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={cn(
        "min-h-10 border border-surface-border px-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-slate-300",
        "hover:border-cyan-300/70 hover:text-cyan-200",
        TRANSITION_COLORS,
        FOCUS_RING,
      )}
      aria-label={`${nextLanguage} / Switch language`}
      title={`${nextLanguage} / Switch language`}
    >
      {locale === "zh" ? "EN" : "中"}
    </button>
  );
}
