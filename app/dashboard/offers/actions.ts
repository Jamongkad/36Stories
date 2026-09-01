"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setOfferPublished(formData: FormData) {
  const offerId = String(formData.get("offerId") ?? "").trim();
  const isPublished = formData.get("isPublished") === "true";

  if (!offerId) {
    return;
  }

  const site = await prisma.site.findFirst({
    where: {
      domain: "localhost",
      organization: { slug: "36stories-demo" },
    },
    select: { id: true, organization: { select: { slug: true } } },
  });

  if (!site) {
    return;
  }

  await prisma.offer.updateMany({
    where: { id: offerId, siteId: site.id },
    data: { isPublished },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/offers");
  revalidatePath("/dashboard/analytics");
  revalidatePath(`/bio/${site.organization.slug}`);
}
