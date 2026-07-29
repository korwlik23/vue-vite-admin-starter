import authEN from "@/locales/en/auth.json";
import commonEN from "@/locales/en/common.json";
import navigationEN from "@/locales/en/navigation.json";
import validationEN from "@/locales/en/validation.json";
import authTH from "@/locales/th/auth.json";
import commonTH from "@/locales/th/common.json";
import navigationTH from "@/locales/th/navigation.json";
import validationTH from "@/locales/th/validation.json";
import {
  parseCatalog,
  parseCatalogCategory,
  type Catalog,
} from "@/i18n/catalog-schema";

const bundles: Record<string, Record<string, unknown>> = {
  en: {
    auth: authEN,
    common: commonEN,
    navigation: navigationEN,
    validation: validationEN,
  },
  th: {
    auth: authTH,
    common: commonTH,
    navigation: navigationTH,
    validation: validationTH,
  },
};

export function loadBundledCatalog(
  locale: string,
  category: string,
): Catalog | undefined {
  const safeCategory = parseCatalogCategory(category);
  const value = bundles[locale]?.[safeCategory];
  return value === undefined ? undefined : parseCatalog(value);
}
