import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";

export type CreatorContext = {
  userId: string;
  organizationId: string;
  organizationSlug: string;
  siteId: string;
  name: string;
  username: string;
};

const getCreatorContextUncached = async (): Promise<CreatorContext | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      organizationId: true,
      organization: {
        select: {
          slug: true,
          sites: { orderBy: { createdAt: "asc" }, take: 1, select: { id: true } },
        },
      },
    },
  });

  const site = user?.organization.sites[0];
  if (!user || !site) return null;

  return {
    userId: user.id,
    organizationId: user.organizationId,
    organizationSlug: user.organization.slug,
    siteId: site.id,
    name: user.name,
    username: user.username,
  };
}

export const getCreatorContext = cache(getCreatorContextUncached);

export async function requireCreatorContext(): Promise<CreatorContext> {
  const context = await getCreatorContext();
  if (!context) throw new Error("UNAUTHORIZED");
  return context;
}
