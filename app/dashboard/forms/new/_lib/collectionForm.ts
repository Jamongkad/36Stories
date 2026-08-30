export const submitterFieldNames = [
  "fullName",
  "email",
  "socialProfile",
] as const;

export type SubmitterFieldName = (typeof submitterFieldNames)[number];

export type FieldConfiguration = {
  show: boolean;
  required: boolean;
};

export type CollectionFormConfiguration = {
  version: 2;
  headline: string;
  instructions: string;
  successMessage: string;
  fields: Record<SubmitterFieldName, FieldConfiguration>;
};

export type LegacyCollectionFormConfiguration = {
  version: 1;
  headline: string;
  instructions: string;
  successMessage: string;
  fields: Record<string, FieldConfiguration>;
};

export type CollectionFormFieldName =
  | "internalName"
  | "headline"
  | "instructions"
  | "successMessage";

export type CollectionFormActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<
    Record<
      | CollectionFormFieldName
      | "rating"
      | "message"
      | "fullName"
      | "email"
      | "socialHandle"
      | "socialPlatform",
      string
    >
  >;
  widgetId?: string;
};

export const initialCollectionFormActionState: CollectionFormActionState = {
  status: "idle",
  message: "",
};

export type FeedbackSubmissionInput = {
  rating: number | null;
  message: string;
  fullName: string;
  email: string;
  socialPlatform: "INSTAGRAM" | "TIKTOK" | null;
  socialHandle: string;
  publicationConsent: boolean;
};

export type FeedbackSubmissionResult = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<
    Record<
      | "rating"
      | "message"
      | "fullName"
      | "email"
      | "socialHandle"
      | "socialPlatform",
      string
    >
  >;
};

export const initialFeedbackSubmissionResult: FeedbackSubmissionResult = {
  status: "idle",
  message: "",
};

export const initialSubmitterFields: Record<
  SubmitterFieldName,
  FieldConfiguration
> = {
  fullName: { show: true, required: false },
  email: { show: false, required: false },
  socialProfile: { show: true, required: false },
};

export const initialCollectionFormConfiguration: CollectionFormConfiguration = {
  version: 2,
  headline: "Share your story",
  instructions: "Tell us about your experience.",
  successMessage: "Thanks for sharing your story!",
  fields: initialSubmitterFields,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseField = (value: unknown): FieldConfiguration => {
  if (!isRecord(value)) {
    return { show: false, required: false };
  }

  const show = value.show === true;
  return { show, required: show && value.required === true };
};

export const parseCollectionFormConfiguration = (
  value: unknown,
): CollectionFormConfiguration | null => {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
    return null;
  }

  const headline = typeof value.headline === "string" ? value.headline.trim() : "";
  const instructions =
    typeof value.instructions === "string" ? value.instructions.trim() : "";
  const successMessage =
    typeof value.successMessage === "string" ? value.successMessage.trim() : "";
  const rawFields = isRecord(value.fields) ? value.fields : {};

  if (!headline || !instructions || !successMessage) {
    return null;
  }

  const fields = {
    fullName: parseField(rawFields.fullName),
    email: parseField(rawFields.email),
    socialProfile:
      value.version === 2
        ? parseField(rawFields.socialProfile)
        : { show: false, required: false },
  };

  return { version: 2, headline, instructions, successMessage, fields };
};
