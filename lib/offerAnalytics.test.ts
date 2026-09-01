import { describe, expect, it } from "vitest";
import {
  getAnalyticsStartDate,
  parseAnalyticsPeriod,
  summarizeAnalytics,
  summarizeOfferAnalytics,
  type OfferAnalyticsEvent,
} from "./offerAnalytics";

const event = (
  id: string,
  type: OfferAnalyticsEvent["type"],
  sessionId: string,
): OfferAnalyticsEvent => ({
  id,
  type,
  sessionId,
  source: "instagram_bio",
});

describe("offer analytics", () => {
  it("parses supported periods and defaults to 30 days", () => {
    expect(parseAnalyticsPeriod("7d")).toBe("7d");
    expect(parseAnalyticsPeriod("all")).toBe("all");
    expect(parseAnalyticsPeriod("invalid")).toBe("30d");
    expect(getAnalyticsStartDate("7d", new Date("2026-08-31T12:00:00.000Z")))
      .toEqual(new Date("2026-08-24T12:00:00.000Z"));
  });

  it("deduplicates sessions and calculates the primary intent rate", () => {
    const events = Array.from({ length: 12 }, (_, index) =>
      event(`view-${index}`, "VIEW", `session-${index}`),
    );
    events.push(event("duplicate-view", "VIEW", "session-0"));
    events.push(event("click-1", "OUTBOUND_CLICK", "session-0"));
    events.push(event("click-2", "OUTBOUND_CLICK", "session-1"));
    events.push(event("click-duplicate", "OUTBOUND_CLICK", "session-1"));

    const summary = summarizeOfferAnalytics({
      id: "offer-1",
      title: "Creator kit",
      kind: "PRODUCT",
      mode: "LIVE",
      ctaType: "OUTBOUND",
      events,
      signups: [],
    });

    expect(summary.views).toBe(12);
    expect(summary.intentActions).toBe(2);
    expect(summary.intentRate).toBe(17);
    expect(summary.status).toBe("Promising");
  });

  it("uses unique signup emails as a waitlist fallback", () => {
    const summary = summarizeOfferAnalytics({
      id: "offer-2",
      title: "Pocket light",
      kind: "PRODUCT",
      mode: "COMING_SOON",
      ctaType: "WAITLIST",
      events: Array.from({ length: 5 }, (_, index) =>
        event(`view-${index}`, "VIEW", `session-${index}`),
      ),
      signups: [
        { id: "signup-1", email: "one@example.com", source: null },
        { id: "signup-2", email: "two@example.com", source: null },
      ],
    });

    expect(summary.intentActions).toBe(2);
    expect(summary.intentRate).toBe(40);
    expect(summary.status).toBe("Needs more traffic");
  });

  it("only names a strongest offer after it has enough traffic", () => {
    const result = summarizeAnalytics([
      {
        id: "offer-1",
        title: "Small sample",
        kind: "PRODUCT",
        mode: "IDEA",
        ctaType: "INTEREST",
        events: [
          event("view-1", "VIEW", "session-1"),
          event("interest-1", "INTEREST", "session-1"),
        ],
        signups: [],
      },
    ]);

    expect(result.strongestOffer).toBeNull();
  });
});
