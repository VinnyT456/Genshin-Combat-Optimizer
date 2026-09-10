"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_URL_STATE,
  decodeUrlState,
  urlStateEquals,
  urlStateToPath,
  type UrlState,
} from "./urlState";

// ---------------------------------------------------------------------------
// Browser binding for the deep-linkable state in `urlState.ts`.
//
// The encode/decode rules are pure and live next door; this hook owns only the
// History API side effects:
//   - read the initial state from the current URL (after mount, so server and
//     client first render agree and React does not report a hydration
//     mismatch),
//   - push a new entry when the user changes state,
//   - adopt the URL again on popstate, so Back/Forward genuinely navigate
//     between configurations instead of leaving the app.
//
// `replace` exists for changes that should not each earn a history entry — a
// search box would otherwise push one entry per keystroke and make Back
// useless.
// ---------------------------------------------------------------------------

interface UseUrlStateResult {
  readonly state: UrlState;
  /** Pushes a new history entry. Use for deliberate, discrete changes. */
  readonly push: (next: UrlState) => void;
  /** Rewrites the current entry. Use for continuous input like a search box. */
  readonly replace: (next: UrlState) => void;
  /** True once the URL has been read; guards against acting on the default. */
  readonly hydrated: boolean;
}

export function useUrlState(): UseUrlStateResult {
  const [state, setState] = useState<UrlState>(DEFAULT_URL_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Mirrors `state` for the popstate listener, which must not be re-subscribed
  // on every state change.
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(decodeUrlState(window.location.search));
    setHydrated(true);

    const onPopState = () => {
      setState(decodeUrlState(window.location.search));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const commit = useCallback((next: UrlState, mode: "push" | "replace") => {
    // A no-op change must not create a history entry, or Back would appear
    // broken: the user would press it and land on an identical view.
    if (urlStateEquals(next, stateRef.current)) {
      setState(next);
      return;
    }
    const url = urlStateToPath(next, window.location.pathname);
    if (mode === "push") {
      window.history.pushState(null, "", url);
    } else {
      window.history.replaceState(null, "", url);
    }
    setState(next);
  }, []);

  const push = useCallback((next: UrlState) => commit(next, "push"), [commit]);
  const replace = useCallback((next: UrlState) => commit(next, "replace"), [commit]);

  return { state, push, replace, hydrated };
}
