import type {
  DisplayPageBackgroundColor,
  DisplayPageButtonColor,
  DisplayPageTheme,
} from "./types";

export const DISPLAY_NAME_MAX_LENGTH = 80;
export const DISPLAY_BIO_MAX_LENGTH = 240;
export const DISPLAY_LINK_LABEL_MAX_LENGTH = 60;
export const DISPLAY_LINK_URL_MAX_LENGTH = 2048;
export const DISPLAY_LINK_LIMIT = 10;

export const displayPageThemes = ["modern", "minimalist", "sophisticated"] as const;
export const displayPageBackgroundColors = ["paper", "mist", "sand", "ink"] as const;
export const displayPageButtonColors = ["charcoal", "cobalt", "forest", "violet"] as const;

export const displayPageThemePolicy: Record<
  DisplayPageTheme,
  {
    label: string;
    description: string;
    backgroundColor: DisplayPageBackgroundColor;
    buttonColor: DisplayPageButtonColor;
  }
> = {
  modern: {
    label: "Modern",
    description: "Bright, friendly, and built for quick taps.",
    backgroundColor: "mist",
    buttonColor: "cobalt",
  },
  minimalist: {
    label: "Minimalist",
    description: "Quiet, spacious, and focused on your links.",
    backgroundColor: "paper",
    buttonColor: "charcoal",
  },
  sophisticated: {
    label: "Sophisticated",
    description: "Warm, editorial, and polished.",
    backgroundColor: "sand",
    buttonColor: "forest",
  },
};

export const displayPageBackgroundColorPolicy: Record<
  DisplayPageBackgroundColor,
  { label: string; value: string }
> = {
  paper: { label: "Paper", value: "#ffffff" },
  mist: { label: "Mist", value: "#f5f7fb" },
  sand: { label: "Sand", value: "#f7f2e9" },
  ink: { label: "Ink", value: "#202124" },
};

export const displayPageButtonColorPolicy: Record<
  DisplayPageButtonColor,
  { label: string; value: string }
> = {
  charcoal: { label: "Charcoal", value: "#111827" },
  cobalt: { label: "Cobalt", value: "#2563eb" },
  forest: { label: "Forest", value: "#1f6849" },
  violet: { label: "Violet", value: "#7c3aed" },
};
