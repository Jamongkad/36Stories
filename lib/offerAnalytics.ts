import {
  offerCtaPolicy,
  offerViewEvent,
  type OfferCtaType,
  type OfferIntentEvent,
  type OfferKind,
  type OfferMode,
} from "./offers/policy";

export const analyticsPeriods = ["7d", "30d", "all"] as const;

export type AnalyticsPeriod = (typeof analyticsPeriods)[number];
export type AnalyticsEventType = typeof offerViewEvent | OfferIntentEvent;
export type SignalStatus =
  | "Strong signal"
  | "Promising"
  | "Early signal"
  | "Needs more traffic";

export const MIN_SIGNAL_VIEWS = 10;

export type OfferAnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  sessionId: string | null;
  source: string | null;
};

export type OfferAnalyticsSignup = {
  id: string;
  email: string;
  source: string | null;
};

export type OfferAnalyticsInput = {
  id: string;
  title: string;
  kind: OfferKind;
  mode: OfferMode;
  ctaType: OfferCtaType;
  events: OfferAnalyticsEvent[];
  signups: OfferAnalyticsSignup[];
};

export type OfferAnalyticsSummary = {
  id: string;
  title: string;
  kind: OfferAnalyticsInput["kind"];
  mode: OfferAnalyticsInput["mode"];
  ctaType: OfferCtaType;
  views: number;
  intentActions: number;
  intentRate: number;
  primaryActionLabel: string;
  status: SignalStatus;
  sources: Array<{ source: string; views: number }>;
};

const eventIdentity = (event: OfferAnalyticsEvent) =>
  event.sessionId ? `session:${event.sessionId}` : `event:${event.id}`;

const signalStatus = (views: number, intentRate: number): SignalStatus => {
  if (views < MIN_SIGNAL_VIEWS) {
    return "Needs more traffic";
  }

  if (intentRate >= 20) {
    return "Strong signal";
  }

  if (intentRate >= 8) {
    return "Promising";
  }

  return "Early signal";
};

export const parseAnalyticsPeriod = (value: string | string[] | undefined): AnalyticsPeriod => {
  const candidate = Array.isArray(value) ? value[0] : value;
  return analyticsPeriods.includes(candidate as AnalyticsPeriod)
    ? (candidate as AnalyticsPeriod)
    : "30d";
};

export const getAnalyticsStartDate = (period: AnalyticsPeriod, now = new Date()) => {
  if (period === "all") {
    return null;
  }

  const days = period === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setUTCDate(start.getUTCDate() - days);
  return start;
};

export const summarizeOfferAnalytics = (
  input: OfferAnalyticsInput,
): OfferAnalyticsSummary => {
  const ctaPolicy = offerCtaPolicy[input.ctaType];
  const viewEvents = input.events.filter((event) => event.type === offerViewEvent);
  const viewIdentities = new Set(viewEvents.map(eventIdentity));
  const intentIdentities = new Set(
    input.events
      .filter((event) => event.type === ctaPolicy.intentEvent)
      .map(eventIdentity),
  );
  const signupEmails = new Set(input.signups.map((signup) => signup.email.toLowerCase()));
  const intentActions =
    ctaPolicy.captureMethod === "SIGNUP"
      ? Math.max(intentIdentities.size, signupEmails.size)
      : intentIdentities.size;
  const views = viewIdentities.size;
  const intentRate = views === 0
    ? 0
    : Math.round((Math.min(intentActions, views) / views) * 100);
  const sourceViews = new Map<string, Set<string>>();

  for (const event of viewEvents) {
    const source = event.source?.trim() || "Direct or unknown";
    const identities = sourceViews.get(source) ?? new Set<string>();
    identities.add(eventIdentity(event));
    sourceViews.set(source, identities);
  }

  const sources = [...sourceViews.entries()]
    .map(([source, identities]) => ({ source, views: identities.size }))
    .sort((left, right) => right.views - left.views);

  return {
    id: input.id,
    title: input.title,
    kind: input.kind,
    mode: input.mode,
    ctaType: input.ctaType,
    views,
    intentActions,
    intentRate,
    primaryActionLabel: ctaPolicy.analyticsLabel,
    status: signalStatus(views, intentRate),
    sources,
  };
};

export const summarizeAnalytics = (inputs: OfferAnalyticsInput[]) => {
  const offers = inputs.map(summarizeOfferAnalytics);
  const totalViews = offers.reduce((total, offer) => total + offer.views, 0);
  const totalIntentActions = offers.reduce(
    (total, offer) => total + offer.intentActions,
    0,
  );
  const rankedOffers = offers
    .filter((offer) => offer.views >= MIN_SIGNAL_VIEWS)
    .sort(
      (left, right) =>
        right.intentRate - left.intentRate ||
        right.intentActions - left.intentActions ||
        right.views - left.views,
    );

  return {
    offers,
    totalViews,
    totalIntentActions,
    strongestOffer: rankedOffers[0] ?? null,
  };
};
