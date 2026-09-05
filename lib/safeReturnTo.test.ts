import { describe, expect, it } from "vitest";
import { safeReturnTo } from "./safeReturnTo";

const origin = "https://36stories.example";

describe("safeReturnTo", () => {
  it.each([
    "/dashboard",
    "/dashboard/offers",
    "/dashboard/analytics?period=7d#offer-signals-heading",
    "/dashboard?next=https%3A%2F%2Fexample.org",
  ])("preserves internal destination %s", (value) => {
    expect(safeReturnTo(value, origin)).toBe(value);
  });

  it.each([
    undefined,
    null,
    "",
    "dashboard",
    "https://example.org",
    "https://36stories.example/dashboard/offers",
    "javascript:alert(1)",
    "//example.org",
    "/\\example.org",
    "/\t/example.org",
    "/a/..//example.org",
    "/%2e//example.org",
    "/\\[invalid",
  ])("falls back for unsafe or missing destination %s", (value) => {
    expect(safeReturnTo(value, origin)).toBe("/dashboard");
  });
});
