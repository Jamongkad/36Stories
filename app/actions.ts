"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createFeedback(formData: FormData): Promise<void> {
  const message = String(formData.get("message") ?? "").trim();

  if (!message) {
    throw new Error("Message is required.");
  }

  const site = await prisma.site.findFirst({
    where: {
      domain: "localhost",
      organization: { slug: "36stories-demo" },
    },
    select: { id: true },
  });

  if (!site) {
    throw new Error("Demo site not found. Run `npm run db:seed`.");
  }

  await prisma.feedback.create({
    data: { siteId: site.id, message },
  });

  revalidatePath("/");
  revalidatePath("/dashboard");
}
