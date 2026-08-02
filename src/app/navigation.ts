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
  const items: AdminNavigationItem[] = [{ id: "foundation", label: "Foundation", href: "/" }];
  const candidates = [
    { id: "publishing", label: "Publishing", href: "/publishing/content", module: "publishing", permission: "publishing.pages.read.own" },
    { id: "media", label: "Media", href: "/media", module: "media", permission: "media.assets.read.own" },
    { id: "navigation", label: "Navigation", href: "/navigation/menus", module: "navigation", permission: "navigation.menus.read.own" },
    { id: "discoverability", label: "Discoverability", href: "/discoverability", module: "discoverability", permission: "discoverability.seo.read.own" },
  ];
  for (const candidate of candidates) {
    if (moduleIDs.includes(candidate.module) && hasPermission(permissions, candidate.permission)) {
      items.push({ id: candidate.id, label: candidate.label, href: candidate.href });
    }
  }
  return items;
}
