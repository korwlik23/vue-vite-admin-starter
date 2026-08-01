import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("C2.1 admin server contract", () => {
  it("serves the SPA and keeps runtime config uncached", () => {
    const config = readFileSync(
      resolve(process.cwd(), "docker/server.conf"),
      "utf8",
    );

    expect(config).toContain("listen 8080");
    expect(config).toContain("try_files $uri $uri/ /index.html");
    expect(config).toMatch(/location = \/config\.js[\s\S]*no-store/);
    expect(config).toContain("alias /tmp/runtime-config/config.js");
    expect(config).toContain("X-Content-Type-Options");
    expect(config).toContain("Content-Security-Policy");
  });
});
