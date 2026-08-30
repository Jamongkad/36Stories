import { describe, expect, it } from "vitest";
import {
  createDefaultDisplayPageConfiguration,
  getCollectionHeadline,
  isHttpUrl,
  parseDisplayPageConfiguration,
} from "./displayPage";

describe("display page configuration", () => {
  it("returns safe defaults for missing or unsupported configuration", () => {
    expect(parseDisplayPageConfiguration(null, "Creator Name")).toEqual(
      createDefaultDisplayPageConfiguration("Creator Name"),
    );
    expect(
      parseDisplayPageConfiguration({ version: 2, displayName: "Old" }, "Creator Name"),
    ).toEqual(createDefaultDisplayPageConfiguration("Creator Name"));
  });

  it("keeps valid ordered links and drops malformed or unsafe links", () => {
    const config = parseDisplayPageConfiguration(
      {
        version: 1,
        displayName: " Maya Creator ",
        bio: " Product reviews ",
        selectedCollectionWidgetId: " collection-1 ",
        links: [
          { id: "youtube", label: "YouTube", url: "https://youtube.com/maya" },
          { id: "unsafe", label: "Unsafe", url: "javascript:alert(1)" },
          { id: "youtube", label: "Duplicate", url: "https://example.com" },
          { id: "amazon", label: "Amazon", url: "http://amazon.com/shop/maya" },
        ],
      },
      "Fallback",
    );

    expect(config).toEqual({
      version: 1,
      displayName: "Maya Creator",
      bio: "Product reviews",
      selectedCollectionWidgetId: "collection-1",
      links: [
        { id: "youtube", label: "YouTube", url: "https://youtube.com/maya" },
        { id: "amazon", label: "Amazon", url: "http://amazon.com/shop/maya" },
      ],
    });
  });

  it("accepts only http(s) destinations", () => {
    expect(isHttpUrl("https://example.com")).toBe(true);
    expect(isHttpUrl("http://example.com")).toBe(true);
    expect(isHttpUrl("mailto:hello@example.com")).toBe(false);
    expect(isHttpUrl("not a url")).toBe(false);
  });

  it("reads a usable collection headline", () => {
    expect(getCollectionHeadline({ headline: " Share your story " })).toBe(
      "Share your story",
    );
    expect(getCollectionHeadline({ headline: "" })).toBeNull();
    expect(getCollectionHeadline(null)).toBeNull();
  });
});
