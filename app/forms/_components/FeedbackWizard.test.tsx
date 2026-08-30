import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CollectionFormConfiguration } from "@/app/dashboard/forms/new/_lib/collectionForm";
import FeedbackWizard from "./FeedbackWizard";

const configuration: CollectionFormConfiguration = {
  version: 2,
  headline: "Leave me a review",
  instructions: "Tell us about your experience.",
  successMessage: "Thanks for sharing!",
  fields: {
    fullName: { show: true, required: false },
    email: { show: false, required: false },
    socialProfile: { show: true, required: false },
  },
};

const renderWizard = () => {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => {
    void _input;
    void _init;
    return new Response(JSON.stringify({ status: "success", message: "Thanks for sharing!" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  });
  vi.stubGlobal("fetch", fetchMock);

  render(
    <FeedbackWizard
      configuration={configuration}
      creatorName="Maya Creator"
      creatorPath="/testimonials/maya"
      publicKey="collection-maya"
    />,
  );

  return { fetchMock };
};

describe("FeedbackWizard", () => {
  it("highlights the selected star and all stars before it", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(screen.getByRole("button", { name: "3 out of 5 stars" }));

    expect(screen.getByRole("button", { name: "1 out of 5 stars" })).toHaveAttribute(
      "data-highlighted",
      "true",
    );
    expect(screen.getByRole("button", { name: "2 out of 5 stars" })).toHaveAttribute(
      "data-highlighted",
      "true",
    );
    expect(screen.getByRole("button", { name: "3 out of 5 stars" })).toHaveAttribute(
      "data-highlighted",
      "true",
    );
    expect(screen.getByRole("button", { name: "4 out of 5 stars" })).toHaveAttribute(
      "data-highlighted",
      "false",
    );
    expect(screen.getByRole("button", { name: "5 out of 5 stars" })).toHaveAttribute(
      "data-highlighted",
      "false",
    );
  });

  it("moves through rating, story, details, and success screens", async () => {
    const user = userEvent.setup();
    const { fetchMock } = renderWizard();

    expect(screen.getByRole("heading", { name: "Rate your experience" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "5 out of 5 stars" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "Tell us about your experience" })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Your story" }), "It helped me a lot.");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("heading", { name: "Add your details" })).toBeInTheDocument();

    await user.type(screen.getByRole("textbox", { name: "Full name" }), "Jamie Rivera");
    await user.type(screen.getByRole("textbox", { name: "Social handle" }), "@jamie");
    await user.click(screen.getByRole("button", { name: "Send feedback" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
      expect(screen.getByRole("heading", { name: "Thanks for sharing!" })).toBeInTheDocument();
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/forms/collection-maya/submissions");
    expect(request.method).toBe("POST");
    expect(request.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(String(request.body))).toMatchObject({
      rating: 5,
      message: "It helped me a lot.",
      fullName: "Jamie Rivera",
      socialHandle: "@jamie",
    });
  });

  it("keeps entered story text when navigating back", async () => {
    const user = userEvent.setup();
    renderWizard();

    await user.click(screen.getByRole("button", { name: "5 out of 5 stars" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    const story = screen.getByRole("textbox", { name: "Your story" });
    await user.type(story, "A useful experience.");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByRole("textbox", { name: "Your story" })).toHaveValue("A useful experience.");
  });

  it("does not render a submittable form before the details step", async () => {
    const user = userEvent.setup();
    const { fetchMock } = renderWizard();

    await user.click(screen.getByRole("button", { name: "5 out of 5 stars" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    const story = screen.getByRole("textbox", { name: "Your story" });
    await user.type(story, "A useful experience.");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(story.closest("form")).toBeNull();
    expect(screen.getByRole("heading", { name: "Tell us about your experience" })).toBeInTheDocument();
  });
});
