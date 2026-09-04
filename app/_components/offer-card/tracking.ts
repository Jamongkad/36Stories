import type { PublicOfferEventType } from "@/lib/offers/policy";

const SESSION_STORAGE_KEY = "36stories-offer-session";

const createSessionId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getTrackingContext = () => {
  let sessionId = createSessionId();

  try {
    const storedSessionId = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedSessionId) {
      sessionId = storedSessionId;
    } else {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
  } catch {
    // Storage can be unavailable. Keep the generated in-memory session ID so
    // tracking never blocks the visitor's interaction.
  }

  const searchParams = new URLSearchParams(window.location.search);
  return {
    sessionId,
    source: searchParams.get("utm_source") ?? searchParams.get("source"),
    referrer: document.referrer || null,
  };
};

export const recordOfferEvent = async (
  offerId: string,
  type: PublicOfferEventType,
) => {
  const response = await fetch(`/api/offers/${offerId}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, ...getTrackingContext() }),
    keepalive: true,
  });

  if (!response.ok) {
    throw new Error("Offer event could not be recorded.");
  }
};

export const joinOfferWaitlist = async (
  offerId: string,
  email: string,
  website: string,
) => {
  const response = await fetch(`/api/offers/${offerId}/signups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, website, ...getTrackingContext() }),
  });

  if (!response.ok) {
    throw new Error("Waitlist signup failed.");
  }
};
