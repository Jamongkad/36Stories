import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TestimonialPageView from "./TestimonialPageView";

const config = {
  version: 1 as const,
  displayName: "Maya Creator",
  bio: "Honest product reviews and creator tips.",
  selectedCollectionWidgetId: "collection-1",
  links: [
    { id: "youtube", label: "YouTube", url: "https://youtube.com/maya" },
    { id: "amazon", label: "Amazon", url: "https://amazon.com/shop/maya" },
  ],
};

const testimonials = [
  {
    id: "feedback-1",
    title: "Helpful reviews",
    message: "Your recommendations saved me so much time.",
    rating: 5,
    attribution: "Jamie Rivera",
  },
];

describe("TestimonialPageView", () => {
  it("renders creator links and attributed testimonials", () => {
    render(<TestimonialPageView config={config} testimonials={testimonials} />);

    expect(screen.getByRole("heading", { name: "Maya Creator" })).toBeInTheDocument();
    expect(screen.getByText(config.bio)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /YouTube/ })).toHaveAttribute(
      "href",
      "https://youtube.com/maya",
    );
    expect(screen.getByRole("link", { name: /YouTube/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(screen.getByText(/Your recommendations/)).toBeInTheDocument();
    expect(screen.getByText(/Jamie Rivera/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Leave a review" })).not.toBeInTheDocument();
  });

  it("shows the selected CTA label only in preview mode", () => {
    render(
      <TestimonialPageView
        config={config}
        ctaLabel="Share your story"
        preview
        showReviewCta
        testimonials={[]}
      />,
    );

    expect(screen.getByRole("button", { name: "Share your story" })).toBeDisabled();
    expect(screen.getByText("Stories are coming soon.")).toBeInTheDocument();
  });
});
