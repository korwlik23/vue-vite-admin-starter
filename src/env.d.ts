/// <reference types="vite/client" />

interface Window {
  __STARTER_CONFIG__?: Record<string, unknown>;
}

// eslint-disable-next-line no-var
declare var __STARTER_CONFIG__: Record<string, unknown> | undefined;
