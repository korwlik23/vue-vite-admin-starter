import type { components } from "@/generated/api/schema";
import type { APIClient } from "@/shared/api/client";
import { errorFromResponse } from "@/shared/api/errors";

export type Role = components["schemas"]["RoleResponse"];
export type RoleList = components["schemas"]["RoleListResponse"];
export type RolePermissions = components["schemas"]["RolePermissionListResponse"];
export type RoleAssignments = components["schemas"]["RoleAssignmentListResponse"];
type CreateRoleRequest = components["schemas"]["CreateRoleRequest"];
type UpdateRoleRequest = components["schemas"]["UpdateRoleRequest"];
type RoleAssignmentRequest = components["schemas"]["RoleAssignmentRequest"];
type RoleRevokeRequest = components["schemas"]["RoleRevokeRequest"];

export interface RoleListQuery {
  scope?: "system" | "account";
  accountId?: string;
  page?: number;
  perPage?: number;
}

export interface RoleAssignmentListQuery {
  page?: number;
  perPage?: number;
}

export async function listRoles(
  client: APIClient,
  query: RoleListQuery = {},
): Promise<RoleList> {
  const parameters = new URLSearchParams();
  if (query.scope !== undefined) parameters.set("scope", query.scope);
  if (query.accountId !== undefined) parameters.set("account_id", query.accountId);
  if (query.page !== undefined) parameters.set("page", String(query.page));
  if (query.perPage !== undefined) parameters.set("per_page", String(query.perPage));
  const suffix = parameters.toString();
  const response = await client.request(
    `/authorization/roles${suffix === "" ? "" : `?${suffix}`}`,
  );
  return readJSON(response, "role list", isRoleListResponse);
}

export async function createRole(
  client: APIClient,
  input: CreateRoleRequest,
): Promise<Role> {
  const response = await client.request("/authorization/roles", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return readJSON(response, "role", isRoleResponse);
}

export async function updateRole(
  client: APIClient,
  roleID: string,
  input: UpdateRoleRequest,
): Promise<Role> {
  const response = await client.request(
    `/authorization/roles/${encodeURIComponent(roleID)}`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return readJSON(response, "role", isRoleResponse);
}

export async function listRolePermissions(
  client: APIClient,
  roleID: string,
): Promise<RolePermissions> {
  const response = await client.request(
    `/authorization/roles/${encodeURIComponent(roleID)}/permissions`,
  );
  return readJSON(response, "role permission list", isRolePermissionsResponse);
}

export async function listRoleAssignments(
  client: APIClient,
  roleID: string,
  query: RoleAssignmentListQuery = {},
): Promise<RoleAssignments> {
  const parameters = new URLSearchParams();
  if (query.page !== undefined) parameters.set("page", String(query.page));
  if (query.perPage !== undefined) parameters.set("per_page", String(query.perPage));
  const suffix = parameters.toString();
  const response = await client.request(
    `/authorization/roles/${encodeURIComponent(roleID)}/assignments${suffix === "" ? "" : `?${suffix}`}`,
  );
  return readJSON(response, "role assignment list", isRoleAssignmentsResponse);
}

export async function assignRole(
  client: APIClient,
  roleID: string,
  input: RoleAssignmentRequest,
): Promise<components["schemas"]["RoleAssignmentResponse"]> {
  const response = await client.request(
    `/authorization/roles/${encodeURIComponent(roleID)}/assignments`,
    { method: "POST", body: JSON.stringify(input) },
  );
  return readJSON(response, "role assignment", isRoleAssignmentResponse);
}

export async function revokeRole(
  client: APIClient,
  assignmentID: string,
  input: RoleRevokeRequest,
): Promise<components["schemas"]["RoleRevokeResponse"]> {
  const response = await client.request(
    `/authorization/assignments/${encodeURIComponent(assignmentID)}`,
    { method: "DELETE", body: JSON.stringify(input) },
  );
  return readJSON(response, "role revocation", isRoleRevokeResponse);
}

async function readJSON<T>(
  response: Response,
  label: string,
  guard: (value: unknown) => value is T,
): Promise<T> {
  if (!response.ok) {
    throw await errorFromResponse(response);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid ${label} response`);
  }
  if (!guard(body)) {
    throw new Error(`Invalid ${label} response`);
  }
  return body;
}

function isRoleListResponse(value: unknown): value is RoleList {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isRoleResponse) &&
    isPageInfo(value.page)
  );
}

function isRoleResponse(value: unknown): value is Role {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id !== "" &&
    (value.owner_type === "system" || value.owner_type === "account") &&
    validRoleAccountID(value.owner_type, value.account_id) &&
    typeof value.name === "string" &&
    value.name !== "" &&
    isPositiveNumber(value.version) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function isRolePermissionsResponse(value: unknown): value is RolePermissions {
  return (
    isRecord(value) &&
    typeof value.role_id === "string" &&
    value.role_id !== "" &&
    isPositiveNumber(value.role_version) &&
    Array.isArray(value.items) &&
    value.items.every(isRolePermission)
  );
}

function isRolePermission(value: unknown): value is RolePermissions["items"][number] {
  return (
    isRecord(value) &&
    typeof value.permission_key === "string" &&
    value.permission_key !== "" &&
    typeof value.active === "boolean" &&
    typeof value.delegable === "boolean" &&
    (value.tier === "core" || value.tier === "default" || value.tier === "optional")
  );
}

function isRoleAssignmentsResponse(value: unknown): value is RoleAssignments {
  return (
    isRecord(value) &&
    Array.isArray(value.items) &&
    value.items.every(isRoleAssignment) &&
    isPageInfo(value.page)
  );
}

function isRoleAssignment(value: unknown): value is RoleAssignments["items"][number] {
  return (
    isRecord(value) &&
    typeof value.assignment_id === "string" &&
    value.assignment_id !== "" &&
    typeof value.role_id === "string" &&
    value.role_id !== "" &&
    (value.scope === "system" || value.scope === "account") &&
    validAssignmentAccountID(value.scope, value.account_id) &&
    typeof value.user_id === "string" &&
    value.user_id !== "" &&
    typeof value.created_at === "string"
  );
}

function validRoleAccountID(
  ownerType: unknown,
  accountID: unknown,
): accountID is string | null | undefined {
  if (ownerType === "account") {
    return typeof accountID === "string" && accountID !== "";
  }
  return accountID === undefined || accountID === null;
}

function validAssignmentAccountID(
  scope: unknown,
  accountID: unknown,
): accountID is string | null | undefined {
  if (scope === "account") {
    return typeof accountID === "string" && accountID !== "";
  }
  return accountID === undefined || accountID === null;
}

function isRoleAssignmentResponse(
  value: unknown,
): value is components["schemas"]["RoleAssignmentResponse"] {
  return (
    isRecord(value) &&
    typeof value.assignment_id === "string" &&
    typeof value.role_id === "string" &&
    isPositiveNumber(value.version) &&
    isNonNegativeNumber(value.affected_principals) &&
    isSessionInvalidationOutcome(value.session_outcome)
  );
}

function isRoleRevokeResponse(
  value: unknown,
): value is components["schemas"]["RoleRevokeResponse"] {
  return (
    isRecord(value) &&
    typeof value.assignment_id === "string" &&
    value.revoked === true &&
    isPositiveNumber(value.version) &&
    isNonNegativeNumber(value.affected_principals) &&
    isSessionInvalidationOutcome(value.session_outcome)
  );
}

function isSessionInvalidationOutcome(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.current_principal === "unchanged" || value.current_principal === "rotated") &&
    (value.other_principals === "unchanged" || value.other_principals === "invalidated")
  );
}

function isPageInfo(value: unknown): value is components["schemas"]["PageInfo"] {
  return (
    isRecord(value) &&
    isPositiveNumber(value.page) &&
    isPositiveNumber(value.per_page) &&
    isNonNegativeNumber(value.total_items) &&
    isNonNegativeNumber(value.total_pages)
  );
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
