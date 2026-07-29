import type { components } from "@/generated/api/schema";

type LoginInput = components["schemas"]["LoginRequest"];
type LoginResult =
  | components["schemas"]["LoginAuthenticatedResponse"]
  | components["schemas"]["LoginMFAPendingResponse"];

interface LoginDependencies {
  auth: {
    login(input: LoginInput): Promise<LoginResult>;
  };
  csrf: {
    token(): Promise<string>;
  };
  queryClient: {
    invalidateQueries(options: {
      queryKey: readonly string[];
    }): Promise<unknown> | unknown;
  };
}

export function loginMutationOptions(dependencies: LoginDependencies) {
  return {
    retry: false as const,
    async mutationFn(input: LoginInput): Promise<LoginResult> {
      await dependencies.csrf.token();
      return dependencies.auth.login(input);
    },
    async onSuccess(): Promise<void> {
      await dependencies.queryClient.invalidateQueries({
        queryKey: ["identity", "session"],
      });
    },
  };
}
