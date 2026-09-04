"use server";

import { prisma } from "@/lib/prisma";
import { revalidateCreatorPaths } from "@/lib/revalidatePaths";
import { requireCreatorContext } from "@/lib/creatorAuth";

export async function setOfferPublished(offerId: string, isPublished: boolean) {
  const normalizedOfferId = typeof offerId === "string" ? offerId.trim() : "";

  if (!normalizedOfferId || typeof isPublished !== "boolean") {
    return;
  }

  const creator = await requireCreatorContext().catch(() => null);
  if (!creator) return;
  const site = await prisma.site.findFirst({
    where: { id: creator.siteId, organizationId: creator.organizationId },
    select: { id: true, organization: { select: { slug: true } } },
  });

  if (!site) {
    return;
  }

  await prisma.offer.updateMany({
    where: { id: normalizedOfferId, siteId: site.id },
    data: { isPublished },
  });

  revalidateCreatorPaths(site.organization.slug);
}

export async function deleteOffer(offerId: string) {
  const normalizedOfferId = typeof offerId === "string" ? offerId.trim() : "";

  if (!normalizedOfferId) {
    return;
  }

  const creator = await requireCreatorContext().catch(() => null);
  if (!creator) return;
  const site = await prisma.site.findFirst({
    where: { id: creator.siteId, organizationId: creator.organizationId },
    select: { id: true, organization: { select: { slug: true } } },
  });

  if (!site) {
    return;
  }

  await prisma.offer.deleteMany({
    where: { id: normalizedOfferId, siteId: site.id },
  });

  revalidateCreatorPaths(site.organization.slug);
}
