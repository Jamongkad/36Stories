export const offerKindPolicy = {
  PRODUCT: { label: "Product" },
  SERVICE: { label: "Service" },
} as const;

export type OfferKind = keyof typeof offerKindPolicy;

export const offerDestinationTypePolicy = {
  STORE: { label: "Store or product page" },
  AFFILIATE: { label: "Affiliate link" },
  BOOKING: { label: "Booking or Calendly" },
  OTHER: { label: "Other" },
} as const;

export type OfferDestinationType = keyof typeof offerDestinationTypePolicy;

export const offerCtaPolicy = {
  OUTBOUND: {
    intentEvent: "OUTBOUND_CLICK",
    analyticsLabel: "Outbound clicks",
    captureMethod: "EVENT",
  },
  WAITLIST: {
    intentEvent: "WAITLIST_SIGNUP",
    analyticsLabel: "Waitlist signups",
    captureMethod: "SIGNUP",
  },
  INTEREST: {
    intentEvent: "INTEREST",
    analyticsLabel: "Interest actions",
    captureMethod: "EVENT",
  },
} as const;

export type OfferCtaType = keyof typeof offerCtaPolicy;
export type OfferIntentEvent =
  (typeof offerCtaPolicy)[OfferCtaType]["intentEvent"];
export const offerViewEvent = "VIEW" as const;
type EventCapturedCtaPolicy = Extract<
  (typeof offerCtaPolicy)[OfferCtaType],
  { captureMethod: "EVENT" }
>;
export type PublicOfferEventType =
  | typeof offerViewEvent
  | EventCapturedCtaPolicy["intentEvent"];

type OfferModePolicyEntry = {
  label: string;
  editorLabel: string;
  description: string;
  ctaType: OfferCtaType;
  defaultCtaLabel: string;
  requiresDestination: boolean;
  supportsAffiliate: boolean;
  supportsLaunchDate: boolean;
};

export const offerModePolicy = {
  LIVE: {
    label: "Available now",
    editorLabel: "Available now",
    description: "Send visitors to something they can buy, book, or view now.",
    ctaType: "OUTBOUND",
    defaultCtaLabel: "View offer",
    requiresDestination: true,
    supportsAffiliate: true,
    supportsLaunchDate: false,
  },
  COMING_SOON: {
    label: "Coming soon",
    editorLabel: "Coming soon",
    description: "Collect emails before you launch or commit inventory.",
    ctaType: "WAITLIST",
    defaultCtaLabel: "Join early access",
    requiresDestination: false,
    supportsAffiliate: false,
    supportsLaunchDate: true,
  },
  IDEA: {
    label: "Idea",
    editorLabel: "Idea to pressure-test",
    description: "Measure early interest before you build anything.",
    ctaType: "INTEREST",
    defaultCtaLabel: "I’m interested",
    requiresDestination: false,
    supportsAffiliate: false,
    supportsLaunchDate: false,
  },
} as const satisfies Record<string, OfferModePolicyEntry>;

export type OfferMode = keyof typeof offerModePolicy;

export const offerKinds = Object.keys(offerKindPolicy) as OfferKind[];
export const offerDestinationTypes = Object.keys(
  offerDestinationTypePolicy,
) as OfferDestinationType[];
export const offerModes = Object.keys(offerModePolicy) as OfferMode[];
export const defaultOfferMode: OfferMode = "LIVE";
export const offerCtaTypes = Object.keys(offerCtaPolicy) as OfferCtaType[];
export const offerIntentEvents = Object.values(offerCtaPolicy).map(
  (policy) => policy.intentEvent,
) as OfferIntentEvent[];
export const signupOfferCtaTypes = offerCtaTypes.filter(
  (ctaType) => offerCtaPolicy[ctaType].captureMethod === "SIGNUP",
);

export const publicOfferEventTypes: PublicOfferEventType[] = [
  offerViewEvent,
  ...Object.values(offerCtaPolicy)
    .filter((policy) => policy.captureMethod === "EVENT")
    .map((policy) => policy.intentEvent),
];

export const isOfferKind = (value: string): value is OfferKind =>
  offerKinds.includes(value as OfferKind);

export const isOfferDestinationType = (
  value: string,
): value is OfferDestinationType =>
  offerDestinationTypes.includes(value as OfferDestinationType);

export const isOfferMode = (value: string): value is OfferMode =>
  offerModes.includes(value as OfferMode);

export const isPublicOfferEventType = (
  value: unknown,
): value is PublicOfferEventType =>
  typeof value === "string" && publicOfferEventTypes.includes(value as PublicOfferEventType);

export const getCtaTypeForPublicEvent = (
  eventType: PublicOfferEventType,
): OfferCtaType | null => {
  if (eventType === offerViewEvent) {
    return null;
  }

  const entry = Object.entries(offerCtaPolicy).find(
    ([, policy]) =>
      policy.captureMethod === "EVENT" && policy.intentEvent === eventType,
  );

  return (entry?.[0] as OfferCtaType | undefined) ?? null;
};
