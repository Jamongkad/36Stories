import type {
  OfferCtaType,
  OfferKind,
  OfferMode,
} from "./policy";

export type PublicOffer = {
  id: string;
  kind: OfferKind;
  mode: OfferMode;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceLabel: string | null;
  launchAt: string | null;
  destinationUrl: string | null;
  ctaType: OfferCtaType;
  ctaLabel: string;
  isAffiliate: boolean;
  disclosureText: string | null;
};
