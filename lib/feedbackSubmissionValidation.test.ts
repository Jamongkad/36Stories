import { describe, expect, it } from "vitest";
import {
	initialCollectionFormConfiguration,
	type CollectionFormConfiguration,
} from "@/app/dashboard/forms/new/_lib/collectionForm";
import {
	normalizeFeedbackSubmissionInput,
	validateFeedbackSubmission,
} from "./feedbackSubmissionValidation";

const emailRequiredConfiguration: CollectionFormConfiguration = {
	...initialCollectionFormConfiguration,
	fields: {
		...initialCollectionFormConfiguration.fields,
		email: { show: true, required: true },
	},
};

const validInput = {
	rating: 5,
	message: "Helpful feedback",
	fullName: "Jamie Rivera",
	email: "jamie@example.com",
	socialPlatform: "INSTAGRAM",
	socialHandle: "@jamie",
	publicationConsent: true,
};

describe("feedback submission validation", () => {
	it("normalizes untrusted input into the submission shape", () => {
		expect(
			normalizeFeedbackSubmissionInput({
				rating: "4",
				message: "  A story  ",
				email: "  jamie@example.com ",
				socialPlatform: "TIKTOK",
				socialHandle: " @jamie ",
				publicationConsent: true,
			}),
		).toEqual({
			rating: 4,
			message: "A story",
			fullName: "",
			email: "jamie@example.com",
			socialPlatform: "TIKTOK",
			socialHandle: "@jamie",
			publicationConsent: true,
		});
	});

	it("keeps all field rules in a pure validation result", () => {
		const result = validateFeedbackSubmission(validInput, emailRequiredConfiguration);

		expect(result.fieldErrors).toEqual({});
		expect(result.accepted).toEqual({
			fullName: "Jamie Rivera",
			email: "jamie@example.com",
			socialHandle: "@jamie",
			socialPlatform: "INSTAGRAM",
		});
	});

	it("rejects malformed email addresses independently of browser validation", () => {
		const result = validateFeedbackSubmission(
			{ ...validInput, email: "jamie@example" },
			emailRequiredConfiguration,
		);

		expect(result.fieldErrors.email).toBe("Enter a valid email address.");
	});

	it("reports required fields when the raw request is missing", () => {
		const result = validateFeedbackSubmission(null, emailRequiredConfiguration);

		expect(result.fieldErrors).toEqual({
			rating: "Choose a rating from 1 to 5.",
		message: "Tell us about your experience.",
		email: "Email is required.",
	});
	});
});
