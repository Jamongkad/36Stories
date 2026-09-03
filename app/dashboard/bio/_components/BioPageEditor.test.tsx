import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { PublicOffer } from "@/lib/offers/types";
import BioPageEditor from "./BioPageEditor";

vi.mock("../actions", () => ({
  saveDisplayPage: vi.fn(),
}));

const config = {
  version: 2 as const,
  displayName: "Maya Creator",
  bio: "Product reviews",
  links: [{ id: "youtube", label: "YouTube", url: "https://youtube.com/maya" }],
  selectedCollectionWidgetId: "collection-1",
  theme: "sophisticated" as const,
  backgroundColor: "sand" as const,
  buttonColor: "forest" as const,
};

const offers: PublicOffer[] = [];

describe("BioPageEditor", () => {
  it("switches themes and colors in the live preview", async () => {
    const user = userEvent.setup();
    render(<BioPageEditor config={config} offers={offers} publicSlug="maya" />);

    expect(screen.getByText("Live preview")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Modern/ }));
    await user.click(screen.getByRole("button", { name: "Ink background color" }));
    await user.click(screen.getByRole("button", { name: "Violet button color" }));

    expect(screen.getByRole("button", { name: /^Modern/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Ink background color" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Violet button color" })).toHaveAttribute("aria-pressed", "true");
  });

  it("adds and removes links without leaving the page", async () => {
    const user = userEvent.setup();
    render(<BioPageEditor config={config} offers={offers} publicSlug="maya" />);

    await user.click(screen.getByRole("button", { name: "Add link" }));
    expect(screen.getByDisplayValue("YouTube")).toBeInTheDocument();
    expect(screen.getAllByLabelText("Link label")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Remove link 2" }));
    expect(screen.getAllByLabelText("Link label")).toHaveLength(1);
  });
});
