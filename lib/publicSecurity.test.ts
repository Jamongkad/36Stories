import { describe, expect, it, vi } from "vitest";

vi.mock("./prisma", () => ({ prisma: {} }));

import {
  PUBLIC_BODY_LIMIT,
  readPublicJsonRequest,
  readPublicJson,
  validatePublicOrigin,
  validatePublicOriginRequest,
} from "./publicSecurity";

describe("public endpoint security", () => {
  it("accepts bounded JSON and rejects unsupported content types", async () => {
    const valid = new Request("https://creator.example/api/offers/one/events", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ sessionId: "session-1" }),
    });
    const unsupported = new Request(
      "https://creator.example/api/offers/one/events",
      {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: "{}",
      },
    );

    await expect(readPublicJson(valid)).resolves.toEqual({
      sessionId: "session-1",
    });
    await expect(readPublicJson(unsupported)).resolves.toBeNull();
  });

  it("rejects declared and streamed bodies above the limit", async () => {
    const declared = new Request(
      "https://creator.example/api/offers/one/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": String(PUBLIC_BODY_LIMIT + 1),
        },
        body: "{}",
      },
    );
    const streamed = new Request(
      "https://creator.example/api/offers/one/events",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: "x".repeat(PUBLIC_BODY_LIMIT) }),
      },
    );

    await expect(readPublicJson(declared)).resolves.toBeNull();
    await expect(readPublicJson(streamed)).resolves.toBeNull();
  });

  it("allows same-origin requests and rejects foreign browser origins", () => {
    vi.stubEnv("BETTER_AUTH_URL", "https://creator.example");
    const sameOrigin = new Request(
      "https://creator.example/api/offers/one/events",
      { headers: { Origin: "https://creator.example" } },
    );
    const foreignOrigin = new Request(
      "https://creator.example/api/offers/one/events",
      { headers: { Origin: "https://attacker.example" } },
    );

    expect(validatePublicOrigin(sameOrigin)).toBe(true);
    expect(validatePublicOrigin(foreignOrigin)).toBe(false);
    vi.unstubAllEnvs();
  });

  it("returns consistent route responses for invalid public requests", async () => {
    const foreignOrigin = new Request("https://creator.example/api/offers/one/events", {
      headers: { Origin: "https://attacker.example" },
    });
    expect(validatePublicOriginRequest(foreignOrigin)?.status).toBe(403);

    const invalidBody = new Request("https://creator.example/api/offers/one/events", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: "{}",
    });
    const result = await readPublicJsonRequest(invalidBody);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });
});
