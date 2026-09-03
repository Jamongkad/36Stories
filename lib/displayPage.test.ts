import { describe, expect, it } from "vitest";
import {
  createDefaultDisplayPageConfiguration,
  getCollectionHeadline,
  getDisplayPageAppearance,
  isHttpUrl,
  parseDisplayPageForm,
  parseDisplayPageConfiguration,
} from "./displayPage";

describe("display page configuration", () => {
  it("returns safe defaults for missing or unsupported configuration", () => {
    expect(parseDisplayPageConfiguration(null, "Creator Name")).toEqual(
      createDefaultDisplayPageConfiguration("Creator Name"),
    );
    expect(
      parseDisplayPageConfiguration({ version: 3, displayName: "Old" }, "Creator Name"),
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
      version: 2,
      displayName: "Maya Creator",
      bio: "Product reviews",
      selectedCollectionWidgetId: "collection-1",
      links: [
        { id: "youtube", label: "YouTube", url: "https://youtube.com/maya" },
        { id: "amazon", label: "Amazon", url: "http://amazon.com/shop/maya" },
      ],
      theme: "sophisticated",
      backgroundColor: "sand",
      buttonColor: "forest",
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

  it("validates the editor form and preserves ordered links", () => {
    const formData = new FormData();
    formData.set("displayName", "Maya Creator");
    formData.set("bio", "Product reviews");
    formData.set("theme", "modern");
    formData.set("backgroundColor", "mist");
    formData.set("buttonColor", "cobalt");
    formData.set(
      "links",
      JSON.stringify([
        { id: "youtube", label: "YouTube", url: "https://youtube.com/maya" },
        { id: "amazon", label: "Amazon", url: "https://amazon.com/shop/maya" },
      ]),
    );

    expect(parseDisplayPageForm(formData)).toEqual({
      fieldErrors: {},
      input: {
        displayName: "Maya Creator",
        bio: "Product reviews",
        theme: "modern",
        backgroundColor: "mist",
        buttonColor: "cobalt",
        links: [
          { id: "youtube", label: "YouTube", url: "https://youtube.com/maya" },
          { id: "amazon", label: "Amazon", url: "https://amazon.com/shop/maya" },
        ],
      },
    });
  });

  it("rejects invalid theme colors, URLs, and oversized content", () => {
    const formData = new FormData();
    formData.set("displayName", "x".repeat(81));
    formData.set("bio", "x".repeat(241));
    formData.set("theme", "retro");
    formData.set("backgroundColor", "pink");
    formData.set("buttonColor", "yellow");
    formData.set("links", JSON.stringify([{ id: "bad", label: "Bad", url: "javascript:alert(1)" }]));

    const result = parseDisplayPageForm(formData);

    expect(result.input).toBeUndefined();
    expect(result.fieldErrors).toEqual({
      displayName: "Keep this under 80 characters.",
      bio: "Keep this under 240 characters.",
      theme: "Choose a theme.",
      backgroundColor: "Choose a background color.",
      buttonColor: "Choose a button color.",
      links: "Each link needs a unique label and a valid http(s) URL.",
    });
  });

  it("applies distinct theme structure and color tokens", () => {
    const modern = getDisplayPageAppearance({
      theme: "modern",
      backgroundColor: "mist",
      buttonColor: "cobalt",
    });
    const minimalist = getDisplayPageAppearance({
      theme: "minimalist",
      backgroundColor: "paper",
      buttonColor: "charcoal",
    });
    const sophisticated = getDisplayPageAppearance({
      theme: "sophisticated",
      backgroundColor: "sand",
      buttonColor: "forest",
    });

    expect(modern.button).toBe("#2563eb");
    expect(minimalist.backgroundImage).toBe("none");
    expect(minimalist.buttonRadius).toBe(2);
    expect(sophisticated.headingFontFamily).toContain("Georgia");
  });
});
