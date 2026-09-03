import {
  DISPLAY_BIO_MAX_LENGTH,
  DISPLAY_LINK_LABEL_MAX_LENGTH,
  DISPLAY_LINK_LIMIT,
  DISPLAY_LINK_URL_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  displayPageBackgroundColors,
  displayPageButtonColors,
  displayPageThemes,
} from "./constants";
import type {
  DisplayPageActionState,
  DisplayPageBackgroundColor,
  DisplayPageButtonColor,
  DisplayPageConfigurationV2,
  DisplayPageFieldName,
  DisplayPageLink,
  DisplayPageTheme,
} from "./types";

export const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const initialDisplayPageActionState: DisplayPageActionState = {
  status: "idle",
  message: "",
};

export const parseDisplayPageForm = (
  formData: FormData,
): {
  input?: Omit<DisplayPageConfigurationV2, "version" | "selectedCollectionWidgetId">;
  fieldErrors: Partial<Record<DisplayPageFieldName, string>>;
} => {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const themeValue = String(formData.get("theme") ?? "");
  const backgroundValue = String(formData.get("backgroundColor") ?? "");
  const buttonValue = String(formData.get("buttonColor") ?? "");
  const fieldErrors: Partial<Record<DisplayPageFieldName, string>> = {};

  if (!displayName) fieldErrors.displayName = "Add a display name.";
  else if (displayName.length > DISPLAY_NAME_MAX_LENGTH) fieldErrors.displayName = `Keep this under ${DISPLAY_NAME_MAX_LENGTH} characters.`;
  if (bio.length > DISPLAY_BIO_MAX_LENGTH) fieldErrors.bio = `Keep this under ${DISPLAY_BIO_MAX_LENGTH} characters.`;
  if (!displayPageThemes.includes(themeValue as DisplayPageTheme)) fieldErrors.theme = "Choose a theme.";
  if (!displayPageBackgroundColors.includes(backgroundValue as DisplayPageBackgroundColor)) fieldErrors.backgroundColor = "Choose a background color.";
  if (!displayPageButtonColors.includes(buttonValue as DisplayPageButtonColor)) fieldErrors.buttonColor = "Choose a button color.";

  const links: DisplayPageLink[] = [];
  try {
    const parsedLinks: unknown = JSON.parse(String(formData.get("links") ?? "[]"));
    if (!Array.isArray(parsedLinks) || parsedLinks.length > DISPLAY_LINK_LIMIT) {
      fieldErrors.links = `Add no more than ${DISPLAY_LINK_LIMIT} links.`;
    } else {
      const seenIds = new Set<string>();
      for (const value of parsedLinks) {
        if (!isRecord(value)) {
          fieldErrors.links = "Check your links and try again.";
          break;
        }
        const id = typeof value.id === "string" ? value.id.trim() : "";
        const label = typeof value.label === "string" ? value.label.trim() : "";
        const url = typeof value.url === "string" ? value.url.trim() : "";
        if (!id || seenIds.has(id) || !label || label.length > DISPLAY_LINK_LABEL_MAX_LENGTH || url.length > DISPLAY_LINK_URL_MAX_LENGTH || !isHttpUrl(url)) {
          fieldErrors.links = "Each link needs a unique label and a valid http(s) URL.";
          break;
        }
        seenIds.add(id);
        links.push({ id, label, url });
      }
    }
  } catch {
    fieldErrors.links = "Check your links and try again.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  return {
    fieldErrors,
    input: {
      displayName,
      bio,
      links,
      theme: themeValue as DisplayPageTheme,
      backgroundColor: backgroundValue as DisplayPageBackgroundColor,
      buttonColor: buttonValue as DisplayPageButtonColor,
    },
  };
};
