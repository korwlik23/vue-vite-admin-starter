export type FieldErrors = Record<string, string[]>;

export class APIError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fields: FieldErrors;
  readonly requestID: string;

  constructor(options: {
    code: string;
    message: string;
    status: number;
    fields?: FieldErrors;
    requestID?: string;
  }) {
    super(options.message);
    this.name = "APIError";
    this.code = options.code;
    this.status = options.status;
    this.fields = options.fields ?? {};
    this.requestID = options.requestID ?? "";
  }
}

export async function errorFromResponse(response: Response): Promise<APIError> {
  const body = await readProblem(response);
  if (body !== undefined) {
    return new APIError({
      code: body.code,
      message: body.message,
      status: response.status,
      fields: body.fields,
      requestID: body.requestID,
    });
  }
  return new APIError({
    code: "request_failed",
    message: messageForStatus(response.status),
    status: response.status,
  });
}

export function safeError(error: unknown): APIError {
  if (error instanceof APIError) {
    return error;
  }
  return new APIError({
    code: "unexpected_error",
    message: "Something went wrong. Please try again.",
    status: 0,
  });
}

async function readProblem(response: Response): Promise<
  | {
      code: string;
      message: string;
      fields: FieldErrors;
      requestID: string;
    }
  | undefined
> {
  if (!response.headers.get("Content-Type")?.includes("application/json")) {
    return undefined;
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return undefined;
  }
  if (
    !isRecord(body) ||
    typeof body.code !== "string" ||
    body.code === "" ||
    typeof body.message !== "string" ||
    body.message === ""
  ) {
    return undefined;
  }
  return {
    code: body.code,
    message: body.message,
    fields: parseFields(body.fields),
    requestID: typeof body.request_id === "string" ? body.request_id : "",
  };
}

function parseFields(value: unknown): FieldErrors {
  if (!isRecord(value)) {
    return {};
  }
  const fields: FieldErrors = {};
  for (const [field, messages] of Object.entries(value)) {
    if (
      /^[a-z][a-z0-9_.-]*$/.test(field) &&
      Array.isArray(messages) &&
      messages.every((message) => typeof message === "string")
    ) {
      fields[field] = messages;
    }
  }
  return fields;
}

function messageForStatus(status: number): string {
  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission to perform this action.";
  }
  return "The request could not be completed. Please try again.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
