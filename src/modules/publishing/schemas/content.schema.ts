import type {
  ContentMutationRequest,
  PublishingBlock,
} from "@/modules/publishing/api/content.client";

export type ContentMutation = ContentMutationRequest;
export type PublishingBlockType = PublishingBlock["type"];
export type ValidationErrors = Record<string, string[]>;

export type ParseContentMutationResult =
  | { success: true; data: ContentMutation }
  | { success: false; errors: ValidationErrors };

const blockTypes = new Set<PublishingBlockType>([
  "text",
  "image",
  "callout",
  "answer",
  "steps",
  "comparison",
]);

const contentFields = new Set([
  "kind",
  "content_key",
  "translation_id",
  "locale",
  "slug",
  "path",
  "title",
  "excerpt",
  "blocks",
  "seo",
  "geo",
  "aeo",
  "expected_version",
]);

export function parseContentMutation(value: unknown): ParseContentMutationResult {
  if (!isRecord(value)) {
    return { success: false, errors: { form: ["Content must be an object."] } };
  }

  for (const key of Object.keys(value)) {
    if (!contentFields.has(key)) {
      return { success: false, errors: { [key]: ["This field is not accepted."] } };
    }
  }

  const errors: ValidationErrors = {};
  requireString(value, "locale", 2, 255, errors);
  requireString(value, "slug", 1, 160, errors);
  requirePath(value, errors);
  requireString(value, "title", 1, 255, errors, true);
  requireString(value, "excerpt", 0, 2000, errors);
  if (value.kind !== undefined && value.kind !== "page" && value.kind !== "post") {
    errors.kind = ["Choose page or post."];
  }
  optionalString(value, "content_key", 1, 128, errors);
  optionalString(value, "translation_id", 1, 128, errors);
  if (value.expected_version !== undefined && !isPositiveInteger(value.expected_version)) {
    errors.expected_version = ["Expected version must be a positive integer."];
  }

  const blockErrors = validatePublishingBlocks(value.blocks);
  addErrors(errors, blockErrors);
  validateMetadata(value.seo, "seo", errors, {
    title: 255,
    description: 320,
    canonical_url: 2048,
    robots: 64,
  });
  validateMetadata(value.geo, "geo", errors, { region: 128, locality: 128 });
  validateMetadata(value.aeo, "aeo", errors, { question: 255, answer: 20000 });

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }
  return { success: true, data: value as ContentMutation };
}

export function validatePublishingBlocks(value: unknown): ValidationErrors {
  if (!Array.isArray(value)) {
    return { blocks: ["Add at least one structured block."] };
  }
  if (value.length === 0 || value.length > 100) {
    return { blocks: ["Use between 1 and 100 structured blocks."] };
  }

  const errors: ValidationErrors = {};
  value.forEach((candidate, index) => {
    const field = `blocks.${index}`;
    if (!isRecord(candidate)) {
      errors[field] = ["Block must be an object."];
      return;
    }
    if (!blockTypes.has(candidate.type as PublishingBlockType)) {
      errors[`${field}.type`] = ["Choose a supported block type."];
      return;
    }
    if (!isRecord(candidate.data)) {
      errors[`${field}.data`] = ["Block data must be a structured object."];
      return;
    }

    switch (candidate.type) {
      case "text":
        requireBlockText(candidate.data, field, "text", errors);
        break;
      case "image":
        requireBlockText(candidate.data, field, "asset_id", errors);
        requireBlockText(candidate.data, field, "alt", errors);
        break;
      case "callout":
        requireBlockText(candidate.data, field, "heading", errors);
        requireBlockText(candidate.data, field, "body", errors);
        break;
      case "answer":
        requireBlockText(candidate.data, field, "answer", errors);
        break;
      case "steps":
        requireBlockCollection(candidate.data, field, "steps", errors);
        break;
      case "comparison":
        if (!Array.isArray(candidate.data.rows) && !Array.isArray(candidate.data.columns)) {
          errors[`${field}.data`] = ["Comparison blocks need rows or columns."];
        }
        break;
    }
  });
  return errors;
}

function validateMetadata(
  value: unknown,
  field: string,
  errors: ValidationErrors,
  fields: Record<string, number>,
): void {
  if (!isRecord(value)) {
    errors[field] = ["This section is required."];
    return;
  }
  const allowed = new Set([...Object.keys(fields), ...(field === "seo" ? ["structured_data"] : [])]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      errors[`${field}.${key}`] = ["This field is not accepted."];
    }
  }
  for (const [key, maxLength] of Object.entries(fields)) {
    if (typeof value[key] !== "string") {
      errors[`${field}.${key}`] = ["Enter a text value."];
    } else if (value[key].length > maxLength) {
      errors[`${field}.${key}`] = [`Use at most ${maxLength} characters.`];
    }
  }
  if (field === "seo" && value.structured_data !== undefined && !isRecord(value.structured_data)) {
    errors["seo.structured_data"] = ["Structured data must be an object."];
  }
}

function requireString(
  value: Record<string, unknown>,
  field: string,
  minLength: number,
  maxLength: number,
  errors: ValidationErrors,
  trimRequired = false,
): void {
  if (typeof value[field] !== "string") {
    errors[field] = ["Enter a text value."];
    return;
  }
  if (value[field].length < minLength || value[field].length > maxLength) {
    errors[field] = [`Use between ${minLength} and ${maxLength} characters.`];
  } else if (trimRequired && value[field] !== value[field].trim()) {
    errors[field] = ["Remove leading and trailing whitespace."];
  }
}

function optionalString(
  value: Record<string, unknown>,
  field: string,
  minLength: number,
  maxLength: number,
  errors: ValidationErrors,
): void {
  if (value[field] !== undefined) {
    requireString(value, field, minLength, maxLength, errors);
  }
}

function requirePath(value: Record<string, unknown>, errors: ValidationErrors): void {
  if (typeof value.path !== "string") {
    errors.path = ["Enter a path."];
    return;
  }
  if (!/^\/[a-z0-9][a-z0-9/_-]*$/.test(value.path) || value.path.length > 512) {
    errors.path = ["Use a canonical path beginning with /."];
  }
}

function requireBlockText(
  data: Record<string, unknown>,
  field: string,
  key: string,
  errors: ValidationErrors,
): void {
  if (typeof data[key] !== "string" || data[key].trim() === "") {
    errors[`${field}.data.${key}`] = ["Enter visible block content."];
  }
}

function requireBlockCollection(
  data: Record<string, unknown>,
  field: string,
  key: string,
  errors: ValidationErrors,
): void {
  if (!Array.isArray(data[key]) || data[key].length === 0) {
    errors[`${field}.data.${key}`] = ["Add at least one item."];
  }
}

function addErrors(target: ValidationErrors, source: ValidationErrors): void {
  for (const [key, messages] of Object.entries(source)) {
    target[key] = messages;
  }
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
