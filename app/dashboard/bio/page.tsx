import { connection } from "next/server";
import { WidgetType } from "@/generated/prisma/client";
import { parseDisplayPageConfiguration } from "@/lib/displayPage";
import type { PublicOffer } from "@/lib/offers/types";
import { prisma } from "@/lib/prisma";
import { DashboardPageHeader } from "../_components/DashboardPrimitives";
import BioPageEditor from "./_components/BioPageEditor";

const BioPageEditorRoute = async () => {
  await connection();

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
          <a href={`/bio/${site?.organization.slug ?? "36stories-demo"}`} target="_blank">
            View live page ↗
          </a>
        }
        description="Shape the page your followers see when they tap your bio link. Changes go live when you save."
        eyebrow="Your public page"
        title="Bio page"
      />
      <BioPageEditor config={config} offers={offers} publicSlug={site?.organization.slug ?? "36stories-demo"} />
    </>
  );
};

export default BioPageEditorRoute;
