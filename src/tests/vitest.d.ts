// ---------------------------------------------------------------------------
// Type augmentation for the `@testing-library/jest-dom` matchers that
// `src/tests/setupDom.ts` registers via `expect.extend`.
//
// `expect.extend` is a runtime call, so without this declaration TypeScript
// has no idea `toBeInTheDocument` exists and `npm run typecheck` fails on
// every DOM test. Importing the matcher interface and merging it into
// vitest's `Assertion` is the supported way to tell it.
// ---------------------------------------------------------------------------

import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion<T = unknown> extends TestingLibraryMatchers<T, void> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining
    extends TestingLibraryMatchers<unknown, void> {}
}
