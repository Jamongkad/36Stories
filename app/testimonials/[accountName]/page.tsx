import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import TestimonialPageView from "@/app/_components/TestimonialPageView";
import { WidgetType } from "@/generated/prisma/client";
import { getCollectionHeadline, parseDisplayPageConfiguration } from "@/lib/displayPage";
import { formatContactAttribution } from "@/lib/contact";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Testimonials | 36Stories",
  description: "Creator links and published stories on 36Stories.",
};

const PublicTestimonialPage = async ({
  params,
}: PageProps<"/testimonials/[accountName]">) => {
  await connection();
  const { accountName } = await params;

  const site = await prisma.site.findFirst({
    where: { organization: { slug: accountName } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      organization: { select: { name: true } },
      widgets: {
        where: { type: WidgetType.DISPLAY, isActive: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { config: true },
      },
      feedback: {
        where: { isPublished: true, permission: "PUBLIC" },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
          id: true,
          title: true,
          message: true,
          rating: true,
          contact: {
            select: {
              fullName: true,
              firstName: true,
              lastName: true,
              socialHandle: true,
              socialPlatform: true,
            },
          },
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
  const reviewWidget = config.selectedCollectionWidgetId
    ? await prisma.widget.findFirst({
        where: {
          id: config.selectedCollectionWidgetId,
          siteId: site.id,
          type: WidgetType.COLLECTION,
          isActive: true,
        },
        select: { publicKey: true, config: true },
      })
    : null;
  const testimonials = site.feedback.map((feedback) => {
    return {
      id: feedback.id,
      title: feedback.title,
      message: feedback.message,
      rating: feedback.rating,
      attribution: formatContactAttribution(feedback.contact),
    };
  });

  return (
    <TestimonialPageView
      config={config}
      ctaLabel={getCollectionHeadline(reviewWidget?.config) ?? "Leave me a review"}
      reviewHref={reviewWidget ? `/forms/${reviewWidget.publicKey}` : undefined}
      showReviewCta={Boolean(reviewWidget)}
      testimonials={testimonials}
    />
  );
};

export default PublicTestimonialPage;
