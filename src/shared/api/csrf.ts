export interface CSRFTokenProvider {
  token(): Promise<string>;
  clear(): void;
}

export function createCSRFTokenProvider(
  baseUrl: string,
  fetcher: typeof fetch = globalThis.fetch,
): CSRFTokenProvider {
  let cached: string | undefined;
  return {
    async token(): Promise<string> {
      if (cached !== undefined) {
        return cached;
      }
      const response = await fetcher(
        `${baseUrl.replace(/\/+$/, "")}/auth/csrf`,
        {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
        },
      );
      if (!response.ok) {
        throw new Error("Unable to establish CSRF protection");
      }
      const body: unknown = await response.json();
      if (
        typeof body !== "object" ||
        body === null ||
        !("csrf_token" in body) ||
        typeof body.csrf_token !== "string" ||
        body.csrf_token === ""
      ) {
        throw new Error("Invalid CSRF response");
      }
      cached = body.csrf_token;
      return cached;
    },
    clear(): void {
      cached = undefined;
    },
  };
}
