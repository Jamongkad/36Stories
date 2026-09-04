const errors = [];

function requireValue(name) {
  const value = process.env[name]?.trim();
  if (!value) errors.push(`${name} is required.`);
  return value;
}

const databaseUrl = requireValue("DATABASE_URL");
if (databaseUrl) {
  try {
    const protocol = new URL(databaseUrl).protocol;
    if (protocol !== "postgres:" && protocol !== "postgresql:") {
      errors.push("DATABASE_URL must be a PostgreSQL connection string.");
    }
  } catch {
    errors.push("DATABASE_URL must be a valid URL.");
  }
}

const authUrl = requireValue("BETTER_AUTH_URL");
if (authUrl) {
  try {
    const parsed = new URL(authUrl);
    if (parsed.protocol !== "https:") {
      errors.push("BETTER_AUTH_URL must use HTTPS for a production deployment.");
    }
    if (parsed.origin !== authUrl.replace(/\/$/, "")) {
      errors.push("BETTER_AUTH_URL must be an origin without a path, query, or fragment.");
    }
  } catch {
    errors.push("BETTER_AUTH_URL must be a valid URL.");
  }
}

const authSecret = requireValue("BETTER_AUTH_SECRET");
if (authSecret && authSecret.length < 32) {
  errors.push("BETTER_AUTH_SECRET must contain at least 32 characters.");
}

const actionsKey = requireValue("NEXT_SERVER_ACTIONS_ENCRYPTION_KEY");
if (actionsKey) {
  const decodedLength = Buffer.from(actionsKey, "base64").byteLength;
  if (![16, 24, 32].includes(decodedLength)) {
    errors.push(
      "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY must be base64-encoded AES key material (16, 24, or 32 bytes).",
    );
  }
}

if (errors.length > 0) {
  console.error("Deployment configuration is invalid:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Deployment environment looks valid.");
