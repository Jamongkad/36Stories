type ContactAttribution = {
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  socialHandle: string | null;
  socialPlatform: string | null;
};

export const formatContactAttribution = (contact: ContactAttribution | null) => {
  if (!contact) {
    return null;
  }

  const name =
    contact.fullName?.trim() ||
    [contact.firstName, contact.lastName].filter(Boolean).join(" ").trim();
  const platform =
    contact.socialPlatform === "INSTAGRAM"
      ? "Instagram"
      : contact.socialPlatform === "TIKTOK"
        ? "TikTok"
        : "";
  const social = contact.socialHandle?.trim()
    ? `${platform ? `${platform} ` : ""}${contact.socialHandle.trim()}`
    : "";

  return [name, social].filter(Boolean).join(" · ") || null;
};
