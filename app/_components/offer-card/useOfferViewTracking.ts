"use client";

import { useEffect, useRef } from "react";
import { offerViewEvent } from "@/lib/offers/policy";
import { recordOfferEvent } from "./tracking";

export const useOfferViewTracking = (offerId: string, enabled: boolean) => {
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!enabled || !card || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void recordOfferEvent(offerId, offerViewEvent).catch(() => undefined);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, [enabled, offerId]);

  return cardRef;
};
