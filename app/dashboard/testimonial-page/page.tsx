import { connection } from "next/server";
import { WidgetType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
	createDefaultDisplayPageConfiguration,
	getCollectionHeadline,
	parseDisplayPageConfiguration,
} from "@/lib/displayPage";
import { formatContactAttribution } from "@/lib/contact";
import TestimonialPageEditor from "./_components/TestimonialPageEditor";
import { saveTestimonialPage } from "./actions";

const DashboardTestimonialPage = async () => {
	await connection();

  const site = await prisma.site.findFirst({
    where: {
      domain: "localhost",
      organization: { slug: "36stories-demo" },
    },
    select: {
      id: true,
      organization: { select: { name: true, slug: true } },
      widgets: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { id: true, type: true, name: true, config: true },
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

  if (!site) {
    return <p>Demo site not found. Run `npm run db:seed`.</p>;
  }

  const displayWidget = site.widgets.find((widget) => widget.type === WidgetType.DISPLAY);
  const initialConfig = displayWidget
    ? parseDisplayPageConfiguration(displayWidget.config, site.organization.name)
    : createDefaultDisplayPageConfiguration(site.organization.name);
  const collectionForms = site.widgets
    .filter((widget) => widget.type === WidgetType.COLLECTION)
    .map((widget) => ({
      id: widget.id,
      name: widget.name,
      headline: getCollectionHeadline(widget.config),
    }));
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
    <TestimonialPageEditor
      collectionForms={collectionForms}
      initialConfig={initialConfig}
      publicPath={`/testimonials/${site.organization.slug}`}
      saveAction={saveTestimonialPage}
      testimonials={testimonials}
    />
  );
};

export default DashboardTestimonialPage;
