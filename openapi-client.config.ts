export const openAPIClientConfig = {
  input: ".contracts/admin.openapi.yaml",
  schemaOutput: "src/generated/api/schema.ts",
  metadataOutput: "src/generated/api/contract.meta.json",
} as const;
