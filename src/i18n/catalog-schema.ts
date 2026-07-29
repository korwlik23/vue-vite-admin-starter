export type Catalog = Readonly<Record<string, string>>;

const categoryPattern = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;
const keyPattern =
  /^[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*(?:\.[a-z][a-z0-9]*(?:[_-][a-z0-9]+)*)*$/;

export function parseCatalogCategory(value: string): string {
  if (
    value.length > 64 ||
    !categoryPattern.test(value) ||
    hasPrototypeSegment(value)
  ) {
    throw new Error("Invalid catalog category");
  }
  return value;
}

export function parseCatalog(value: unknown): Catalog {
  if (!isRecord(value)) {
    throw new Error("Invalid translation catalog");
  }
  const result: Record<string, string> = Object.create(null);
  for (const [key, translation] of Object.entries(value)) {
    if (
      key.length > 255 ||
      !keyPattern.test(key) ||
      hasPrototypeSegment(key) ||
      typeof translation !== "string" ||
      translation.length < 1 ||
      translation.length > 16_384
    ) {
      throw new Error("Invalid translation catalog");
    }
    result[key] = translation;
  }
  return Object.freeze(result);
}

function hasPrototypeSegment(value: string): boolean {
  return value
    .split(/[._-]/)
    .some((segment) => segment === "prototype" || segment === "constructor");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
