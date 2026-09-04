import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function ask(question: string, hidden = false) {
  const input = process.stdin;
  const output = process.stdout;
  output.write(question);
  if (!hidden || !input.isTTY) {
    const rl = createInterface({ input, output });
    const answer = await rl.question("");
    rl.close();
    return answer.trim();
  }
  return await new Promise<string>((resolve) => {
    let answer = "";
    input.setRawMode?.(true);
    input.resume();
    const onData = (chunk: Buffer) => {
      for (const char of chunk.toString()) {
        if (char === "\r" || char === "\n") {
          input.setRawMode?.(false);
          input.pause();
          input.off("data", onData);
          output.write("\n");
          resolve(answer);
        } else if (char === "\u0003") process.exit(130);
        else if (char === "\u007f") answer = answer.slice(0, -1);
        else answer += char;
      }
    };
    input.on("data", onData);
  });
}

async function main() {
  const username = await ask("Username: ");
  const password = await ask("New password: ", true);
  const confirmation = await ask("Confirm password: ", true);
  if (password.length < 12 || password.length > 128) throw new Error("Password must be 12-128 characters.");
  if (password !== confirmation) throw new Error("Passwords do not match.");

  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() }, select: { id: true } });
  if (!user) throw new Error("User not found.");
  const passwordHash = await hashPassword(password);
  await prisma.$transaction(async (transaction) => {
    const result = await transaction.account.updateMany({ where: { userId: user.id, providerId: "credential" }, data: { password: passwordHash } });
    if (result.count === 0) throw new Error("No credential account exists for this user.");
    await transaction.session.deleteMany({ where: { userId: user.id } });
  });
  console.log("Password updated and existing sessions revoked.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Password reset failed.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
