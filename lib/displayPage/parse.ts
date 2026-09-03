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
import { isHttpUrl } from "./validation";
import type {
  DisplayPageConfigurationV2,
  DisplayPageBackgroundColor,
  DisplayPageButtonColor,
  DisplayPageLink,
  DisplayPageTheme,
} from "./types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const createDefaultDisplayPageConfiguration = (
  displayName: string,
): DisplayPageConfigurationV2 => ({
  version: 2,
  displayName: displayName.trim().slice(0, DISPLAY_NAME_MAX_LENGTH),
  bio: "",
  links: [],
  selectedCollectionWidgetId: null,
  theme: "sophisticated",
  backgroundColor: "sand",
  buttonColor: "forest",
});

export const parseDisplayPageConfiguration = (
  value: unknown,
  fallbackDisplayName: string,
): DisplayPageConfigurationV2 => {
  const fallback = createDefaultDisplayPageConfiguration(fallbackDisplayName);

  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
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
  const theme = displayPageThemes.includes(value.theme as DisplayPageTheme)
    ? (value.theme as DisplayPageTheme)
    : fallback.theme;
  const backgroundColor = displayPageBackgroundColors.includes(
    value.backgroundColor as DisplayPageBackgroundColor,
  )
    ? (value.backgroundColor as DisplayPageBackgroundColor)
    : fallback.backgroundColor;
  const buttonColor = displayPageButtonColors.includes(
    value.buttonColor as DisplayPageButtonColor,
  )
    ? (value.buttonColor as DisplayPageButtonColor)
    : fallback.buttonColor;

  const seenLinkIds = new Set<string>();
  const links = Array.isArray(value.links)
    ? value.links
        .slice(0, DISPLAY_LINK_LIMIT)
        .flatMap((link): DisplayPageLink[] => {
          if (!isRecord(link)) return [];

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
    version: 2,
    displayName,
    bio,
    links,
    selectedCollectionWidgetId,
    theme,
    backgroundColor,
    buttonColor,
  };
};

export const getCollectionHeadline = (value: unknown) => {
  if (!isRecord(value) || typeof value.headline !== "string") return null;

  const headline = value.headline.trim();
  return headline ? headline.slice(0, 120) : null;
};
