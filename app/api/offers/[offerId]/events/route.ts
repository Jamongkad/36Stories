import { revalidatePath } from "next/cache";
import {
  getCtaTypeForPublicEvent,
  offerViewEvent,
} from "@/lib/offers/policy";
import { parsePublicOfferEventInput } from "@/lib/offerTrackingInput";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  let rawInput: unknown;

  try {
    rawInput = await request.json();
  } catch {
    return Response.json({ message: "Invalid request." }, { status: 400 });
  }

  const input = parsePublicOfferEventInput(rawInput);
  if (!input) {
    return Response.json({ message: "Invalid event." }, { status: 400 });
  }

  const { offerId } = await params;
  const offer = await prisma.offer.findFirst({
    where: { id: offerId, isPublished: true },
    select: { ctaType: true },
  });

  if (!offer) {
    return Response.json({ message: "Offer not found." }, { status: 404 });
  }

  const compatibleCtaType = getCtaTypeForPublicEvent(input.type);
  if (input.type !== offerViewEvent && offer.ctaType !== compatibleCtaType) {
    return Response.json({ message: "Event does not match this offer." }, { status: 400 });
  }

  const existingEvent = await prisma.offerEvent.findFirst({
    where: {
      offerId,
      type: input.type,
      sessionId: input.sessionId,
    },
    select: { id: true },
  });

  if (!existingEvent) {
    await prisma.offerEvent.create({
      data: {
        offerId,
        type: input.type,
        sessionId: input.sessionId,
        source: input.source,
        referrer: input.referrer,
      },
    });
    revalidatePath("/dashboard/analytics");
  }

  return Response.json({ recorded: true }, { status: existingEvent ? 200 : 201 });
}
