import {
  displayPageBackgroundColorPolicy,
  displayPageButtonColorPolicy,
} from "./constants";
import type { DisplayPageAppearance, DisplayPageConfigurationV2 } from "./types";

const getRelativeLuminance = (hexColor: string) => {
  const channels = [1, 3, 5].map((offset) =>
    Number.parseInt(hexColor.slice(offset, offset + 2), 16) / 255,
  );
  const linearChannels = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * linearChannels[0] + 0.7152 * linearChannels[1] + 0.0722 * linearChannels[2];
};

const getContrastText = (hexColor: string) =>
  getRelativeLuminance(hexColor) > 0.48 ? "#111827" : "#ffffff";

export const getDisplayPageAppearance = (
  config: Pick<DisplayPageConfigurationV2, "theme" | "backgroundColor" | "buttonColor">,
): DisplayPageAppearance => {
  const background = displayPageBackgroundColorPolicy[config.backgroundColor].value;
  const button = displayPageButtonColorPolicy[config.buttonColor].value;
  const isDarkBackground = getContrastText(background) === "#ffffff";
  const text = isDarkBackground ? "#ffffff" : config.theme === "sophisticated" ? "#231f1a" : "#111827";
  const mutedText = isDarkBackground ? "#d1d5db" : config.theme === "sophisticated" ? "#655f57" : "#667085";

  const themeStyles = {
    modern: {
      backgroundImage: `radial-gradient(circle at 50% 0%, ${button}24, transparent 22rem)`,
      card: isDarkBackground ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.82)",
      border: isDarkBackground ? "rgba(255, 255, 255, 0.2)" : "#dce4f0",
      headingFontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      pageRadius: 4,
      cardRadius: 4,
      buttonRadius: 999,
      sectionSpacing: 3,
    },
    minimalist: {
      backgroundImage: "none",
      card: isDarkBackground ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.72)",
      border: isDarkBackground ? "rgba(255, 255, 255, 0.28)" : "#e5e7eb",
      headingFontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      pageRadius: 2,
      cardRadius: 2,
      buttonRadius: 2,
      sectionSpacing: 3.5,
    },
    sophisticated: {
      backgroundImage: `radial-gradient(circle at 50% 0%, ${button}24, transparent 22rem)`,
      card: isDarkBackground ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.8)",
      border: isDarkBackground ? "rgba(255, 255, 255, 0.22)" : "#ded5c8",
      headingFontFamily: 'Georgia, "Times New Roman", serif',
      pageRadius: 4,
      cardRadius: 3,
      buttonRadius: 999,
      sectionSpacing: 4,
    },
  }[config.theme];

  return {
    background,
    backgroundImage: themeStyles.backgroundImage,
    button,
    buttonText: getContrastText(button),
    card: themeStyles.card,
    border: themeStyles.border,
    headingFontFamily: themeStyles.headingFontFamily,
    text,
    mutedText,
    pageRadius: themeStyles.pageRadius,
    cardRadius: themeStyles.cardRadius,
    buttonRadius: themeStyles.buttonRadius,
    sectionSpacing: themeStyles.sectionSpacing,
  };
};
