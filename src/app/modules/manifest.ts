export interface AdminModule {
  id: string;
  activate(): void;
}

export const moduleManifest: readonly AdminModule[] = [
  { id: "identity", activate: () => undefined },
  { id: "accounts", activate: () => undefined },
  { id: "audit", activate: () => undefined },
  { id: "operations", activate: () => undefined },
  { id: "authorization", activate: () => undefined },
  { id: "localization", activate: () => undefined },
];
