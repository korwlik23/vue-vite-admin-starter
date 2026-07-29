import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execute = promisify(execFile);
const input = resolve(".contracts/admin.openapi.yaml");
const schemaOutput = resolve("src/generated/api/schema.ts");
const metadataOutput = resolve("src/generated/api/contract.meta.json");
const lockPath = resolve("contracts/admin.openapi.lock.json");

await mkdir(dirname(schemaOutput), { recursive: true });
await execute(
  process.execPath,
  [
    resolve("node_modules/openapi-typescript/bin/cli.js"),
    input,
    "--output",
    schemaOutput,
    "--alphabetize",
  ],
  { windowsHide: true },
);

const lock = JSON.parse(await readFile(lockPath, "utf8"));
await writeFile(
  metadataOutput,
  `${JSON.stringify(
    {
      repository: lock.repository,
      commit: lock.commit,
      artifactPath: lock.artifactPath,
      sha256: lock.sha256,
    },
    null,
    2,
  )}\n`,
);
