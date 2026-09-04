import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";
    const scriptSource = isProduction ? "'self' 'unsafe-inline'" : "'self' 'unsafe-inline' 'unsafe-eval'";

    return [
      {
        source: "/(.*)",
        headers: [
          ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src ${scriptSource}; connect-src 'self'` },
        ],
      },
    ];
  },
};

export default nextConfig;
