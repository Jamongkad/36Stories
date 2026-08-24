"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createFeedback(formData: FormData): Promise<void> {
  const source = String(formData.get("source") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!source || !message) {
    throw new Error("Source and message are required.");
  }

  await prisma.feedback.create({
    data: { source, message },
  });

  revalidatePath("/");
}
