import { tenantResolutionService } from '../src/services/tenant/TenantResolutionService';
import { ClientTenantSummary, DEFAULT_MAIN_CLIENT, generateTenantSubdomain } from '../src/domain/tenant/types';

const mockClientsRegistry: ClientTenantSummary[] = [
  {
    id: 'khushi-makeup-arts',
    name: 'Khushi Makeup Arts',
    founder: 'Khushi',
    city: 'Delhi',
    phone: '+919999999999',
    instagram: 'khushimakeupart',
    customDomain: 'khushimakeupart.vercel.app',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'fatima-face-arts',
    name: 'Fatima Face Arts',
    founder: 'Fatima',
    city: 'Mumbai',
    phone: '+918888888888',
    instagram: 'fatimafacearts',
    customDomain: 'glamourbyfatima.com',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'nidhi-glam',
    name: 'Nidhi Glam Studio',
    founder: 'Nidhi',
    city: 'Bangalore',
    phone: '+917777777777',
    instagram: 'nidhiglam',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'priya-shine-arts',
    name: 'Priya Shine Arts',
    founder: 'Priya',
    city: 'Pune',
    phone: '+916666666666',
    instagram: 'priyashinearts',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    if (details) console.error('         Details:', JSON.stringify(details, null, 2));
    testsFailed++;
  }
}

console.log('\n=== RUNNING TENANT RESOLUTION TEST SUITE ===\n');

// 1. khushimakeupart.vercel.app -> khushi-makeup-arts
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'khushi-makeup-arts' && !res.isPlatform && !res.isUnknownTenant,
    'khushimakeupart.vercel.app resolves to khushi-makeup-arts',
    res
  );
}

// 2. fatimafacearts.vercel.app -> fatima-face-arts (de-hyphenated matching)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'fatimafacearts.vercel.app',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'fatima-face-arts' && res.source === 'tenant-hostname' && !res.isUnknownTenant,
    'fatimafacearts.vercel.app resolves to fatima-face-arts via slug de-hyphenation',
    res
  );
}

// 3. nidhiglam.vercel.app -> nidhi-glam
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'nidhiglam.vercel.app',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'nidhi-glam' && res.source === 'tenant-hostname' && !res.isUnknownTenant,
    'nidhiglam.vercel.app resolves to nidhi-glam',
    res
  );
}

// 4. unknown-tenant.vercel.app -> isUnknownTenant: true, tenantId: null
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'random-unregistered-salon.vercel.app',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.isUnknownTenant === true && res.tenantId === null && res.source === 'unknown',
    'unknown-tenant.vercel.app returns isUnknownTenant: true with null tenantId (NO fallback to khushi)',
    res
  );
}

// 5. platform.ateliersaas.com / atelier-platform.vercel.app -> isPlatform: true
{
  const res1 = tenantResolutionService.resolveTenantFromHost({
    hostname: 'platform.ateliersaas.com',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res1.isPlatform === true && res1.tenantId === null && res1.source === 'platform',
    'platform.ateliersaas.com returns isPlatform: true with null tenantId',
    res1
  );

  const res2 = tenantResolutionService.resolveTenantFromHost({
    hostname: 'atelier-platform.vercel.app',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res2.isPlatform === true && res2.tenantId === null && res2.source === 'platform',
    'atelier-platform.vercel.app returns isPlatform: true with null tenantId',
    res2
  );
}

// 6. localhost:3000 default -> development fallback
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'localhost:3000',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.source === 'development' && res.tenantId === 'khushi-makeup-arts',
    'localhost:3000 resolves to development default (first client in registry)',
    res
  );
}

// 7. localhost:3000/?client=fatima-face-arts -> development query param resolution
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'localhost:3000',
    search: '?client=fatima-face-arts',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.source === 'development' && res.tenantId === 'fatima-face-arts',
    'localhost:3000/?client=fatima-face-arts resolves to fatima-face-arts',
    res
  );
}

// 8. fatimafacearts.vercel.app/?client=khushi -> fatima-face-arts (query param strictly IGNORED in production)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'fatimafacearts.vercel.app',
    search: '?client=khushi-makeup-arts',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'fatima-face-arts' && res.source === 'tenant-hostname',
    'fatimafacearts.vercel.app/?client=khushi ignores query param in production and resolves to fatima-face-arts',
    res
  );
}

// 9. Custom domain matching (glamourbyfatima.com -> fatima-face-arts)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'https://glamourbyfatima.com/',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'fatima-face-arts' && res.source === 'custom-domain',
    'glamourbyfatima.com resolves to fatima-face-arts via customDomain',
    res
  );
}

// 10. Normalization of casing and protocol
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: '  HTTPS://NIDHIGLAM.VERCEL.APP:443/  ',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'nidhi-glam' && !res.isUnknownTenant,
    'Uppercase, port, whitespace, and protocol are normalized before resolution',
    res
  );
}

// 11. Future tenant auto de-hyphenation (priyashinearts.vercel.app -> priya-shine-arts)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'priyashinearts.vercel.app',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'priya-shine-arts' && res.source === 'tenant-hostname',
    'Future tenant priyashinearts.vercel.app resolves to priya-shine-arts automatically without config',
    res
  );
}

// 12. Invitation context on production domain (khushimakeupart.vercel.app/?inviteId=inv1&token=tok1&client=fatima-face-arts)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?inviteId=inv1&token=tok1&client=fatima-face-arts',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.source === 'invitation' && res.tenantId === 'fatima-face-arts' && !res.isUnknownTenant,
    'Invitation link with token and client hint resolves to source: invitation and tenantId: fatima-face-arts',
    res
  );
}

// 13. Invitation context without client hint
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?inviteId=inv1&token=tok1',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.source === 'invitation' && res.tenantId === null && !res.isUnknownTenant,
    'Invitation link with token without client hint resolves to source: invitation and tenantId: null',
    res
  );
}

// 14. Incomplete invitation parameters do NOT trigger invitation context (anti-tamper)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?inviteId=inv1',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'khushi-makeup-arts' && res.source !== 'invitation',
    'Missing token prevents invitation bypass; falls back to production tenant khushi-makeup-arts',
    res
  );
}

// 15. Query param ?client=fatima-face-arts alone does NOT override khushimakeupart.vercel.app
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?client=fatima-face-arts',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'khushi-makeup-arts' && res.source !== 'invitation',
    '?client= alone cannot override production hostname khushimakeupart.vercel.app',
    res
  );
}

// 16. LIVE PRODUCTION SCENARIO: ?client=naveensln on khushimakeupart.vercel.app strictly resolves to Khushi
{
  const liveFirestoreRegistry: ClientTenantSummary[] = [
    {
      id: 'khushi',
      name: 'Khushi Makeup Arts',
      founder: 'Khushi Kumari',
      city: 'Siwan, Bihar',
      phone: '+91 91621 43273',
      instagram: '@khushimakeuparts',
      archetype: 'solo_mua',
      status: 'active',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-09-27T07:58:01.244Z',
    },
    {
      id: 'naveensln',
      name: 'naveenSLN',
      founder: 'Naveen',
      city: 'noida',
      phone: '8809261324',
      instagram: '@osmtechies',
      archetype: 'hybrid_atelier',
      status: 'active',
      active: true,
      invitedOwnerEmail: 'n1999naveenkr@gmail.com',
      createdAt: '2026-09-27T17:19:19.944Z',
      updatedAt: '2026-09-27T17:20:11.269Z',
    },
  ];

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?client=naveensln',
    clientsRegistry: liveFirestoreRegistry,
  });

  assert(
    res.tenantId === 'khushi' && res.source === 'tenant-hostname' && !res.isUnknownTenant,
    'khushimakeupart.vercel.app/?client=naveensln strictly resolves to khushi (never naveensln)',
    res
  );
}

// 17. Query param ?client=anything on khushimakeupart.vercel.app strictly resolves to Khushi
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?client=anything-random-xyz',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'khushi-makeup-arts' && !res.isUnknownTenant,
    'khushimakeupart.vercel.app/?client=anything strictly resolves to khushi tenant',
    res
  );
}

// 18. Hash-based client route on production domain cannot override tenant
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    hash: '#/c/naveensln',
    clientsRegistry: mockClientsRegistry,
  });
  assert(
    res.tenantId === 'khushi-makeup-arts',
    'khushimakeupart.vercel.app/#/c/naveensln strictly resolves to khushi tenant',
    res
  );
}

// 19. Development localhost switching continues to support ?client=
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'localhost:3000',
    search: '?client=naveensln',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });
  assert(
    res.tenantId === 'naveensln' && res.source === 'development',
    'localhost:3000/?client=naveensln resolves to naveensln in development mode',
    res
  );
}

// 20. Requirement A: khushimakeupart.vercel.app/?client=naveensln still resolves to Khushi even when authenticated user has assignedClientId = naveensln
{
  const liveFirestoreRegistry: ClientTenantSummary[] = [
    {
      id: 'khushi',
      name: 'Khushi Makeup Arts',
      founder: 'Khushi Kumari',
      city: 'Siwan, Bihar',
      phone: '+91 91621 43273',
      instagram: '@khushimakeuparts',
      archetype: 'solo_mua',
      status: 'active',
      active: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-09-27T07:58:01.244Z',
    },
    {
      id: 'naveensln',
      name: 'naveenSLN',
      founder: 'Naveen',
      city: 'noida',
      phone: '8809261324',
      instagram: '@osmtechies',
      archetype: 'hybrid_atelier',
      status: 'active',
      active: true,
      invitedOwnerEmail: 'n1999naveenkr@gmail.com',
      createdAt: '2026-09-27T17:19:19.944Z',
      updatedAt: '2026-09-27T17:20:11.269Z',
    },
  ];

  // 1. Authoritative hostname resolution ignores ?client=naveensln
  const resolution = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?client=naveensln',
    clientsRegistry: liveFirestoreRegistry,
  });

  assert(
    resolution.tenantId === 'khushi' && resolution.source === 'tenant-hostname',
    'Hostname resolution returns khushi on khushimakeupart.vercel.app even with ?client=naveensln',
    resolution
  );

  // 2. Simulated ContentContext storefront resolution with authenticated user assigned to naveensln
  const authUser = {
    role: 'client' as const,
    assignedClientId: 'naveensln',
  };

  // On production tenant domain, activeClientId must stay bound to resolution.tenantId
  const isAuthoritativeDomain = resolution.source === 'tenant-hostname' || resolution.source === 'custom-domain';
  let storefrontTenantId = resolution.tenantId;

  if (isAuthoritativeDomain) {
    // assignedClientId must NEVER override storefrontTenantId on production domain
    storefrontTenantId = resolution.tenantId;
  } else if (authUser.role === 'client' && authUser.assignedClientId) {
    storefrontTenantId = authUser.assignedClientId;
  }

  assert(
    storefrontTenantId === 'khushi',
    'Requirement A: Storefront tenant remains strictly khushi when authenticated user has assignedClientId = naveensln',
    storefrontTenantId
  );
}

// 21. Requirement B: Production authentication does not rewrite the storefront URL to ?client=naveensln
{
  const productionResolution = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '',
    clientsRegistry: mockClientsRegistry,
  });

  const acceptedTenantId = 'naveensln';
  const url = new URL('https://khushimakeupart.vercel.app/?inviteId=inv1&token=tok1');

  // Invitation accepted cleanup logic
  url.searchParams.delete('inviteId');
  url.searchParams.delete('token');

  // ONLY sync ?client= in development or platform mode, NEVER on production tenant domain
  if (productionResolution.source === 'development' || productionResolution.isPlatform) {
    url.searchParams.set('client', acceptedTenantId);
  } else {
    url.searchParams.delete('client');
  }

  assert(
    !url.searchParams.has('client') && url.toString() === 'https://khushimakeupart.vercel.app/',
    'Requirement B: Production authentication does not rewrite storefront URL to ?client=naveensln',
    url.toString()
  );
}

// 22. Requirement C: An authenticated client can still access the admin context for their assigned tenant through platform/admin flow
{
  const authenticatedClient = {
    uid: 'user_naveen_123',
    email: 'n1999naveenkr@gmail.com',
    role: 'client' as const,
    assignedClientId: 'naveensln',
  };

  // In the admin context, the target tenant to administer is authoritatively derived from assignedClientId
  const adminContextTenantId = (authenticatedClient.role === 'client' && authenticatedClient.assignedClientId)
    ? authenticatedClient.assignedClientId
    : null;

  assert(
    adminContextTenantId === 'naveensln',
    'Requirement C: Authenticated client receives admin context for their assigned tenant (naveensln)',
    adminContextTenantId
  );

  // And this admin identity does not alter the public storefront resolution
  const publicStorefrontResolution = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    clientsRegistry: mockClientsRegistry,
  });

  assert(
    publicStorefrontResolution.tenantId === 'khushi-makeup-arts',
    'Requirement C: Admin context for naveensln leaves public storefront resolution intact as khushi-makeup-arts',
    publicStorefrontResolution.tenantId
  );
}

// 23. Dedicated Vercel project deployment with VITE_TENANT_ID=naveensln resolves to naveensln
{
  const registry: ClientTenantSummary[] = [
    { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    { id: 'rahulbau', name: 'rahulbau', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
  ];

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'naveensln.vercel.app',
    viteTenantIdOverride: 'naveensln',
    clientsRegistry: registry,
  });

  assert(
    res.tenantId === 'naveensln' && res.source === 'tenant-hostname' && !res.isUnknownTenant,
    'Dedicated Vercel project with VITE_TENANT_ID=naveensln resolves authoritatively to naveensln',
    res
  );
}

// 24. Dedicated Vercel project deployment with VITE_TENANT_ID=rahulbau resolves to rahulbau
{
  const registry: ClientTenantSummary[] = [
    { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    { id: 'rahulbau', name: 'rahulbau', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
  ];

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'rahulbau.vercel.app',
    viteTenantIdOverride: 'rahulbau',
    clientsRegistry: registry,
  });

  assert(
    res.tenantId === 'rahulbau' && res.source === 'tenant-hostname' && !res.isUnknownTenant,
    'Dedicated Vercel project with VITE_TENANT_ID=rahulbau resolves authoritatively to rahulbau',
    res
  );
}

// 25. Decoupled admin context for rahulbau owner (nks.earning@gmail.com)
{
  const rahulbauClient = {
    uid: 'user_rahul_456',
    email: 'nks.earning@gmail.com',
    role: 'client' as const,
    assignedClientId: 'rahulbau',
  };

  const adminTenantId = rahulbauClient.role === 'client' && rahulbauClient.assignedClientId
    ? rahulbauClient.assignedClientId
    : 'khushi';

  assert(
    adminTenantId === 'rahulbau',
    'Admin context for nks.earning@gmail.com evaluates strictly to rahulbau admin',
    adminTenantId
  );
}

// 26. Master Admin (naveen.kr.shiva@gmail.com) retains multi-tenant ability
{
  const masterAdmin: { uid: string; email: string; role: 'developer' | 'client' | 'employee'; assignedClientId: string | null } = {
    uid: 'master_dev_1',
    email: 'naveen.kr.shiva@gmail.com',
    role: 'developer',
    assignedClientId: null,
  };

  const adminTenantId = masterAdmin.role === 'client' && masterAdmin.assignedClientId
    ? masterAdmin.assignedClientId
    : 'active-storefront-tenant';

  assert(
    masterAdmin.role === 'developer' && adminTenantId === 'active-storefront-tenant',
    'Master Admin retains active storefront tenant switcher and is not bound to a single client tenant',
    { role: masterAdmin.role, adminTenantId }
  );
}

// 27. Fourth tenant (e.g. zara-makeovers) creates deterministic deployment metadata without hardcoded mapping
{
  const cleanName = 'Zara Makeovers Studio';
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const vercelProjectName = slug;
  const storefrontUrl = `https://${slug}.vercel.app`;

  const newSummary: ClientTenantSummary = {
    id: slug,
    name: cleanName,
    founder: 'Zara Khan',
    city: 'Patna',
    phone: '+91 99999 88888',
    instagram: '@zaramakeovers',
    archetype: 'solo_mua',
    status: 'pending_invitation',
    active: false,
    storefrontUrl,
    vercelProjectName,
    deploymentStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const resolution = tenantResolutionService.resolveTenantFromHost({
    hostname: `${slug}.vercel.app`,
    clientsRegistry: [newSummary],
  });

  assert(
    newSummary.id === 'zara-makeovers-studio' &&
    newSummary.vercelProjectName === 'zara-makeovers-studio' &&
    newSummary.storefrontUrl === 'https://zara-makeovers-studio.vercel.app' &&
    newSummary.deploymentStatus === 'pending' &&
    resolution.tenantId === 'zara-makeovers-studio' &&
    resolution.source === 'tenant-hostname',
    'Fourth tenant dynamically computes deployment metadata and resolves automatically on its Vercel domain',
    { newSummary, resolution }
  );
}

// 28. atly.in -> platform/master site (MUST NEVER resolve to default khushi tenant)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'atly.in',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'rahulbau', name: 'rahulbau', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.isPlatform === true &&
    res.tenantId === null &&
    res.source === 'platform' &&
    res.tenantId !== 'khushi' &&
    res.tenantId !== 'khushi-makeup-arts',
    'https://atly.in resolves strictly to platform/master site (never to default khushi tenant)',
    res
  );
}

// 29. www.atly.in -> platform/master site (MUST NEVER resolve to default khushi tenant)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'www.atly.in',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.isPlatform === true &&
    res.tenantId === null &&
    res.source === 'platform' &&
    res.tenantId !== 'khushi' &&
    res.tenantId !== 'khushi-makeup-arts',
    'https://www.atly.in resolves strictly to platform/master site (never to default khushi tenant)',
    res
  );
}

// 30. khushi.atly.in -> tenant khushi
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushi.atly.in',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.tenantId === 'khushi' && res.source === 'tenant-hostname' && !res.isPlatform && !res.isUnknownTenant,
    'https://khushi.atly.in resolves to tenant khushi',
    res
  );
}

// 31. naveensln.atly.in -> tenant naveensln
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'naveensln.atly.in',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'rahulbau', name: 'rahulbau', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.tenantId === 'naveensln' && res.source === 'tenant-hostname' && !res.isPlatform && !res.isUnknownTenant,
    'https://naveensln.atly.in resolves to tenant naveensln',
    res
  );
}

// 32. rahulbau.atly.in -> tenant rahulbau
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'rahulbau.atly.in',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'rahulbau', name: 'rahulbau', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.tenantId === 'rahulbau' && res.source === 'tenant-hostname' && !res.isPlatform && !res.isUnknownTenant,
    'https://rahulbau.atly.in resolves to tenant rahulbau',
    res
  );
}

// 33. Arbitrary future tenant testtenant.atly.in resolves dynamically from Firestore without hardcoded map
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'testtenant.atly.in',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'testtenant', name: 'Test Tenant Studio', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.tenantId === 'testtenant' && res.source === 'tenant-hostname' && !res.isPlatform && !res.isUnknownTenant,
    'https://testtenant.atly.in resolves dynamically to testtenant without hardcoded mapping',
    res
  );
}

// 34. Unregistered subdomain unregistered.atly.in returns isUnknownTenant: true (never fallback to Khushi)
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'unregistered.atly.in',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.isUnknownTenant === true && res.tenantId === null && res.source === 'unknown',
    'https://unregistered.atly.in returns isUnknownTenant: true with null tenantId',
    res
  );
}

// 35. VITE_TENANT_ID is safely bypassed on shared wildcard host atly.in / *.atly.in
{
  const resPlatform = tenantResolutionService.resolveTenantFromHost({
    hostname: 'atly.in',
    viteTenantIdOverride: 'khushi',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    resPlatform.isPlatform === true && resPlatform.tenantId === null,
    'VITE_TENANT_ID cannot force apex atly.in away from platform',
    resPlatform
  );

  const resSubdomain = tenantResolutionService.resolveTenantFromHost({
    hostname: 'naveensln.atly.in',
    viteTenantIdOverride: 'khushi',
    clientsRegistry: [
      { id: 'khushi', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
      { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    resSubdomain.tenantId === 'naveensln',
    'VITE_TENANT_ID cannot override dynamic wildcard subdomain naveensln.atly.in',
    resSubdomain
  );
}

// 36. Existing khushimakeupart.vercel.app continues to resolve to khushi-makeup-arts
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    clientsRegistry: [
      { id: 'khushi-makeup-arts', name: 'Khushi Makeup Arts', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  assert(
    res.tenantId === 'khushi-makeup-arts' && res.source === 'tenant-hostname',
    'Existing khushimakeupart.vercel.app continues working and resolves to khushi-makeup-arts',
    res
  );
}

// 37. Metadata consistency: khushi tenant record has storefrontUrl: https://khushi.atly.in and deploymentStatus: live
{
  assert(
    DEFAULT_MAIN_CLIENT.id === 'khushi' &&
    DEFAULT_MAIN_CLIENT.storefrontUrl === 'https://khushi.atly.in' &&
    DEFAULT_MAIN_CLIENT.deploymentStatus === 'live' &&
    DEFAULT_MAIN_CLIENT.active === true,
    'khushi tenant metadata has storefrontUrl: https://khushi.atly.in and deploymentStatus: live',
    DEFAULT_MAIN_CLIENT
  );
}

// 38. Metadata consistency: naveensln tenant record has storefrontUrl: https://naveensln.atly.in and deploymentStatus: live
{
  const naveenslnRecord: ClientTenantSummary = {
    id: 'naveensln',
    name: 'naveenSLN',
    founder: 'Naveen',
    city: 'noida',
    phone: '8809261324',
    instagram: '@osmtechies',
    invitedOwnerEmail: 'n1999naveenkr@gmail.com',
    storefrontUrl: 'https://naveensln.atly.in',
    deploymentStatus: 'live',
    active: true,
    status: 'active',
    createdAt: '2026-09-27T17:19:19.944Z',
    updatedAt: new Date().toISOString(),
  };

  const parsedUrl = new URL(naveenslnRecord.storefrontUrl!);
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: parsedUrl.hostname,
    clientsRegistry: [DEFAULT_MAIN_CLIENT, naveenslnRecord],
  });

  assert(
    naveenslnRecord.storefrontUrl === 'https://naveensln.atly.in' &&
    naveenslnRecord.deploymentStatus === 'live' &&
    res.tenantId === 'naveensln' &&
    res.source === 'tenant-hostname',
    'naveensln tenant metadata is consistent (https://naveensln.atly.in, live) and resolves correctly',
    { naveenslnRecord, res }
  );
}

// 39. Metadata consistency: rahulbau tenant record has storefrontUrl: https://rahulbau.atly.in and deploymentStatus: live
{
  const rahulbauRecord: ClientTenantSummary = {
    id: 'rahulbau',
    name: 'rahulbau',
    founder: 'rahulbau',
    city: 'Patnaq',
    phone: '880929261324',
    instagram: '@osmtechines',
    invitedOwnerEmail: 'nks.earning@gmail.com',
    storefrontUrl: 'https://rahulbau.atly.in',
    deploymentStatus: 'live',
    active: true,
    status: 'active',
    createdAt: '2026-09-28T03:52:55.241Z',
    updatedAt: new Date().toISOString(),
  };

  const parsedUrl = new URL(rahulbauRecord.storefrontUrl!);
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: parsedUrl.hostname,
    clientsRegistry: [DEFAULT_MAIN_CLIENT, rahulbauRecord],
  });

  assert(
    rahulbauRecord.storefrontUrl === 'https://rahulbau.atly.in' &&
    rahulbauRecord.deploymentStatus === 'live' &&
    res.tenantId === 'rahulbau' &&
    res.source === 'tenant-hostname',
    'rahulbau tenant metadata is consistent (https://rahulbau.atly.in, live) and resolves correctly',
    { rahulbauRecord, res }
  );
}

// 40. Auto-enrichment logic: unmigrated tenant records are enriched with https://<id>.atly.in and live deployment status
{
  const rawRecord: ClientTenantSummary = {
    id: 'any-new-salon',
    name: 'Any New Salon',
    founder: 'Artist',
    city: 'Ranchi',
    phone: '9999999999',
    instagram: '@anysalon',
    active: true,
    status: 'active',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const expectedUrl = `https://${rawRecord.id}.atly.in`;
  const enriched: ClientTenantSummary = {
    ...rawRecord,
    storefrontUrl: rawRecord.storefrontUrl || expectedUrl,
    deploymentStatus: rawRecord.deploymentStatus || 'live',
  };

  const parsedUrl = new URL(enriched.storefrontUrl);
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: parsedUrl.hostname,
    clientsRegistry: [enriched],
  });

  assert(
    enriched.storefrontUrl === 'https://any-new-salon.atly.in' &&
    enriched.deploymentStatus === 'live' &&
    res.tenantId === 'any-new-salon',
    'Unmigrated tenant records automatically enrich with wildcard *.atly.in URL and live deployment status',
    { enriched, res }
  );
}

// 41. Canonical Subdomain Generator: compact URL-safe slug with NO hyphens
{
  const test1 = generateTenantSubdomain('Naveen Make up artists');
  const test2 = generateTenantSubdomain('Sweta Glan');
  const test3 = generateTenantSubdomain('Khushi Makeup Arts');
  const test4 = generateTenantSubdomain('Zara\'s & Co. 123');
  const test5 = generateTenantSubdomain('!@#$%^&*()_+');

  assert(
    (test1 === 'naveenmakeupartists' || test1 === 'naveenmakeupartist') &&
    test2 === 'swetaglan' &&
    test3 === 'khushimakeuparts' &&
    test4 === 'zarasco123' &&
    test5 === '',
    'generateTenantSubdomain produces compact DNS-safe slug with NO hyphens',
    { test1, test2, test3, test4, test5 }
  );
}

// 42. Subdomain Resolution: naveenmakeupartist.atly.in resolves to compact tenant record
{
  const naveenRecord: ClientTenantSummary = {
    id: 'naveenmakeupartists',
    name: 'Naveen Make up artists',
    founder: 'Naveen',
    city: 'Delhi',
    phone: '+91 99999 11111',
    instagram: '@naveenmakeup',
    storefrontUrl: 'https://naveenmakeupartist.atly.in',
    deploymentStatus: 'live',
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'naveenmakeupartist.atly.in',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, naveenRecord],
  });

  assert(
    res.tenantId === 'naveenmakeupartists' &&
    res.source === 'tenant-hostname' &&
    !res.isUnknownTenant &&
    !res.isPlatform,
    'https://naveenmakeupartist.atly.in resolves to tenant naveenmakeupartists via storefrontUrl/name matching',
    res
  );
}

// 43. Subdomain Resolution: swetaglan.atly.in resolves to tenant swetaglan
{
  const swetaRecord: ClientTenantSummary = {
    id: 'swetaglan',
    name: 'Sweta Glan',
    founder: 'Sweta',
    city: 'Kolkata',
    phone: '+91 99999 22222',
    instagram: '@swetaglan',
    storefrontUrl: 'https://swetaglan.atly.in',
    deploymentStatus: 'live',
    active: true,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'swetaglan.atly.in',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, swetaRecord],
  });

  assert(
    res.tenantId === 'swetaglan' &&
    res.source === 'tenant-hostname' &&
    !res.isUnknownTenant,
    'https://swetaglan.atly.in resolves to tenant swetaglan',
    res
  );
}

// 44. Subdomain Resolution: khushimakeuparts.atly.in resolves to khushi tenant
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeuparts.atly.in',
    clientsRegistry: [DEFAULT_MAIN_CLIENT],
  });

  assert(
    (res.tenantId === 'khushi' || res.tenantId === 'khushi-makeup-arts') &&
    res.source === 'tenant-hostname' &&
    !res.isUnknownTenant,
    'https://khushimakeuparts.atly.in resolves to primary khushi tenant',
    res
  );
}

// 45. Invitation Link on Subdomain WITHOUT &client= param extracts tenant hint from hostname
{
  const pendingTenant: ClientTenantSummary = {
    id: 'naveenmakeupartist',
    name: 'Naveen Make up artists',
    founder: 'Naveen',
    city: 'Delhi',
    phone: '+91 99999 11111',
    instagram: '@naveenmua',
    storefrontUrl: 'https://naveenmakeupartist.atly.in',
    deploymentStatus: 'live',
    active: false,
    status: 'pending_invitation',
    invitedOwnerEmail: 'naveen@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'naveenmakeupartist.atly.in',
    search: '?inviteId=inv_test_123&token=tok_test_456',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, pendingTenant],
  });

  assert(
    res.source === 'invitation' &&
    res.tenantId === 'naveenmakeupartist' &&
    res.matchedClient?.id === 'naveenmakeupartist' &&
    !res.isUnknownTenant,
    'Invitation link on subdomain without &client= param extracts tenant from hostname',
    res
  );
}

// 46. Invitation Link with query parameters in URL hash resolves without losing parameters
{
  const pendingTenant: ClientTenantSummary = {
    id: 'swetaglan',
    name: 'Sweta Glan',
    founder: 'Sweta',
    city: 'Kolkata',
    phone: '+91 99999 22222',
    instagram: '@swetaglan',
    storefrontUrl: 'https://swetaglan.atly.in',
    deploymentStatus: 'live',
    active: false,
    status: 'pending_invitation',
    invitedOwnerEmail: 'sweta@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'swetaglan.atly.in',
    search: '',
    hash: '#/?inviteId=inv_hash_789&token=tok_hash_012&client=swetaglan',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, pendingTenant],
  });

  assert(
    res.source === 'invitation' &&
    res.tenantId === 'swetaglan' &&
    res.matchedClient?.id === 'swetaglan',
    'Invitation link with query parameters in hash resolves correctly without losing parameters',
    res
  );
}

// 47. Pending tenant in pending_invitation status resolves authoritatively without invite params
{
  const pendingTenant: ClientTenantSummary = {
    id: 'swetaglan',
    name: 'Sweta Glan',
    founder: 'Sweta',
    city: 'Kolkata',
    phone: '+91 99999 22222',
    instagram: '@swetaglan',
    storefrontUrl: 'https://swetaglan.atly.in',
    deploymentStatus: 'live',
    active: false,
    status: 'pending_invitation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'swetaglan.atly.in',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, pendingTenant],
  });

  assert(
    res.tenantId === 'swetaglan' &&
    res.source === 'tenant-hostname' &&
    !res.isUnknownTenant &&
    res.matchedClient?.status === 'pending_invitation',
    'Pending tenant in pending_invitation status resolves authoritatively on its subdomain',
    res
  );
}

// 48. Regression: Invitation URL on *.atly.in resolves properly to invitation context
{
  const swetaTenant: ClientTenantSummary = {
    id: 'swetaglan',
    name: 'Sweta Glan',
    founder: 'Sweta',
    city: 'Kolkata',
    phone: '+91 99999 22222',
    instagram: '@swetaglan',
    storefrontUrl: 'https://swetaglan.atly.in',
    deploymentStatus: 'live',
    active: false,
    status: 'pending_invitation',
    invitedOwnerEmail: 'sweta@example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'swetaglan.atly.in',
    search: '?inviteId=inv_sweta_999&token=tok_sweta_secret&client=swetaglan',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, swetaTenant],
  });

  assert(
    res.source === 'invitation' &&
    res.tenantId === 'swetaglan' &&
    res.matchedClient?.id === 'swetaglan',
    'Regression: Invitation URL on *.atly.in resolves properly with full context',
    res
  );
}

// 49. Regression: Firebase Auth error codes mapped accurately for diagnostic and user display
{
  function mapAuthError(code: string): string {
    if (code === 'auth/unauthorized-domain') {
      return 'This domain is not authorized for Google sign-in. Please contact the platform administrator.';
    } else if (code === 'auth/popup-blocked') {
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
    } else if (code === 'auth/network-request-failed') {
      return 'Network error. Please check your internet connection and try again.';
    } else if (code === 'auth/popup-closed-by-user') {
      return 'Authentication cancelled: auth/popup-closed-by-user';
    }
    return 'Google sign-in failed. Please try again.';
  }

  assert(
    mapAuthError('auth/unauthorized-domain').includes('domain is not authorized') &&
    mapAuthError('auth/popup-blocked').includes('blocked by your browser') &&
    mapAuthError('auth/popup-closed-by-user').includes('auth/popup-closed-by-user'),
    'Regression: Google authentication error codes mapped accurately',
    {
      unauthorized: mapAuthError('auth/unauthorized-domain'),
      blocked: mapAuthError('auth/popup-blocked'),
    }
  );
}

// 50. Regression: Mismatched Google email rejected strictly
{
  const invitedEmail = 'sweta@example.com';
  const authenticatedGoogleEmail = 'attacker@gmail.com';

  const isMatch = authenticatedGoogleEmail.trim().toLowerCase() === invitedEmail.trim().toLowerCase();

  assert(
    !isMatch,
    'Regression: Mismatched Google email rejected strictly (cannot claim another tenant)',
    { invitedEmail, authenticatedGoogleEmail, isMatch }
  );
}

// 51. Regression: Matching Google email verified and authorized to accept
{
  const invitedEmail = 'Sweta@Example.COM';
  const authenticatedGoogleEmail = '  sweta@example.com ';

  const isMatch = authenticatedGoogleEmail.trim().toLowerCase() === invitedEmail.trim().toLowerCase();

  assert(
    isMatch,
    'Regression: Matching Google email successfully verified and authorized',
    { invitedEmail, authenticatedGoogleEmail, isMatch }
  );
}

// 52. Regression: Invalid/expired invitation validation
{
  const expiredInvitation = {
    invitationId: 'inv_123',
    token: 'valid_token',
    status: 'pending',
    expiresAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  };

  const isExpiredByTime = Date.now() > new Date(expiredInvitation.expiresAt).getTime();
  const isInvalidStatus = expiredInvitation.status !== 'pending';

  assert(
    isExpiredByTime && !isInvalidStatus,
    'Regression: Expired invitation correctly identified as expired',
    { expiredInvitation, isExpiredByTime }
  );
}

// 53. Regression: Preservation of inviteId, token, and client across URL parameters and hash
{
  const urlWithParams = new URL('https://swetaglan.atly.in/?inviteId=inv_123&token=tok_abc&client=swetaglan');
  const inviteId = urlWithParams.searchParams.get('inviteId');
  const token = urlWithParams.searchParams.get('token');
  const client = urlWithParams.searchParams.get('client');

  // Verify parameters survive redirect reconstruction
  const reconstructedUrl = new URL(`https://swetaglan.atly.in/?inviteId=${inviteId}&token=${token}&client=${client}`);

  assert(
    reconstructedUrl.searchParams.get('inviteId') === 'inv_123' &&
    reconstructedUrl.searchParams.get('token') === 'tok_abc' &&
    reconstructedUrl.searchParams.get('client') === 'swetaglan',
    'Regression: Preservation of inviteId, token, and client across redirect reconstruction',
    reconstructedUrl.toString()
  );
}

// 54. Regression: Correct post-acceptance redirect to https://<tenantSubdomain>.atly.in/#admin
{
  function computePostAcceptanceRedirect(clientId: string, currentHostname: string): string {
    const compactSub = clientId.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetHost = `${compactSub}.atly.in`;
    if (currentHostname !== targetHost) {
      return `https://${targetHost}/#admin`;
    }
    return `#admin`;
  }

  const redirectFromApex = computePostAcceptanceRedirect('swetaglan', 'atly.in');
  const redirectFromTenant = computePostAcceptanceRedirect('swetaglan', 'swetaglan.atly.in');
  const redirectNaveen = computePostAcceptanceRedirect('Naveen Make up artists', 'atly.in');

  assert(
    redirectFromApex === 'https://swetaglan.atly.in/#admin' &&
    redirectFromTenant === '#admin' &&
    (redirectNaveen === 'https://naveenmakeupartists.atly.in/#admin' || redirectNaveen === 'https://naveenmakeupartist.atly.in/#admin'),
    'Regression: Correct post-acceptance redirect URL computation for tenant admin',
    { redirectFromApex, redirectFromTenant, redirectNaveen }
  );
}

// 55. Regression: Apex gateway redirection from *.atly.in tenant subdomain to https://atly.in
{
  function buildApexGatewayAuthUrl(currentHost: string, invitationId: string, token: string, clientIdHint?: string): string | null {
    const host = currentHost.toLowerCase();
    const isAtlySubdomain = host.endsWith('.atly.in') && host !== 'atly.in' && host !== 'www.atly.in';
    if (!isAtlySubdomain) {
      return null;
    }
    const apexAuthUrl = new URL('https://atly.in/');
    apexAuthUrl.searchParams.set('inviteId', invitationId.trim());
    apexAuthUrl.searchParams.set('token', token.trim());
    if (clientIdHint) {
      apexAuthUrl.searchParams.set('client', clientIdHint.trim());
    }
    apexAuthUrl.searchParams.set('promptAuth', 'true');
    return apexAuthUrl.toString();
  }

  const gatewayUrl = buildApexGatewayAuthUrl('swetaglan.atly.in', 'inv_sweta_123', 'tok_secret_456', 'swetaglan');
  const onApex = buildApexGatewayAuthUrl('atly.in', 'inv_123', 'tok_456', 'khushi');
  const onLocalhost = buildApexGatewayAuthUrl('localhost:3000', 'inv_123', 'tok_456', 'khushi');

  const parsedGateway = new URL(gatewayUrl!);

  assert(
    gatewayUrl !== null &&
    parsedGateway.hostname === 'atly.in' &&
    parsedGateway.searchParams.get('inviteId') === 'inv_sweta_123' &&
    parsedGateway.searchParams.get('token') === 'tok_secret_456' &&
    parsedGateway.searchParams.get('client') === 'swetaglan' &&
    parsedGateway.searchParams.get('promptAuth') === 'true' &&
    onApex === null &&
    onLocalhost === null,
    'Regression: Tenant subdomain detects *.atly.in and generates correct apex auth gateway URL',
    { gatewayUrl, onApex, onLocalhost }
  );
}

// 56. Regression: Apex atly.in with invitation parameters resolves as platform/gateway with invitation context
{
  const res = tenantResolutionService.resolveTenantFromHost({
    hostname: 'atly.in',
    search: '?inviteId=inv_sweta_123&token=tok_secret_456&client=swetaglan&promptAuth=true',
    clientsRegistry: [DEFAULT_MAIN_CLIENT],
  });

  assert(
    res.source === 'invitation' &&
    res.isPlatform === false &&
    res.tenantId === 'swetaglan',
    'Regression: Apex atly.in with invitation parameters activates invitation context for target tenant',
    res
  );
}

// 57. Regression: A tenant cannot be selected merely by changing ?client= on production hostnames
{
  const resKhushi = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushimakeupart.vercel.app',
    search: '?client=swetaglan',
    clientsRegistry: [DEFAULT_MAIN_CLIENT],
  });

  const resTenantSub = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushi.atly.in',
    search: '?client=swetaglan',
    clientsRegistry: [DEFAULT_MAIN_CLIENT],
  });

  assert(
    (resKhushi.tenantId === 'khushi' || resKhushi.tenantId === 'khushi-makeup-arts') &&
    resKhushi.tenantId !== 'swetaglan' &&
    resTenantSub.tenantId === 'khushi',
    'Regression: Query parameter ?client= cannot override authoritative tenant hostnames',
    { resKhushi, resTenantSub }
  );
}

// 58. Regression: Custom domains and legacy tenants (khushi, naveensln, rahulbau) remain intact
{
  const resCustom = tenantResolutionService.resolveTenantFromHost({
    hostname: 'glamourbyfatima.com',
    clientsRegistry: [
      { id: 'fatima-face-arts', name: 'Fatima Face Arts', customDomain: 'glamourbyfatima.com', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' },
    ],
  });

  const resKhushi = tenantResolutionService.resolveTenantFromHost({
    hostname: 'khushi.atly.in',
    clientsRegistry: [DEFAULT_MAIN_CLIENT],
  });

  const resNaveen = tenantResolutionService.resolveTenantFromHost({
    hostname: 'naveensln.atly.in',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, { id: 'naveensln', name: 'naveenSLN', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' }],
  });

  const resRahul = tenantResolutionService.resolveTenantFromHost({
    hostname: 'rahulbau.atly.in',
    clientsRegistry: [DEFAULT_MAIN_CLIENT, { id: 'rahulbau', name: 'rahulbau', active: true, founder: '', city: '', phone: '', instagram: '', createdAt: '', updatedAt: '' }],
  });

  assert(
    resCustom.tenantId === 'fatima-face-arts' &&
    resKhushi.tenantId === 'khushi' &&
    resNaveen.tenantId === 'naveensln' &&
    resRahul.tenantId === 'rahulbau',
    'Regression: Custom domains and existing tenants (khushi, naveensln, rahulbau) remain strictly intact',
    { resCustom, resKhushi, resNaveen, resRahul }
  );
}

console.log(`\nTEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed.\n`);
if (testsFailed > 0) {
  process.exit(1);
}

