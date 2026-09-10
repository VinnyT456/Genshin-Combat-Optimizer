/**
 * Joins conditional class names. Deliberately tiny — the project does not need
 * `clsx`/`tailwind-merge` for this, and adding a dependency for string joining
 * is not justified.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter((v): v is string => typeof v === "string" && v.length > 0).join(" ");
}
