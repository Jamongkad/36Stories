"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { WidgetType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  type CollectionFormActionState,
  type CollectionFormConfiguration,
  type CollectionFormFieldName,
  submitterFieldNames,
} from "./_lib/collectionForm";

const textLimits: Record<CollectionFormFieldName, number> = {
  internalName: 100,
  headline: 120,
  instructions: 500,
  successMessage: 240,
};

const readText = (formData: FormData, name: CollectionFormFieldName) =>
  String(formData.get(name) ?? "").trim();

const isChecked = (formData: FormData, name: string) =>
  formData.get(name) === "on";

export async function createCollectionForm(
  _previousState: CollectionFormActionState,
  formData: FormData,
): Promise<CollectionFormActionState> {
  const internalName = readText(formData, "internalName");
  const headline = readText(formData, "headline");
  const instructions = readText(formData, "instructions");
  const successMessage = readText(formData, "successMessage");
  const values = { internalName, headline, instructions, successMessage };
  const fieldErrors: CollectionFormActionState["fieldErrors"] = {};

  for (const [name, value] of Object.entries(values) as Array<
    [CollectionFormFieldName, string]
  >) {
    if (!value) {
      fieldErrors[name] = "This field is required.";
    } else if (value.length > textLimits[name]) {
      fieldErrors[name] = `Keep this field under ${textLimits[name]} characters.`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const fields = Object.fromEntries(
    submitterFieldNames.map((name) => {
      const show = isChecked(formData, `${name}Show`);
      const required = show && isChecked(formData, `${name}Required`);

      return [name, { show, required }];
    }),
  ) as CollectionFormConfiguration["fields"];

  const config: CollectionFormConfiguration = {
    version: 2,
    headline,
    instructions,
    successMessage,
    fields,
  };

  try {
    const site = await prisma.site.findFirst({
      where: {
        domain: "localhost",
        organization: { slug: "36stories-demo" },
      },
      select: { id: true },
    });

    if (!site) {
      return {
        status: "error",
        message: "Demo site not found. Run `npm run db:seed` and try again.",
      };
    }

    const widget = await prisma.widget.create({
      data: {
        siteId: site.id,
        type: WidgetType.COLLECTION,
        name: internalName,
        publicKey: `collection_${randomUUID().replaceAll("-", "")}`,
        config,
      },
    });

    revalidatePath("/dashboard/forms");
    revalidatePath("/dashboard/testimonial-page");

    return {
      status: "success",
      message: "Form created successfully!",
      widgetId: widget.id,
    };
  } catch {
    return {
      status: "error",
      message: "We couldn't create the form. Please try again.",
    };
  }
}
