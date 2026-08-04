import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

async function vueFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await vueFiles(path));
    } else if (entry.isFile() && entry.name.endsWith(".vue")) {
      files.push(path);
    }
  }
  return files;
}

describe("shared UI primitive adoption", () => {
  it("keeps module pages on shared controls except native file inputs", async () => {
    const root = resolve("src/modules");
    const files = await vueFiles(root);
    const violations: string[] = [];

    for (const file of files) {
      const source = await readFile(file, "utf8");
      const controls = [...source.matchAll(/<(button|input|select|textarea)\b/g)].map((match) => match[1]);
      if (controls.length === 0) continue;
      const relativeFile = relative(process.cwd(), file).replaceAll("\\", "/");
      const isFileInputOnly = relativeFile === "src/modules/media/components/MediaUploader.vue"
        && controls.every((control) => control === "input")
        && source.includes('type="file"');
      if (!isFileInputOnly) {
        violations.push(relativeFile + ": " + controls.join(", "));
      }
    }

    expect(violations).toEqual([]);
  });
});
