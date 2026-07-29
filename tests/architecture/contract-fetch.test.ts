import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { fetchContract } from "../../scripts/contracts/fetch-openapi.mjs";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("immutable OpenAPI acquisition", () => {
  it("copies only the checksum-verified artifact from the locked API commit", async () => {
    const directory = await temporaryDirectory();
    const outputPath = join(directory, "admin.openapi.yaml");

    await fetchContract({
      lockPath: resolve("contracts/admin.openapi.lock.json"),
      localRoot: resolve("../api"),
      outputPath,
    });

    expect(await readFile(outputPath, "utf8")).toBe(
      await readFile(resolve("../api/openapi/dist/admin.openapi.yaml"), "utf8"),
    );
  });

  it("rejects checksum mismatch and traversal paths", async () => {
    const directory = await temporaryDirectory();
    const source = JSON.parse(
      await readFile(resolve("contracts/admin.openapi.lock.json"), "utf8"),
    ) as Record<string, unknown>;

    const checksumLock = join(directory, "checksum.json");
    await writeFile(
      checksumLock,
      JSON.stringify({ ...source, sha256: "0".repeat(64) }),
    );
    await expect(
      fetchContract({
        lockPath: checksumLock,
        localRoot: resolve("../api"),
        outputPath: join(directory, "checksum.yaml"),
      }),
    ).rejects.toThrow("checksum");

    const traversalLock = join(directory, "traversal.json");
    await writeFile(
      traversalLock,
      JSON.stringify({ ...source, artifactPath: "../secret" }),
    );
    await expect(
      fetchContract({
        lockPath: traversalLock,
        localRoot: resolve("../api"),
        outputPath: join(directory, "traversal.yaml"),
      }),
    ).rejects.toThrow("artifact path");
  });
});

async function temporaryDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "admin-contract-"));
  temporaryDirectories.push(directory);
  return directory;
}
