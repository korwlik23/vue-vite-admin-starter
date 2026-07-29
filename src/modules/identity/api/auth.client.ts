import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

type LoginRequest = components["schemas"]["LoginRequest"];
type LoginResult =
  | components["schemas"]["LoginAuthenticatedResponse"]
  | components["schemas"]["LoginMFAPendingResponse"];
type CurrentSession = components["schemas"]["CurrentSessionResponse"];

export interface AuthClient {
  login(input: LoginRequest): Promise<LoginResult>;
  currentSession(): Promise<CurrentSession | undefined>;
  logout(): Promise<void>;
}

export function createAuthClient(client: APIClient): AuthClient {
  return {
    async login(input): Promise<LoginResult> {
      const response = await client.request("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        throw await errorFromResponse(response);
      }
      const body: unknown = await response.json();
      if (!isLoginResult(body)) {
        throw new Error("Invalid login response");
      }
      return body;
    },
    async currentSession(): Promise<CurrentSession | undefined> {
      const response = await client.request("/auth/session");
      if (response.status === 401) {
        return undefined;
      }
      if (!response.ok) {
        throw await errorFromResponse(response);
      }
      const body: unknown = await response.json();
      if (!isCurrentSession(body)) {
        throw new Error("Invalid session response");
      }
      return body;
    },
    async logout(): Promise<void> {
      const response = await client.request("/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw await errorFromResponse(response);
      }
    },
  };
}

function isLoginResult(value: unknown): value is LoginResult {
  if (!isRecord(value) || typeof value.csrf_token !== "string") {
    return false;
  }
  return (
    value.status === "authenticated" ||
    (value.status === "mfa_pending" &&
      typeof value.challenge_id === "string" &&
      value.challenge_id !== "")
  );
}

function isCurrentSession(value: unknown): value is CurrentSession {
  return (
    isRecord(value) &&
    value.state === "authenticated" &&
    typeof value.session_id === "string" &&
    isRecord(value.principal) &&
    typeof value.principal.id === "string" &&
    typeof value.principal.email === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
