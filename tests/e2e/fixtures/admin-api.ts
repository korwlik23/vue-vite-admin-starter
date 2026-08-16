import type { Page, Route } from "@playwright/test";

const timestamp = "2026-08-09T00:00:00Z";
const role = {
  id: "role-editor",
  owner_type: "account",
  account_id: "account-demo",
  name: "Editor",
  version: 1,
  created_at: timestamp,
  updated_at: timestamp,
};

const pageInfo = { page: 1, per_page: 20, total_items: 1, total_pages: 1 };

export async function installAuthenticatedAdminAPI(page: Page): Promise<void> {
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace(/^\/api\/v1/, "");

    if (request.method() !== "GET") {
      await json(route, { message: "Mutation not stubbed" }, 405);
      return;
    }

    if (path === "/auth/session") {
      await json(route, {
        state: "authenticated",
        session_id: "session-e2e",
        principal: { id: "user-e2e", email: "admin@example.test" },
      });
      return;
    }
    if (path === "/operations/modules") {
      await json(route, { items: [
        { id: "operations", enabled: true, reconcile_revision: 1 },
        { id: "authorization", enabled: true, reconcile_revision: 1 },
      ] });
      return;
    }
    if (path === "/authorization/effective-permissions") {
      await json(route, { account_id: "account-demo", permissions: [
        "operations.foundation.read.system",
        "authorization.roles.read.system",
      ] });
      return;
    }
    if (path === "/authorization/roles") {
      await json(route, { items: [role], page: pageInfo });
      return;
    }
    if (path === `/authorization/roles/${role.id}/permissions`) {
      await json(route, {
        role_id: role.id,
        role_version: role.version,
        items: [{
          permission_key: "publishing.pages.read.own",
          active: true,
          delegable: false,
          tier: "default",
        }],
      });
      return;
    }
    if (path === `/authorization/roles/${role.id}/assignments`) {
      await json(route, { items: [], page: { ...pageInfo, total_items: 0, total_pages: 0 } });
      return;
    }

    await json(route, { message: `No fixture for ${path}` }, 404);
  });
}

async function json(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}
