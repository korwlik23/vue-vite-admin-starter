import { execFile } from "node:child_process";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execute = promisify(execFile);
const checker = resolve("scripts/check-import-boundaries.mjs");

describe("U15", () => {
  it("allows module API adapters to import generated contracts", async () => {
    await expect(
      execute(process.execPath, [
        checker,
        resolve("tests/fixtures/imports/valid-adapter.ts"),
      ]),
    ).resolves.toBeDefined();
  });

  it("rejects generated contract imports from views and components", async () => {
    await expect(
      execute(process.execPath, [
        checker,
        resolve("tests/fixtures/imports/invalid-view.vue"),
      ]),
    ).rejects.toThrow("generated API imports");
  });
});
