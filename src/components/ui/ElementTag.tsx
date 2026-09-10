import type { Element } from "@/types";
import { cn } from "@/components/ui/cn";
import { elementBgClass, elementTextClass } from "@/lib/format";
import { elementZh } from "@/lib/i18n";

interface Props {
  element: Element;
  className?: string;
}

/**
 * Element dot + element name in Chinese text.
 */
export function ElementTag({ element, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-micro font-medium uppercase tracking-wide",
        elementTextClass(element),
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", elementBgClass(element))}
      />
      {elementZh(element)}
    </span>
  );
}
