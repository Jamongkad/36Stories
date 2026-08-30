import { revalidatePath } from "next/cache";
import { FeedbackPermission, WidgetType } from "@/generated/prisma/client";
import {
	parseCollectionFormConfiguration,
	type FeedbackSubmissionResult,
} from "@/app/dashboard/forms/new/_lib/collectionForm";
import { validateFeedbackSubmission } from "@/lib/feedbackSubmissionValidation";
import { prisma } from "@/lib/prisma";

export type FeedbackSubmissionServiceResult = FeedbackSubmissionResult & {
  code?: "not_found" | "invalid" | "server";
};

export async function saveFeedbackSubmission(
  publicKey: string,
  rawInput: unknown,
): Promise<FeedbackSubmissionServiceResult> {
	let widget;

  try {
    widget = await prisma.widget.findFirst({
      where: { publicKey, type: WidgetType.COLLECTION, isActive: true },
      select: {
        siteId: true,
        config: true,
        site: { select: { organization: { select: { slug: true } } } },
      },
    });
  } catch {
    return {
      status: "error",
      code: "server",
      message: "We couldn't send your feedback. Please try again.",
    };
  }

  if (!widget) {
    return {
      status: "error",
      code: "not_found",
      message: "This feedback form is no longer available.",
    };
  }

	const config = parseCollectionFormConfiguration(widget.config);
  if (!config) {
    return {
      status: "error",
      code: "invalid",
      message: "This feedback form is not configured correctly.",
    };
  }

	const { input, accepted, fieldErrors } = validateFeedbackSubmission(rawInput, config);

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      code: "invalid",
      message: "Check the highlighted fields and try again.",
      fieldErrors,
    };
  }

  try {
    await prisma.$transaction(async (transaction) => {
			const hasContactDetails = Boolean(
				accepted.fullName || accepted.email || accepted.socialHandle,
			);
      let contactId: string | undefined;

      if (hasContactDetails) {
        const contact = await transaction.contact.create({
          data: {
            siteId: widget.siteId,
				fullName: accepted.fullName || null,
				email: accepted.email || null,
				socialHandle: accepted.socialHandle || null,
				socialPlatform: accepted.socialHandle ? accepted.socialPlatform : null,
          },
          select: { id: true },
        });
        contactId = contact.id;
      }

      await transaction.feedback.create({
        data: {
          siteId: widget.siteId,
          contactId,
          message: input.message,
          rating: input.rating,
          permission: input.publicationConsent
            ? FeedbackPermission.PUBLIC
            : FeedbackPermission.PRIVATE,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/inbox");
    revalidatePath(`/testimonials/${widget.site.organization.slug}`);
    return { status: "success", message: config.successMessage };
  } catch {
    return {
      status: "error",
      code: "server",
      message: "We couldn't send your feedback. Please try again.",
    };
  }
}
