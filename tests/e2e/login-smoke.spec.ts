import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/auth/session", async (route) => {
    await route.fulfill({ status: 401, body: "" });
  });
});

test("renders the login screen through the running SPA", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });

  await expect(
    page.getByRole("heading", { name: "Sign in to your workspace" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
});

test("shows client-side validation for an empty login submission", async ({ page }) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByRole("alert")).toHaveText(
    "Please review the highlighted fields.",
  );
  await expect(page.locator("#login-email-error")).toHaveText("Email is required.");
  await expect(page.locator("#login-password-error")).toHaveText(
    "Password is required.",
  );
});
