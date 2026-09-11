"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import { cn } from "@/components/ui/cn";
import { IconButton } from "@/components/ui/IconButton";
import { acquireScrollLock, releaseScrollLock } from "@/components/ui/scrollLock";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

/**
 * The dialog sizes this product uses. Named rather than passed as raw classes
 * so four surfaces cannot drift into four different idioms again.
 *
 * `browse` is the full-width browsing surface (character / weapon / artifact
 * pickers: a large filtered grid). `detail` is the reading-and-editing surface
 * (one entity's configuration). `compact` is for short confirmations.
 */
export type DialogSize = "browse" | "detail" | "compact";

const SIZE_CLASS: Record<DialogSize, string> = {
  // Pickers use the full viewport on phones so filters, cards, and detail
  // actions have room to breathe. Desktop keeps the bounded workbench shell.
  browse: "h-[100dvh] w-full max-w-7xl sm:h-[90vh] sm:w-[96vw]",
  detail: "h-[100dvh] w-full max-w-4xl sm:h-[90vh] sm:w-[96vw]",
  compact: "w-[96vw] max-w-lg",
};

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Element to focus on open; falls back to the first focusable child. */
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Named size. Defaults to `compact`. */
  size?: DialogSize;
  className?: string;
}

/**
 * Modal dialog on desktop/tablet, bottom sheet on mobile. Traps focus, closes
 * on `Esc`, and restores focus to the invoking element on close.
 *
 * Presentation only — it owns no application state.
 */
export function Dialog({
  open,
  title,
  onClose,
  children,
  initialFocusRef,
  size = "compact",
  className,
}: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || panelRef.current === null) return;

      const items = focusableWithin(panelRef.current);
      const first = items[0];
      const last = items[items.length - 1];
      if (first === undefined || last === undefined) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  // The page behind a modal must not scroll. `overscroll-behavior: contain`
  // (below) only stops scroll CHAINING; it does nothing for a wheel or touch
  // over the scrim, so the document itself is taken out of scroll here.
  useEffect(() => {
    if (!open) return;
    acquireScrollLock();
    return () => releaseScrollLock();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const target =
      initialFocusRef?.current ??
      (panelRef.current ? focusableWithin(panelRef.current)[0] : undefined);
    target?.focus();

    const restore = restoreRef.current;
    return () => restore?.focus();
  }, [open, initialFocusRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Scrim. A sibling button so the overlay is dismissible by pointer
          without putting a click handler on a div. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/70"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex max-h-[100dvh] w-full flex-col overflow-hidden border border-surface-border bg-surface-raised shadow-xl shadow-black/70",
          "rounded-t-xl sm:rounded-xl",
          SIZE_CLASS[size],
          className,
        )}
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-surface-border px-4 py-3">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <IconButton label="关闭对话框" glyph="✕" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{ overscrollBehavior: "contain" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
