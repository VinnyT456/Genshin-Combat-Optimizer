import type { Element } from "@/types";

/**
 * Lane-span fills. Element colour at reduced opacity for the body, with a
 * full-opacity left edge marking the start instant. Written as explicit class
 * maps because Tailwind cannot see dynamically-built class names.
 */
const SPAN_FILL: Record<Element, string> = {
  pyro: "bg-element-pyro/70 border-l-element-pyro",
  hydro: "bg-element-hydro/70 border-l-element-hydro",
  electro: "bg-element-electro/70 border-l-element-electro",
  cryo: "bg-element-cryo/70 border-l-element-cryo",
  anemo: "bg-element-anemo/70 border-l-element-anemo",
  geo: "bg-element-geo/70 border-l-element-geo",
  dendro: "bg-element-dendro/70 border-l-element-dendro",
  physical: "bg-element-physical/70 border-l-element-physical",
};

export function spanFillClass(element: Element): string {
  return SPAN_FILL[element];
}
