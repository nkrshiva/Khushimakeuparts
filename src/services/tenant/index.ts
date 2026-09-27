export {
  TenantService,
  tenantService,
  type TenantResolution,
} from './TenantService';

export {
  TenantResolutionService,
  tenantResolutionService,
  type TenantResolutionSource,
  type TenantResolutionResult,
  type ResolveTenantOptions,
  normalizeHostname,
  normalizeSlug,
  isDevelopmentHostname,
  isPlatformHostname,
} from './TenantResolutionService';
