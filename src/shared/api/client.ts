export interface CSRFTokenSource {
  token(): Promise<string>;
}

export interface APIClientOptions {
  baseUrl: string;
  fetcher?: typeof fetch;
  csrf: CSRFTokenSource;
  requestID?: () => string;
}

export interface APIClient {
  request(path: string, init?: RequestInit): Promise<Response>;
}

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function createAPIClient(options: APIClientOptions): APIClient {
  const baseUrl = normalizeBaseURL(options.baseUrl);
  const fetcher = options.fetcher ?? globalThis.fetch;
  const requestID = options.requestID ?? (() => crypto.randomUUID());
  if (typeof fetcher !== "function" || options.csrf === undefined) {
    throw new Error("Invalid API client configuration");
  }

  return {
    async request(path: string, init: RequestInit = {}): Promise<Response> {
      if (!path.startsWith("/") || path.startsWith("//")) {
        throw new Error("API path must be root-relative");
      }
      const method = (init.method ?? "GET").toUpperCase();
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      headers.set("X-Request-ID", requestID());
      if (init.body !== undefined && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      if (!safeMethods.has(method)) {
        headers.set("X-CSRF-Token", await options.csrf.token());
      }
      return fetcher(`${baseUrl}${path}`, {
        ...init,
        method,
        headers,
        credentials: "include",
      });
    },
  };
}

function normalizeBaseURL(value: string): string {
  const parsed = new URL(value);
  if (
    (parsed.protocol !== "https:" &&
      !(
        parsed.protocol === "http:" &&
        (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost")
      )) ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error("Invalid API base URL");
  }
  return parsed.href.replace(/\/+$/, "");
}
