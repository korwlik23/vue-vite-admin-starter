<script setup lang="ts">
import { reactive, ref } from "vue";

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

    <div class="field">
      <label for="login-email">Email</label>
      <input
        id="login-email"
        v-model="email"
        name="email"
        type="email"
        autocomplete="username"
        autofocus
        :aria-invalid="Boolean(errors.email)"
        :aria-describedby="errors.email ? 'login-email-error' : undefined"
      >
      <p
        v-if="errors.email"
        id="login-email-error"
        class="field-error"
      >
        {{ errors.email }}
      </p>
    </div>

    <div class="field">
      <label for="login-password">Password</label>
      <input
        id="login-password"
        v-model="password"
        name="password"
        type="password"
        autocomplete="current-password"
        :aria-invalid="Boolean(errors.password)"
        :aria-describedby="errors.password ? 'login-password-error' : undefined"
      >
      <p
        v-if="errors.password"
        id="login-password-error"
        class="field-error"
      >
        {{ errors.password }}
      </p>
    </div>

    <button
      type="submit"
      :disabled="pending"
    >
      {{ pending ? "Signing in…" : "Sign in" }}
    </button>
  </form>
</template>

<style
  scoped
  src="./login-form.css"
></style>
