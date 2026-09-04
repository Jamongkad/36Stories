import { connection } from "next/server";
import { WidgetType } from "@/generated/prisma/client";
import { parseDisplayPageConfiguration } from "@/lib/displayPage";
import type { PublicOffer } from "@/lib/offers/types";
import { prisma } from "@/lib/prisma";
import { requireCreatorContext } from "@/lib/creatorAuth";
import { DashboardPageHeader } from "../_components/DashboardPrimitives";
import BioPageEditor from "./_components/BioPageEditor";

const BioPageEditorRoute = async () => {
  await connection();
  const creator = await requireCreatorContext();

  const site = await prisma.site.findFirst({
    where: { id: creator.siteId, organizationId: creator.organizationId },
    select: {
      organization: { select: { name: true, slug: true } },
      widgets: {
        where: { type: WidgetType.DISPLAY, isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { config: true },
      },
      offers: {
        where: { isPublished: true },
        orderBy: [
          { isFeatured: "desc" },
          { sortOrder: "asc" },
          { createdAt: "asc" },
        ],
        select: {
          id: true,
          kind: true,
          mode: true,
          title: true,
          description: true,
          imageUrl: true,
          priceLabel: true,
          launchAt: true,
          destinationUrl: true,
          ctaType: true,
          ctaLabel: true,
          isAffiliate: true,
          disclosureText: true,
        },
      },
    },
  });

  const displayWidget = site?.widgets[0];
  const config = parseDisplayPageConfiguration(
    displayWidget?.config,
    site?.organization.name ?? "Creator Name",
  );
  const offers: PublicOffer[] = (site?.offers ?? []).map((offer) => ({
    ...offer,
    launchAt: offer.launchAt
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(offer.launchAt)
      : null,
  }));

  return (
    <>
      <DashboardPageHeader
        action={
          <a href={`/bio/${site?.organization.slug ?? creator.organizationSlug}`} target="_blank">
            View live page ↗
          </a>
        }
        description="Shape the page your followers see when they tap your bio link. Changes go live when you save."
        eyebrow="Your public page"
        title="Bio page"
      />
      <BioPageEditor config={config} offers={offers} publicSlug={site?.organization.slug ?? creator.organizationSlug} />
    </>
  );
};

export default BioPageEditorRoute;
