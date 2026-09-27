import { tenantResolutionService } from '../src/services/tenant/TenantResolutionService';
import { ClientTenantSummary } from '../src/domain/tenant/types';

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

console.log(`\nTEST SUMMARY: ${testsPassed} passed, ${testsFailed} failed.\n`);
if (testsFailed > 0) {
  process.exit(1);
}
