import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ArtifactAvatar } from "./ArtifactAvatar";

// ---------------------------------------------------------------------------
// FIRST REAL RENDER TEST (TASK #068).
//
// This is what a source-text test cannot do. The previous approach could
// assert that ArtifactAvatar.tsx CONTAINS the string `onError`; it could not
// assert that firing an error actually swaps the source, and it could not have
// caught the live defect this task found — the component was wired to
// `/data/assets/reliquary/`, which 404s for all 63 sets, so the picker
// rendered zero images while every string check still passed.
//
// These assertions run the component and read the DOM it produces.
// ---------------------------------------------------------------------------

const ICON_ID = "UI_RelicIcon_15025_4";
const NAME_ZH = "绝缘之旗印";

/** The rendered <img>, or null once the component has fallen back to a glyph. */
function renderedImage(): HTMLImageElement | null {
  return document.querySelector("img");
}

describe("ArtifactAvatar renders an icon", () => {
  it("requests the verified primary CDN path", () => {
    render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} />);
    const img = renderedImage();
    expect(img).not.toBeNull();
    // `next/image` rewrites src, so assert on the id and path segment that the
    // measured-working URL is built from rather than on an exact string.
    expect(img?.getAttribute("src")).toContain(ICON_ID);
    expect(img?.getAttribute("src")).toContain("artifacts");
    // The known-404 shape must never be requested.
    expect(img?.getAttribute("src")).not.toContain("reliquary/UI_RelicIcon");
  });

  it("reserves the box before the image loads, so nothing shifts", () => {
    const { container } = render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} />);
    const box = container.firstElementChild;
    // A fixed square on the wrapper is what stops layout moving between the
    // in-flight, loaded and failed states.
    expect(box?.className).toContain("h-12");
    expect(box?.className).toContain("w-12");
  });

  it("gives the image an empty alt, so the name is not announced twice", () => {
    render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} />);
    expect(renderedImage()?.getAttribute("alt")).toBe("");
    // An icon is never the accessible name: nothing here exposes the set name.
    expect(screen.queryByLabelText(NAME_ZH)).toBeNull();
  });

  it("sets explicit width and height on the image", () => {
    render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} size="sm" />);
    const img = renderedImage();
    expect(img?.getAttribute("width")).toBe("36");
    expect(img?.getAttribute("height")).toBe("36");
  });

  it("uses the selected piece image instead of the set thumbnail", () => {
    render(<ArtifactAvatar iconId={ICON_ID} nameZh={`${NAME_ZH} · 死之羽`} slot="plume" size="lg" />);
    const img = renderedImage();
    expect(img?.getAttribute("src")).toContain("UI_RelicIcon_15025_2.webp");
    expect(img?.getAttribute("src")).not.toContain("UI_RelicIcon_15025_4.webp");
    expect(img?.getAttribute("width")).toBe("96");
    expect(img?.getAttribute("height")).toBe("96");
  });
});

describe("ArtifactAvatar failure path", () => {
  it("falls back to the second host when the primary errors", () => {
    render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} />);
    const first = renderedImage();
    expect(first).not.toBeNull();
    // Read the string EAGERLY. React reuses the same <img> element and mutates
    // `src` in place, so holding the node and reading it after the error would
    // compare the fallback URL against itself and pass vacuously.
    const firstSrc = first?.getAttribute("src");
    expect(firstSrc).toContain("artifacts");

    fireEvent.error(first as HTMLImageElement);

    const secondSrc = renderedImage()?.getAttribute("src");
    expect(secondSrc).not.toBeUndefined();
    // It moved to the fallback host's path, and it is a different URL.
    expect(secondSrc).toContain("reliquary");
    expect(secondSrc).not.toBe(firstSrc);
  });

  it("renders a glyph placeholder when BOTH hosts fail", () => {
    render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} />);

    fireEvent.error(renderedImage() as HTMLImageElement);
    fireEvent.error(renderedImage() as HTMLImageElement);

    // No broken-image glyph is left in the document.
    expect(renderedImage()).toBeNull();
    expect(screen.getByText("绝")).toBeInTheDocument();
  });

  it("keeps the reserved box after both hosts fail", () => {
    const { container } = render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} />);
    const before = container.firstElementChild?.className;

    fireEvent.error(renderedImage() as HTMLImageElement);
    fireEvent.error(renderedImage() as HTMLImageElement);

    // Identical wrapper classes means the failed state occupies exactly the
    // space the loading state did — the no-layout-shift guarantee.
    expect(container.firstElementChild?.className).toBe(before);
  });

  it("skips the network entirely for a set with no icon id", () => {
    render(<ArtifactAvatar nameZh={NAME_ZH} />);
    // Firing a request known to 404 would flash a broken image first.
    expect(renderedImage()).toBeNull();
    expect(screen.getByText("绝")).toBeInTheDocument();
  });

  it("hides the placeholder glyph from assistive tech", () => {
    render(<ArtifactAvatar nameZh={NAME_ZH} />);
    expect(screen.getByText("绝")).toHaveAttribute("aria-hidden", "true");
  });

  it("retries from the primary when reused for a different set", () => {
    // Grid rows are recycled. A set that inherited a previous set's exhausted
    // failure state would render a placeholder for an icon that exists.
    //
    // MUTATION-VERIFIED: deleting the `stageForIcon` reset entirely fails this
    // test. Weakening it to only drop the same-render correction does NOT —
    // the component still recovers, one render later, via the state setter.
    // That surviving mutant is a real limit of this assertion: it pins the
    // recovery, not the absence of a single stale intermediate frame, which
    // Testing Library does not expose a way to observe.
    const { rerender } = render(<ArtifactAvatar iconId={ICON_ID} nameZh={NAME_ZH} />);
    fireEvent.error(renderedImage() as HTMLImageElement);
    fireEvent.error(renderedImage() as HTMLImageElement);
    expect(renderedImage()).toBeNull();

    rerender(<ArtifactAvatar iconId="UI_RelicIcon_15009_3" nameZh="教官的胸花" />);

    const img = renderedImage();
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toContain("UI_RelicIcon_15009_3");
  });
});
