import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("C2.2 admin runtime config entrypoint", () => {
  it("fails closed before envsubst when public config is unsafe", () => {
    const script = readFileSync(
      resolve(process.cwd(), "docker/19-validate-runtime-config.sh"),
      "utf8",
    );

    expect(script).toContain("PUBLIC_API_BASE_URL");
    expect(script).toContain("grep -Eq");
    expect(script).toContain("exit 1");
    expect(script).not.toContain("eval ");
  });

  it("writes generated public config only to the runtime tmpfs", () => {
    const dockerfile = readFileSync(resolve(process.cwd(), "Dockerfile"), "utf8");
    expect(dockerfile).toContain(
      "NGINX_ENVSUBST_OUTPUT_DIR=/tmp/runtime-config",
    );
    expect(dockerfile).not.toContain(
      "NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html",
    );
  });
});
