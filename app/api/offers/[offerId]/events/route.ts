import { revalidatePath } from "next/cache";
import {
  getCtaTypeForPublicEvent,
  offerViewEvent,
} from "@/lib/offers/policy";
import { parsePublicOfferEventInput } from "@/lib/offerTrackingInput";
import { prisma } from "@/lib/prisma";
import { eventRateLimits, publicRateLimitResponse, readPublicJsonRequest, validatePublicOriginRequest } from "@/lib/publicSecurity";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const originResponse = validatePublicOriginRequest(request);
  if (originResponse) return originResponse;
  const { offerId } = await params;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(offerId)) return Response.json({ message: "Offer not found." }, { status: 404 });
  const rateLimitResponse = await publicRateLimitResponse(request, eventRateLimits(offerId));
  if (rateLimitResponse) return rateLimitResponse;
  const json = await readPublicJsonRequest(request);
  if (!json.ok) return json.response;

  const input = parsePublicOfferEventInput(json.value);
  if (!input) {
    return Response.json({ message: "Invalid event." }, { status: 400 });
  }

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

  try {
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
    return Response.json({ recorded: true }, { status: 201 });
  } catch (error: unknown) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "P2002")) throw error;
    return Response.json({ recorded: true }, { status: 200 });
  }
}
