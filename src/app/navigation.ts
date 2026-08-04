import { hasPermission } from "@/shared/permissions/permissions";

export interface AdminNavigationItem {
  id: string;
  label: string;
  href: string;
}

export function buildAdminNavigationItems(
  moduleIDs: readonly string[],
  permissions: readonly string[],
): readonly AdminNavigationItem[] {
  const items: AdminNavigationItem[] = [
    { id: "foundation", label: "Foundation", href: "/" },
  ];
  const candidates = [
    {
      id: "roles",
      label: "Roles",
      href: "/authorization/roles",
      module: "authorization",
      permission: "authorization.roles.read.system",
    },
    {
      id: "users",
      label: "Users",
      href: "/users",
      module: "identity",
      permission: "identity.users.read.system",
    },
    {
      id: "profile",
      label: "Profile",
      href: "/profile",
      module: "identity",
      permission: "identity.profile.read.own",
    },
    {
      id: "notifications",
      label: "Notifications",
      href: "/notifications",
      module: "notifications",
      permission: "notifications.inbox.read.own",
    },
    {
      id: "memberships",
      label: "Memberships",
      href: "/accounts/memberships",
      module: "accounts",
      permission: "accounts.memberships.read.system",
    },
    {
      id: "audit",
      label: "Audit",
      href: "/audit/events",
      module: "audit",
      permission: "audit.events.read.system",
    },
    {
      id: "modules",
      label: "Modules",
      href: "/operations/modules",
      module: "operations",
      permission: "operations.foundation.read.system",
    },
    {
      id: "jobs",
      label: "Jobs",
      href: "/operations/jobs",
      module: "operations",
      permission: "operations.jobs.read.system",
    },
    {
      id: "ui-components",
      label: "UI Components",
      href: "/ui-components",
      module: "operations",
      permission: "operations.foundation.read.system",
    },
    {
      id: "locales",
      label: "Locales",
      href: "/localization/locales",
      module: "localization",
      permission: "localization.locales.manage.system",
    },
    {
      id: "catalog",
      label: "Catalog",
      href: "/localization/catalog",
      module: "localization",
      permission: "localization.translations.update.system",
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      module: "settings",
      permission: "settings.global.read.system",
    },
    {
      id: "publishing",
      label: "Publishing",
      href: "/publishing/content",
      module: "publishing",
      permission: "publishing.pages.read.own",
    },
    {
      id: "media",
      label: "Media",
      href: "/media",
      module: "media",
      permission: "media.assets.read.own",
    },
    {
      id: "navigation",
      label: "Navigation",
      href: "/navigation/menus",
      module: "navigation",
      permission: "navigation.menus.read.own",
    },
    {
      id: "discoverability",
      label: "Discoverability",
      href: "/discoverability",
      module: "discoverability",
      permission: "discoverability.seo.read.own",
    },
  ];
  for (const candidate of candidates) {
    if (
      moduleIDs.includes(candidate.module) &&
      hasPermission(permissions, candidate.permission)
    ) {
      items.push({
        id: candidate.id,
        label: candidate.label,
        href: candidate.href,
      });
    }
  }
  return items;
}
