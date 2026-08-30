import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeedbackList, {
	formatRelativeDate,
	type FeedbackListItem,
} from "./FeedbackList";

const now = new Date("2026-08-29T12:00:00.000Z");

const createFeedback = (
	overrides: Partial<FeedbackListItem> = {},
): FeedbackListItem => ({
	id: "cm0feedback0001",
	message: "This widget works!",
	rating: 4,
	permission: "PRIVATE",
	isPublished: false,
	createdAt: "2026-08-29T09:00:00.000Z",
	contact: {
		fullName: "Jamie Rivera",
		firstName: null,
		lastName: null,
		email: "jamie@example.com",
	},
	...overrides,
});

describe("formatRelativeDate", () => {
	it("formats calendar-day distances deterministically", () => {
		expect(formatRelativeDate("2026-08-29T12:00:00.000Z", now)).toBe("Today");
		expect(formatRelativeDate("2026-08-28T23:00:00.000Z", now)).toBe("Yesterday");
		expect(formatRelativeDate("2026-08-27T12:00:00.000Z", now)).toBe("2 days ago");
		expect(formatRelativeDate("2026-08-24T12:00:00.000Z", now)).toBe("5 days ago");
	});
});

describe("FeedbackList", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(now);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("renders sender, email, message, rating, and relative date in a card", () => {
		render(<FeedbackList items={[createFeedback()]} />);

		const card = screen.getByRole("article");
		expect(within(card).getByRole("heading", { name: "Jamie Rivera" })).toBeInTheDocument();
		expect(within(card).getByText("jamie@example.com")).toBeInTheDocument();
		expect(within(card).getByText("This widget works!")).toBeInTheDocument();
		expect(within(card).getByText("Today")).toBeInTheDocument();
		expect(within(card).getByRole("img", { name: "4 out of 5 stars" })).toBeInTheDocument();

		const stars = within(card).getAllByTestId("feedback-star");
		expect(stars).toHaveLength(5);
		expect(stars.map((star) => star.getAttribute("data-filled"))).toEqual([
			"true",
			"true",
			"true",
			"true",
			"false",
		]);
	});

	it("uses anonymous and missing-email fallbacks", () => {
		render(
			<FeedbackList
				items={[
					createFeedback({
						contact: {
							fullName: null,
							firstName: null,
							lastName: null,
							email: null,
						},
					}),
				]}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Anonymous sender" })).toBeInTheDocument();
		expect(screen.getByText("No email provided")).toBeInTheDocument();
	});

	it("renders muted stars and a no-rating label when rating is null", () => {
		render(<FeedbackList items={[createFeedback({ rating: null })]} />);

		expect(screen.getByRole("img", { name: "No rating" })).toBeInTheDocument();
		expect(screen.getByText("No rating")).toBeInTheDocument();
		expect(
			screen
				.getAllByTestId("feedback-star")
				.every((star) => star.getAttribute("data-filled") === "false"),
		).toBe(true);
	});

	it("falls back to legacy first and last names", () => {
		render(
			<FeedbackList
				items={[
					createFeedback({
						contact: {
							fullName: null,
							firstName: "Taylor",
							lastName: "Morgan",
							email: "taylor@example.com",
						},
					}),
				]}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Taylor Morgan" })).toBeInTheDocument();
	});
});
