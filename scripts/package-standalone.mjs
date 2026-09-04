import { cp, mkdir } from "node:fs/promises";
import { join } from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = join(projectRoot, ".next", "standalone");

await mkdir(join(standaloneRoot, ".next"), { recursive: true });
await cp(join(projectRoot, "public"), join(standaloneRoot, "public"), {
  recursive: true,
  force: true,
});
await cp(
  join(projectRoot, ".next", "static"),
  join(standaloneRoot, ".next", "static"),
  { recursive: true, force: true },
);

console.log("Packaged public and static assets with the standalone server.");
