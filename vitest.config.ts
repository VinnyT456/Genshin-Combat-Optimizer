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

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        esbuild,
        test: {
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
          name: "dom",
          include: [DOM_TESTS],
          environment: "jsdom",
          setupFiles: [resolve(__dirname, "./src/tests/setupDom.ts")],
        },
      },
    ],
  },
});
