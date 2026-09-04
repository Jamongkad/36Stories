import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { createLocalAccountIssuer } from "better-auth/db";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  FeedbackPermission,
  FeedbackStatus,
  OfferCtaType,
  OfferDestinationType,
  OfferEventType,
  OfferKind,
  OfferMode,
  PrismaClient,
  SocialPlatform,
  WidgetType,
} from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type BetaUserConfig = {
  name: string;
  email: string;
  username: string;
  password: string;
};

function readBetaConfig() {
  const values = {
    owner: {
      name: process.env.BETA_OWNER_NAME,
      email: process.env.BETA_OWNER_EMAIL,
      username: process.env.BETA_OWNER_USERNAME,
      password: process.env.BETA_OWNER_PASSWORD,
    },
    wife: {
      name: process.env.BETA_WIFE_NAME,
      email: process.env.BETA_WIFE_EMAIL,
      username: process.env.BETA_WIFE_USERNAME,
      password: process.env.BETA_WIFE_PASSWORD,
    },
    wifeOrganizationName: process.env.BETA_WIFE_ORGANIZATION_NAME,
    wifeOrganizationSlug: process.env.BETA_WIFE_ORGANIZATION_SLUG,
  };
  const anyConfigured = Object.values(values.owner).some(Boolean) || Object.values(values.wife).some(Boolean) || Boolean(values.wifeOrganizationName || values.wifeOrganizationSlug);
  if (!anyConfigured) return null;
  const required = [...Object.entries(values.owner), ...Object.entries(values.wife), ["wifeOrganizationName", values.wifeOrganizationName], ["wifeOrganizationSlug", values.wifeOrganizationSlug]] as const;
  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length) throw new Error(`Incomplete beta configuration. Missing: ${missing.join(", ")}`);
  const usernamePattern = /^[a-z0-9_]{3,30}$/;
  if (!usernamePattern.test(values.owner.username!) || !usernamePattern.test(values.wife.username!)) throw new Error("Beta usernames must be 3-30 lowercase letters, numbers, or underscores.");
  if (values.owner.username === values.wife.username) throw new Error("Beta usernames must be different.");
  if (values.owner.email!.toLowerCase() === values.wife.email!.toLowerCase()) throw new Error("Beta email addresses must be different.");
  if (![values.owner.email, values.wife.email].every((email) => /^\S+@\S+\.\S+$/.test(email!))) throw new Error("Beta email addresses must be valid.");
  if ([values.owner.password, values.wife.password].some((password) => password!.length < 12 || password!.length > 128)) throw new Error("Beta passwords must be 12-128 characters.");
  if (!/^[a-z0-9-]{3,63}$/.test(values.wifeOrganizationSlug!)) throw new Error("The wife's organization slug must be lowercase letters, numbers, and hyphens.");
  if (values.wifeOrganizationSlug === "36stories-demo") throw new Error("The wife's organization slug must differ from 36stories-demo.");
  return {
    owner: values.owner as BetaUserConfig,
    wife: values.wife as BetaUserConfig,
    wifeOrganizationName: values.wifeOrganizationName!,
    wifeOrganizationSlug: values.wifeOrganizationSlug!,
  };
}

async function provisionUser(config: BetaUserConfig, organizationId: string) {
  const credentialIssuer = createLocalAccountIssuer("credential");
  const user = await prisma.user.upsert({
    where: { username: config.username.toLowerCase() },
    update: { name: config.name, email: config.email.toLowerCase(), organizationId, emailVerified: true },
    create: { name: config.name, email: config.email.toLowerCase(), username: config.username.toLowerCase(), organizationId, emailVerified: true },
  });
  const existingAccount = await prisma.account.findUnique({
    where: { issuer_accountId: { issuer: credentialIssuer, accountId: user.id } },
    select: { id: true, password: true },
  });
  if (!existingAccount) {
    await prisma.account.create({
      data: { userId: user.id, accountId: user.id, providerId: "credential", issuer: credentialIssuer, password: await hashPassword(config.password) },
    });
  } else if (!existingAccount.password) {
    await prisma.account.update({ where: { id: existingAccount.id }, data: { password: await hashPassword(config.password) } });
  }
  return user;
}

async function main() {
  const beta = readBetaConfig();
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

  const offers = [
    {
      id: "cseedoffer0000000000000001",
      siteId: site.id,
      kind: OfferKind.PRODUCT,
      mode: OfferMode.LIVE,
      title: "My Amazon favorites",
      description: "Tools and gear I regularly recommend.",
      priceLabel: null,
      destinationUrl: "https://www.amazon.com/",
      destinationType: OfferDestinationType.AFFILIATE,
      ctaType: OfferCtaType.OUTBOUND,
      ctaLabel: "Shop favorites",
      feedbackPrompt: "What did you think of this recommendation?",
      isAffiliate: true,
      disclosureText: "As an Amazon Associate I earn from qualifying purchases.",
      isPublished: true,
      isFeatured: false,
      sortOrder: 1,
    },
    {
      id: "cseedoffer0000000000000002",
      siteId: site.id,
      kind: OfferKind.SERVICE,
      mode: OfferMode.LIVE,
      title: "Creator coaching call",
      description: "A focused session to improve your next content idea.",
      priceLabel: "$75",
      destinationUrl: "https://calendly.com/",
      destinationType: OfferDestinationType.BOOKING,
      ctaType: OfferCtaType.OUTBOUND,
      ctaLabel: "Book a call",
      feedbackPrompt: "What would you want help with?",
      isAffiliate: false,
      disclosureText: null,
      isPublished: true,
      isFeatured: false,
      sortOrder: 2,
    },
    {
      id: "cseedoffer0000000000000003",
      siteId: site.id,
      kind: OfferKind.PRODUCT,
      mode: OfferMode.COMING_SOON,
      title: "Pocket lighting kit",
      description: "A compact lighting kit for better phone videos.",
      priceLabel: "$40–$60",
      launchAt: new Date("2026-09-15T16:00:00.000Z"),
      destinationUrl: null,
      destinationType: null,
      ctaType: OfferCtaType.WAITLIST,
      ctaLabel: "Join early access",
      feedbackPrompt: "What would make this lighting kit worth buying?",
      isAffiliate: false,
      disclosureText: null,
      isPublished: true,
      isFeatured: true,
      sortOrder: 0,
    },
    {
      id: "cseedoffer0000000000000004",
      siteId: site.id,
      kind: OfferKind.PRODUCT,
      mode: OfferMode.IDEA,
      title: "Tiny FPV drone",
      description: "A hand-built micro drone for indoor flying.",
      priceLabel: "$150–$200",
      destinationUrl: null,
      destinationType: null,
      ctaType: OfferCtaType.INTEREST,
      ctaLabel: "I’m interested",
      feedbackPrompt: "What would you want this drone to do?",
      isAffiliate: false,
      disclosureText: null,
      isPublished: true,
      isFeatured: false,
      sortOrder: 3,
    },
  ];

  await prisma.$transaction(
    offers.map(({ id, ...data }) =>
      prisma.offer.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      }),
    ),
  );

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
      offerId: "cseedoffer0000000000000004",
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
      offerId: "cseedoffer0000000000000003",
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

  const offerSignups = [
    {
      id: "cseedoffersignup000000000001",
      offerId: "cseedoffer0000000000000003",
      email: "early-access@example.com",
      consentAt: new Date("2026-08-27T17:00:00.000Z"),
      source: "instagram_bio",
    },
    {
      id: "cseedoffersignup000000000002",
      offerId: "cseedoffer0000000000000004",
      email: "drone-builder@example.com",
      consentAt: new Date("2026-08-27T18:30:00.000Z"),
      source: "youtube_description",
    },
    ...Array.from({ length: 4 }, (_, index) => ({
      id: `cseedoffersignupkit${String(index + 2).padStart(6, "0")}`,
      offerId: "cseedoffer0000000000000003",
      email: `lighting-fan-${index + 2}@example.com`,
      consentAt: new Date(`2026-08-${28 + index}T17:00:00.000Z`),
      source: index < 3 ? "instagram_bio" : "tiktok_bio",
    })),
  ];

  await prisma.$transaction(
    offerSignups.map(({ id, ...data }) =>
      prisma.offerSignup.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      }),
    ),
  );

  const offerEvents = [
    {
      id: "cseedevent0000000000000001",
      offerId: "cseedoffer0000000000000003",
      type: OfferEventType.VIEW,
      sessionId: "demo-session-1",
      source: "instagram_bio",
      referrer: "https://www.instagram.com/",
    },
    {
      id: "cseedevent0000000000000002",
      offerId: "cseedoffer0000000000000003",
      type: OfferEventType.INTEREST,
      sessionId: "demo-session-1",
      source: "instagram_bio",
      referrer: "https://www.instagram.com/",
    },
    {
      id: "cseedevent0000000000000003",
      offerId: "cseedoffer0000000000000001",
      type: OfferEventType.OUTBOUND_CLICK,
      sessionId: "demo-session-2",
      source: "instagram_bio",
      referrer: "https://www.instagram.com/",
    },
    ...Array.from({ length: 18 }, (_, index) => ({
      id: `cseedeventkitview${String(index + 1).padStart(6, "0")}`,
      offerId: "cseedoffer0000000000000003",
      type: OfferEventType.VIEW,
      sessionId: `demo-kit-session-${index + 1}`,
      source: index < 12 ? "instagram_bio" : "tiktok_bio",
      referrer:
        index < 12
          ? "https://www.instagram.com/"
          : "https://www.tiktok.com/",
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      id: `cseedeventkitsignup${String(index + 1).padStart(4, "0")}`,
      offerId: "cseedoffer0000000000000003",
      type: OfferEventType.WAITLIST_SIGNUP,
      sessionId: `demo-kit-session-${index + 1}`,
      source: "instagram_bio",
      referrer: "https://www.instagram.com/",
    })),
    ...Array.from({ length: 12 }, (_, index) => ({
      id: `cseedeventdroneview${String(index + 1).padStart(5, "0")}`,
      offerId: "cseedoffer0000000000000004",
      type: OfferEventType.VIEW,
      sessionId: `demo-drone-session-${index + 1}`,
      source: index < 8 ? "youtube_description" : "instagram_bio",
      referrer:
        index < 8
          ? "https://www.youtube.com/"
          : "https://www.instagram.com/",
    })),
    ...Array.from({ length: 3 }, (_, index) => ({
      id: `cseedeventdroneinterest${String(index + 1).padStart(3, "0")}`,
      offerId: "cseedoffer0000000000000004",
      type: OfferEventType.INTEREST,
      sessionId: `demo-drone-session-${index + 1}`,
      source: "youtube_description",
      referrer: "https://www.youtube.com/",
    })),
    ...Array.from({ length: 12 }, (_, index) => ({
      id: `cseedeventamazonview${String(index + 1).padStart(4, "0")}`,
      offerId: "cseedoffer0000000000000001",
      type: OfferEventType.VIEW,
      sessionId: `demo-amazon-session-${index + 1}`,
      source: "instagram_bio",
      referrer: "https://www.instagram.com/",
    })),
    ...Array.from({ length: 4 }, (_, index) => ({
      id: `cseedeventamazonclick${String(index + 1).padStart(3, "0")}`,
      offerId: "cseedoffer0000000000000001",
      type: OfferEventType.OUTBOUND_CLICK,
      sessionId: `demo-amazon-session-${index + 1}`,
      source: "instagram_bio",
      referrer: "https://www.instagram.com/",
    })),
    ...Array.from({ length: 8 }, (_, index) => ({
      id: `cseedeventcoachingview${String(index + 1).padStart(3, "0")}`,
      offerId: "cseedoffer0000000000000002",
      type: OfferEventType.VIEW,
      sessionId: `demo-coaching-session-${index + 1}`,
      source: "tiktok_bio",
      referrer: "https://www.tiktok.com/",
    })),
    ...Array.from({ length: 2 }, (_, index) => ({
      id: `cseedeventcoachingclick${String(index + 1).padStart(2, "0")}`,
      offerId: "cseedoffer0000000000000002",
      type: OfferEventType.OUTBOUND_CLICK,
      sessionId: `demo-coaching-session-${index + 1}`,
      source: "tiktok_bio",
      referrer: "https://www.tiktok.com/",
    })),
  ];

  await prisma.$transaction(
    offerEvents.map(({ id, ...data }) =>
      prisma.offerEvent.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      }),
    ),
  );

  await prisma.socialPostReference.upsert({
    where: {
      offerId_url: {
        offerId: "cseedoffer0000000000000004",
        url: "https://www.instagram.com/p/demo-drone-post/",
      },
    },
    update: {
      platform: SocialPlatform.INSTAGRAM,
      label: "Drone build teaser",
      postedAt: new Date("2026-08-26T18:00:00.000Z"),
    },
    create: {
      id: "cseedpostref000000000000001",
      offerId: "cseedoffer0000000000000004",
      platform: SocialPlatform.INSTAGRAM,
      url: "https://www.instagram.com/p/demo-drone-post/",
      label: "Drone build teaser",
      postedAt: new Date("2026-08-26T18:00:00.000Z"),
    },
  });

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
    version: 2,
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
    theme: "sophisticated",
    backgroundColor: "sand",
    buttonColor: "forest",
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

  if (beta) {
    await provisionUser(beta.owner, organization.id);

    const wifeOrganization = await prisma.organization.upsert({
      where: { slug: beta.wifeOrganizationSlug },
      update: { name: beta.wifeOrganizationName },
      create: { name: beta.wifeOrganizationName, slug: beta.wifeOrganizationSlug },
    });
    const wifeSite = await prisma.site.upsert({
      where: { id: `beta-site-${wifeOrganization.id}` },
      update: { name: `${beta.wife.name}'s 36Stories`, domain: "localhost", organizationId: wifeOrganization.id },
      create: { id: `beta-site-${wifeOrganization.id}`, name: `${beta.wife.name}'s 36Stories`, domain: "localhost", organizationId: wifeOrganization.id },
    });
    const collection = await prisma.widget.upsert({
      where: { publicKey: `collection_${beta.wifeOrganizationSlug}` },
      update: { siteId: wifeSite.id, name: "Follower stories", type: WidgetType.COLLECTION, isActive: true, config: { version: 2, headline: "Leave me a review", instructions: "Tell me about your experience.", successMessage: "Thanks for sharing your story!", fields: { fullName: { show: true, required: false }, email: { show: false, required: false }, socialProfile: { show: true, required: false } } } },
      create: { siteId: wifeSite.id, publicKey: `collection_${beta.wifeOrganizationSlug}`, name: "Follower stories", type: WidgetType.COLLECTION, config: { version: 2, headline: "Leave me a review", instructions: "Tell me about your experience.", successMessage: "Thanks for sharing your story!", fields: { fullName: { show: true, required: false }, email: { show: false, required: false }, socialProfile: { show: true, required: false } } } },
    });
    await prisma.widget.upsert({
      where: { publicKey: `display_${beta.wifeOrganizationSlug}` },
      update: { siteId: wifeSite.id, name: "Bio Page", type: WidgetType.DISPLAY, isActive: true, config: { version: 2, displayName: beta.wife.name, bio: "Stories, recommendations, and honest feedback.", links: [], selectedCollectionWidgetId: collection.id, theme: "sophisticated", backgroundColor: "sand", buttonColor: "forest" } },
      create: { siteId: wifeSite.id, publicKey: `display_${beta.wifeOrganizationSlug}`, name: "Bio Page", type: WidgetType.DISPLAY, config: { version: 2, displayName: beta.wife.name, bio: "Stories, recommendations, and honest feedback.", links: [], selectedCollectionWidgetId: collection.id, theme: "sophisticated", backgroundColor: "sand", buttonColor: "forest" } },
    });
    await provisionUser(beta.wife, wifeOrganization.id);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
