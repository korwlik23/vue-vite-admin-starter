<script setup lang="ts">
import { computed, ref } from "vue";

type Method = "totp" | "recovery_code";

const props = defineProps<{
  methods: Method[];
  onSubmit: (input: { method: Method; code: string }) => Promise<unknown> | unknown;
}>();

const method = ref<Method>(props.methods[0] ?? "totp");
const code = ref("");
const pending = ref(false);
const error = ref("");
const label = computed(() =>
  method.value === "recovery_code" ? "Recovery code" : "Verification code",
);

async function submit(): Promise<void> {
  if (pending.value) {
    return;
  }
  const normalized = code.value.trim();
  if (normalized === "") {
    error.value = `${label.value} is required.`;
    return;
  }
  pending.value = true;
  error.value = "";
  try {
    await props.onSubmit({ method: method.value, code: normalized });
  } catch {
    error.value = "Verification failed. Try another code.";
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form
    class="mfa-form"
    :aria-busy="pending"
    @submit.prevent="submit"
  >
    <fieldset v-if="methods.length > 1">
      <legend>Verification method</legend>
      <label>
        <input
          v-model="method"
          type="radio"
          value="totp"
        >
        Authenticator app
      </label>
      <label>
        <input
          v-model="method"
          type="radio"
          value="recovery_code"
        >
        Recovery code
      </label>
    </fieldset>
    <label for="mfa-code">{{ label }}</label>
    <input
      id="mfa-code"
      v-model="code"
      inputmode="numeric"
      autocomplete="one-time-code"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? 'mfa-error' : undefined"
    >
    <p
      v-if="error"
      id="mfa-error"
      role="alert"
    >
      {{ error }}
    </p>
    <button
      type="submit"
      :disabled="pending"
    >
      {{ pending ? "Verifying…" : "Verify" }}
    </button>
  </form>
</template>

<style scoped>
.mfa-form {
  display: grid;
  gap: 0.85rem;
}

fieldset {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0.8rem;
  border: 1px solid #d5dbe5;
  border-radius: 0.7rem;
}

label,
legend {
  font-weight: 700;
}

input:not([type="radio"]) {
  min-height: 2.85rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #b8c0ce;
  border-radius: 0.7rem;
  font: inherit;
}

button {
  min-height: 2.9rem;
  border: 0;
  border-radius: 0.7rem;
  color: white;
  background: #172033;
  font-weight: 750;
}

[role="alert"] {
  margin: 0;
  color: #912018;
}
</style>
