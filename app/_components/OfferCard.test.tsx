import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicOffer } from "@/lib/offers/types";
import OfferCard from "./OfferCard";

const baseOffer: PublicOffer = {
  id: "offer-1",
  kind: "PRODUCT",
  mode: "LIVE",
  title: "Creator lighting kit",
  description: "A compact kit for better phone videos.",
  imageUrl: null,
  priceLabel: "$50",
  launchAt: null,
  destinationUrl: "https://example.com/lighting-kit",
  ctaType: "OUTBOUND",
  ctaLabel: "Shop now",
  isAffiliate: false,
  disclosureText: null,
};

describe("OfferCard", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("records interest for an idea-stage offer", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OfferCard
        offer={{
          ...baseOffer,
          mode: "IDEA",
          destinationUrl: null,
          ctaType: "INTEREST",
          ctaLabel: "I’m interested",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: "I’m interested" }));

    expect(await screen.findByRole("button", { name: "Interest recorded" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/offers/offer-1/events",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("submits an email to a coming-soon waitlist", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <OfferCard
        offer={{
          ...baseOffer,
          mode: "COMING_SOON",
          destinationUrl: null,
          ctaType: "WAITLIST",
          ctaLabel: "Join early access",
        }}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Email for early access" }),
      "creator@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Join early access" }));

    expect(await screen.findByRole("button", { name: "You’re on the list" })).toBeDisabled();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/offers/offer-1/signups",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("creator@example.com"),
        }),
      );
    });
  });

  it("simulates preview interactions without recording analytics or signups", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    const { rerender } = render(
      <OfferCard
        offer={{
          ...baseOffer,
          mode: "IDEA",
          destinationUrl: null,
          ctaType: "INTEREST",
          ctaLabel: "I’m interested",
        }}
        trackingEnabled={false}
      />,
    );

    await user.click(screen.getByRole("button", { name: "I’m interested" }));
    expect(screen.getByRole("button", { name: "Interest recorded" })).toBeDisabled();

    rerender(
      <OfferCard
        offer={{
          ...baseOffer,
          mode: "COMING_SOON",
          destinationUrl: null,
          ctaType: "WAITLIST",
          ctaLabel: "Join early access",
        }}
        trackingEnabled={false}
      />,
    );

    await user.type(
      screen.getByRole("textbox", { name: "Email for early access" }),
      "creator@example.com",
    );
    await user.click(screen.getByRole("button", { name: "Join early access" }));

    expect(screen.getByRole("button", { name: "You’re on the list" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
