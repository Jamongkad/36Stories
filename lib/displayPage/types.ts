export type DisplayPageLink = {
  id: string;
  label: string;
  url: string;
};

export type DisplayPageTheme = "modern" | "minimalist" | "sophisticated";
export type DisplayPageBackgroundColor = "paper" | "mist" | "sand" | "ink";
export type DisplayPageButtonColor = "charcoal" | "cobalt" | "forest" | "violet";

export type DisplayPageConfigurationV2 = {
  version: 2;
  displayName: string;
  bio: string;
  links: DisplayPageLink[];
  selectedCollectionWidgetId: string | null;
  theme: DisplayPageTheme;
  backgroundColor: DisplayPageBackgroundColor;
  buttonColor: DisplayPageButtonColor;
};

export type DisplayPageConfiguration = DisplayPageConfigurationV2;

export type DisplayPageAppearance = {
  background: string;
  backgroundImage: string;
  button: string;
  buttonText: string;
  card: string;
  border: string;
  headingFontFamily: string;
  text: string;
  mutedText: string;
  pageRadius: number;
  cardRadius: number;
  buttonRadius: number;
  sectionSpacing: number;
};

export type DisplayPageFieldName =
  | "displayName"
  | "bio"
  | "links"
  | "selectedCollectionWidgetId"
  | "theme"
  | "backgroundColor"
  | "buttonColor";

export type DisplayPageActionState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Partial<Record<DisplayPageFieldName, string>>;
};
