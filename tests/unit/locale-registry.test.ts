import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { eligibleLocales } from "@/i18n/locale-registry";
import { useLocalePreferences } from "@/shared/stores/preferences";

const registry = [
  { id: "en", code: "en", name: "English", enabled: true, selectable: true },
  { id: "th", code: "th", name: "ไทย", enabled: true, selectable: true },
  { id: "ja", code: "ja", name: "日本語", enabled: true, selectable: true },
  { id: "de", code: "de", name: "Deutsch", enabled: false, selectable: true },
];

describe("U7", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("shows an explicit user subset without adding locale to the Admin URL", () => {
    const preferences = useLocalePreferences();
    preferences.apply({
      allLanguages: false,
      localeIDs: ["en", "th"],
      version: 2,
    });

    expect(eligibleLocales(registry, preferences.$state).map((item) => item.code))
      .toEqual(["en", "th"]);
    preferences.select("th");
    expect(preferences.selectedLocale).toBe("th");
    expect(window.location.pathname).toBe("/");
  });

  it("expands all languages dynamically from enabled selectable locales", () => {
    const preferences = useLocalePreferences();
    preferences.apply({ allLanguages: true, localeIDs: [], version: 1 });

    expect(eligibleLocales(registry, preferences.$state).map((item) => item.code))
      .toEqual(["en", "ja", "th"]);
  });
});
