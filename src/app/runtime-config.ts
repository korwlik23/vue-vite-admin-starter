export interface RuntimeConfig {
  apiBaseUrl: string;
  appName: string;
}

const allowedKeys = new Set(["PUBLIC_API_BASE_URL", "PUBLIC_APP_NAME"]);

export function parseRuntimeConfig(source: unknown): RuntimeConfig {
  if (!isRecord(source)) {
    throw new Error("Invalid runtime config");
  }
  for (const key of Object.keys(source)) {
    if (!allowedKeys.has(key)) {
      throw new Error("Invalid runtime config field");
    }
  }
  const apiBaseUrl = parseAPIBaseURL(source.PUBLIC_API_BASE_URL);
  const appName = parseAppName(source.PUBLIC_APP_NAME);
  return { apiBaseUrl, appName };
}

export function loadRuntimeConfig(): RuntimeConfig {
  return parseRuntimeConfig(globalThis.__STARTER_CONFIG__);
}

function parseAPIBaseURL(value: unknown): string {
  if (typeof value !== "string" || value.trim() !== value || value === "") {
    throw new Error("Invalid runtime config API URL");
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Invalid runtime config API URL");
  }
  const localHTTP =
    parsed.protocol === "http:" &&
    (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost");
  if (
    (parsed.protocol !== "https:" && !localHTTP) ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error("Invalid runtime config API URL");
  }
  return parsed.href.replace(/\/+$/, "");
}

function parseAppName(value: unknown): string {
  if (value === undefined) {
    return "Starter Admin";
  }
  if (
    typeof value !== "string" ||
    value.trim() !== value ||
    value.length < 1 ||
    value.length > 80
  ) {
    throw new Error("Invalid runtime config app name");
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
