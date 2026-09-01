import { describe, expect, it } from "vitest";
import {
  parseOfferSignupInput,
  parsePublicOfferEventInput,
} from "./offerTrackingInput";

describe("offer tracking input", () => {
  it("accepts public event types with an anonymous session", () => {
    expect(
      parsePublicOfferEventInput({
        type: "OUTBOUND_CLICK",
        sessionId: " session-1 ",
        source: "instagram_bio",
      }),
    ).toEqual({
      type: "OUTBOUND_CLICK",
      sessionId: "session-1",
      source: "instagram_bio",
      referrer: null,
    });
  });

  it("rejects internal event types and missing sessions", () => {
    expect(
      parsePublicOfferEventInput({ type: "WAITLIST_SIGNUP", sessionId: "session-1" }),
    ).toBeNull();
    expect(parsePublicOfferEventInput({ type: "VIEW" })).toBeNull();
  });

  it("normalizes valid signup emails", () => {
    expect(
      parseOfferSignupInput({
        email: " Creator@Example.com ",
        sessionId: "session-1",
        referrer: "https://www.instagram.com/",
      }),
    ).toMatchObject({
      email: "creator@example.com",
      sessionId: "session-1",
    });
    expect(parseOfferSignupInput({ email: "invalid", sessionId: "session-1" }))
      .toBeNull();
  });
});
