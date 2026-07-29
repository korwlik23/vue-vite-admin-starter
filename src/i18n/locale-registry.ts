export interface LocaleRegistryItem {
  id: string;
  code: string;
  name: string;
  enabled: boolean;
  selectable: boolean;
}

export interface LocalePreferenceSelection {
  allLanguages: boolean;
  localeIDs: string[];
}

export function eligibleLocales(
  registry: readonly LocaleRegistryItem[],
  preferences: LocalePreferenceSelection,
): LocaleRegistryItem[] {
  const subset = new Set(preferences.localeIDs);
  return registry
    .filter(
      (locale) =>
        locale.enabled &&
        locale.selectable &&
        (preferences.allLanguages || subset.has(locale.id)),
    )
    .toSorted((left, right) => left.code.localeCompare(right.code));
}
