import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BioPageView from "./BioPageView";

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

const offers = [
  {
    id: "offer-1",
    kind: "PRODUCT" as const,
    mode: "LIVE" as const,
    title: "Creator lighting kit",
    description: "A compact kit for better phone videos.",
    imageUrl: null,
    priceLabel: "$50",
    launchAt: null,
    destinationUrl: "https://example.com/lighting-kit",
    ctaType: "OUTBOUND" as const,
    ctaLabel: "Shop now",
    isAffiliate: false,
    disclosureText: null,
  },
];

describe("BioPageView", () => {
  it("renders creator links and the offers section", () => {
    render(<BioPageView config={config} offers={[]} />);

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
    expect(screen.getByRole("heading", { name: "My socials" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Products & services" })).toBeInTheDocument();
    expect(screen.getByText("Offers are coming soon.")).toBeInTheDocument();
    expect(screen.queryByText("What people are saying")).not.toBeInTheDocument();
  });

  it("renders the offers empty state in preview mode", () => {
    render(
      <BioPageView
        config={config}
        offers={[]}
        preview
      />,
    );

    expect(screen.getByText("Offers are coming soon.")).toBeInTheDocument();
    expect(screen.queryByText("What people are saying")).not.toBeInTheDocument();
  });

  it("renders product cards and hides testimonial content for the bio layout", () => {
    render(
      <BioPageView
        config={config}
        offers={offers}
      />,
    );

    expect(screen.getByRole("heading", { name: "Products & services" })).toBeInTheDocument();
    expect(screen.getByText("Creator lighting kit")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop now" })).toHaveAttribute(
      "href",
      "https://example.com/lighting-kit",
    );
    expect(screen.queryByText("What people are saying")).not.toBeInTheDocument();
  });
});
