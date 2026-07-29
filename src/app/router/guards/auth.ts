export function requireAuthentication(
  authenticated: boolean,
  returnTo: string,
): true | { name: "login"; query: { returnTo: string } } {
  if (authenticated) {
    return true;
  }
  return {
    name: "login",
    query: { returnTo: safeReturnPath(returnTo) },
  };
}

function safeReturnPath(value: string): string {
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.length > 2_048
  ) {
    return "/";
  }
  return value;
}
