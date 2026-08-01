<script setup lang="ts">
import { onMounted, ref } from "vue";

import { createLocale, listLocales, setDefaultLocale, updateLocaleStatus, type Locale } from "@/modules/localization/api/locales.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

const props = defineProps<{ client: APIClient }>();
const locales = ref<Locale[]>([]);
const loading = ref(true);
const busyID = ref("");
const errorMessage = ref("");
const code = ref("");
const name = ref("");
const direction = ref<"ltr" | "rtl">("ltr");

onMounted(() => void loadLocales());
async function loadLocales(): Promise<void> { loading.value = true; errorMessage.value = ""; try { locales.value = (await listLocales(props.client)).items; } catch (error) { errorMessage.value = safeError(error).message; } finally { loading.value = false; } }
async function addLocale(): Promise<void> { if (!code.value.trim() || !name.value.trim()) { errorMessage.value = "Locale code and name are required."; return; } try { const created = await createLocale(props.client, { code: code.value.trim(), name: name.value.trim(), direction: direction.value }); locales.value = [...locales.value, created]; code.value = ""; name.value = ""; } catch (error) { errorMessage.value = safeError(error).message; } }
async function toggle(locale: Locale): Promise<void> { busyID.value = locale.id; errorMessage.value = ""; try { const version = locale.version ?? 1; const updated = await updateLocaleStatus(props.client, locale.id, { enabled: !locale.enabled, selectable: locale.selectable && !locale.enabled ? true : locale.selectable, expected_version: version }); locales.value = locales.value.map((item) => item.id === locale.id ? { ...item, enabled: updated.enabled, selectable: updated.selectable, version: updated.version } : item); } catch (error) { errorMessage.value = safeError(error).message; await loadLocales(); } finally { busyID.value = ""; } }
async function makeDefault(locale: Locale): Promise<void> { if (!globalThis.confirm(`Set ${locale.code} as the default locale?`)) return; busyID.value = locale.id; try { const result = await setDefaultLocale(props.client, locale.id, locale.version ?? 1); locales.value = locales.value.map((item): Locale => { const next: Locale = { ...item, default: item.id === result.locale_id }; if (item.id === locale.id) next.version = result.version; return next; }); } catch (error) { errorMessage.value = safeError(error).message; await loadLocales(); } finally { busyID.value = ""; } }
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="locales-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        LOCALIZATION · SYSTEM ADMINISTRATION
      </p><h1 id="locales-title">
        Locales
      </h1><p class="intro">
        Add languages, control user-selectable locales, and keep one enabled default.
      </p>
    </header><p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p><form
      class="create-form"
      @submit.prevent="addLocale"
    >
      <label>Code<input
        v-model="code"
        required
        placeholder="th-TH"
      ></label><label>Name<input
        v-model="name"
        required
        placeholder="Thai"
      ></label><label>Direction<select v-model="direction"><option value="ltr">LTR</option><option value="rtl">RTL</option></select></label><button type="submit">
        Add locale
      </button>
    </form><div
      v-if="loading"
      class="panel state"
      role="status"
    >
      Loading locales…
    </div><div
      v-else-if="locales.length === 0"
      class="panel state"
    >
      <h2>No locales</h2><p>Add the first locale to initialize the catalog.</p>
    </div><div
      v-else
      class="panel table-wrap"
    >
      <table>
        <caption class="sr-only">
          Locale registry
        </caption><thead>
          <tr>
            <th scope="col">
              Code
            </th><th scope="col">
              Name
            </th><th scope="col">
              Enabled
            </th><th scope="col">
              Selectable
            </th><th scope="col">
              Default
            </th><th scope="col">
              <span class="sr-only">Actions</span>
            </th>
          </tr>
        </thead><tbody>
          <tr
            v-for="locale in locales"
            :key="locale.id"
          >
            <td>{{ locale.code }}</td><td>{{ locale.name }}</td><td>{{ locale.enabled ? "Yes" : "No" }}</td><td>{{ locale.selectable ? "Yes" : "No" }}</td><td>{{ locale.default ? "Yes" : "No" }}</td><td>
              <button
                type="button"
                :disabled="busyID === locale.id"
                @click="toggle(locale)"
              >
                {{ locale.enabled ? "Disable" : "Enable" }}
              </button><button
                v-if="!locale.default"
                type="button"
                :disabled="busyID === locale.id || !locale.enabled"
                @click="makeDefault(locale)"
              >
                Set default
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.admin-page { width: min(90rem, 100%); margin-inline: auto; }
.page-header { margin-bottom: 1.4rem; }
h1, h2, p { margin-top: 0; }
h1 { margin-bottom: .65rem; color: #101828; font-size: clamp(2rem, 4vw, 3.4rem); letter-spacing: -.045em; }
h2 { color: #172033; font-size: 1.25rem; }
.eyebrow { margin-bottom: .35rem; color: #526078; font-size: .7rem; font-weight: 750; letter-spacing: .14em; }
.intro { color: #526078; line-height: 1.6; }
.create-form { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin-bottom: 1rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, button { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
button { margin-right: .35rem; color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .75rem .6rem; border-bottom: 1px solid #e5e9f0; text-align: left; white-space: nowrap; }
th { color: #526078; font-size: .76rem; }
.error-message { margin-bottom: 1rem; padding: .7rem .85rem; border: 1px solid #f0b5bd; border-radius: .55rem; color: #881337; background: #fff1f2; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
