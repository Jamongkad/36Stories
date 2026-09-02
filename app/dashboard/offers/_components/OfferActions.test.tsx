import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteOffer, setOfferPublished } from "../actions";

import OfferActions from "./OfferActions";

vi.mock("../actions", () => ({
  deleteOffer: vi.fn(),
  setOfferPublished: vi.fn(),
}));

const deleteOfferMock = vi.mocked(deleteOffer);
const setOfferPublishedMock = vi.mocked(setOfferPublished);

describe("OfferActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes an offer from a click handler", async () => {
    const user = userEvent.setup();
    setOfferPublishedMock.mockResolvedValue();

    render(<OfferActions isPublished={false} offerId="offer-1" offerTitle="Tiny drone" />);

    await user.click(screen.getByRole("button", { name: "Publish" }));

    await waitFor(() => {
      expect(setOfferPublishedMock).toHaveBeenCalledWith("offer-1", true);
    });
  });

  it("requires confirmation before deleting through a click handler", async () => {
    const user = userEvent.setup();
    deleteOfferMock.mockResolvedValue();

    render(<OfferActions isPublished offerId="offer-1" offerTitle="Tiny drone" />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("heading", { name: "Delete “Tiny drone”?" })).toBeInTheDocument();
    expect(screen.getByText(/feedback will be preserved/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete offer" }));

    await waitFor(() => {
      expect(deleteOfferMock).toHaveBeenCalledWith("offer-1");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
