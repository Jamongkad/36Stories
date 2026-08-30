import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  FeedbackPermission,
  FeedbackStatus,
  PrismaClient,
  WidgetType,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "36stories-demo" },
    update: { name: "36Stories Demo" },
    create: {
      name: "36Stories Demo",
      slug: "36stories-demo",
    },
  });

  const existingSite = await prisma.site.findFirst({
    where: {
      organizationId: organization.id,
      domain: "localhost",
    },
  });

  const site = existingSite
    ? await prisma.site.update({
      where: { id: existingSite.id },
      data: { name: "Demo Site" },
    })
    : await prisma.site.create({
        data: {
          organizationId: organization.id,
          name: "Demo Site",
          domain: "localhost",
        },
      });

  const feedback = [
    {
      id: "cseedfeedback0000000000001",
      siteId: site.id,
      title: "Approachable tutorials",
      message: "Your tutorials make complicated topics feel approachable.",
      rating: 5,
      status: FeedbackStatus.NEW,
      permission: FeedbackPermission.PRIVATE,
      isPublished: false,
      isFeatured: false,
      createdAt: new Date("2026-08-26T16:00:00.000Z"),
    },
    {
      id: "cseedfeedback0000000000002",
      siteId: site.id,
      title: "Posting consistently",
      message: "I started posting consistently because of your advice.",
      rating: 5,
      status: FeedbackStatus.NEW,
      permission: FeedbackPermission.PUBLIC,
      isPublished: false,
      isFeatured: false,
      createdAt: new Date("2026-08-25T18:30:00.000Z"),
    },
    {
      id: "cseedfeedback0000000000003",
      siteId: site.id,
      title: "Better videos",
      message: "The lighting guide completely changed how I film my videos.",
      rating: 4,
      status: FeedbackStatus.IN_PROGRESS,
      permission: FeedbackPermission.PUBLIC,
      isPublished: false,
      isFeatured: false,
      createdAt: new Date("2026-08-24T20:15:00.000Z"),
    },
    {
      id: "cseedfeedback0000000000004",
      siteId: site.id,
      title: "Honest reviews",
      message: "Your honest product reviews save me so much time.",
      rating: 5,
      status: FeedbackStatus.CLOSED,
      permission: FeedbackPermission.PUBLIC,
      isPublished: true,
      isFeatured: false,
      createdAt: new Date("2026-08-23T17:45:00.000Z"),
    },
    {
      id: "cseedfeedback0000000000005",
      siteId: site.id,
      title: "Favorite weekly posts",
      message: "The weekly behind-the-scenes posts are my favorite.",
      rating: 5,
      status: FeedbackStatus.CLOSED,
      permission: FeedbackPermission.PUBLIC,
      isPublished: true,
      isFeatured: true,
      createdAt: new Date("2026-08-22T19:00:00.000Z"),
    },
  ];

  await prisma.$transaction(
    feedback.map(({ id, ...data }) =>
      prisma.feedback.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      }),
    ),
  );

  const collectionWidget = await prisma.widget.upsert({
    where: { publicKey: "collection_36stories_demo" },
    update: {
      siteId: site.id,
      type: WidgetType.COLLECTION,
      name: "Follower stories",
      isActive: true,
      config: {
        version: 2,
        headline: "Leave me a review",
        instructions: "Tell us about your experience.",
        successMessage: "Thanks for sharing your story!",
        fields: {
          fullName: { show: true, required: false },
          email: { show: false, required: false },
          socialProfile: { show: true, required: false },
        },
      },
    },
    create: {
      siteId: site.id,
      type: WidgetType.COLLECTION,
      name: "Follower stories",
      publicKey: "collection_36stories_demo",
      config: {
        version: 2,
        headline: "Leave me a review",
        instructions: "Tell us about your experience.",
        successMessage: "Thanks for sharing your story!",
        fields: {
          fullName: { show: true, required: false },
          email: { show: false, required: false },
          socialProfile: { show: true, required: false },
        },
      },
    },
  });

  const displayConfig = {
    version: 1,
    displayName: "36Stories Demo",
    bio: "Creator stories, recommendations, and honest feedback in one place.",
    links: [
      {
        id: "demo-youtube",
        label: "Watch on YouTube",
        url: "https://www.youtube.com/",
      },
      {
        id: "demo-amazon",
        label: "My Amazon favorites",
        url: "https://www.amazon.com/",
      },
    ],
    selectedCollectionWidgetId: collectionWidget.id,
  };
  const existingDisplayWidget = await prisma.widget.findFirst({
    where: { siteId: site.id, type: WidgetType.DISPLAY },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (existingDisplayWidget) {
    await prisma.widget.update({
      where: { id: existingDisplayWidget.id },
      data: {
        name: "Testimonial Page",
        config: displayConfig,
        isActive: true,
      },
    });
  } else {
    await prisma.widget.create({
      data: {
        siteId: site.id,
        type: WidgetType.DISPLAY,
        name: "Testimonial Page",
        publicKey: "display_36stories_demo",
        config: displayConfig,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
