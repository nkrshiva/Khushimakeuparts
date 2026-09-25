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

export interface AdminAccountConfig {
  email: string;
  role: 'developer' | 'client';
  label: string;
  clientId?: string;
}

// Platform bootstrap developer emails (default + environment variable)
export const PLATFORM_BOOTSTRAP_DEVELOPER_EMAILS: string[] = [
  'admin@khushimakeup.com',
  ...((typeof import.meta !== 'undefined' && import.meta.env?.VITE_PLATFORM_DEVELOPER_EMAILS) || '')
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean),
];

export const isBootstrapDeveloperEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();
  return PLATFORM_BOOTSTRAP_DEVELOPER_EMAILS.includes(cleanEmail);
};
