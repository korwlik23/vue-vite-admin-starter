<script setup lang="ts">
import type { components } from "@/generated/api/schema";
import LoginForm from "@/modules/identity/components/LoginForm.vue";

type LoginInput = components["schemas"]["LoginRequest"];
type LoginResult =
  | components["schemas"]["LoginAuthenticatedResponse"]
  | components["schemas"]["LoginMFAPendingResponse"];

const props = withDefaults(
  defineProps<{
    authenticated: boolean;
    returnTo?: string;
    submit: (input: LoginInput) => Promise<LoginResult>;
  }>(),
  { returnTo: "/" },
);

const emit = defineEmits<{
  navigate: [path: string];
}>();

async function handleSubmit(input: LoginInput): Promise<void> {
  const result = await props.submit(input);
  if (result.status === "mfa_pending") {
    emit("navigate", "/mfa");
    return;
  }
  emit("navigate", safeReturnPath(props.returnTo));
}

function safeReturnPath(value: string): string {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.length > 2_048
  ) {
    return "/";
  }
  return value;
}
</script>

<template>
  <main class="login-page">
    <section
      v-if="!authenticated"
      class="login-panel"
      aria-labelledby="login-title"
    >
      <p class="eyebrow">
        SECURE ADMIN ACCESS
      </p>
      <h1 id="login-title">
        Sign in to your workspace
      </h1>
      <p class="intro">
        Your session stays in a secure cookie. Passwords and tokens are never
        stored in the browser.
      </p>
      <LoginForm :on-submit="handleSubmit" />
    </section>
    <section
      v-else
      class="login-panel"
      aria-labelledby="session-title"
    >
      <h1 id="session-title">
        You are already signed in
      </h1>
      <p>Continue to the dashboard from the navigation.</p>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 1rem;
}

.login-panel {
  width: min(100%, 28rem);
  padding: clamp(1.5rem, 5vw, 2.5rem);
  border: 1px solid #d5dbe5;
  border-radius: 1.25rem;
  background: rgb(255 255 255 / 92%);
}

h1 {
  margin: 0.65rem 0 0.8rem;
  color: #101828;
  font-size: clamp(1.8rem, 7vw, 2.6rem);
  letter-spacing: -0.04em;
}

.intro {
  margin: 0 0 1.75rem;
  color: #667085;
  line-height: 1.55;
}

@media (prefers-color-scheme: dark) {
  .login-panel {
    border-color: #293449;
    background: rgb(15 23 42 / 94%);
  }

  h1 {
    color: #f8fafc;
  }

  .intro {
    color: #aab5c7;
  }
}
</style>
