<script setup lang="ts">
import { onMounted, ref } from "vue";

import { listMemberships, updateMembershipStatus, type Membership } from "@/modules/accounts/api/memberships.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";

const props = defineProps<{ client: APIClient; accountID?: string | (() => string | undefined) }>();
const accountID = ref(resolveAccountID(props.accountID));
const memberships = ref<Membership[]>([]);
const status = ref<"" | "active" | "disabled">("");
const loading = ref(false);
const busyID = ref("");
const errorMessage = ref("");

onMounted(() => { if (accountID.value) void loadMemberships(); });

async function loadMemberships(): Promise<void> {
  const target = accountID.value.trim(); if (!target) { errorMessage.value = "Account ID is required."; memberships.value = []; return; }
  loading.value = true; errorMessage.value = "";
  try {
    const input: Parameters<typeof listMemberships>[2] = { perPage: 50 };
    if (status.value) input.status = status.value;
    memberships.value = (await listMemberships(props.client, target, input)).items;
  } catch (error) { errorMessage.value = safeError(error).message; } finally { loading.value = false; }
}

async function toggleStatus(membership: Membership): Promise<void> {
  const next = membership.status === "active" ? "disabled" : "active";
  if (!globalThis.confirm(`Change this membership to ${next}?`)) return;
  busyID.value = membership.id; errorMessage.value = "";
  try { const updated = await updateMembershipStatus(props.client, membership.account_id, membership.id, next, membership.authorization_version); memberships.value = memberships.value.map((item) => item.id === updated.id ? updated : item); } catch (error) { errorMessage.value = safeError(error).message; await loadMemberships(); } finally { busyID.value = ""; }
}

function resolveAccountID(value: string | (() => string | undefined) | undefined): string { const resolved = typeof value === "function" ? value() : value; return resolved ?? ""; }
</script>

<template>
  <section
    class="admin-page"
    aria-labelledby="memberships-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        ACCOUNTS · SYSTEM ADMINISTRATION
      </p><h1 id="memberships-title">
        Memberships
      </h1><p class="intro">
        Inspect account membership status without crossing account boundaries in the query layer.
      </p>
    </header>
    <form
      class="filters"
      @submit.prevent="loadMemberships"
    >
      <label>Account ID<input
        v-model="accountID"
        required
        autocomplete="off"
        placeholder="account UUID"
      ></label><label>Status<select v-model="status"><option value="">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></select></label><button
        type="submit"
        :disabled="loading"
      >
        Load memberships
      </button>
    </form>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
    </p>
    <div
      v-if="loading"
      class="panel state"
      role="status"
    >
      Loading memberships…
    </div>
    <div
      v-else-if="memberships.length === 0"
      class="panel state"
    >
      <h2>No memberships</h2><p>Enter an account ID or adjust the status filter.</p>
    </div>
    <div
      v-else
      class="panel table-wrap"
    >
      <table>
        <caption class="sr-only">
          Account memberships
        </caption><thead>
          <tr>
            <th scope="col">
              User
            </th><th scope="col">
              Account
            </th><th scope="col">
              Status
            </th><th scope="col">
              <span class="sr-only">Action</span>
            </th>
          </tr>
        </thead><tbody>
          <tr
            v-for="membership in memberships"
            :key="membership.id"
          >
            <td>{{ membership.user_email }}</td><td>{{ membership.account_slug }}</td><td>
              <span
                class="status"
                :data-status="membership.status"
              >{{ membership.status }}</span>
            </td><td>
              <button
                type="button"
                :disabled="busyID === membership.id"
                @click="toggleStatus(membership)"
              >
                {{ membership.status === "active" ? "Disable" : "Enable" }}
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
.filters { display: flex; flex-wrap: wrap; align-items: end; gap: .75rem; margin-bottom: 1rem; }
label { display: grid; gap: .3rem; color: #526078; font-size: .8rem; font-weight: 700; }
input, select, button { min-height: 2.65rem; padding: .5rem .7rem; border: 1px solid #aeb9c9; border-radius: .55rem; background: white; font: inherit; }
button { color: #172033; cursor: pointer; font-weight: 750; }
button:disabled { cursor: wait; opacity: .6; }
.panel { padding: 1rem; border: 1px solid #d5dbe5; border-radius: 1rem; background: rgb(255 255 255 / 86%); }
.state { padding-block: 3rem; text-align: center; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: .75rem .6rem; border-bottom: 1px solid #e5e9f0; text-align: left; white-space: nowrap; }
th { color: #526078; font-size: .76rem; }
.status { color: #526078; font-size: .82rem; font-weight: 750; text-transform: capitalize; }
.status[data-status="active"] { color: #166534; }
.status[data-status="disabled"] { color: #9f1239; }
.error-message { margin-bottom: 1rem; padding: .7rem .85rem; border: 1px solid #f0b5bd; border-radius: .55rem; color: #881337; background: #fff1f2; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
</style>
