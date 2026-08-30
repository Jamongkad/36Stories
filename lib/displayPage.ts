export const DISPLAY_NAME_MAX_LENGTH = 80;
export const DISPLAY_BIO_MAX_LENGTH = 240;
export const DISPLAY_LINK_LABEL_MAX_LENGTH = 60;
export const DISPLAY_LINK_URL_MAX_LENGTH = 2048;
export const DISPLAY_LINK_LIMIT = 10;

export type DisplayPageLink = {
  id: string;
  label: string;
  url: string;
};

export type DisplayPageConfigurationV1 = {
  version: 1;
  displayName: string;
  bio: string;
  links: DisplayPageLink[];
  selectedCollectionWidgetId: string | null;
};

export type DisplayPageFieldName =
  | "displayName"
  | "bio"
  | "links"
  | "selectedCollectionWidgetId";

export type DisplayPageActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<Record<DisplayPageFieldName, string>>;
};

export const initialDisplayPageActionState: DisplayPageActionState = {
  status: "idle",
  message: "",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const createDefaultDisplayPageConfiguration = (
  displayName: string,
): DisplayPageConfigurationV1 => ({
  version: 1,
  displayName: displayName.trim().slice(0, DISPLAY_NAME_MAX_LENGTH),
  bio: "",
  links: [],
  selectedCollectionWidgetId: null,
});

export const parseDisplayPageConfiguration = (
  value: unknown,
  fallbackDisplayName: string,
): DisplayPageConfigurationV1 => {
  const fallback = createDefaultDisplayPageConfiguration(fallbackDisplayName);

  if (!isRecord(value) || value.version !== 1) {
    return fallback;
  }

  const displayName =
    typeof value.displayName === "string" && value.displayName.trim()
      ? value.displayName.trim().slice(0, DISPLAY_NAME_MAX_LENGTH)
      : fallback.displayName;
  const bio =
    typeof value.bio === "string"
      ? value.bio.trim().slice(0, DISPLAY_BIO_MAX_LENGTH)
      : "";
  const selectedCollectionWidgetId =
    typeof value.selectedCollectionWidgetId === "string" &&
    value.selectedCollectionWidgetId.trim()
      ? value.selectedCollectionWidgetId.trim()
      : null;

  const seenLinkIds = new Set<string>();
  const links = Array.isArray(value.links)
    ? value.links
        .slice(0, DISPLAY_LINK_LIMIT)
        .flatMap((link): DisplayPageLink[] => {
          if (!isRecord(link)) {
            return [];
          }

          const id = typeof link.id === "string" ? link.id.trim() : "";
          const label = typeof link.label === "string" ? link.label.trim() : "";
          const url = typeof link.url === "string" ? link.url.trim() : "";

          if (
            !id ||
            seenLinkIds.has(id) ||
            !label ||
            label.length > DISPLAY_LINK_LABEL_MAX_LENGTH ||
            url.length > DISPLAY_LINK_URL_MAX_LENGTH ||
            !isHttpUrl(url)
          ) {
            return [];
          }

          seenLinkIds.add(id);
          return [{ id, label, url }];
        })
    : [];

  return {
    version: 1,
    displayName,
    bio,
    links,
    selectedCollectionWidgetId,
  };
};

export const getCollectionHeadline = (value: unknown) => {
  if (!isRecord(value) || typeof value.headline !== "string") {
    return null;
  }

  const headline = value.headline.trim();
  return headline ? headline.slice(0, 120) : null;
};
