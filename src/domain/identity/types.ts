import type { TenantLifecycleStatus } from '../tenant/types';

/**
 * Authoritative Identity Classification
 */
export type IdentityType =
  | 'MASTER_PLATFORM_ADMIN'
  | 'TENANT_OWNER'
  | 'TENANT_EMPLOYEE'
  | 'NO_WORKSPACE'
  | 'UNAUTHENTICATED';

/**
 * Master Platform Administrator Identity
 * Authoritative platform-level authority (strictly naveen.kr.shiva@gmail.com).
 */
export interface PlatformAdminIdentity {
  type: 'MASTER_PLATFORM_ADMIN';
  uid: string;
  email: string;
  name?: string;
}

/**
 * Tenant Owner Identity
 * Authoritative administrator of strictly ONE tenant site.
 */
export interface TenantOwnerIdentity {
  type: 'TENANT_OWNER';
  uid: string;
  email: string;
  tenantId: string;
  tenantName?: string;
  tenantStatus?: TenantLifecycleStatus;
}

/**
 * Tenant Employee Identity
 * Subordinate member belonging to strictly ONE tenant with owner-delegated permissions.
 */
export interface TenantEmployeeIdentity {
  type: 'TENANT_EMPLOYEE';
  uid: string;
  email: string;
  tenantId: string;
  employeeId: string;
  permissions: string[];
  tenantName?: string;
  staffRole?: string;
}

/**
 * No Workspace Reason
 */
export type NoWorkspaceReason =
  | 'UNASSIGNED'
  | 'TENANT_SUSPENDED'
  | 'TENANT_NOT_FOUND'
  | 'INACTIVE_ACCOUNT';

/**
 * Authenticated User with No Workspace
 * Authenticated via Firebase Auth, but possesses no active authorized tenant assignment.
 */
export interface NoWorkspaceIdentity {
  type: 'NO_WORKSPACE';
  uid: string;
  email: string;
  reason: NoWorkspaceReason;
  tenantId?: string | null;
}

/**
 * Unauthenticated Identity
 */
export interface UnauthenticatedIdentity {
  type: 'UNAUTHENTICATED';
}

/**
 * Discriminated Union of Authoritative Identities
 */
export type ResolvedIdentity =
  | PlatformAdminIdentity
  | TenantOwnerIdentity
  | TenantEmployeeIdentity
  | NoWorkspaceIdentity
  | UnauthenticatedIdentity;

/**
 * Authorized Destinations
 */
export type ResolvedDestination =
  | 'MASTER_ADMIN'
  | 'TENANT_ADMIN'
  | 'EMPLOYEE_WORKSPACE'
  | 'NO_WORKSPACE'
  | 'EMAIL_VERIFICATION'
  | 'AUTHENTICATION_REQUIRED';

/**
 * Full Identity Resolution Result
 */
export interface IdentityResolutionResult {
  identity: ResolvedIdentity;
  destination: ResolvedDestination;
  requiresEmailVerification: boolean;
  emailVerified: boolean;
  redirectPath: string;
}

/**
 * Framework-independent User Auth Input
 */
export interface AuthUserInput {
  uid: string;
  email?: string | null;
  emailVerified?: boolean;
}
