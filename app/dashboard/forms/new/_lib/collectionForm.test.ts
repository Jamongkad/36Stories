import { describe, expect, it } from "vitest";
import { parseCollectionFormConfiguration } from "./collectionForm";

describe("parseCollectionFormConfiguration", () => {
  it("normalizes a version 2 creator-focused form", () => {
    expect(
      parseCollectionFormConfiguration({
        version: 2,
        headline: " Share your story ",
        instructions: " Tell us what happened. ",
        successMessage: " Thank you! ",
        fields: {
          fullName: { show: true, required: true },
          email: { show: false, required: true },
          socialProfile: { show: true, required: false },
        },
      }),
    ).toEqual({
      version: 2,
      headline: "Share your story",
      instructions: "Tell us what happened.",
      successMessage: "Thank you!",
      fields: {
        fullName: { show: true, required: true },
        email: { show: false, required: false },
        socialProfile: { show: true, required: false },
      },
    });
  });

  it("reads legacy version 1 forms without exposing deprecated fields", () => {
    expect(
      parseCollectionFormConfiguration({
        version: 1,
        headline: "Share your story",
        instructions: "Tell us about your experience.",
        successMessage: "Thanks!",
        fields: {
          fullName: { show: true, required: false },
          email: { show: true, required: true },
          company: { show: true, required: true },
          jobTitle: { show: true, required: true },
        },
      }),
    ).toEqual({
      version: 2,
      headline: "Share your story",
      instructions: "Tell us about your experience.",
      successMessage: "Thanks!",
      fields: {
        fullName: { show: true, required: false },
        email: { show: true, required: true },
        socialProfile: { show: false, required: false },
      },
    });
  });

  it("rejects malformed form messaging", () => {
    expect(parseCollectionFormConfiguration({ version: 2 },)).toBeNull();
  });
});
