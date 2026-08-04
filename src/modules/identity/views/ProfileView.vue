<!-- eslint-disable -->
<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  changeMyPassword,
  getMyProfile,
  updateMyProfile,
  type UserProfile,
} from "@/modules/identity/api/profile.client";
import type { APIClient } from "@/shared/api/client";
import { safeError } from "@/shared/api/errors";
import UiButton from "@/shared/components/ui/UiButton.vue";
import UiInput from "@/shared/components/ui/UiInput.vue";
const props = defineProps<{ client: APIClient }>();
const profile = ref<UserProfile>();
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const notice = ref("");
const passwordSaving = ref(false);
const passwordError = ref("");
const passwordNotice = ref("");
const currentPassword = ref("");
const newPassword = ref("");
const passwordConfirmation = ref("");
onMounted(() => void load());
async function load(): Promise<void> {
  loading.value = true;
  try {
    profile.value = await getMyProfile(props.client);
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    loading.value = false;
  }
}
async function save(): Promise<void> {
  if (!profile.value) return;
  saving.value = true;
  errorMessage.value = "";
  try {
    profile.value = await updateMyProfile(
      props.client,
      profile.value,
      profile.value.version,
    );
    notice.value = "Profile saved.";
  } catch (error) {
    errorMessage.value = safeError(error).message;
  } finally {
    saving.value = false;
  }
}
async function changePassword(): Promise<void> {
  passwordError.value = "";
  passwordNotice.value = "";
  if (newPassword.value.length < 12 || newPassword.value.length > 128) {
    passwordError.value = "New password must be between 12 and 128 characters.";
    return;
  }
  if (newPassword.value !== passwordConfirmation.value) {
    passwordError.value = "New password confirmation does not match.";
    return;
  }
  passwordSaving.value = true;
  try {
    await changeMyPassword(
      props.client,
      currentPassword.value,
      newPassword.value,
    );
    currentPassword.value = "";
    newPassword.value = "";
    passwordConfirmation.value = "";
    passwordNotice.value =
      "Password changed. Sign in again with the new password.";
  } catch (error) {
    passwordError.value = safeError(error).message;
  } finally {
    passwordSaving.value = false;
  }
}
</script>
<template>
  <section
    class="admin-page"
    aria-labelledby="profile-title"
  >
    <header class="page-header">
      <p class="eyebrow">
        IDENTITY · MY PROFILE
      </p>
      <h1 id="profile-title">
        Profile
      </h1>
      <p class="intro">
        Your display preferences are stored separately from authentication
        credentials.
      </p>
    </header>
    <p
      v-if="notice"
      class="notice"
      role="status"
    >
      {{ notice }}
    </p>
    <p
      v-if="errorMessage"
      class="error-message"
      role="alert"
    >
      {{ errorMessage }}
      <UiButton
        size="sm"
        variant="secondary"
        @click="load"
      >
        Retry
      </UiButton>
    </p>
    <div
      v-if="loading"
      class="panel state"
    >
      Loading profile…
    </div>
    <form
      v-else-if="profile"
      class="panel form"
      @submit.prevent="save"
    >
      <label>Display name<UiInput
        v-model="profile.display_name"
        required
      /></label><label>Timezone<UiInput
        v-model="profile.timezone"
        required
        placeholder="Asia/Bangkok"
      /></label><label>Preferred locale<UiInput
        v-model="profile.preferred_locale"
        placeholder="th"
      /></label><UiButton
        type="submit"
        :loading="saving"
      >
        Save profile
      </UiButton><small>Version {{ profile.version }}</small>
    </form>
    <form
      v-if="profile"
      class="panel form password-form"
      @submit.prevent="changePassword"
    >
      <h2>Change password</h2>
      <p class="helper">
        Changing the password signs out existing sessions, including this
        browser.
      </p>
      <p
        v-if="passwordNotice"
        class="notice"
        role="status"
      >
        {{ passwordNotice }}
      </p>
      <p
        v-if="passwordError"
        class="error-message"
        role="alert"
      >
        {{ passwordError }}
      </p>
      <label>Current password<UiInput
        v-model="currentPassword"
        type="password"
        autocomplete="current-password"
        required
      /></label>
      <label>New password<UiInput
        v-model="newPassword"
        type="password"
        autocomplete="new-password"
        required
      /></label>
      <label>Confirm new password<UiInput
        v-model="passwordConfirmation"
        type="password"
        autocomplete="new-password"
        required
      /></label>
      <UiButton
        type="submit"
        :loading="passwordSaving"
      >
        Change password
      </UiButton>
    </form>
  </section>
</template>
<style scoped>
.admin-page {
  width: min(50rem, 100%);
  margin: auto;
}
.page-header {
  margin-bottom: 1.4rem;
}
h1,
p {
  margin-top: 0;
}
h1 {
  color: #101828;
  font-size: clamp(2rem, 4vw, 3.4rem);
  letter-spacing: -0.045em;
}
.eyebrow {
  color: #526078;
  font-size: 0.7rem;
  font-weight: 750;
  letter-spacing: 0.14em;
}
.intro {
  color: #526078;
  line-height: 1.6;
}
.panel {
  padding: 1.2rem;
  border: 1px solid #d5dbe5;
  border-radius: 1rem;
  background: #fff;
}
.form {
  display: grid;
  gap: 1rem;
}
.form label {
  display: grid;
  gap: 0.4rem;
  color: #344054;
  font-weight: 700;
}
.form small {
  color: #667085;
}
.password-form {
  margin-top: 1rem;
}
.password-form h2 {
  margin: 0;
  color: #172033;
}
.helper {
  margin: 0;
  color: #667085;
  line-height: 1.5;
}
.state {
  text-align: center;
  padding-block: 3rem;
}
.notice,
.error-message {
  padding: 0.7rem 0.85rem;
  border: 1px solid #b8d9c1;
  border-radius: 0.55rem;
  color: #14532d;
  background: #f0fdf4;
}
.error-message {
  border-color: #f0b5bd;
  color: #881337;
  background: #fff1f2;
}
</style>
