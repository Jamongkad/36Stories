import { createHmac, randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "./prisma";

export const PUBLIC_BODY_LIMIT = 4 * 1024;

export type PublicJsonResult =
  | { ok: true; value: unknown }
  | { ok: false; response: Response };

export function validatePublicOriginRequest(request: Request): Response | null {
  return validatePublicOrigin(request)
    ? null
    : Response.json({ message: "Invalid request." }, { status: 403 });
}

export async function readPublicJson(request: Request): Promise<unknown | null> {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") return null;

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && Number(declaredLength) > PUBLIC_BODY_LIMIT) return null;
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > PUBLIC_BODY_LIMIT) return null;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export async function readPublicJsonRequest(request: Request): Promise<PublicJsonResult> {
  const value = await readPublicJson(request);
  return value === null
    ? { ok: false, response: Response.json({ message: "Invalid request." }, { status: 400 }) }
    : { ok: true, value };
}

export function validatePublicOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const requestOrigin = new URL(request.url).origin;
    const configuredOrigin = process.env.BETTER_AUTH_URL ? new URL(process.env.BETTER_AUTH_URL).origin : requestOrigin;
    return origin === requestOrigin || origin === configuredOrigin;
  } catch {
    return false;
  }
}

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (process.env.NODE_ENV === "production" && forwarded) return forwarded.split(",", 1)[0]?.trim() || "unknown";
  return forwarded?.split(",", 1)[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function addressKey(request: Request, scope: string) {
  const secret = process.env.BETTER_AUTH_SECRET || "development-only-change-this-secret";
  const address = getClientAddress(request);
  return createHmac("sha256", secret).update(`${scope}:${address}`).digest("hex");
}

type Limit = { scope: string; windowSeconds: number; max: number };

async function consume(limit: Limit, request: Request) {
  const now = Date.now();
  const windowStart = now - limit.windowSeconds * 1000;
  const key = addressKey(request, limit.scope);
  const rows = await prisma.$queryRaw<Array<{ count: number }>>(Prisma.sql`
    INSERT INTO "RateLimit" ("id", "key", "count", "lastRequest")
    VALUES (${randomUUID()}, ${key}, 1, ${BigInt(now)})
    ON CONFLICT ("key") DO UPDATE
    SET "count" = CASE WHEN "RateLimit"."lastRequest" <= ${BigInt(windowStart)} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "lastRequest" = CASE WHEN "RateLimit"."lastRequest" <= ${BigInt(windowStart)} THEN ${BigInt(now)} ELSE "RateLimit"."lastRequest" END
    RETURNING "count"
  `);
  return (rows[0]?.count ?? limit.max + 1) <= limit.max;
}

export async function enforcePublicRateLimit(request: Request, limits: Limit[]) {
  try {
    for (const limit of limits) {
      if (!(await consume(limit, request))) {
        return { ok: false as const, response: Response.json({ message: "Too many requests." }, { status: 429, headers: { "Retry-After": String(limit.windowSeconds) } }) };
      }
    }
    return { ok: true as const };
  } catch {
    return { ok: false as const, response: Response.json({ message: "Service temporarily unavailable." }, { status: 503 }) };
  }
}

export async function publicRateLimitResponse(request: Request, limits: Limit[]): Promise<Response | null> {
  const result = await enforcePublicRateLimit(request, limits);
  return result.ok ? null : result.response;
}

export const eventRateLimits = (offerId: string): Limit[] => [
  { scope: "public-event:global", windowSeconds: 60, max: 120 },
  { scope: `public-event:offer:${offerId}`, windowSeconds: 60, max: 30 },
];

export const signupRateLimits = (offerId: string): Limit[] => [
  { scope: "public-signup:global", windowSeconds: 60 * 60, max: 10 },
  { scope: `public-signup:offer:${offerId}`, windowSeconds: 60 * 60, max: 3 },
];
