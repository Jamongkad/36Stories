import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

const authHandler = toNextJsHandler(auth);

const disabledPaths = new Set([
  "/sign-up/email",
  "/sign-in/email",
  "/request-password-reset",
  "/reset-password",
  "/change-password",
  "/is-username-available",
]);

async function handle(request: Request) {
  const path = new URL(request.url).pathname.replace(/^\/api\/auth/, "");
  if (disabledPaths.has(path)) {
    return Response.json({ message: "This authentication method is not available." }, { status: 404 });
  }

  const method = request.method as keyof typeof authHandler;
  const handler = authHandler[method];
  return handler ? handler(request) : new Response(null, { status: 405 });
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
