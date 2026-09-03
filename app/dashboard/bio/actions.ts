"use server";

import { WidgetType } from "@/generated/prisma/client";
import { parseDisplayPageConfiguration, parseDisplayPageForm, type DisplayPageActionState } from "@/lib/displayPage";
import { prisma } from "@/lib/prisma";
import { revalidateCreatorPaths } from "@/lib/revalidatePaths";

export async function saveDisplayPage(
  _previousState: DisplayPageActionState,
  formData: FormData,
): Promise<DisplayPageActionState> {
  const { input, fieldErrors } = parseDisplayPageForm(formData);

  if (!input) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    const site = await prisma.site.findFirst({
      where: {
        domain: "localhost",
        organization: { slug: "36stories-demo" },
      },
      select: {
        organization: { select: { name: true, slug: true } },
        widgets: {
          where: { type: WidgetType.DISPLAY, isActive: true },
          orderBy: { createdAt: "asc" },
          take: 1,
          select: { id: true, config: true },
        },
      },
    });

    const displayWidget = site?.widgets[0];
    if (!site || !displayWidget) {
      return {
        status: "error",
        message: "Bio page not found. Run the database seed and try again.",
      };
    }

    const currentConfig = parseDisplayPageConfiguration(
      displayWidget.config,
      site.organization.name,
    );

    await prisma.widget.update({
      where: { id: displayWidget.id },
      data: {
        config: {
          version: 2,
          ...input,
          selectedCollectionWidgetId: currentConfig.selectedCollectionWidgetId,
        },
      },
    });

    revalidateCreatorPaths(site.organization.slug);

    return {
      status: "success",
      message: "Bio page saved.",
    };
  } catch {
    return {
      status: "error",
      message: "We couldn’t save your bio page. Please try again.",
    };
  }
}
