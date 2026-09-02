import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOffer } from "../actions";
import { initialOfferFormActionState } from "@/lib/offerForm";

import OfferEditor from "./OfferEditor";

vi.mock("../actions", () => ({
  createOffer: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const createOfferMock = vi.mocked(createOffer);

describe("OfferEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createOfferMock.mockResolvedValue(initialOfferFormActionState);
  });

  it("renders the live offer fields with the correct labels", () => {
    render(<OfferEditor />);

    expect(screen.getByRole("heading", { name: "What are you testing?" })).toBeInTheDocument();
    expect(screen.getByLabelText("Offer type")).toBeInTheDocument();
    expect(screen.getByLabelText("Availability")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Offer title" })).toBeRequired();
    expect(screen.getByRole("textbox", { name: "Short description" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Price or expected range" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Image URL" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Destination URL" })).toBeRequired();
    expect(screen.getByLabelText("Destination type")).toBeInTheDocument();
    expect(screen.getByLabelText("This is an affiliate link")).toBeInTheDocument();
    expect(screen.queryByLabelText("Expected launch date")).not.toBeInTheDocument();
  });

  it("shows launch fields for coming-soon offers and hides live-only fields", async () => {
    const user = userEvent.setup();
    render(<OfferEditor />);

    await user.click(screen.getByRole("combobox", { name: "Availability" }));
    await user.click(screen.getByRole("option", { name: "Coming soon" }));

    expect(screen.getByLabelText("Expected launch date")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Destination URL" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Destination type")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("This is an affiliate link")).not.toBeInTheDocument();
    expect(screen.getByText("Collect emails before you launch or commit inventory.")).toBeInTheDocument();
  });

  it("reveals affiliate disclosure only when the affiliate option is checked", async () => {
    const user = userEvent.setup();
    render(<OfferEditor />);

    const affiliateCheckbox = screen.getByLabelText("This is an affiliate link");

    expect(screen.queryByRole("textbox", { name: "Affiliate disclosure" })).not.toBeInTheDocument();

    await user.click(affiliateCheckbox);

    expect(screen.getByRole("textbox", { name: "Affiliate disclosure" })).toBeInTheDocument();

    await user.click(affiliateCheckbox);

    await waitFor(() => {
      expect(screen.queryByRole("textbox", { name: "Affiliate disclosure" })).not.toBeInTheDocument();
    });
  });
});
