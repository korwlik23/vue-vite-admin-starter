import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { installAuthenticatedAdminAPI } from "./fixtures/admin-api";

test.beforeEach(async ({ page }) => {
  await installAuthenticatedAdminAPI(page);
});

test("renders permission-filtered shell with exact navigation and visible focus", async ({ page }) => {
  await page.goto("/ui-components", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { name: "UI Components" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Foundation" })).not.toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "UI Components" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Roles" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toHaveCount(0);

  await page.keyboard.press("Tab");
  await expect(page.locator(":focus-visible")).toBeVisible();
});

test("keeps mobile navigation operable with touch-sized controls", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ui-components", { waitUntil: "networkidle" });

  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  await expect(toggle).toBeVisible();
  const box = await toggle.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  await toggle.click();
  const link = page.getByRole("link", { name: "UI Components" });
  await expect(link).toBeVisible();
  const linkBox = await link.boundingBox();
  expect(linkBox?.height).toBeGreaterThanOrEqual(44);
});

test("captures the Admin visual approval matrix with readable contrast", async ({ page }) => {
  test.setTimeout(120_000);
  const output = resolve(process.cwd(), "..", "tmp", "ui-review", "admin");
  await mkdir(output, { recursive: true });
  const views = [
    { name: "showcase", path: "/ui-components" },
    { name: "role", path: "/authorization/roles" },
    { name: "shell", path: "/" },
  ];
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const view of views) {
        await page.goto(view.path, { waitUntil: "networkidle" });
        await expect(page.locator("body")).toBeVisible();
        expect(await contrastRatio(page, "body")).toBeGreaterThanOrEqual(4.5);
        await page.screenshot({
          path: resolve(output, `${view.name}-${width}-${theme}.png`),
          fullPage: true,
        });
      }
    }
  }
});

async function contrastRatio(page: import("@playwright/test").Page, selector: string): Promise<number> {
  const colors = await page.locator(selector).evaluate((element) => {
    const style = getComputedStyle(element);
    return { foreground: style.color, background: style.backgroundColor };
  });
  const foreground = luminance(parseRGB(colors.foreground));
  const background = luminance(parseRGB(colors.background));
  return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
}

function parseRGB(value: string): [number, number, number] {
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) throw new Error(`Unsupported color: ${value}`);
  return channels as [number, number, number];
}

function luminance([red, green, blue]: [number, number, number]): number {
  const channels = [red, green, blue].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}
