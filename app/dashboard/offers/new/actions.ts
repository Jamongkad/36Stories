"use server";

import { prisma } from "@/lib/prisma";
import {
  type OfferFormActionState,
  validateOfferForm,
} from "@/lib/offerForm";
import { revalidateCreatorPaths } from "@/lib/revalidatePaths";
import { requireCreatorContext } from "@/lib/creatorAuth";

export async function createOffer(
  _previousState: OfferFormActionState,
  formData: FormData,
): Promise<OfferFormActionState> {
  const { input, fieldErrors } = validateOfferForm(formData);

  if (!input) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    const creator = await requireCreatorContext();
    const site = await prisma.site.findFirst({
      where: { id: creator.siteId, organizationId: creator.organizationId },
      select: {
        id: true,
        organization: { select: { slug: true } },
        offers: {
          orderBy: { sortOrder: "desc" },
          take: 1,
          select: { sortOrder: true },
        },
      },
    });

    if (!site) {
      return {
        status: "error",
        message: "Demo site not found. Run the database seed and try again.",
      };
    }

    const offer = await prisma.offer.create({
      data: {
        siteId: site.id,
        ...input,
        sortOrder: (site.offers[0]?.sortOrder ?? -1) + 1,
      },
      select: { id: true },
    });

    revalidateCreatorPaths(site.organization.slug);

    return {
      status: "success",
      message: input.isPublished ? "Offer created and published." : "Offer saved as a draft.",
      offerId: offer.id,
    };
  } catch {
    return {
      status: "error",
      message: "We couldn’t create this offer. Please try again.",
    };
  }
}
