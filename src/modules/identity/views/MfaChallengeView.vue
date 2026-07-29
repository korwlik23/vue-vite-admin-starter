<script setup lang="ts">
import { onMounted, ref } from "vue";

import MfaChallengeForm from "@/modules/identity/components/MfaChallengeForm.vue";

type Method = "totp" | "recovery_code";

const props = defineProps<{
  pending: boolean;
  methods: Method[];
  refreshCSRF: () => Promise<string>;
  submit: (input: { method: Method; code: string }) => Promise<unknown> | unknown;
  verified?: () => Promise<unknown> | unknown;
}>();

const setupError = ref("");
const emit = defineEmits<{
  verified: [];
}>();

onMounted(async () => {
  if (!props.pending) {
    return;
  }
  try {
    await props.refreshCSRF();
  } catch {
    setupError.value = "The verification session could not be refreshed.";
  }
});

async function handleSubmit(input: { method: Method; code: string }): Promise<void> {
  await props.submit(input);
  emit("verified");
  await props.verified?.();
}
</script>

<template>
  <main class="challenge-page">
    <section
      v-if="pending"
      class="challenge-panel"
      aria-labelledby="challenge-title"
    >
      <p class="eyebrow">
        SECOND STEP
      </p>
      <h1 id="challenge-title">
        Verify your identity
      </h1>
      <p
        v-if="setupError"
        role="alert"
      >
        {{ setupError }}
      </p>
      <MfaChallengeForm
        v-else
        :methods="methods"
        :on-submit="handleSubmit"
      />
    </section>
    <section
      v-else
      class="challenge-panel"
    >
      <h1>This challenge is no longer available</h1>
      <p>Return to sign in to begin a new session.</p>
    </section>
  </main>
</template>

<style scoped>
.challenge-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 1rem;
}

.challenge-panel {
  width: min(100%, 28rem);
  padding: clamp(1.5rem, 5vw, 2.5rem);
  border: 1px solid #d5dbe5;
  border-radius: 1.25rem;
  background: rgb(255 255 255 / 92%);
}

h1 {
  margin: 0.65rem 0 1.5rem;
  font-size: clamp(1.8rem, 7vw, 2.6rem);
  letter-spacing: -0.04em;
}
</style>
