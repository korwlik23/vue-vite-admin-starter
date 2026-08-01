export interface AdminModule {
  id: string;
  activate(): void;
}

export const moduleManifest: readonly AdminModule[] = [
  { id: "operations", activate: () => undefined },
  { id: "authorization", activate: () => undefined },
  { id: "localization", activate: () => undefined },
];
