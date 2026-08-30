"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { WidgetType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DISPLAY_BIO_MAX_LENGTH,
  DISPLAY_LINK_LABEL_MAX_LENGTH,
  DISPLAY_LINK_LIMIT,
  DISPLAY_LINK_URL_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  type DisplayPageActionState,
  type DisplayPageConfigurationV1,
  type DisplayPageLink,
  isHttpUrl,
} from "@/lib/displayPage";

const readLinks = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
};

const validateLinks = (value: unknown) => {
  if (!Array.isArray(value) || value.length > DISPLAY_LINK_LIMIT) {
    return null;
  }

  const seenIds = new Set<string>();
  const links: DisplayPageLink[] = [];

  for (const candidate of value) {
    if (typeof candidate !== "object" || candidate === null || Array.isArray(candidate)) {
      return null;
    }

    const record = candidate as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id.trim() : "";
    const label = typeof record.label === "string" ? record.label.trim() : "";
    const url = typeof record.url === "string" ? record.url.trim() : "";

    if (
      !id ||
      seenIds.has(id) ||
      !label ||
      label.length > DISPLAY_LINK_LABEL_MAX_LENGTH ||
      !url ||
      url.length > DISPLAY_LINK_URL_MAX_LENGTH ||
      !isHttpUrl(url)
    ) {
      return null;
    }

    seenIds.add(id);
    links.push({ id, label, url });
  }

  return links;
};

export async function saveTestimonialPage(
  _previousState: DisplayPageActionState,
  formData: FormData,
): Promise<DisplayPageActionState> {
  const displayName = String(formData.get("displayName") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const selectedCollectionWidgetId =
    String(formData.get("selectedCollectionWidgetId") ?? "").trim();
  const links = validateLinks(readLinks(formData.get("links")));
  const fieldErrors: DisplayPageActionState["fieldErrors"] = {};

  if (!displayName) {
    fieldErrors.displayName = "Display name is required.";
  } else if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    fieldErrors.displayName = `Keep the display name under ${DISPLAY_NAME_MAX_LENGTH} characters.`;
  }

  if (bio.length > DISPLAY_BIO_MAX_LENGTH) {
    fieldErrors.bio = `Keep the bio under ${DISPLAY_BIO_MAX_LENGTH} characters.`;
  }

  if (links === null) {
    fieldErrors.links =
      "Add no more than 10 links, each with a unique ID, label, and valid http(s) URL.";
  }

  if (!selectedCollectionWidgetId) {
    fieldErrors.selectedCollectionWidgetId =
      "Select an active collection form before publishing.";
  }

  if (Object.keys(fieldErrors).length > 0 || links === null) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    // Authentication has not been introduced in this foundation yet. Resolve the
    // same single demo account used by the rest of the dashboard and never trust
    // a site or organization identifier supplied by the browser.
    const site = await prisma.site.findFirst({
      where: {
        domain: "localhost",
        organization: { slug: "36stories-demo" },
      },
      select: {
        id: true,
        organization: { select: { slug: true } },
      },
    });

    if (!site) {
      return {
        status: "error",
        message: "Demo site not found. Run `npm run db:seed` and try again.",
      };
    }

    if (selectedCollectionWidgetId) {
      const collectionWidget = await prisma.widget.findFirst({
        where: {
          id: selectedCollectionWidgetId,
          siteId: site.id,
          type: WidgetType.COLLECTION,
          isActive: true,
        },
        select: { id: true },
      });

      if (!collectionWidget) {
        return {
          status: "error",
          message: "Choose an active collection form and try again.",
          fieldErrors: {
            selectedCollectionWidgetId: "This collection form is no longer available.",
          },
        };
      }
    }

    const config: DisplayPageConfigurationV1 = {
      version: 1,
      displayName,
      bio,
      links,
      selectedCollectionWidgetId,
    };
    const existingDisplayWidget = await prisma.widget.findFirst({
      where: { siteId: site.id, type: WidgetType.DISPLAY },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (existingDisplayWidget) {
      await prisma.widget.update({
        where: { id: existingDisplayWidget.id },
        data: {
          config,
          isActive: true,
          name: "Testimonial Page",
        },
      });
    } else {
      await prisma.widget.create({
        data: {
          siteId: site.id,
          type: WidgetType.DISPLAY,
          name: "Testimonial Page",
          publicKey: `display_${randomUUID().replaceAll("-", "")}`,
          config,
        },
      });
    }

    revalidatePath("/dashboard/testimonial-page");
    revalidatePath(`/testimonials/${site.organization.slug}`);

    return {
      status: "success",
      message: "Testimonial page saved and published.",
    };
  } catch {
    return {
      status: "error",
      message: "We couldn't save the testimonial page. Please try again.",
    };
  }
}
