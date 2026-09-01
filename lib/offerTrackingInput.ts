import {
  isPublicOfferEventType,
  type PublicOfferEventType,
} from "./offers/policy";

type TrackingContext = {
  sessionId: string;
  source: string | null;
  referrer: string | null;
};

export type PublicOfferEventInput = TrackingContext & {
  type: PublicOfferEventType;
};

export type OfferSignupInput = TrackingContext & {
  email: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const optionalString = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
};

const parseTrackingContext = (value: Record<string, unknown>): TrackingContext | null => {
  const sessionId = optionalString(value.sessionId, 128);
  if (!sessionId) {
    return null;
  }

  return {
    sessionId,
    source: optionalString(value.source, 120),
    referrer: optionalString(value.referrer, 2048),
  };
};

export const parsePublicOfferEventInput = (
  value: unknown,
): PublicOfferEventInput | null => {
  if (!isRecord(value) || !isPublicOfferEventType(value.type)) {
    return null;
  }

  const context = parseTrackingContext(value);
  if (!context) {
    return null;
  }

  return { ...context, type: value.type };
};

export const parseOfferSignupInput = (value: unknown): OfferSignupInput | null => {
  if (!isRecord(value)) {
    return null;
  }

  const context = parseTrackingContext(value);
  const email = optionalString(value.email, 320)?.toLowerCase() ?? null;

  if (!context || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return null;
  }

  return { ...context, email };
};
