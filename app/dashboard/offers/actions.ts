"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function setOfferPublished(offerId: string, isPublished: boolean) {
  const normalizedOfferId = typeof offerId === "string" ? offerId.trim() : "";

  if (!normalizedOfferId || typeof isPublished !== "boolean") {
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
    where: { id: normalizedOfferId, siteId: site.id },
    data: { isPublished },
  });

  revalidate(site.organization.slug);
}

export async function deleteOffer(offerId: string) {
  const normalizedOfferId = typeof offerId === "string" ? offerId.trim() : "";

  if (!normalizedOfferId) {
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

  await prisma.offer.deleteMany({
    where: { id: normalizedOfferId, siteId: site.id },
  });

  revalidate(site.organization.slug);
}

const revalidate = (slug: string) => {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/offers");
  revalidatePath("/dashboard/analytics");
  revalidatePath(`/bio/${slug}`);
};
