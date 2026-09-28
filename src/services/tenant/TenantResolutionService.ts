import { ClientTenantSummary } from '../../domain/tenant/types';

export type TenantResolutionSource =
  | 'tenant-hostname'
  | 'custom-domain'
  | 'development'
  | 'platform'
  | 'invitation'
  | 'unknown';

export interface TenantResolutionResult {
  tenantId: string | null;
  source: TenantResolutionSource;
  isPlatform: boolean;
  isUnknownTenant: boolean;
  matchedDomain?: string;
  matchedClient?: ClientTenantSummary | null;
}

export interface ResolveTenantOptions {
  hostname?: string;
  search?: string;
  hash?: string;
  clientsRegistry?: ClientTenantSummary[];
  platformHostnames?: string[];
  isDevelopmentOverride?: boolean;
  viteTenantIdOverride?: string;
}

/**
 * Standard known platform domain aliases / subdomains.
 */
const DEFAULT_PLATFORM_HOSTNAMES = [
  'platform.ateliersaas.com',
  'atelier-platform.vercel.app',
  'auraos.vercel.app',
  'aura-platform.vercel.app',
  'atelierplatform.vercel.app',
];

/**
 * Canonical mappings for production Vercel subdomains to tenant IDs.
 * Used to ensure deterministic resolution even before Firestore clients registry finishes loading.
 */
const CANONICAL_TENANT_HOSTNAME_MAP: Record<string, string> = {
  'khushimakeupart': 'khushi-makeup-arts',
  'khushimakeuparts': 'khushi-makeup-arts',
};

/**
 * Normalizes a hostname or domain string:
 * - strips protocol (http://, https://)
 * - strips port (:3000, :5173)
 * - strips trailing slashes
 * - converts to lowercase and trims
 */
export function normalizeHostname(input: string): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, '')
    .replace(/:\d+$/, '')
    .replace(/\/+$/, '')
    .replace(/^\.+|\.+$/g, '');
}

/**
 * Normalizes a slug or subdomain by stripping hyphens and special characters
 * to allow fuzzy matching (e.g. "fatima-face-arts" matches "fatimafacearts").
 */
export function normalizeSlug(input: string): string {
  if (!input) return '';
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Checks if a hostname represents a local development environment.
 */
export function isDevelopmentHostname(hostname: string): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return true;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('127.') ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.test')
  );
}

/**
 * Retrieves the build-time dedicated tenant ID configured via VITE_TENANT_ID or TENANT_ID.
 * Baked into production Vercel project deployments.
 */
export function getBuildTimeTenantId(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const raw = (import.meta.env as any).VITE_TENANT_ID;
    if (raw && typeof raw === 'string') {
      return raw.trim().toLowerCase();
    }
  }
  if (typeof process !== 'undefined' && process.env) {
    const raw = process.env.VITE_TENANT_ID || process.env.TENANT_ID;
    if (raw && typeof raw === 'string') {
      return raw.trim().toLowerCase();
    }
  }
  return '';
}

/**
 * Checks if a hostname represents the central SaaS platform.
 */
export function isPlatformHostname(hostname: string, customPlatformHosts: string[] = []): boolean {
  const host = normalizeHostname(hostname);
  if (!host) return false;

  // Environment variable override
  const envPlatformHost = typeof import.meta !== 'undefined' && import.meta.env
    ? (import.meta.env.VITE_PLATFORM_HOSTNAME || '')
    : '';
  if (envPlatformHost && normalizeHostname(envPlatformHost) === host) {
    return true;
  }

  // Check custom list
  if (customPlatformHosts.some((h) => normalizeHostname(h) === host)) {
    return true;
  }

  // Check default platform list
  if (DEFAULT_PLATFORM_HOSTNAMES.some((h) => normalizeHostname(h) === host)) {
    return true;
  }

  // Check subdomain keyword pattern for Vercel deployments (e.g. atelier-platform.vercel.app)
  if (host.endsWith('.vercel.app')) {
    const sub = host.slice(0, -'.vercel.app'.length);
    if (sub.includes('platform') || sub === 'auraos' || sub === 'ateliersaas') {
      return true;
    }
  }

  return false;
}

export class TenantResolutionService {
  /**
   * Authoritatively resolves the active tenant and environment type from the current host.
   *
   * Resolution Priority:
   * 0. Onboarding Invitation context (URL has inviteId + token)?
   *    -> Neutral onboarding context (source: 'invitation').
   *       Does NOT bind to the underlying host's tenant storefront.
   * 1. Is this local development (localhost / 127.0.0.1)?
   *    -> Development resolution (permits ?client=, hash, localStorage, with fallback to main tenant).
   * 2. Is this the central platform hostname?
   *    -> Returns source: 'platform', isPlatform: true, tenantId: null.
   * 3. Production Tenant Resolution (STRICT):
   *    a. Registered Custom Domain match in registry -> source: 'custom-domain'
   *    b. Registered Tenant Vercel Subdomain / Slug match -> source: 'tenant-hostname'
   *    c. Canonical Known Tenant Hostname mapping -> source: 'tenant-hostname'
   *    d. UNKNOWN HOSTNAME -> source: 'unknown', isUnknownTenant: true, tenantId: null.
   *       NEVER falls back to Khushi or another tenant in production!
   *       NEVER allows ?client= or localStorage to override an authoritative production hostname!
   */
  resolveTenantFromHost(options: ResolveTenantOptions): TenantResolutionResult {
    const rawHost = options.hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
    const host = normalizeHostname(rawHost);
    const search = options.search || (typeof window !== 'undefined' ? window.location.search : '');
    const hash = options.hash || (typeof window !== 'undefined' ? window.location.hash : '');
    const clients = options.clientsRegistry || [];

    // ─── 0. ONBOARDING INVITATION CONTEXT CHECK ──────────────────────────────
    // When an invitation link is opened (contains both inviteId and token query params),
    // treat the request as a neutral onboarding/invitation flow rather than binding strictly
    // to the underlying host's tenant storefront (e.g. khushimakeupart.vercel.app).
    try {
      const searchParams = new URLSearchParams(search);
      const inviteId = searchParams.get('inviteId')?.trim();
      const token = searchParams.get('token')?.trim();
      if (inviteId && token) {
        // Optional client query parameter hint (for branding/routing hint only, NOT authorization)
        const rawClientHint = searchParams.get('client')?.trim().toLowerCase().replace(/\/+$/, '');
        const matchedClient = rawClientHint ? clients.find((c) => c.id.toLowerCase() === rawClientHint) : null;
        return {
          tenantId: matchedClient ? matchedClient.id : (rawClientHint || null),
          source: 'invitation',
          isPlatform: false,
          isUnknownTenant: false,
          matchedDomain: host,
          matchedClient: matchedClient || null,
        };
      }
    } catch {}

    // ─── 0.5 DEDICATED BUILD-TIME TENANT IDENTITY (VITE_TENANT_ID) ───────────
    // When a Vercel project is deployed for a specific tenant, VITE_TENANT_ID
    // identifies the project authoritatively at build time.
    const isDev = options.isDevelopmentOverride ?? isDevelopmentHostname(host);
    const buildTenantId = options.viteTenantIdOverride !== undefined
      ? options.viteTenantIdOverride.trim().toLowerCase()
      : getBuildTimeTenantId();

    if (buildTenantId && !isDev) {
      const matchedClient = clients.find(
        (c) => c.id.toLowerCase() === buildTenantId ||
          (buildTenantId === 'khushi' && c.id === 'khushi-makeup-arts') ||
          (buildTenantId === 'khushi-makeup-arts' && c.id === 'khushi')
      );
      const resolvedTenantId = matchedClient ? matchedClient.id : buildTenantId;
      return {
        tenantId: resolvedTenantId,
        source: 'tenant-hostname',
        isPlatform: false,
        isUnknownTenant: false,
        matchedDomain: host,
        matchedClient: matchedClient || null,
      };
    }

    // ─── 1. LOCAL DEVELOPMENT RESOLUTION ─────────────────────────────────────
    if (isDev) {
      // Development mode supports ?client=, hash, and localStorage for fast local testing
      // 1. URL search param ?client=
      try {
        const params = new URLSearchParams(search);
        const clientParam = params.get('client')?.trim().toLowerCase().replace(/\/+$/, '');
        if (clientParam) {
          const matched = clients.find((c) => c.id.toLowerCase() === clientParam);
          return {
            tenantId: matched ? matched.id : clientParam,
            source: 'development',
            isPlatform: false,
            isUnknownTenant: false,
            matchedClient: matched || null,
          };
        }
      } catch {}

      // 2. Hash client param e.g. #...?client=... or #/c/...
      if (hash) {
        const hashMatch = hash.match(/[?&]client=([a-z0-9_-]+)/i);
        if (hashMatch && hashMatch[1]) {
          const slug = hashMatch[1].toLowerCase().replace(/\/+$/, '');
          const matched = clients.find((c) => c.id.toLowerCase() === slug);
          return {
            tenantId: matched ? matched.id : slug,
            source: 'development',
            isPlatform: false,
            isUnknownTenant: false,
            matchedClient: matched || null,
          };
        }
        const routeMatch = hash.match(/#\/c\/([a-z0-9_-]+)/i);
        if (routeMatch && routeMatch[1]) {
          const slug = routeMatch[1].toLowerCase().replace(/\/+$/, '');
          const matched = clients.find((c) => c.id.toLowerCase() === slug);
          return {
            tenantId: matched ? matched.id : slug,
            source: 'development',
            isPlatform: false,
            isUnknownTenant: false,
            matchedClient: matched || null,
          };
        }
      }

      // 3. LocalStorage active client
      try {
        if (typeof window !== 'undefined') {
          const stored = (
            localStorage.getItem('platform_active_client_id') ||
            localStorage.getItem('khushi_active_client_id')
          )?.trim().toLowerCase().replace(/\/+$/, '');
          if (stored) {
            const matched = clients.find((c) => c.id.toLowerCase() === stored);
            return {
              tenantId: matched ? matched.id : stored,
              source: 'development',
              isPlatform: false,
              isUnknownTenant: false,
              matchedClient: matched || null,
            };
          }
        }
      } catch {}

      // 4. Default development fallback
      const defaultId = buildTenantId || clients[0]?.id || 'khushi-makeup-arts';
      return {
        tenantId: defaultId,
        source: 'development',
        isPlatform: false,
        isUnknownTenant: false,
        matchedClient: clients.find((c) => c.id === defaultId) || clients[0] || null,
      };
    }

    // ─── 2. CENTRAL PLATFORM HOSTNAME CHECK ──────────────────────────────────
    if (isPlatformHostname(host, options.platformHostnames)) {
      return {
        tenantId: null,
        source: 'platform',
        isPlatform: true,
        isUnknownTenant: false,
        matchedDomain: host,
        matchedClient: null,
      };
    }

    // ─── 3. PRODUCTION TENANT RESOLUTION (STRICT) ────────────────────────────
    // In production, neither ?client= nor localStorage is allowed to override the hostname!

    // Step A: Exact Custom Domain Match against registered clients
    if (clients.length > 0) {
      for (const client of clients) {
        if (client.customDomain) {
          const normalizedCustom = normalizeHostname(client.customDomain);
          if (normalizedCustom && normalizedCustom === host) {
            return {
              tenantId: client.id,
              source: 'custom-domain',
              isPlatform: false,
              isUnknownTenant: false,
              matchedDomain: client.customDomain,
              matchedClient: client,
            };
          }
        }
      }
    }

    // Step B: Vercel Subdomain / Hostname Resolution (e.g. *.vercel.app)
    let subdomain = '';
    if (host.endsWith('.vercel.app')) {
      subdomain = host.slice(0, -'.vercel.app'.length);
    } else {
      const parts = host.split('.');
      if (parts.length >= 3 && parts[0] !== 'www') {
        subdomain = parts[0];
      }
    }

    if (subdomain) {
      // 1. Direct match with client.id
      const directMatch = clients.find((c) => c.id.toLowerCase() === subdomain);
      if (directMatch) {
        return {
          tenantId: directMatch.id,
          source: 'tenant-hostname',
          isPlatform: false,
          isUnknownTenant: false,
          matchedDomain: host,
          matchedClient: directMatch,
        };
      }

      // 2. De-hyphenated match (e.g. "fatima-face-arts" matches "fatimafacearts")
      const normSub = normalizeSlug(subdomain);
      const dehyphenMatch = clients.find((c) => normalizeSlug(c.id) === normSub);
      if (dehyphenMatch) {
        return {
          tenantId: dehyphenMatch.id,
          source: 'tenant-hostname',
          isPlatform: false,
          isUnknownTenant: false,
          matchedDomain: host,
          matchedClient: dehyphenMatch,
        };
      }

      // 3. Custom domain prefix match
      const customPrefixMatch = clients.find((c) => {
        if (!c.customDomain) return false;
        const normCustom = normalizeHostname(c.customDomain);
        return normCustom === host || normCustom.startsWith(`${subdomain}.`);
      });
      if (customPrefixMatch) {
        return {
          tenantId: customPrefixMatch.id,
          source: 'tenant-hostname',
          isPlatform: false,
          isUnknownTenant: false,
          matchedDomain: host,
          matchedClient: customPrefixMatch,
        };
      }

      // 4. Canonical tenant hostname mapping (guarantees resolution for primary tenants)
      if (CANONICAL_TENANT_HOSTNAME_MAP[subdomain] || CANONICAL_TENANT_HOSTNAME_MAP[normSub]) {
        const canonicalId = CANONICAL_TENANT_HOSTNAME_MAP[subdomain] || CANONICAL_TENANT_HOSTNAME_MAP[normSub];
        // If a client exists in registry with matching canonicalId or legacy 'khushi', align to that record
        const registryClient = clients.find(
          (c) => c.id === canonicalId || (canonicalId === 'khushi-makeup-arts' && c.id === 'khushi')
        );
        const resolvedId = registryClient ? registryClient.id : canonicalId;
        return {
          tenantId: resolvedId,
          source: 'tenant-hostname',
          isPlatform: false,
          isUnknownTenant: false,
          matchedDomain: host,
          matchedClient: registryClient || null,
        };
      }
    }

    // ─── 4. UNKNOWN HOSTNAME (SAFE UNKNOWN STATE) ───────────────────────────
    // Critical: Do NOT default to Khushi. Do NOT check localStorage. Do NOT check ?client=.
    return {
      tenantId: null,
      source: 'unknown',
      isPlatform: false,
      isUnknownTenant: true,
      matchedDomain: host,
      matchedClient: null,
    };
  }
}

export const tenantResolutionService = new TenantResolutionService();
