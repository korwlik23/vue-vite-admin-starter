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

<style scoped>
.login-form {
  display: grid;
  gap: 1.1rem;
}

.field {
  display: grid;
  gap: 0.45rem;
}

label {
  color: #344054;
  font-size: 0.875rem;
  font-weight: 700;
}

input {
  min-height: 2.85rem;
  width: 100%;
  padding: 0.7rem 0.85rem;
  border: 1px solid #b8c0ce;
  border-radius: 0.7rem;
  color: #101828;
  background: white;
  font: inherit;
}

input[aria-invalid="true"] {
  border-color: #b42318;
}

button {
  min-height: 2.9rem;
  border: 0;
  border-radius: 0.7rem;
  color: white;
  background: #172033;
  font: inherit;
  font-weight: 750;
  cursor: pointer;
}

button:disabled {
  cursor: wait;
  opacity: 0.62;
}

.form-alert,
.field-error {
  color: #912018;
}

.form-alert {
  padding: 0.8rem;
  border: 1px solid #f0b4ad;
  border-radius: 0.7rem;
  background: #fff4f2;
}

.field-error {
  margin: 0;
  font-size: 0.82rem;
}

@media (prefers-color-scheme: dark) {
  label {
    color: #d3d9e4;
  }

  input {
    border-color: #46536a;
    color: #f8fafc;
    background: #111a2d;
  }

  button {
    color: #111827;
    background: #e2e8f0;
  }

  .form-alert {
    border-color: #7f2f29;
    background: #351512;
  }
}
</style>
