<script setup lang="ts">
import { reactive, ref } from "vue";

import UiButton from "@/shared/components/ui/UiButton.vue";
import UiField from "@/shared/components/ui/UiField.vue";
import UiInput from "@/shared/components/ui/UiInput.vue";

const props = defineProps<{
  onSubmit: (credentials: {
    email: string;
    password: string;
  }) => Promise<unknown> | unknown;
}>();

const email = ref("");
const password = ref("");
const pending = ref(false);
const errors = reactive<{ email?: string; password?: string; form?: string }>({});

async function submit(): Promise<void> {
  if (pending.value) {
    return;
  }
  clearErrors();
  if (!email.value.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password.value) {
    errors.password = "Password is required.";
  }
  if (errors.email || errors.password) {
    errors.form = "Please review the highlighted fields.";
    return;
  }
  pending.value = true;
  try {
    await props.onSubmit({
      email: email.value.trim(),
      password: password.value,
    });
  } catch {
    errors.form = "Sign in failed. Check your details and try again.";
  } finally {
    pending.value = false;
  }
}

function clearErrors(): void {
  delete errors.email;
  delete errors.password;
  delete errors.form;
}
</script>

<template>
  <form
    class="login-form"
    novalidate
    :aria-busy="pending"
    @submit.prevent="submit"
  >
    <div
      v-if="errors.form"
      class="form-alert"
      role="alert"
    >
      {{ errors.form }}
    </div>

    <UiField
      id="login-email"
      label="Email"
      :error="errors.email"
      required
    >
      <UiInput
        id="login-email"
        v-model="email"
        name="email"
        type="email"
        autocomplete="username"
        autofocus
        :aria-invalid="Boolean(errors.email)"
        :aria-describedby="errors.email ? 'login-email-error' : undefined"
      />
    </UiField>

    <UiField
      id="login-password"
      label="Password"
      :error="errors.password"
      required
    >
      <UiInput
        id="login-password"
        v-model="password"
        name="password"
        type="password"
        autocomplete="current-password"
        :aria-invalid="Boolean(errors.password)"
        :aria-describedby="errors.password ? 'login-password-error' : undefined"
      />
    </UiField>

    <UiButton
      type="submit"
      :loading="pending"
      loading-label="Signing in…"
    >
      {{ pending ? "Signing in…" : "Sign in" }}
    </UiButton>
  </form>
</template>

<style
  scoped
  src="./login-form.css"
></style>
