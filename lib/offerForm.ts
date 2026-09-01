import { isHttpUrl } from "./displayPage";
import {
  isOfferDestinationType,
  isOfferKind,
  isOfferMode,
  offerModePolicy,
  type OfferCtaType,
  type OfferDestinationType,
  type OfferKind,
  type OfferMode,
} from "./offers/policy";

export type OfferFormField =
  | "kind"
  | "mode"
  | "title"
  | "description"
  | "imageUrl"
  | "priceLabel"
  | "launchAt"
  | "destinationUrl"
  | "destinationType"
  | "ctaLabel"
  | "disclosureText";

export type OfferFormActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<Record<OfferFormField, string>>;
  offerId?: string;
};

export const initialOfferFormActionState: OfferFormActionState = {
  status: "idle",
  message: "",
};

export type ValidatedOfferInput = {
  kind: OfferKind;
  mode: OfferMode;
  title: string;
  description: string | null;
  imageUrl: string | null;
  priceLabel: string | null;
  launchAt: Date | null;
  destinationUrl: string | null;
  destinationType: OfferDestinationType | null;
  ctaType: OfferCtaType;
  ctaLabel: string;
  isAffiliate: boolean;
  disclosureText: string | null;
  isPublished: boolean;
};

const stringValue = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "").trim();

export const validateOfferForm = (
  formData: FormData,
): { input: ValidatedOfferInput | null; fieldErrors: OfferFormActionState["fieldErrors"] } => {
  const kind = stringValue(formData, "kind");
  const mode = stringValue(formData, "mode");
  const title = stringValue(formData, "title");
  const description = stringValue(formData, "description");
  const imageUrl = stringValue(formData, "imageUrl");
  const priceLabel = stringValue(formData, "priceLabel");
  const launchAtValue = stringValue(formData, "launchAt");
  const destinationUrl = stringValue(formData, "destinationUrl");
  const destinationType = stringValue(formData, "destinationType");
  const ctaLabel = stringValue(formData, "ctaLabel");
  const disclosureText = stringValue(formData, "disclosureText");
  const fieldErrors: OfferFormActionState["fieldErrors"] = {};
  const normalizedKind = isOfferKind(kind) ? kind : null;
  const normalizedMode = isOfferMode(mode) ? mode : null;
  const modePolicy = normalizedMode ? offerModePolicy[normalizedMode] : null;
  const normalizedDestinationType = isOfferDestinationType(destinationType)
    ? destinationType
    : null;

  if (!normalizedKind) {
    fieldErrors.kind = "Choose product or service.";
  }

  if (!normalizedMode) {
    fieldErrors.mode = "Choose whether this is live, coming soon, or an idea.";
  }

  if (!title) {
    fieldErrors.title = "Give this offer a title.";
  } else if (title.length > 120) {
    fieldErrors.title = "Keep the title under 120 characters.";
  }

  if (description.length > 600) {
    fieldErrors.description = "Keep the description under 600 characters.";
  }

  if (imageUrl && !isHttpUrl(imageUrl)) {
    fieldErrors.imageUrl = "Enter a valid http(s) image URL.";
  }

  if (priceLabel.length > 80) {
    fieldErrors.priceLabel = "Keep the price label under 80 characters.";
  }

  if (ctaLabel.length > 80) {
    fieldErrors.ctaLabel = "Keep the button label under 80 characters.";
  }

  let launchAt: Date | null = null;
  if (launchAtValue && modePolicy?.supportsLaunchDate) {
    launchAt = new Date(launchAtValue);
    if (Number.isNaN(launchAt.getTime())) {
      fieldErrors.launchAt = "Enter a valid launch date.";
      launchAt = null;
    }
  }

  if (modePolicy?.requiresDestination && !isHttpUrl(destinationUrl)) {
    fieldErrors.destinationUrl = "Add the store, affiliate, booking, or product URL.";
  }

  if (modePolicy?.requiresDestination && !normalizedDestinationType) {
    fieldErrors.destinationType = "Choose where this offer sends visitors.";
  }

  if (
    !normalizedKind ||
    !normalizedMode ||
    !modePolicy ||
    Object.keys(fieldErrors).length > 0
  ) {
    return { input: null, fieldErrors };
  }

  const isAffiliate =
    modePolicy.supportsAffiliate && formData.get("isAffiliate") === "on";

  return {
    input: {
      kind: normalizedKind,
      mode: normalizedMode,
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      priceLabel: priceLabel || null,
      launchAt,
      destinationUrl: modePolicy.requiresDestination ? destinationUrl : null,
      destinationType: modePolicy.requiresDestination
        ? normalizedDestinationType
        : null,
      ctaType: modePolicy.ctaType,
      ctaLabel: ctaLabel || modePolicy.defaultCtaLabel,
      isAffiliate,
      disclosureText: isAffiliate
        ? disclosureText || "This link may earn me a commission."
        : null,
      isPublished: formData.get("isPublished") === "on",
    },
    fieldErrors,
  };
};
