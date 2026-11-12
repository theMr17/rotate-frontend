export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | null;
  readonly fields: FieldErrors;

  constructor(status: number, detail: string | null, fields: FieldErrors = {}) {
    const firstFieldError = Object.values(fields).flat()[0];
    super(detail ?? firstFieldError ?? defaultMessage(status));
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.fields = fields;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  fieldError(name: string): string | undefined {
    return this.fields[name]?.[0];
  }

  static async fromResponse(response: Response): Promise<ApiError> {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {}
    return ApiError.fromPayload(response.status, payload);
  }

  static fromPayload(status: number, payload: unknown): ApiError {
    if (Array.isArray(payload)) {
      return new ApiError(status, toMessages(payload)[0] ?? null);
    }
    if (!isRecord(payload)) return new ApiError(status, null);

    const { detail, fields } = payload;
    const rest = Object.fromEntries(
      Object.entries(payload).filter(([key]) => key !== "detail" && key !== "code"),
    );
    const rawFields = isRecord(fields) ? fields : rest;

    const parsedFields: FieldErrors = {};
    for (const [name, value] of Object.entries(rawFields)) {
      const messages = toMessages(value);
      if (messages.length) parsedFields[name] = messages;
    }

    let parsedDetail = typeof detail === "string" ? detail : null;
    if (!parsedDetail && parsedFields.non_field_errors) {
      parsedDetail = parsedFields.non_field_errors[0];
    }

    return new ApiError(status, parsedDetail, parsedFields);
  }
}

function defaultMessage(status: number) {
  if (status === 0) return "Could not reach the server. Check your connection and try again.";
  if (status === 401) return "Please log in to continue.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "Not found.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return `Request failed (${status})`;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toMessages(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(toMessages);
  if (isRecord(value)) return Object.values(value).flatMap(toMessages);
  return [];
}
