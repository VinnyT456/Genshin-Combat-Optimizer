import { describe, expect, it } from "vitest";
import {
  resolvePickerEmptyState,
  type PickerEmptyInput,
} from "./pickerEmptyState";

const base: PickerEmptyInput = {
  rosterSize: 100,
  filteredSize: 10,
  query: "",
  hasFacetFilters: false,
  takenCount: 0,
};

describe("resolvePickerEmptyState", () => {
  it("reports no empty state while results remain", () => {
    const state = resolvePickerEmptyState(base);
    expect(state.kind).toBe("none");
    expect(state.message).toBe("");
    expect(state.action).toBe("none");
  });

  it("treats an empty roster as an error, not an empty state", () => {
    // A roster is static data and is never legitimately empty, so zero
    // characters means loading failed.
    const state = resolvePickerEmptyState({ ...base, rosterSize: 0, filteredSize: 0 });
    expect(state.kind).toBe("roster-error");
    expect(state.action).toBe("none");
  });

  it("names the query when a search returns nothing", () => {
    const state = resolvePickerEmptyState({
      ...base,
      filteredSize: 0,
      query: "  Xiangling  ",
    });
    expect(state.kind).toBe("no-search-match");
    // The remedy must be reversible in one step: clear the text, keep facets.
    expect(state.action).toBe("clear-search");
    // The query is echoed, trimmed, so the user sees what actually matched
    // nothing rather than a bare "0 results".
    expect(state.message).toContain("Xiangling");
    expect(state.message).not.toContain("  Xiangling");
  });

  it("prefers the search cause over the facet cause when both are active", () => {
    // Both narrow the set, but the query is the more specific and more
    // recently-typed cause, so it is the one named.
    const state = resolvePickerEmptyState({
      ...base,
      filteredSize: 0,
      query: "zzz",
      hasFacetFilters: true,
    });
    expect(state.kind).toBe("no-search-match");
  });

  it("names the filters when facets alone exclude everything", () => {
    const state = resolvePickerEmptyState({
      ...base,
      filteredSize: 0,
      hasFacetFilters: true,
    });
    expect(state.kind).toBe("no-filter-match");
    expect(state.action).toBe("clear-filters");
  });

  it("distinguishes an exhausted team from a filter miss", () => {
    // Results EXIST, so clearing filters would not help. Different situation,
    // different copy, and deliberately no clear-filters button.
    const state = resolvePickerEmptyState({
      ...base,
      filteredSize: 4,
      takenCount: 4,
    });
    expect(state.kind).toBe("all-taken");
    expect(state.action).toBe("none");
  });

  it("does not claim all-taken while a selectable character remains", () => {
    const state = resolvePickerEmptyState({
      ...base,
      filteredSize: 4,
      takenCount: 3,
    });
    expect(state.kind).toBe("none");
  });

  it("falls back to an error when the pipeline yields nothing without a cause", () => {
    // No query and no facets cannot legitimately produce zero rows from a
    // non-empty roster; surfacing it beats rendering a blank panel.
    const state = resolvePickerEmptyState({ ...base, filteredSize: 0 });
    expect(state.kind).toBe("roster-error");
  });

  it("ignores a whitespace-only query when choosing the cause", () => {
    const state = resolvePickerEmptyState({
      ...base,
      filteredSize: 0,
      query: "   ",
      hasFacetFilters: true,
    });
    expect(state.kind).toBe("no-filter-match");
  });
});
