import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "./LoginForm";

const replaceMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
}));

async function submitLogin() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/^Username/), "creator");
  await user.type(screen.getByLabelText(/^Password/), "test-password-123");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
}

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ["/dashboard/analytics?period=7d#signals", "/dashboard/analytics?period=7d#signals"],
    ["/\\example.org", "/dashboard"],
  ])("navigates safely after successful login with %s", async (returnTo, expected) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    render(<LoginForm returnTo={returnTo} />);
    await submitLogin();
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith(expected));
    expect(refreshMock).toHaveBeenCalledOnce();
  });

  it("does not navigate after a failed login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    render(<LoginForm returnTo="/dashboard/offers" />);
    await submitLogin();
    expect(await screen.findByRole("alert")).toHaveTextContent("The username or password is incorrect.");
    expect(replaceMock).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
