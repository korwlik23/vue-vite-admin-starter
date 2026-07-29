import { defineStore } from "pinia";

export interface LocalePreferenceState {
  allLanguages: boolean;
  localeIDs: string[];
  selectedLocale: string;
  version: number;
}

export const useLocalePreferences = defineStore("locale-preferences", {
  state: (): LocalePreferenceState => ({
    allLanguages: true,
    localeIDs: [],
    selectedLocale: "",
    version: 0,
  }),
  actions: {
    apply(preference: {
      allLanguages: boolean;
      localeIDs: string[];
      version: number;
    }): void {
      this.allLanguages = preference.allLanguages;
      this.localeIDs = [...preference.localeIDs];
      this.version = preference.version;
    },
    select(locale: string): void {
      if (locale.trim() === "") {
        throw new Error("Locale selection must not be empty");
      }
      this.selectedLocale = locale;
    },
  },
});
