// ---------------------------------------------------------------------------
// Body scroll lock for modal layers.
//
// `overscroll-behavior: contain` was previously credited with solving this. It
// does not: it stops scroll CHAINING (a scroller reaching its end handing the
// remaining delta to an ancestor). It does nothing when the pointer is over the
// scrim, or over any non-scrollable part of the dialog — the page underneath
// still scrolls on wheel and on iOS touch.
//
// The fix is to actually take the document out of scroll while a modal is open.
// Setting `overflow: hidden` on <body> alone reflows the page by the width of
// the vanished scrollbar, so the compensating padding is applied at the same
// time; without it every modal open jolts the page sideways.
//
// Reference-counted, because more than one modal can legitimately be mounted
// at once (a picker opening a confirm). Only the first lock records the
// original style; only the last release restores it, so nested modals cannot
// leave the page permanently unscrollable.
//
// Pure DOM utility, framework-agnostic and directly testable.
// ---------------------------------------------------------------------------

let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

/** Width of the vertical scrollbar currently taken out of the layout. */
function scrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth;
}

/**
 * Locks document scrolling. Safe to call repeatedly; each call must be paired
 * with exactly one `releaseScrollLock()`.
 */
export function acquireScrollLock(): void {
  if (typeof document === "undefined") return;

  lockCount += 1;
  if (lockCount > 1) return;

  const { body } = document;
  savedOverflow = body.style.overflow;
  savedPaddingRight = body.style.paddingRight;

  const gap = scrollbarWidth();
  if (gap > 0) {
    const current = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
    body.style.paddingRight = `${current + gap}px`;
  }
  body.style.overflow = "hidden";
}

/** Releases one lock, restoring the original styles when the last one goes. */
export function releaseScrollLock(): void {
  if (typeof document === "undefined") return;
  if (lockCount === 0) return;

  lockCount -= 1;
  if (lockCount > 0) return;

  const { body } = document;
  body.style.overflow = savedOverflow;
  body.style.paddingRight = savedPaddingRight;
  savedOverflow = "";
  savedPaddingRight = "";
}

/** Current lock depth. Exposed for tests and debugging only. */
export function scrollLockDepth(): number {
  return lockCount;
}
