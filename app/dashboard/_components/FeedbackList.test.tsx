import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FeedbackList from "./FeedbackList";

describe("FeedbackList", () => {
  it("renders Feedback messages", () => {
		render(
			<FeedbackList items={[
				{
					id: "cm0feedback0001",
					siteId: "cm0site0001",
					contactId: null,
					categoryId: null,
					title: "Great experience",
					message: "This widget works!",
					rating: 5,
					status: "NEW",
					permission: "PRIVATE",
					isPublished: false,
					isFeatured: false,
					createdAt: "2026-08-24T12:00:00.000Z",
					updatedAt: "2026-08-24T12:00:00.000Z",
				}
			]}/>,
		);

		expect(
			screen.getByText("This widget works!")
		).toBeInTheDocument();
	})
});
