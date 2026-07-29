export interface LoginInput {
  email: string;
  password: string;
}

export type LoginResult =
  | {
      status: "authenticated";
      csrf_token: string;
    }
  | {
      status: "mfa_pending";
      challenge_id: string;
      csrf_token: string;
    };

export type MFAMethod = "totp" | "recovery_code";
