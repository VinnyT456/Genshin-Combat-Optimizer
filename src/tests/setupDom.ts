// ---------------------------------------------------------------------------
// jsdom setup for React render tests.
//
// Loaded ONLY by files that opt into the jsdom environment (see
// `vitest.config.ts`). The simulation suite stays on `environment: "node"`:
// it is the bulk of the suite, it must stay fast, and giving pure math a DOM
// would let a test accidentally depend on browser globals that production
// never has.
//
// What this file provides, and why each piece is needed rather than nice:
//   1. `@testing-library/jest-dom` matchers (`toBeInTheDocument`, ...).
//   2. Automatic `cleanup()` between tests — Testing Library does NOT do this
//      for us under `globals: false`, and without it every render accumulates
//      in the same document and `getByRole` starts throwing "found multiple".
//   3. The browser APIs jsdom does not implement that our components call.
//      Each one is stubbed only because a real component reaches for it; none
//      is speculative.
// ---------------------------------------------------------------------------

import { afterEach, expect, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

afterEach(() => {
  cleanup();
  // The workspace autosaves a draft to localStorage, so without this a test
  // inherits the previous test's edited configuration and its "did this edit
  // change anything?" assertions silently stop testing anything. jsdom keeps
  // one storage per FILE, not per test, so clearing has to be explicit.
  window.localStorage.clear();
  window.sessionStorage.clear();
  // Each test sets its own URL; leaving the previous one leaks view state.
  window.history.replaceState(null, "", "/");
});

// `Dialog` reads `matchMedia` to honour `prefers-reduced-motion`. jsdom ships
// no implementation at all, so the bare call throws before any assertion runs.
if (typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string): MediaQueryList =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  });
}

// jsdom implements neither observer. Components that measure layout construct
// one at mount, so an undefined constructor is a render-time crash.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  } as unknown as typeof ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: readonly number[] = [];
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// jsdom does not implement scrollIntoView; `Dialog`'s focus management calls it.
if (typeof Element.prototype.scrollIntoView !== "function") {
  Element.prototype.scrollIntoView = vi.fn();
}
