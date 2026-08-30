import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CollectionFormActionState } from "../_lib/collectionForm";

import CollectionFormEditor from "./CollectionFormEditor";

const { routerPush } = vi.hoisted(() => ({
  routerPush: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

describe("CollectionFormEditor", () => {
  beforeEach(() => {
    routerPush.mockClear();
  });

  const renderEditor = (
    createCollectionAction = vi.fn(
      async (): Promise<CollectionFormActionState> => ({
        status: "idle",
        message: "",
      }),
    ),
  ) => {

    render(
      <CollectionFormEditor
        createCollectionAction={createCollectionAction}
      />,
    );

    return { createCollectionAction };
  };

  it("renders the collection form messaging fields", () => {
    renderEditor();

    expect(
      screen.getByRole("heading", { name: "Collection Form Editor" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Internal form name" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Headline" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Instructions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Success message" }),
    ).toBeInTheDocument();
  });

  it.each(["Internal form name", "Headline"])(
    "keeps the %s label above the input",
    (name) => {
      renderEditor();

      const input = screen.getByRole("textbox", { name });
      const label = input.closest(".MuiFormControl-root")?.querySelector("label");

      expect(label).toHaveAttribute("data-shrink", "true");
    },
  );

  it("uses the recommended submitter field defaults", () => {
    renderEditor();

    expect(
      screen.getByRole("checkbox", { name: "Show Full name" }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Show Email" }),
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Show Social profile" }),
    ).toBeChecked();
  });

  it("clears and disables required when a field is hidden", async () => {
    const user = userEvent.setup();
    renderEditor();

    const showFullName = screen.getByRole("checkbox", {
      name: "Show Full name",
    });
    const requireFullName = screen.getByRole("checkbox", {
      name: "Require Full name",
    });

    await user.click(requireFullName);
    expect(requireFullName).toBeChecked();

    await user.click(showFullName);
    expect(requireFullName).not.toBeChecked();
    expect(requireFullName).toBeDisabled();
  });

  it("navigates to the forms list after a successful action", async () => {
    const user = userEvent.setup();
    const createCollectionAction = vi.fn(
      async (): Promise<CollectionFormActionState> => ({
        status: "success",
        message: "Form created successfully!",
        widgetId: "widget-1",
      }),
    );
    renderEditor(createCollectionAction);

    await user.type(
      screen.getByRole("textbox", { name: "Internal form name" }),
      "Creator stories",
    );
    await user.click(screen.getByRole("button", { name: "Create form" }));

    await waitFor(() => {
      expect(routerPush).toHaveBeenCalledWith("/dashboard/forms");
    });
  });
});
