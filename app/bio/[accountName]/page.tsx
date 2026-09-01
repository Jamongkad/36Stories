import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import BioPageView from "@/app/_components/BioPageView";
import { WidgetType } from "@/generated/prisma/client";
import { parseDisplayPageConfiguration } from "@/lib/displayPage";
import type { PublicOffer } from "@/lib/offers/types";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Bio | 36Stories",
  description: "Creator links, products, and services on 36Stories.",
};

const PublicBioPage = async ({
  params,
}: PageProps<"/bio/[accountName]">) => {
  await connection();
  const { accountName } = await params;

  const site = await prisma.site.findFirst({
    where: { organization: { slug: accountName } },
    orderBy: { createdAt: "asc" },
    select: {
      organization: { select: { name: true } },
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
  if (!site || !displayWidget) {
    notFound();
  }

  const config = parseDisplayPageConfiguration(
    displayWidget.config,
    site.organization.name,
  );
  const offers: PublicOffer[] = site.offers.map((offer) => ({
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
    <BioPageView
      config={config}
      offers={offers}
    />
  );
};

export default PublicBioPage;
