import type { Element } from "@/types";

export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

const elementColor: Record<Element, string> = {
  pyro: "text-element-pyro",
  hydro: "text-element-hydro",
  electro: "text-element-electro",
  cryo: "text-element-cryo",
  anemo: "text-element-anemo",
  geo: "text-element-geo",
  dendro: "text-element-dendro",
  physical: "text-element-physical",
};

export function elementTextClass(el: Element): string {
  return elementColor[el];
}

const elementBg: Record<Element, string> = {
  pyro: "bg-element-pyro",
  hydro: "bg-element-hydro",
  electro: "bg-element-electro",
  cryo: "bg-element-cryo",
  anemo: "bg-element-anemo",
  geo: "bg-element-geo",
  dendro: "bg-element-dendro",
  physical: "bg-element-physical",
};

export function elementBgClass(el: Element): string {
  return elementBg[el];
}

/** Uppercase element name, e.g. "PYRO". Element colour is never the sole signal. */
export function elementLabel(el: Element): string {
  return el.toUpperCase();
}

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

/** Formats a fraction (0.6) as a percentage string ("60%"). */
export function fmtPercent(fraction: number): string {
  return percentFormatter.format(fraction);
}
