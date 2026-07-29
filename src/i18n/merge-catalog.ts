import { parseCatalog, type Catalog } from "@/i18n/catalog-schema";

export function mergeCatalog(input: {
  fallback?: Catalog;
  bundle?: Catalog;
  overrides?: Catalog;
}): Catalog {
  return parseCatalog({
    ...(input.fallback ?? {}),
    ...(input.bundle ?? {}),
    ...(input.overrides ?? {}),
  });
}
