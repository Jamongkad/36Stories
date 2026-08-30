import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { DisplayPageActionState } from "@/lib/displayPage";
import TestimonialPageEditor from "./TestimonialPageEditor";

const initialConfig = {
  version: 1 as const,
  displayName: "Maya Creator",
  bio: "Creator tips.",
  selectedCollectionWidgetId: null,
  links: [
    { id: "youtube", label: "YouTube", url: "https://youtube.com/maya" },
  ],
};

const renderEditor = () => {
  const saveAction = vi.fn(
    async (): Promise<DisplayPageActionState> => ({ status: "idle", message: "" }),
  );

  render(
    <TestimonialPageEditor
      collectionForms={[
        { id: "collection-1", name: "Follower stories", headline: "Share your story" },
      ]}
      initialConfig={initialConfig}
      publicPath="/testimonials/36stories-demo"
      saveAction={saveAction}
      testimonials={[]}
    />,
  );

  return { saveAction };
};

describe("TestimonialPageEditor", () => {
  it("updates the live creator preview", async () => {
    const user = userEvent.setup();
    renderEditor();

    const displayName = screen.getByRole("textbox", { name: "Display name" });
    await user.clear(displayName);
    await user.type(displayName, "Maya Reviews");

    expect(screen.getByRole("heading", { name: "Maya Reviews" })).toBeInTheDocument();
  });

  it("adds, removes, and reorders creator links", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Add link" }));
    await user.type(screen.getByRole("textbox", { name: "Link 2 label" }), "Amazon");
    await user.type(
      screen.getByRole("textbox", { name: "Link 2 URL" }),
      "https://amazon.com/shop/maya",
    );
    await user.click(screen.getAllByRole("button", { name: "Move up" })[1]);

    expect(screen.getByRole("textbox", { name: "Link 1 label" })).toHaveValue("Amazon");
    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);
    expect(screen.queryByDisplayValue("Amazon")).not.toBeInTheDocument();
  });

  it("uses the selected collection form headline in the preview", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByLabelText("Collection form"));
    await user.click(screen.getByRole("option", { name: "Follower stories" }));

    expect(screen.getByRole("button", { name: "Share your story" })).toBeDisabled();
  });
});
