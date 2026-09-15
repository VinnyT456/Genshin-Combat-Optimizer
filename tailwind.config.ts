import type { Config } from "tailwindcss";

// ---------------------------------------------------------------------------
// Design tokens. Source of truth: docs/design/DESIGN-SYSTEM.md.
// Current surface/CTA contrast is recorded in the 2026 cyberpunk update there.
// Re-measure contrast before changing surface or foreground values.
// ---------------------------------------------------------------------------

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    // Radius scale — CLOSED SET (DESIGN-SYSTEM "Borders / radius / shadows", D1).
    //
    // This REPLACES Tailwind's radius scale rather than extending it. Under
    // `theme.extend`, Tailwind's lg/2xl/3xl stay available and the documented
    // "no other radii" rule is unenforceable prose. Replacing makes
    // `rounded-lg` / `rounded-2xl` / `rounded-3xl` fail to produce a class, so
    // the scale enforces itself instead of relying on reviewer diligence.
    borderRadius: {
      none: "0",
      sm: "2px", // inline chips, bars, dense markers
      md: "6px", // default — cards, panels, buttons, inputs, tabs
      xl: "12px", // dialog panels and bottom sheets ONLY
      full: "9999px", // circular timeline markers and avatars ONLY
    },
    extend: {
      colors: {
        surface: {
          DEFAULT: "#080c10",
          raised: "#10171c",
          // Hover elevation for raised surfaces (DESIGN-SYSTEM interaction states).
          hover: "#19252c",
          border: "#2b3b43",
        },
        element: {
          pyro: "#ec4c3a",
          hydro: "#2f9fe0",
          electro: "#b26cf5",
          cryo: "#7ad4e8",
          anemo: "#4ad2a6",
          geo: "#e0a53b",
          dendro: "#8bc34a",
          physical: "#c9ced9",
        },
        // Four semantic states only. Each is a fg/bg/border triplet; `bg` is
        // never used without `fg` text, and state colour is never the sole
        // signal (a label or glyph always accompanies it).
        state: {
          success: {
            fg: "#4ade80",
            bg: "rgba(74,222,128,0.12)",
            border: "rgba(74,222,128,0.32)",
          },
          warning: {
            fg: "#fbbf24",
            bg: "rgba(251,191,36,0.12)",
            border: "rgba(251,191,36,0.32)",
          },
          error: {
            fg: "#f87171",
            bg: "rgba(248,113,113,0.12)",
            border: "rgba(248,113,113,0.32)",
          },
          info: {
            fg: "#7dd3fc",
            bg: "rgba(125,211,252,0.12)",
            border: "rgba(125,211,252,0.32)",
          },
        },
      },
      fontFamily: {
        // System UI stack — no webfont, no FOUT, neutral technical voice.
        // Latin faces FIRST, then the CJK faces. Order is load-bearing: a CJK
        // family ahead of the Latin ones supplies its own numerals, which are
        // not tabular, silently breaking `tabular-nums` column alignment in a
        // product built on numeric columns.
        //
        // Without the CJK entries, Han glyphs fall through to generic
        // `sans-serif` — SimSun, a SERIF, on much of Windows. macOS is
        // accidentally fine because `-apple-system` resolves CJK, which is why
        // this is invisible on a Mac dev machine (UI-AUDIT-055 F5).
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Noto Sans CJK SC",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        // The `micro` step of the 7-step type scale. 11px is the floor; the
        // Phase 1 `text-[10px]` usage is retired.
        micro: ["11px", { lineHeight: "14px" }],
      },
      transitionDuration: {
        // Motion budget: nothing animates longer than 150ms.
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
} satisfies Config;
