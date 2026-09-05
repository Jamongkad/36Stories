export function safeReturnTo(value: string | null | undefined, origin: string): string {
  const fallback = "/dashboard";
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, origin);
    // Normalization can also produce a protocol-relative pathname (e.g. /a/..//host).
    // Reject it before passing the relative destination back to the router.
    if (url.origin !== origin || url.pathname.startsWith("//")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
