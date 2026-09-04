import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LogoutButton from "./LogoutButton";

const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("sends a JSON sign-out request before navigating to login", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<LogoutButton />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/sign-out", {
        body: "{}",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      expect(replaceMock).toHaveBeenCalledWith("/login");
      expect(refreshMock).toHaveBeenCalledOnce();
    });
  });
});
