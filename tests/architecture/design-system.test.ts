import { readFile, readdir } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

interface VisualViolation {
  kind: string;
  value: string;
}

const legacyVisualDebt: Record<string, number> = {
  "src/app/layouts/AdminShell.vue": 0,
  "src/modules/accounts/views/MembershipsView.vue": 21,
  "src/modules/audit/views/AuditEventsView.vue": 19,
  "src/modules/authorization/components/RoleDetailsPanel.vue": 0,
  "src/modules/authorization/components/RoleDirectoryPanel.vue": 0,
  "src/modules/authorization/views/RoleAdministrationView.vue": 0,
  "src/modules/discoverability/components/ContentAuditPanel.vue": 17,
  "src/modules/discoverability/views/DiscoverabilityView.vue": 25,
  "src/modules/discoverability/views/RedirectsView.vue": 25,
  "src/modules/identity/components/login-form.css": 21,
  "src/modules/identity/components/MfaChallengeForm.vue": 8,
  "src/modules/identity/views/LoginView.vue": 9,
  "src/modules/identity/views/MfaChallengeView.vue": 3,
  "src/modules/identity/views/ProfileView.vue": 17,
  "src/modules/identity/views/UsersView.vue": 26,
  "src/modules/localization/components/CatalogEntryEditor.vue": 9,
  "src/modules/localization/views/CatalogEditorView.vue": 0,
  "src/modules/localization/views/LocalesView.vue": 18,
  "src/modules/media/components/MediaDetails.vue": 12,
  "src/modules/media/components/MediaUploader.vue": 11,
  "src/modules/media/views/MediaLibraryView.vue": 17,
  "src/modules/navigation/components/MenuTreeEditor.vue": 7,
  "src/modules/navigation/views/MenuEditorView.vue": 25,
  "src/modules/navigation/views/MenuListView.vue": 14,
  "src/modules/notifications/views/NotificationsView.vue": 13,
  "src/modules/operations/views/FoundationStatusView.vue": 4,
  "src/modules/operations/views/JobsView.vue": 13,
  "src/modules/operations/views/ModulesView.vue": 18,
  "src/modules/operations/views/UIComponentsView.vue": 0,
  "src/modules/publishing/components/BlockEditor.vue": 13,
  "src/modules/publishing/components/ContentForm.vue": 10,
  "src/modules/publishing/components/ContentIdentityFields.vue": 5,
  "src/modules/publishing/components/ContentMetadataFields.vue": 7,
  "src/modules/publishing/components/PreviewLink.vue": 3,
  "src/modules/publishing/components/RevisionDiff.vue": 6,
  "src/modules/publishing/components/ScheduleForm.vue": 6,
  "src/modules/publishing/components/WorkflowActions.vue": 5,
  "src/modules/publishing/views/ContentEditor.vue": 18,
  "src/modules/publishing/views/ContentList.vue": 18,
  "src/modules/publishing/views/ReviewQueue.vue": 18,
  "src/modules/publishing/views/RevisionHistory.vue": 20,
  "src/modules/publishing/views/ScheduleView.vue": 20,
  "src/modules/settings/views/SettingsView.vue": 14,
  "src/shared/components/feedback/ErrorState.vue": 0,
  "src/shared/components/feedback/LoadingState.vue": 0,
  "src/shared/components/shell/Header.vue": 0,
  "src/shared/components/shell/LocaleSwitcher.vue": 0,
  "src/shared/components/shell/Sidebar.vue": 0,
  "src/shared/components/ui/UiBadge.vue": 0,
  "src/shared/components/ui/UiButton.vue": 0,
  "src/shared/components/ui/UiCard.vue": 0,
  "src/shared/components/ui/UiCheckbox.vue": 0,
  "src/shared/components/ui/UiEmptyState.vue": 0,
  "src/shared/components/ui/UiField.vue": 0,
  "src/shared/components/ui/UiInput.vue": 0,
  "src/shared/components/ui/UiRadio.vue": 0,
  "src/shared/components/ui/UiSelect.vue": 0,
  "src/shared/components/ui/UiTextarea.vue": 0,
  "src/styles/main.css": 0,
};

const legacySizeLimits: Record<string, number> = {
  "src/modules/discoverability/views/RedirectsView.vue": 279,
  "src/modules/identity/views/ProfileView.vue": 276,
  "src/modules/discoverability/views/DiscoverabilityView.vue": 261,
  "src/modules/identity/views/UsersView.vue": 230,
  "src/modules/operations/views/JobsView.vue": 223,
  "src/modules/navigation/views/MenuEditorView.vue": 221,
  "src/modules/publishing/views/ScheduleView.vue": 210,
  "src/modules/notifications/views/NotificationsView.vue": 201,
  "src/app/router/core-routes.ts": 268,
  "src/modules/authorization/api/roles.client.ts": 278,
  "src/modules/publishing/api/content.client.ts": 298,
  "src/modules/publishing/schemas/content.schema.ts": 237,
};

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "generated") files.push(...await sourceFiles(path));
    } else if ([".css", ".ts", ".vue"].includes(extname(entry.name))) {
      files.push(path);
    }
  }
  return files;
}

export function collectVisualViolations(source: string): VisualViolation[] {
  const violations: VisualViolation[] = [];
  const collect = (kind: string, pattern: RegExp) => {
    for (const match of source.matchAll(pattern)) {
      violations.push({ kind, value: match[0] });
    }
  };

  collect("hex", /#[\da-f]{3,8}\b/gi);
  collect("rgb", /rgba?\(/gi);
  collect("hsl", /hsla?\(/gi);
  collect(
    "tailwind-arbitrary-visual",
    /(?:bg|text|border|shadow|rounded)-\[[^\]]+\]/g,
  );
  for (const match of source.matchAll(/\bbox-shadow\s*:\s*([^;}{]+)/gi)) {
    const value = match[1]?.trim() ?? "";
    if (value !== "none" && !value.startsWith("var(")) {
      violations.push({ kind: "box-shadow", value });
    }
  }
  for (const match of source.matchAll(/\bborder-radius\s*:\s*([^;}{]+)/gi)) {
    const value = match[1]?.trim() ?? "";
    if (!value.startsWith("var(")) {
      violations.push({ kind: "border-radius", value });
    }
  }
  for (const match of source.matchAll(
    /(?:^|[;{]\s*)(?:color|background(?:-color)?|border(?:-[\w-]+)?-color)\s*:\s*(white|black)\b/gim,
  )) {
    violations.push({ kind: "named-color", value: match[1] ?? "" });
  }
  return violations;
}

describe("admin design-system boundary", () => {
  it("defines the complete semantic token contract", async () => {
    const source = await readFile(resolve("src/styles/tokens.css"), "utf8");
    const requiredTokens = [
      "--color-canvas",
      "--color-surface",
      "--color-surface-subtle",
      "--color-text",
      "--color-text-muted",
      "--color-border",
      "--color-action",
      "--color-action-hover",
      "--color-focus",
      "--color-success",
      "--color-warning",
      "--color-danger",
      "--font-sans",
      "--space-1",
      "--space-6",
      "--radius-sm",
      "--radius-md",
      "--radius-lg",
      "--radius-pill",
      "--shadow-surface",
      "--motion-fast",
      "--content-wide",
    ];

    for (const token of requiredTokens) {
      expect(source, token).toContain(`${token}:`);
    }
    expect(source).toContain("@media (prefers-color-scheme: dark)");
  });

  it("keeps global styling in ordered token and base layers", async () => {
    const main = await readFile(resolve("src/styles/main.css"), "utf8");
    const base = await readFile(resolve("src/styles/base.css"), "utf8");

    expect(main.trim()).toBe(
      '@import "tailwindcss";\n@import "./tokens.css";\n@import "./base.css";',
    );
    expect(base).toContain("font-family: var(--font-sans)");
    expect(base).toContain(":focus-visible");
    expect(base).toContain("@media (prefers-reduced-motion: reduce)");
    expect(collectVisualViolations(base)).toEqual([]);
  });

  it("detects inline, scoped-style, and utility escape hatches", () => {
    const source = `
      <div style="color: #fff" :style="{ background: 'rgb(0 0 0)' }" class="rounded-[13px]" />
      <style>.card { box-shadow: 0 1px 2px #0003; border-radius: 9px; }</style>
    `;

    expect(collectVisualViolations(source).map(({ kind }) => kind)).toEqual(
      expect.arrayContaining([
        "hex",
        "rgb",
        "tailwind-arbitrary-visual",
        "box-shadow",
        "border-radius",
      ]),
    );
  });

  it("does not allow visual debt to grow outside tokens", async () => {
    const root = resolve("src");
    const files = await sourceFiles(root);
    const growth: string[] = [];

    for (const file of files) {
      const relativeFile = relative(process.cwd(), file).replaceAll("\\", "/");
      if (relativeFile === "src/styles/tokens.css") continue;
      const source = await readFile(file, "utf8");
      const actual = collectVisualViolations(source).length;
      const allowed = legacyVisualDebt[relativeFile] ?? 0;
      if (actual > allowed) growth.push(`${relativeFile}: ${actual} > ${allowed}`);
    }

    expect(growth).toEqual([]);
  });

  it("keeps handwritten sources below their explicit size ceilings", async () => {
    const root = resolve("src");
    const files = await sourceFiles(root);
    const oversized: string[] = [];

    for (const file of files) {
      if (![".ts", ".vue"].includes(extname(file))) continue;
      const relativeFile = relative(process.cwd(), file).replaceAll("\\", "/");
      const source = await readFile(file, "utf8");
      const lines = source.trimEnd().split(/\r?\n/).length;
      const limit = legacySizeLimits[relativeFile] ?? 200;
      if (lines > limit) oversized.push(`${relativeFile}: ${lines} > ${limit}`);
    }

    expect(oversized).toEqual([]);
  });
});
