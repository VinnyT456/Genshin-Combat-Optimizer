import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * React render tests opt IN by filename: `*.dom.test.tsx`. Everything else
 * runs in node.
 *
 * The suffix is the opt-in mechanism (rather than a per-file docblock) because
 * it makes the environment visible in the filename and in `git diff`, and
 * because it lets the jsdom setup file be scoped to exactly that set. A
 * docblock cannot scope `setupFiles`, and a global setup file that imports
 * `@testing-library/react` and touches `window` breaks every node test — this
 * was measured, not assumed.
 */
const DOM_TESTS = "src/**/*.dom.test.tsx";
/** Node covers both extensions; `.test.tsx` files that are not DOM tests exist. */
const NODE_TESTS = ["src/**/*.test.ts", "src/**/*.test.tsx"];

const alias = { "@": resolve(__dirname, "./src") };

// tsconfig sets `jsx: "preserve"` for Next's own transform, which leaves vitest
// with no JSX handling. React 19 uses the automatic runtime.
const esbuild = { jsx: "automatic" } as const;

/**
 * Suite-wide budget, in milliseconds, replacing vitest's 5s default.
 *
 * Measured, not guessed: the heaviest DOM tests render the whole workspace and
 * take 1-3.4s in isolation, but 3-5x that when the pool runs files in parallel
 * on a loaded machine. Adding two DOM files was enough to push eleven unrelated
 * pre-existing tests past 5s — every one a timeout with zero assertion
 * failures. The budget belongs at the suite level, not patched onto whichever
 * test happened to lose the race, which would only hide the next one. This is
 * still far below any real hang.
 */
const TEST_TIMEOUT_MS = 20_000;

/** Projects do NOT inherit the root `test` block, so the budget is set on each. */
const timeouts = { testTimeout: TEST_TIMEOUT_MS, hookTimeout: TEST_TIMEOUT_MS } as const;

export default defineConfig({
  test: {
    ...timeouts,
    projects: [
      {
        resolve: { alias },
        esbuild,
        test: {
          ...timeouts,
          name: "node",
          include: NODE_TESTS,
          exclude: ["**/node_modules/**", DOM_TESTS],
          environment: "node",
        },
      },
      {
        resolve: { alias },
        esbuild,
        test: {
          ...timeouts,
          name: "dom",
          include: [DOM_TESTS],
          environment: "jsdom",
          setupFiles: [resolve(__dirname, "./src/tests/setupDom.ts")],
        },
      },
    ],
  },
});
