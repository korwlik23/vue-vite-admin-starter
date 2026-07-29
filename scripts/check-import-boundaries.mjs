import { readdir, readFile, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import process from "node:process";

const targets = process.argv.slice(2);
const roots = targets.length > 0 ? targets : [resolve("src")];
const files = (
  await Promise.all(roots.map((target) => collectFiles(resolve(target))))
).flat();
const violations = [];

for (const file of files) {
  if (!/\.(?:ts|tsx|vue)$/.test(file)) {
    continue;
  }
  const contents = await readFile(file, "utf8");
  if (!/from\s+["'][^"']*generated\/api[^"']*["']/.test(contents)) {
    continue;
  }
  const normalized = file.split(sep).join("/");
  const allowed =
    /\/src\/modules\/[^/]+\/(?:api|mutations|queries)\//.test(normalized) ||
    /\/src\/shared\/api\//.test(normalized) ||
    /\/tests\/fixtures\/imports\/valid-adapter\.ts$/.test(normalized);
  if (!allowed) {
    violations.push(normalized);
  }
}

if (violations.length > 0) {
  throw new Error(
    `Direct generated API imports are forbidden outside adapters:\n${violations.join("\n")}`,
  );
}

async function collectFiles(target) {
  const information = await stat(target);
  if (information.isFile()) {
    return [target];
  }
  if (!information.isDirectory()) {
    return [];
  }
  const entries = await readdir(target, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => entry.name !== "generated")
      .map((entry) => collectFiles(resolve(target, entry.name))),
  );
  return nested.flat();
}
