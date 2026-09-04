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
  honeypot: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const optionalString = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
};

const parseTrackingContext = (value: Record<string, unknown>): TrackingContext | null => {
  if (Object.keys(value).some((key) => !["type", "sessionId", "source", "referrer"].includes(key))) return null;
  if (("sessionId" in value && typeof value.sessionId !== "string") || ("source" in value && value.source !== null && value.source !== undefined && typeof value.source !== "string") || ("referrer" in value && value.referrer !== null && value.referrer !== undefined && typeof value.referrer !== "string")) return null;
  if ((typeof value.sessionId === "string" && value.sessionId.trim().length > 128) || (typeof value.source === "string" && value.source.trim().length > 120) || (typeof value.referrer === "string" && value.referrer.trim().length > 2048)) return null;
  const rawSource = optionalString(value.source, 120);
  if (rawSource && !/^[a-zA-Z0-9_-]+$/.test(rawSource)) return null;
  const sessionId = optionalString(value.sessionId, 128);
  if (!sessionId || !/^[a-zA-Z0-9._:-]{1,128}$/.test(sessionId)) {
    return null;
  }

  const rawReferrer = optionalString(value.referrer, 2048);
  let normalizedReferrer: string | null = null;
  if (rawReferrer) {
    try {
      const url = new URL(rawReferrer);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      normalizedReferrer = url.toString();
    } catch {
      return null;
    }
  }

  return {
    sessionId,
    source: rawSource,
    referrer: normalizedReferrer,
  };
};

export const parsePublicOfferEventInput = (
  value: unknown,
): PublicOfferEventInput | null => {
  if (!isRecord(value) || !isPublicOfferEventType(value.type)) {
    return null;
  }
  if (Object.keys(value).some((key) => !["type", "sessionId", "source", "referrer"].includes(key))) return null;

  const context = parseTrackingContext({
    sessionId: value.sessionId,
    source: value.source,
    referrer: value.referrer,
  });
  if (!context) {
    return null;
  }

  return { ...context, type: value.type };
};

export const parseOfferSignupInput = (value: unknown): OfferSignupInput | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (Object.keys(value).some((key) => !["sessionId", "source", "referrer", "email", "website"].includes(key))) return null;
  if (("email" in value && typeof value.email !== "string") || ("website" in value && value.website !== null && value.website !== undefined && typeof value.website !== "string")) return null;
  if ((typeof value.email === "string" && value.email.trim().length > 320) || (typeof value.website === "string" && value.website.trim().length > 128)) return null;

  const context = parseTrackingContext({
    sessionId: value.sessionId,
    source: value.source,
    referrer: value.referrer,
  });
  const email = optionalString(value.email, 320)?.toLowerCase() ?? null;

  if (!context || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return null;
  }

  return { ...context, email, honeypot: optionalString(value.website, 128) };
};
