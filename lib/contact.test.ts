import { describe, expect, it } from "vitest";
import { formatContactAttribution } from "./contact";

describe("formatContactAttribution", () => {
  it("prefers full name and includes a self-reported social profile", () => {
    expect(
      formatContactAttribution({
        fullName: "Jamie Rivera",
        firstName: null,
        lastName: null,
        socialHandle: "@jamie",
        socialPlatform: "INSTAGRAM",
      }),
    ).toBe("Jamie Rivera · Instagram @jamie");
  });

  it("falls back to legacy first and last names", () => {
    expect(
      formatContactAttribution({
        fullName: null,
        firstName: "Jamie",
        lastName: "Rivera",
        socialHandle: null,
        socialPlatform: null,
      }),
    ).toBe("Jamie Rivera");
  });

  it("returns null for an anonymous contact", () => {
    expect(
      formatContactAttribution({
        fullName: null,
        firstName: null,
        lastName: null,
        socialHandle: null,
        socialPlatform: null,
      }),
    ).toBeNull();
  });
});
