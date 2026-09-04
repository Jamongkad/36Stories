import { revalidatePath } from "next/cache";
import {
  offerCtaPolicy,
  signupOfferCtaTypes,
} from "@/lib/offers/policy";
import { parseOfferSignupInput } from "@/lib/offerTrackingInput";
import { prisma } from "@/lib/prisma";
import { publicRateLimitResponse, readPublicJsonRequest, signupRateLimits, validatePublicOriginRequest } from "@/lib/publicSecurity";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ offerId: string }> },
) {
  const originResponse = validatePublicOriginRequest(request);
  if (originResponse) return originResponse;
  const { offerId } = await params;
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(offerId)) return Response.json({ message: "Waitlist offer not found." }, { status: 404 });
  const rateLimitResponse = await publicRateLimitResponse(request, signupRateLimits(offerId));
  if (rateLimitResponse) return rateLimitResponse;
  const json = await readPublicJsonRequest(request);
  if (!json.ok) return json.response;

  const input = parseOfferSignupInput(json.value);
  if (!input) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  const offer = await prisma.offer.findFirst({
    where: {
      id: offerId,
      isPublished: true,
      ctaType: { in: signupOfferCtaTypes },
    },
    select: { id: true, ctaType: true },
  });

  if (!offer) {
    return Response.json({ message: "Waitlist offer not found." }, { status: 404 });
  }

  if (input.honeypot) {
    return Response.json({ joined: true }, { status: 202 });
  }

  const intentEvent = offerCtaPolicy[offer.ctaType].intentEvent;
  await prisma.$transaction([
    prisma.offerSignup.upsert({
      where: { offerId_email: { offerId, email: input.email } },
      update: {},
      create: {
        offerId,
        email: input.email,
        consentAt: new Date(),
        source: input.source,
      },
    }),
    prisma.offerEvent.upsert({
      where: {
        offerId_type_sessionId: {
          offerId,
          type: intentEvent,
          sessionId: input.sessionId,
        },
      },
      update: {},
      create: {
        offerId,
        type: intentEvent,
        sessionId: input.sessionId,
        source: input.source,
        referrer: input.referrer,
      },
    }),
  ]);
  revalidatePath("/dashboard/analytics");
  return Response.json({ joined: true }, { status: 202 });
}
