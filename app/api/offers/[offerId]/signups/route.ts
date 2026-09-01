import { revalidatePath } from "next/cache";
import {
  offerCtaPolicy,
  signupOfferCtaTypes,
} from "@/lib/offers/policy";
import { parseOfferSignupInput } from "@/lib/offerTrackingInput";
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

  const input = parseOfferSignupInput(rawInput);
  if (!input) {
    return Response.json({ message: "Enter a valid email address." }, { status: 400 });
  }

  const { offerId } = await params;
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

  const existingSignup = await prisma.offerSignup.findUnique({
    where: { offerId_email: { offerId, email: input.email } },
    select: { id: true },
  });

  if (!existingSignup) {
    const intentEvent = offerCtaPolicy[offer.ctaType].intentEvent;
    await prisma.$transaction([
      prisma.offerSignup.create({
        data: {
          offerId,
          email: input.email,
          consentAt: new Date(),
          source: input.source,
        },
      }),
      prisma.offerEvent.create({
        data: {
          offerId,
          type: intentEvent,
          sessionId: input.sessionId,
          source: input.source,
          referrer: input.referrer,
        },
      }),
    ]);
    revalidatePath("/dashboard/analytics");
  }

  return Response.json(
    { joined: true, alreadyJoined: Boolean(existingSignup) },
    { status: existingSignup ? 200 : 201 },
  );
}
