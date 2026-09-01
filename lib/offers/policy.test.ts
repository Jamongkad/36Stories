import {
  OfferCtaType as PrismaOfferCtaType,
  OfferDestinationType as PrismaOfferDestinationType,
  OfferEventType as PrismaOfferEventType,
  OfferKind as PrismaOfferKind,
  OfferMode as PrismaOfferMode,
} from "@/generated/prisma/client";
import { describe, expect, it } from "vitest";
import {
  getCtaTypeForPublicEvent,
  offerViewEvent,
  offerCtaPolicy,
  offerCtaTypes,
  offerDestinationTypes,
  offerIntentEvents,
  offerKinds,
  offerModePolicy,
  offerModes,
  isPublicOfferEventType,
} from "./policy";

const sorted = <T extends string>(values: T[]) => [...values].sort();

describe("offer policy", () => {
  it("defines one CTA and intent event for every offer mode", () => {
    for (const mode of offerModes) {
      const modePolicy = offerModePolicy[mode];
      const ctaPolicy = offerCtaPolicy[modePolicy.ctaType];

      expect(ctaPolicy.intentEvent).toBeTruthy();
      expect(modePolicy.defaultCtaLabel).toBeTruthy();
    }
  });

  it("maps direct public events back to their compatible CTA", () => {
    expect(getCtaTypeForPublicEvent(offerViewEvent)).toBeNull();

    for (const ctaType of offerCtaTypes) {
      const ctaPolicy = offerCtaPolicy[ctaType];

      expect(isPublicOfferEventType(ctaPolicy.intentEvent)).toBe(
        ctaPolicy.captureMethod === "EVENT",
      );

      if (ctaPolicy.captureMethod === "EVENT") {
        expect(getCtaTypeForPublicEvent(ctaPolicy.intentEvent)).toBe(ctaType);
      }
    }
  });

  it("stays synchronized with Prisma enums", () => {
    expect(sorted(offerKinds)).toEqual(sorted(Object.values(PrismaOfferKind)));
    expect(sorted(offerModes)).toEqual(sorted(Object.values(PrismaOfferMode)));
    expect(sorted(offerCtaTypes)).toEqual(sorted(Object.values(PrismaOfferCtaType)));
    expect(sorted(offerDestinationTypes)).toEqual(
      sorted(Object.values(PrismaOfferDestinationType)),
    );
    expect(sorted([offerViewEvent, ...offerIntentEvents])).toEqual(
      sorted(Object.values(PrismaOfferEventType)),
    );
  });

  it("requires every CTA policy to be used by an offer mode", () => {
    const configuredCtas = Object.values(offerModePolicy).map(
      (policy) => policy.ctaType,
    );

    expect(sorted([...new Set(configuredCtas)])).toEqual(sorted(offerCtaTypes));
  });
});
