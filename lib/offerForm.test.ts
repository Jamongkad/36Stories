import { describe, expect, it } from "vitest";
import { validateOfferForm } from "./offerForm";

const baseForm = () => {
  const formData = new FormData();
  formData.set("kind", "PRODUCT");
  formData.set("mode", "LIVE");
  formData.set("title", "Creator lighting kit");
  formData.set("destinationUrl", "https://example.com/kit");
  formData.set("destinationType", "STORE");
  return formData;
};

describe("offer form validation", () => {
  it("creates an outbound configuration for a live offer", () => {
    const result = validateOfferForm(baseForm());

    expect(result.fieldErrors).toEqual({});
    expect(result.input).toMatchObject({
      mode: "LIVE",
      ctaType: "OUTBOUND",
      ctaLabel: "View offer",
      destinationUrl: "https://example.com/kit",
    });
  });

  it("removes destinations and creates a waitlist CTA for coming-soon offers", () => {
    const formData = baseForm();
    formData.set("mode", "COMING_SOON");

    const result = validateOfferForm(formData);

    expect(result.input).toMatchObject({
      mode: "COMING_SOON",
      ctaType: "WAITLIST",
      destinationUrl: null,
      destinationType: null,
    });
  });

  it("requires a valid destination for live offers", () => {
    const formData = baseForm();
    formData.set("destinationUrl", "not-a-url");

    const result = validateOfferForm(formData);

    expect(result.input).toBeNull();
    expect(result.fieldErrors?.destinationUrl).toBeTruthy();
  });

  it("normalizes unsupported fields from the selected mode policy", () => {
    const formData = baseForm();
    formData.set("mode", "IDEA");
    formData.set("launchAt", "2026-10-01T10:00");
    formData.set("isAffiliate", "on");
    formData.set("disclosureText", "Affiliate link");

    const result = validateOfferForm(formData);

    expect(result.input).toMatchObject({
      mode: "IDEA",
      ctaType: "INTEREST",
      launchAt: null,
      destinationUrl: null,
      destinationType: null,
      isAffiliate: false,
      disclosureText: null,
    });
  });
});
