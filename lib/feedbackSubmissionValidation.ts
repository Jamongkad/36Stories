import { SocialPlatform } from "@/generated/prisma/client";
import {
	type CollectionFormConfiguration,
	type FeedbackSubmissionInput,
	type FeedbackSubmissionResult,
} from "@/app/dashboard/forms/new/_lib/collectionForm";

const validSocialPlatforms = new Set<SocialPlatform>([
	SocialPlatform.INSTAGRAM,
	SocialPlatform.TIKTOK,
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyInput: FeedbackSubmissionInput = {
	rating: null,
	message: "",
	fullName: "",
	email: "",
	socialPlatform: "INSTAGRAM",
	socialHandle: "",
	publicationConsent: false,
};

export type AcceptedFeedbackDetails = {
	fullName: string;
	email: string;
	socialHandle: string;
	socialPlatform: SocialPlatform | null;
};

export type FeedbackSubmissionValidation = {
	input: FeedbackSubmissionInput;
	accepted: AcceptedFeedbackDetails;
	fieldErrors: NonNullable<FeedbackSubmissionResult["fieldErrors"]>;
};

export const normalizeFeedbackSubmissionInput = (
	value: unknown,
): FeedbackSubmissionInput => {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return emptyInput;
	}

	const input = value as Record<string, unknown>;
	const socialPlatform =
		input.socialPlatform === "TIKTOK" || input.socialPlatform === "INSTAGRAM"
			? input.socialPlatform
			: null;

	return {
		rating:
			typeof input.rating === "number"
				? input.rating
				: typeof input.rating === "string" && input.rating.trim()
					? Number(input.rating)
					: null,
		message: typeof input.message === "string" ? input.message.trim() : "",
		fullName: typeof input.fullName === "string" ? input.fullName.trim() : "",
		email: typeof input.email === "string" ? input.email.trim() : "",
		socialPlatform,
		socialHandle:
			typeof input.socialHandle === "string" ? input.socialHandle.trim() : "",
		publicationConsent: input.publicationConsent === true,
	};
};

export const validateFeedbackSubmission = (
	rawInput: unknown,
	config: CollectionFormConfiguration,
): FeedbackSubmissionValidation => {
	const input = normalizeFeedbackSubmissionInput(rawInput);
	const accepted = {
		fullName: config.fields.fullName.show ? input.fullName : "",
		email: config.fields.email.show ? input.email : "",
		socialHandle: config.fields.socialProfile.show ? input.socialHandle : "",
		socialPlatform: input.socialPlatform as SocialPlatform | null,
	};
	const fieldErrors: NonNullable<FeedbackSubmissionResult["fieldErrors"]> = {};

	if (
		!Number.isInteger(input.rating) ||
		input.rating === null ||
		input.rating < 1 ||
		input.rating > 5
	) {
		fieldErrors.rating = "Choose a rating from 1 to 5.";
	}

	if (!input.message) {
		fieldErrors.message = "Tell us about your experience.";
	} else if (input.message.length > 2000) {
		fieldErrors.message = "Keep your story under 2,000 characters.";
	}

	if (config.fields.fullName.required && !accepted.fullName) {
		fieldErrors.fullName = "Full name is required.";
	} else if (accepted.fullName.length > 100) {
		fieldErrors.fullName = "Keep your name under 100 characters.";
	}

	if (config.fields.email.required && !accepted.email) {
		fieldErrors.email = "Email is required.";
	} else if (
		accepted.email &&
		(accepted.email.length > 254 || !emailPattern.test(accepted.email))
	) {
		fieldErrors.email = "Enter a valid email address.";
	}

	if (config.fields.socialProfile.required && !accepted.socialHandle) {
		fieldErrors.socialHandle = "Social handle is required.";
	} else if (accepted.socialHandle.length > 50) {
		fieldErrors.socialHandle = "Keep your handle under 50 characters.";
	}

	if (
		accepted.socialHandle &&
		(!accepted.socialPlatform || !validSocialPlatforms.has(accepted.socialPlatform))
	) {
		fieldErrors.socialPlatform = "Choose Instagram or TikTok.";
	}

	return { input, accepted, fieldErrors };
};
