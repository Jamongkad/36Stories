import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { prisma } from "./prisma";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const configuredSecret = process.env.BETTER_AUTH_SECRET;
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
if (process.env.NODE_ENV === "production" && !configuredSecret && !isBuildPhase) {
  throw new Error("BETTER_AUTH_SECRET must be configured in production.");
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql", transaction: true }),
  baseURL,
  basePath: "/api/auth",
  secret: configuredSecret || "development-only-change-this-secret",
  trustedOrigins: [baseURL],
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    autoSignIn: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/username": { window: 60 * 15, max: 10 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
      immutableUsername: true,
      displayUsername: false,
      usernameNormalization: (value) => value.trim().toLowerCase(),
      usernameValidator: (value) => /^[a-z0-9_]+$/.test(value),
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
