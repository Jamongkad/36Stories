import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Client generation does not need a live database. Commands that do need
    // one are guarded by deploy:check and produce their own missing-URL error.
    url: process.env.DATABASE_URL ?? "",
  },
});
