/**
 * Admin Security & Role Configuration
 *
 * ROLES:
 * 1. 'developer' (SaaS Platform Super Admin):
 *    - Has full access to all client tenant websites, SaaS Master Cockpit, and lifecycle management.
 *    - Authority is grounded strictly in Firestore `/users/{uid}.role === 'developer'` or custom auth claims.
 *
 * 2. 'client' (Salon Owner / Makeup Artist / Tenant Admin):
 *    - Has access strictly to customize their own assigned website.
 *    - Restricted from viewing or managing other client websites.
 *    - URL parameter and localStorage tampering are strictly rejected.
 */

import type { ActiveTenantRole } from '../domain/tenant/types';

export interface AdminAccountConfig {
  email: string;
  role: ActiveTenantRole;
  label: string;
  clientId?: string;
}

export const MASTER_ADMIN_EMAIL = 'naveen.kr.shiva@gmail.com';

// Authoritative Master Developer identity (Naveen.kr.shiva@gmail.com only)
export const PLATFORM_BOOTSTRAP_DEVELOPER_EMAILS: string[] = [
  MASTER_ADMIN_EMAIL,
];

export const isBootstrapDeveloperEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return cleanEmail === MASTER_ADMIN_EMAIL;
};
