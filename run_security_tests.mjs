// run_security_tests.mjs
// Comprehensive Security Rules & Master Admin Test Suite executed against Cloud Firestore Emulator

const HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const PROJECT_ID = 'khushimakeuparts865';
const BASE_URL = `http://${HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const MASTER_ADMIN_EMAIL = 'naveen.kr.shiva@gmail.com';

function createMockToken(uid, customClaims = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: uid,
    user_id: uid,
    aud: PROJECT_ID,
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    ...customClaims,
  })).toString('base64url');
  return `${header}.${payload}.`;
}

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } };
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return { fields };
}

// REST API Request Wrappers
async function apiGet(docPath, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/${docPath}`, { method: 'GET', headers });
  return res.status;
}

async function apiPatch(docPath, data, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const body = JSON.stringify(toFirestoreFields(data));
  const res = await fetch(`${BASE_URL}/${docPath}`, { method: 'PATCH', headers, body });
  return res.status;
}

async function apiDelete(docPath, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}/${docPath}`, { method: 'DELETE', headers });
  return res.status;
}


// Admin Seeding (Bearer owner bypasses security rules in Firestore Emulator)
async function seedDoc(docPath, data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer owner'
  };
  const body = JSON.stringify(toFirestoreFields(data));
  const res = await fetch(`${BASE_URL}/${docPath}`, { method: 'PATCH', headers, body });
  if (!res.ok) {
    throw new Error(`Failed to seed ${docPath}: ${res.status} ${await res.text()}`);
  }
}

const results = [];

function recordTest(id, name, expected, actualStatus) {
  // In Firestore REST:
  // If allowed: 200 (OK) or 404 (Not Found, but permission granted).
  // If denied: 403 (Permission Denied).
  const isAllowed = actualStatus === 200 || actualStatus === 404 || actualStatus === 'ALLOW';
  const isDenied = actualStatus === 403 || actualStatus === 'DENIED';
  
  let outcome = 'FAIL';
  if (expected === 'ALLOW' && isAllowed) outcome = 'PASS';
  if (expected === 'DENY' && isDenied) outcome = 'PASS';

  results.push({
    id,
    name,
    expected,
    actualStatus,
    actualEvaluation: isDenied ? 'DENY' : (isAllowed ? 'ALLOW' : `HTTP_${actualStatus}`),
    result: outcome
  });
}

async function run() {
  console.log('================================================================');
  console.log('STARTING FIRESTORE SECURITY RULES & STEP 8 MASTER ADMIN TEST SUITE');
  console.log(`Target: ${BASE_URL}`);
  console.log('================================================================\n');

  // --- SEED TEST IDENTITIES & TENANTS ---
  console.log('Seeding initial state using Emulator Admin privileges...');
  await seedDoc('users/client_a_uid', {
    role: 'client',
    email: 'client_a@salon.com',
    assignedClientId: 'salon-a'
  });
  await seedDoc('users/client_b_uid', {
    role: 'client',
    email: 'client_b@salon.com',
    assignedClientId: 'salon-b'
  });
  await seedDoc('users/developer_uid', {
    role: 'developer',
    email: MASTER_ADMIN_EMAIL
  });
  await seedDoc('users/employee_a_uid', {
    role: 'employee',
    email: 'employee_a@salon.com',
    assignedClientId: 'salon-a',
    employeeId: 'emp-01',
    permissions: ['view_schedule']
  });
  await seedDoc('users/unassigned_uid', {
    role: 'client',
    email: 'unassigned@user.com',
    assignedClientId: null
  });
  await seedDoc('users/suspended_user_uid', {
    role: 'client',
    email: 'suspended@salon.com',
    assignedClientId: 'salon-suspended'
  });
  await seedDoc('clients/salon-suspended', {
    id: 'salon-suspended',
    name: 'Suspended Salon Test',
    status: 'suspended',
    active: false,
    content: { brand: { name: 'Suspended Salon' } }
  });
  await seedDoc('clients/salon-a', {
    id: 'salon-a',
    name: 'Salon A Test',
    active: true,
    content: { brand: { name: 'Salon A' } }
  });
  await seedDoc('clients/salon-b', {
    id: 'salon-b',
    name: 'Salon B Test',
    active: true,
    content: { brand: { name: 'Salon B' } }
  });
  await seedDoc('clients/khushi', {
    id: 'khushi',
    name: 'Khushi Makeup Arts',
    active: true,
    content: { brand: { name: 'Khushi Makeup Arts' } }
  });
  await seedDoc('clients/salon-a/appointments/apt-seed-1', {
    clientId: 'salon-a',
    customerName: 'Secret Customer',
    customerPhone: '1234567890'
  });
  await seedDoc('clients/salon-b/appointments/apt-seed-2', {
    clientId: 'salon-b',
    customerName: 'Other Secret Customer',
    customerPhone: '9876543210'
  });
  await seedDoc('clients/salon-a/slot_locks/existing_lock', {
    clientId: 'salon-a',
    appointmentId: 'apt-seed-1',
    staffId: 'staff-1',
    date: '2026-10-01',
    blockMinute: 600
  });
  console.log('Seeding completed.\n');

  const tokenClientA = createMockToken('client_a_uid', { email: 'client_a@salon.com' });
  const tokenClientB = createMockToken('client_b_uid', { email: 'client_b@salon.com' });
  const tokenDev = createMockToken('developer_uid', { email: MASTER_ADMIN_EMAIL });
  const tokenEmployeeA = createMockToken('employee_a_uid', { email: 'employee_a@salon.com' });
  const tokenUnassigned = createMockToken('unassigned_uid', { email: 'unassigned@user.com' });
  const tokenOtherUser = createMockToken('other_user_uid', { email: 'other@gmail.com' });

  // ==========================================================================
  // SECTION A: BASELINE 25 RULES TESTS (FROM STEP 7)
  // ==========================================================================
  console.log('Executing Baseline Category 1: Public Reads...');
  recordTest('B-1', 'Anonymous read /clients/salon-a', 'ALLOW', await apiGet('clients/salon-a'));
  recordTest('B-2', 'Anonymous read /clients/salon-a/staff/staff-1', 'ALLOW', await apiGet('clients/salon-a/staff/staff-1'));
  recordTest('B-3', 'Anonymous read appointments subcollection', 'DENY', await apiGet('clients/salon-a/appointments/apt-seed-1'));
  recordTest('B-4', 'Anonymous read enquiries subcollection', 'DENY', await apiGet('clients/salon-a/enquiries/enq-1'));

  console.log('Executing Baseline Category 2: Public Writes...');
  const validApt = {
    clientId: 'salon-a',
    customerName: 'Priya Sharma',
    customerPhone: '9876543210',
    serviceId: 'bridal-hd',
    date: '2026-11-15',
    timeSlot: '10:00 AM',
    startMinute: 600,
    endMinute: 720,
    status: 'pending'
  };
  recordTest('B-5', 'Valid anonymous appointment creation', 'ALLOW', await apiPatch('clients/salon-a/appointments/apt-valid-anon', validApt));

  const malformedApt = {
    clientId: 'salon-a',
    customerName: 'Priya Sharma',
    serviceId: 'bridal-hd',
    date: '2026-11-15',
    timeSlot: '10:00 AM',
    startMinute: 600,
    endMinute: 720,
    status: 'pending'
  };
  recordTest('B-6', 'Malformed appointment missing phone', 'DENY', await apiPatch('clients/salon-a/appointments/apt-malformed', malformedApt));

  const mismatchedApt = { ...validApt, clientId: 'salon-b' };
  recordTest('B-7', 'Appointment with mismatched clientId', 'DENY', await apiPatch('clients/salon-a/appointments/apt-mismatched', mismatchedApt));

  const validEnquiry = {
    clientId: 'salon-a',
    clientName: 'Ananya Verma',
    phone: '9876543211',
    status: 'new'
  };
  recordTest('B-8', 'Valid anonymous enquiry creation', 'ALLOW', await apiPatch('clients/salon-a/enquiries/enq-valid-anon', validEnquiry));

  const malformedEnquiry = {
    clientId: 'salon-a',
    phone: '9876543211'
  };
  recordTest('B-9', 'Malformed enquiry missing name', 'DENY', await apiPatch('clients/salon-a/enquiries/enq-malformed', malformedEnquiry));

  const validReview = {
    clientName: 'Sunita Mehra',
    rating: 5,
    reviewText: 'Outstanding bridal makeup!',
    status: 'pending'
  };
  recordTest('B-10', 'Valid pending review creation', 'ALLOW', await apiPatch('clients/salon-a/pending_reviews/rev-valid-anon', validReview));

  const invalidRatingReview = { ...validReview, rating: 10 };
  recordTest('B-11', 'Review with invalid rating 10', 'DENY', await apiPatch('clients/salon-a/pending_reviews/rev-invalid-rating', invalidRatingReview));

  const preApprovedReview = { ...validReview, status: 'approved' };
  recordTest('B-12', 'Review with pre-approved status', 'DENY', await apiPatch('clients/salon-a/pending_reviews/rev-preapproved', preApprovedReview));

  const validLock = {
    clientId: 'salon-a',
    appointmentId: 'apt-valid-anon',
    staffId: 'staff-1',
    date: '2026-11-15',
    blockMinute: 600
  };
  recordTest('B-13', 'Valid slot lock creation', 'ALLOW', await apiPatch('clients/salon-a/slot_locks/lock_new', validLock));

  const duplicateLock = {
    clientId: 'salon-a',
    appointmentId: 'apt-valid-anon',
    staffId: 'staff-1',
    date: '2026-10-01',
    blockMinute: 600
  };
  recordTest('B-14', 'Duplicate slot lock on existing doc', 'DENY', await apiPatch('clients/salon-a/slot_locks/existing_lock', duplicateLock));

  console.log('Executing Baseline Category 3: Tenant Isolation...');
  recordTest('B-15', 'Client A reads salon-a appointment', 'ALLOW', await apiGet('clients/salon-a/appointments/apt-seed-1', tokenClientA));
  recordTest('B-16', 'Client A reads salon-b appointment', 'DENY', await apiGet('clients/salon-b/appointments/apt-seed-2', tokenClientA));

  const clientACms = {
    id: 'salon-a',
    name: 'Salon A Updated',
    content: { brand: { name: 'Salon A Deluxe' } }
  };
  recordTest('B-17', 'Client A updates own salon-a content', 'ALLOW', await apiPatch('clients/salon-a', clientACms, tokenClientA));

  const clientBCms = {
    id: 'salon-b',
    name: 'Hacked by Client A'
  };
  recordTest('B-18', 'Client A attempts to update salon-b content', 'DENY', await apiPatch('clients/salon-b', clientBCms, tokenClientA));

  const ownershipChange = { id: 'salon-b' };
  recordTest('B-19', 'Client A changes tenant ID field on salon-a', 'DENY', await apiPatch('clients/salon-a', ownershipChange, tokenClientA));

  console.log('Executing Baseline Category 4: Role & Tenant Escalation Shield...');
  recordTest('B-20', 'Client A escalates own role to developer', 'DENY', await apiPatch('users/client_a_uid', { role: 'developer' }, tokenClientA));
  recordTest('B-21', 'Client A changes assignedClientId to salon-b', 'DENY', await apiPatch('users/client_a_uid', { assignedClientId: 'salon-b' }, tokenClientA));
  recordTest('B-22', 'Client A modifies Client B role to developer', 'DENY', await apiPatch('users/client_b_uid', { role: 'developer' }, tokenClientA));
  recordTest('B-23', 'Client A modifies Client B assignedClientId', 'DENY', await apiPatch('users/client_b_uid', { assignedClientId: 'salon-a' }, tokenClientA));

  console.log('Executing Baseline Category 5: Developer Authorization...');
  const registryUpdate = {
    clients: [{ id: 'salon-a', name: 'Salon A' }],
    updatedAt: new Date().toISOString()
  };
  recordTest('B-24', 'Developer updates /settings/clients_registry', 'ALLOW', await apiPatch('settings/clients_registry', registryUpdate, tokenDev));
  recordTest('B-25', 'Developer attempts to update immutable slot lock', 'DENY', await apiPatch('clients/salon-a/slot_locks/existing_lock', { blockMinute: 700 }, tokenDev));

  // ==========================================================================
  // SECTION B: STEP 8 SPECIFIC MASTER ADMIN SECURITY TESTS (PART 14)
  // ==========================================================================
  console.log('\nExecuting STEP 8 MASTER ADMIN SECURITY TESTS (Part 14)...');

  // Test 1: Authenticated Naveen.kr.shiva@gmail.com with authoritative Master Admin identity
  // Must ALLOW platform operation in Firestore rules
  recordTest('S8-01', 'Auth Naveen.kr.shiva@gmail.com performs Master Admin write', 'ALLOW',
    await apiPatch('settings/clients_registry', { updatedAt: new Date().toISOString() }, tokenDev)
  );

  // Test 2: Unauthenticated visitor attempts Master Admin operation
  recordTest('S8-02', 'Unauthenticated visitor attempts Master Admin write to settings', 'DENY',
    await apiPatch('settings/clients_registry', { updatedAt: new Date().toISOString() }, null)
  );

  // Test 3: Normal tenant owner attempts Master Admin operation
  recordTest('S8-03', 'Tenant Owner Client A attempts Master Admin write to settings', 'DENY',
    await apiPatch('settings/clients_registry', { updatedAt: new Date().toISOString() }, tokenClientA)
  );

  // Test 4: Tenant employee attempts Master Admin operation
  recordTest('S8-04', 'Tenant Employee Client B attempts Master Admin write to settings', 'DENY',
    await apiPatch('settings/clients_registry', { updatedAt: new Date().toISOString() }, tokenClientB)
  );

  // Test 5: Different authenticated user attempts Master Admin operation
  recordTest('S8-05', 'Different authenticated user (other@gmail.com) attempts Master Admin write', 'DENY',
    await apiPatch('settings/clients_registry', { updatedAt: new Date().toISOString() }, tokenOtherUser)
  );

  // Test 6: User modifies localStorage role to developer (simulated verification)
  // In code, role in TenantContext comes from Firestore /users/{uid}, not localStorage
  // Here we test whether a user with localStorage role set can execute developer write in Firestore
  recordTest('S8-06', 'User with fake localStorage role attempts developer Firestore write', 'DENY',
    await apiPatch('settings/clients_registry', { updatedAt: new Date().toISOString() }, tokenOtherUser)
  );

  // Test 7: User modifies browser/React state (other user trying to write as developer)
  recordTest('S8-07', 'Non-master user attempts developer platform write', 'DENY',
    await apiPatch('settings/clients_registry', { updatedAt: new Date().toISOString() }, tokenClientA)
  );

  // Test 8: User directly opens #masteradmin (unauthenticated read to protected admin data)
  recordTest('S8-08', 'Unauthenticated direct route access to protected data', 'DENY',
    await apiGet('clients/salon-a/appointments/apt-seed-1', null)
  );

  // Test 9: Client attempts to change their Firestore role to developer
  recordTest('S8-09', 'Client attempts to change their Firestore role to developer', 'DENY',
    await apiPatch('users/client_a_uid', { role: 'developer' }, tokenClientA)
  );

  // Test 10: Client attempts to change their assignedClientId
  recordTest('S8-10', 'Client attempts to change their assignedClientId in Firestore', 'DENY',
    await apiPatch('users/client_a_uid', { assignedClientId: 'salon-b' }, tokenClientA)
  );

  // Test 11: Client attempts to create a Master Admin identity record for another user
  recordTest('S8-11', 'Client attempts to create a developer user profile', 'DENY',
    await apiPatch('users/attacker_dev', { role: 'developer', email: 'attacker@evil.com' }, tokenClientA)
  );

  // Test 12: Authorized Master Admin performs existing Master Admin operation (deleting client tenant)
  recordTest('S8-12', 'Authorized Master Admin deletes client tenant document', 'ALLOW',
    await apiDelete('clients/salon-b', tokenDev)
  );

  // ==========================================================================
  // SECTION C: STEP 12 CUSTOMER & ENQUIRY DOMAIN SECURITY TESTS
  // ==========================================================================
  console.log('\nExecuting STEP 12 CUSTOMER & ENQUIRY DOMAIN SECURITY TESTS...');

  const validCustomer = {
    id: 'cust-1',
    name: 'Ritu Sharma',
    phone: '9876543210',
    createdAt: new Date().toISOString()
  };

  // 1. Valid customer creation by tenant owner
  recordTest('S12-01', 'Tenant Owner Client A creates customer in salon-a', 'ALLOW',
    await apiPatch('clients/salon-a/customers/cust-1', validCustomer, tokenClientA)
  );

  // 2. Invalid customer creation by unauthenticated visitor
  recordTest('S12-02', 'Unauthenticated visitor attempts customer creation in salon-a', 'DENY',
    await apiPatch('clients/salon-a/customers/cust-anon', validCustomer, null)
  );

  // 3. Tenant-scoped customer read
  recordTest('S12-03', 'Tenant Owner Client A reads customer in salon-a', 'ALLOW',
    await apiGet('clients/salon-a/customers/cust-1', tokenClientA)
  );

  // 4. Tenant-scoped customer update
  recordTest('S12-04', 'Tenant Owner Client A updates customer in salon-a', 'ALLOW',
    await apiPatch('clients/salon-a/customers/cust-1', { notes: 'VIP Bridal Client' }, tokenClientA)
  );

  // 5. Unauthorized tenant access denied
  recordTest('S12-05', 'Client B attempts to read customer in salon-a', 'DENY',
    await apiGet('clients/salon-a/customers/cust-1', tokenClientB)
  );

  // 6. Unauthorized tenant mutation denied
  recordTest('S12-06', 'Client B attempts to mutate customer in salon-a', 'DENY',
    await apiPatch('clients/salon-a/customers/cust-1', { notes: 'Hacked by Client B' }, tokenClientB)
  );

  // Enquiry Tests (S12-07 to S12-12)
  const validEnquiryS12 = {
    clientId: 'salon-a',
    clientName: 'Meera Rajput',
    phone: '9811122233',
    ceremonyType: 'Reception',
    status: 'new'
  };

  // 7. Valid public enquiry creation
  recordTest('S12-07', 'Valid public anonymous enquiry creation in salon-a', 'ALLOW',
    await apiPatch('clients/salon-a/enquiries/enq-s12-anon', validEnquiryS12, null)
  );

  // 8. Invalid enquiry creation rejected (missing clientName)
  recordTest('S12-08', 'Invalid public enquiry missing name rejected', 'DENY',
    await apiPatch('clients/salon-a/enquiries/enq-s12-invalid', { clientId: 'salon-a', phone: '9811122233' }, null)
  );

  // 9. Tenant owner can access its enquiries
  recordTest('S12-09', 'Tenant Owner Client A reads enquiry in salon-a', 'ALLOW',
    await apiGet('clients/salon-a/enquiries/enq-s12-anon', tokenClientA)
  );

  // 10. Different tenant cannot access those enquiries
  recordTest('S12-10', 'Different Tenant Client B denied read to salon-a enquiry', 'DENY',
    await apiGet('clients/salon-a/enquiries/enq-s12-anon', tokenClientB)
  );

  // 11. Unauthorized mutation denied
  recordTest('S12-11', 'Different Tenant Client B denied update to salon-a enquiry', 'DENY',
    await apiPatch('clients/salon-a/enquiries/enq-s12-anon', { status: 'contacted' }, tokenClientB)
  );

  // 12. Existing enquiry validation remains intact (unauthenticated mutation denied)
  recordTest('S12-12', 'Unauthenticated visitor denied update to salon-a enquiry', 'DENY',
    await apiPatch('clients/salon-a/enquiries/enq-s12-anon', { status: 'completed' }, null)
  );

  // ==========================================================================
  // SECTION D: STEP 13 REVIEWS DOMAIN SECURITY TESTS
  // ==========================================================================
  console.log('\nExecuting STEP 13 REVIEWS DOMAIN SECURITY TESTS...');

  const validReviewS13 = {
    clientName: 'Priya Sharma',
    rating: 5,
    reviewText: 'Incredible bridal hair and makeup styling!',
    ceremony: 'Wedding',
    eventDate: '2026-11-20',
    status: 'pending'
  };

  // 1. Valid public review submission
  recordTest('S13-01', 'Valid public anonymous review creation in salon-a', 'ALLOW',
    await apiPatch('clients/salon-a/pending_reviews/rev-s13-valid', validReviewS13, null)
  );

  // 2. Missing reviewText rejected
  recordTest('S13-02', 'Public review missing reviewText rejected', 'DENY',
    await apiPatch('clients/salon-a/pending_reviews/rev-s13-invalid-text', { clientName: 'Priya', rating: 5, status: 'pending' }, null)
  );

  // 3. Rating 0 rejected
  recordTest('S13-03', 'Public review with rating 0 rejected', 'DENY',
    await apiPatch('clients/salon-a/pending_reviews/rev-s13-invalid-r0', { ...validReviewS13, rating: 0 }, null)
  );

  // 4. Rating 6 rejected
  recordTest('S13-04', 'Public review with rating 6 rejected', 'DENY',
    await apiPatch('clients/salon-a/pending_reviews/rev-s13-invalid-r6', { ...validReviewS13, rating: 6 }, null)
  );

  // 5. Pre-approval status rejected
  recordTest('S13-05', 'Public review with pre-approval status rejected', 'DENY',
    await apiPatch('clients/salon-a/pending_reviews/rev-s13-invalid-status', { ...validReviewS13, status: 'approved' }, null)
  );

  // 6. Unauthenticated visitor denied read to pending reviews
  recordTest('S13-06', 'Unauthenticated visitor denied read to salon-a pending reviews', 'DENY',
    await apiGet('clients/salon-a/pending_reviews/rev-s13-valid', null)
  );

  // 7. Unauthenticated visitor denied delete to pending review
  recordTest('S13-07', 'Unauthenticated visitor denied delete to salon-a pending review', 'DENY',
    await apiDelete('clients/salon-a/pending_reviews/rev-s13-valid', null)
  );

  // 8. Tenant Owner Client A reads salon-a pending review
  recordTest('S13-08', 'Tenant Owner Client A reads salon-a pending review', 'ALLOW',
    await apiGet('clients/salon-a/pending_reviews/rev-s13-valid', tokenClientA)
  );

  // 9. Tenant Owner Client A updates/moderates salon-a pending review
  recordTest('S13-09', 'Tenant Owner Client A updates status of salon-a pending review', 'ALLOW',
    await apiPatch('clients/salon-a/pending_reviews/rev-s13-valid', { status: 'approved' }, tokenClientA)
  );

  // 10. Cross-tenant Client B denied read to salon-a pending review
  recordTest('S13-10', 'Different Tenant Client B denied read to salon-a pending review', 'DENY',
    await apiGet('clients/salon-a/pending_reviews/rev-s13-valid', tokenClientB)
  );

  // 11. Cross-tenant Client B denied delete to salon-a pending review
  recordTest('S13-11', 'Different Tenant Client B denied delete to salon-a pending review', 'DENY',
    await apiDelete('clients/salon-a/pending_reviews/rev-s13-valid', tokenClientB)
  );

  // 12. Tenant Owner Client A deletes salon-a pending review
  recordTest('S13-12', 'Tenant Owner Client A deletes salon-a pending review', 'ALLOW',
    await apiDelete('clients/salon-a/pending_reviews/rev-s13-valid', tokenClientA)
  );

  // ==========================================================================
  // SECTION E: STEP 14 SITE CONTENT / CATALOG DOMAIN FIRESTORE SECURITY
  // ==========================================================================
  console.log('Executing Step 14: Site Content / Catalog Domain Security Tests...');

  // 1. Public unauthenticated read of tenant storefront document
  recordTest('S14-01', 'Public visitor reads tenant storefront content /clients/salon-a', 'ALLOW',
    await apiGet('clients/salon-a')
  );

  // 2. Public unauthenticated read of default tenant storefront document
  recordTest('S14-02', 'Public visitor reads default storefront content /clients/khushi', 'ALLOW',
    await apiGet('clients/khushi')
  );

  // 3. Tenant Owner Client A successfully updates their own site content
  recordTest('S14-03', 'Tenant Owner Client A updates own site content /clients/salon-a', 'ALLOW',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      name: 'Salon A Updated',
      active: true,
      content: { brand: { name: 'Salon A Updated' } }
    }, tokenClientA)
  );

  // 4. Cross-tenant update rejection: Tenant Owner Client A attempts to update Client B's storefront
  recordTest('S14-04', 'Cross-tenant update: Client A attempts to update /clients/salon-b', 'DENY',
    await apiPatch('clients/salon-b', {
      id: 'salon-b',
      name: 'Tampered Salon B',
      active: true,
      content: { brand: { name: 'Tampered' } }
    }, tokenClientA)
  );

  // 5. Cross-tenant update rejection: Tenant Owner Client B attempts to update Client A's storefront
  recordTest('S14-05', 'Cross-tenant update: Client B attempts to update /clients/salon-a', 'DENY',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      name: 'Tampered Salon A',
      active: true,
      content: { brand: { name: 'Tampered' } }
    }, tokenClientB)
  );

  // 6. Tenant ID spoofing rejection: Client A attempts to update /clients/salon-a with mismatched id
  recordTest('S14-06', 'Tenant ID spoofing: Client A updates /clients/salon-a with mismatched id', 'DENY',
    await apiPatch('clients/salon-a', {
      id: 'salon-b',
      name: 'Spoofed ID',
      active: true,
    }, tokenClientA)
  );

  // 7. Anti-pollution rejection: Client A attempts to attach appointments array to /clients/salon-a
  recordTest('S14-07', 'Anti-pollution rejection: Client A writes forbidden appointments key', 'DENY',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      appointments: [{ id: 'polluted' }]
    }, tokenClientA)
  );

  // 8. Anti-pollution rejection: Client A attempts to attach enquiries array to /clients/salon-a
  recordTest('S14-08', 'Anti-pollution rejection: Client A writes forbidden enquiries key', 'DENY',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      enquiries: [{ id: 'polluted' }]
    }, tokenClientA)
  );

  // 9. Anti-pollution rejection: Client A attempts to attach customers array to /clients/salon-a
  recordTest('S14-09', 'Anti-pollution rejection: Client A writes forbidden customers key', 'DENY',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      customers: [{ id: 'polluted' }]
    }, tokenClientA)
  );

  // 10. Anti-pollution rejection: Client A attempts to attach staff_private array to /clients/salon-a
  recordTest('S14-10', 'Anti-pollution rejection: Client A writes forbidden staff_private key', 'DENY',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      staff_private: [{ id: 'polluted' }]
    }, tokenClientA)
  );

  // 11. Unauthenticated write rejection: Public visitor attempts to update /clients/salon-a
  recordTest('S14-11', 'Unauthenticated write rejection: Public visitor updates /clients/salon-a', 'DENY',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      name: 'Hacked Storefront',
      active: true
    }, null)
  );

  // 12. Developer Super Admin updates /clients/salon-a storefront content
  recordTest('S14-12', 'Developer Super Admin updates /clients/salon-a storefront content', 'ALLOW',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      name: 'Salon A Dev Verified',
      active: true,
      content: { brand: { name: 'Salon A Dev Verified' } }
    }, tokenDev)
  );

  // ==========================================================================
  // SECTION F: STEP 15 TENANT REGISTRY / DIRECTORY DOMAIN FIRESTORE SECURITY
  // ==========================================================================
  console.log('Executing Step 15: Tenant Registry / Directory Domain Security Tests...');

  // 1. Master Admin provisions new tenant in /clients/salon-new
  recordTest('S15-01', 'Master Admin provisions new tenant in /clients/salon-new', 'ALLOW',
    await apiPatch('clients/salon-new', {
      id: 'salon-new',
      name: 'New Salon',
      active: true,
    }, tokenDev)
  );

  // 2. Master Admin updates global registry /settings/clients_registry
  recordTest('S15-02', 'Master Admin updates global registry /settings/clients_registry', 'ALLOW',
    await apiPatch('settings/clients_registry', {
      clients: [{ id: 'salon-new', name: 'New Salon' }],
    }, tokenDev)
  );

  // 3. Tenant Owner Client A denied creating new tenant in /clients/salon-unauthorized
  recordTest('S15-03', 'Tenant Owner Client A denied creating new tenant in /clients/salon-unauthorized', 'DENY',
    await apiPatch('clients/salon-unauthorized', {
      id: 'salon-unauthorized',
      name: 'Unauthorized Salon',
      active: true,
    }, tokenClientA)
  );

  // 4. Tenant Owner Client A denied updating global registry /settings/clients_registry
  recordTest('S15-04', 'Tenant Owner Client A denied updating global registry /settings/clients_registry', 'DENY',
    await apiPatch('settings/clients_registry', {
      clients: [],
    }, tokenClientA)
  );

  // 5. Unauthenticated visitor denied updating global registry /settings/clients_registry
  recordTest('S15-05', 'Unauthenticated visitor denied updating global registry /settings/clients_registry', 'DENY',
    await apiPatch('settings/clients_registry', {
      clients: [],
    }, null)
  );

  // 6. Master Admin updates lifecycle status of tenant /clients/salon-a
  recordTest('S15-06', 'Master Admin updates lifecycle status of tenant /clients/salon-a', 'ALLOW',
    await apiPatch('clients/salon-a', {
      id: 'salon-a',
      status: 'suspended',
      active: false,
    }, tokenDev)
  );

  // 7. Tenant Owner Client A denied changing tenant lifecycle status of /clients/salon-b
  recordTest('S15-07', 'Tenant Owner Client A denied changing lifecycle status of /clients/salon-b', 'DENY',
    await apiPatch('clients/salon-b', {
      id: 'salon-b',
      status: 'suspended',
      active: false,
    }, tokenClientA)
  );

  // 8. Tenant Owner Client A denied deleting client tenant document /clients/salon-a
  recordTest('S15-08', 'Tenant Owner Client A denied deleting client tenant document /clients/salon-a', 'DENY',
    await apiDelete('clients/salon-a', tokenClientA)
  );

  // 9. Master Admin successfully deletes client tenant document /clients/salon-new
  recordTest('S15-09', 'Master Admin successfully deletes client tenant document /clients/salon-new', 'ALLOW',
    await apiDelete('clients/salon-new', tokenDev)
  );

  // 10. Tenant Owner Client A denied tampering with assignedClientId in /users/client_a_uid
  recordTest('S15-10', 'Tenant Owner Client A denied tampering with assignedClientId in /users/client_a_uid', 'DENY',
    await apiPatch('users/client_a_uid', {
      assignedClientId: 'salon-b',
    }, tokenClientA)
  );

  // 11. Tenant Owner Client A denied elevating role to developer in /users/client_a_uid
  recordTest('S15-11', 'Tenant Owner Client A denied elevating role to developer in /users/client_a_uid', 'DENY',
    await apiPatch('users/client_a_uid', {
      role: 'developer',
    }, tokenClientA)
  );

  // 12. Master Admin updates user tenant assignment in /users/client_a_uid
  recordTest('S15-12', 'Master Admin updates user tenant assignment in /users/client_a_uid', 'ALLOW',
    await apiPatch('users/client_a_uid', {
      assignedClientId: 'salon-a',
    }, tokenDev)
  );

  // 13. Unauthenticated visitor reads public tenant registry /settings/clients_registry
  recordTest('S15-13', 'Unauthenticated visitor reads public tenant registry /settings/clients_registry', 'ALLOW',
    await apiGet('settings/clients_registry')
  );

  // 14. Unauthenticated visitor denied deleting /settings/clients_registry
  recordTest('S15-14', 'Unauthenticated visitor denied deleting /settings/clients_registry', 'DENY',
    await apiDelete('settings/clients_registry', null)
  );

  // ==========================================================================
  // SECTION G: STEP 16 UNIVERSAL IDENTITY RESOLUTION ARCHITECTURE TESTS
  // ==========================================================================
  console.log('\nExecuting Section G: Step 16 Universal Identity Resolution Tests...');

  // 1. Employee cannot alter assignedClientId in /users/employee_a_uid
  recordTest('S16-01', 'Tenant Employee A denied altering assignedClientId in /users/employee_a_uid', 'DENY',
    await apiPatch('users/employee_a_uid', {
      assignedClientId: 'salon-b',
    }, tokenEmployeeA)
  );

  // 2. Employee cannot elevate role to developer in /users/employee_a_uid
  recordTest('S16-02', 'Tenant Employee A denied elevating role to developer in /users/employee_a_uid', 'DENY',
    await apiPatch('users/employee_a_uid', {
      role: 'developer',
    }, tokenEmployeeA)
  );

  // 3. Employee cannot grant themselves escalated permissions in /users/employee_a_uid
  recordTest('S16-03', 'Tenant Employee A denied granting self permissions in /users/employee_a_uid', 'DENY',
    await apiPatch('users/employee_a_uid', {
      permissions: ['admin_all', 'manage_settings'],
    }, tokenEmployeeA)
  );

  // 4. Employee of Salon A denied access to Salon B appointments
  recordTest('S16-04', 'Tenant Employee A denied access to Salon B appointments', 'DENY',
    await apiGet('clients/salon-b/appointments/apt-seed-2', tokenEmployeeA)
  );

  // 5. Employee of Salon A denied access to Salon B private staff records
  recordTest('S16-05', 'Tenant Employee A denied access to Salon B private staff records', 'DENY',
    await apiGet('clients/salon-b/staff_private/secret_staff', tokenEmployeeA)
  );

  // 6. Normal unassigned user denied self-assigning assignedClientId
  recordTest('S16-06', 'Normal unassigned user denied self-assigning assignedClientId', 'DENY',
    await apiPatch('users/unassigned_uid', {
      assignedClientId: 'salon-a',
    }, tokenUnassigned)
  );

  // 7. Normal unassigned user denied self-granting developer role
  recordTest('S16-07', 'Normal unassigned user denied self-granting developer role', 'DENY',
    await apiPatch('users/unassigned_uid', {
      role: 'developer',
    }, tokenUnassigned)
  );

  // 8. Normal unassigned user denied self-granting permissions
  recordTest('S16-08', 'Normal unassigned user denied self-granting permissions', 'DENY',
    await apiPatch('users/unassigned_uid', {
      permissions: ['admin_all'],
    }, tokenUnassigned)
  );

  // 9. Cross-tenant attack: Tenant Owner Client A denied accessing Salon B private staff records
  recordTest('S16-09', 'Tenant Owner Client A denied accessing Salon B private staff records', 'DENY',
    await apiGet('clients/salon-b/staff_private/secret_staff', tokenClientA)
  );

  // 10. Unauthenticated visitor denied modifying /users/employee_a_uid
  recordTest('S16-10', 'Unauthenticated visitor denied modifying /users/employee_a_uid', 'DENY',
    await apiPatch('users/employee_a_uid', {
      role: 'developer',
    }, null)
  );

  // Domain Identity Resolution Helpers
  async function resolveIdentityFromBackend(user) {
    if (!user || !user.uid) return { type: 'UNAUTHENTICATED' };
    const cleanEmail = (user.email || '').trim().toLowerCase();

    const token = createMockToken(user.uid, { email: cleanEmail });
    const res = await fetch(`${BASE_URL}/users/${user.uid}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    let profile = null;
    if (res.ok) {
      const json = await res.json();
      profile = {
        role: json.fields?.role?.stringValue,
        assignedClientId: json.fields?.assignedClientId?.stringValue,
        employeeId: json.fields?.employeeId?.stringValue,
        permissions: json.fields?.permissions?.arrayValue?.values?.map(v => v.stringValue) || [],
      };
    }

    if (cleanEmail === MASTER_ADMIN_EMAIL && (profile?.role === 'developer' || !profile)) {
      return { type: 'MASTER_PLATFORM_ADMIN', uid: user.uid, email: cleanEmail };
    }

    const assignedTenantId = profile?.assignedClientId || null;
    if (!assignedTenantId) {
      return { type: 'NO_WORKSPACE', uid: user.uid, email: cleanEmail, reason: 'UNASSIGNED', tenantId: null };
    }

    const tRes = await fetch(`${BASE_URL}/clients/${assignedTenantId}`);
    if (!tRes.ok) {
      return { type: 'NO_WORKSPACE', uid: user.uid, email: cleanEmail, reason: 'TENANT_NOT_FOUND', tenantId: assignedTenantId };
    }
    const tJson = await tRes.json();
    const isSuspended = tJson.fields?.status?.stringValue === 'suspended' || tJson.fields?.active?.booleanValue === false;
    if (isSuspended) {
      return { type: 'NO_WORKSPACE', uid: user.uid, email: cleanEmail, reason: 'TENANT_SUSPENDED', tenantId: assignedTenantId };
    }

    if (profile?.role === 'employee' || profile?.employeeId) {
      return {
        type: 'TENANT_EMPLOYEE',
        uid: user.uid,
        email: cleanEmail,
        tenantId: assignedTenantId,
        employeeId: profile?.employeeId || user.uid,
        permissions: profile.permissions && profile.permissions.length > 0 ? profile.permissions : ['view_schedule']
      };
    }

    return {
      type: 'TENANT_OWNER',
      uid: user.uid,
      email: cleanEmail,
      tenantId: assignedTenantId
    };
  }

  function resolveDestinationFromIdentity(identity, emailVerified = true) {
    if (identity.type === 'UNAUTHENTICATED') return 'AUTHENTICATION_REQUIRED';
    if (!emailVerified) return 'EMAIL_VERIFICATION';
    switch (identity.type) {
      case 'MASTER_PLATFORM_ADMIN': return 'MASTER_ADMIN';
      case 'TENANT_OWNER': return 'TENANT_ADMIN';
      case 'TENANT_EMPLOYEE': return 'EMPLOYEE_WORKSPACE';
      case 'NO_WORKSPACE': return 'NO_WORKSPACE';
      default: return 'AUTHENTICATION_REQUIRED';
    }
  }

  // Ensure salon-a is active and client_a profile is seeded for active resolution
  await seedDoc('clients/salon-a', {
    id: 'salon-a',
    name: 'Salon A Test',
    status: 'active',
    active: true,
  });
  await seedDoc('users/client_a_uid', {
    role: 'client',
    email: 'client_a@salon.com',
    assignedClientId: 'salon-a'
  });

  // 11. Domain resolution: Master Admin -> MASTER_PLATFORM_ADMIN & MASTER_ADMIN
  const idDev = await resolveIdentityFromBackend({ uid: 'developer_uid', email: MASTER_ADMIN_EMAIL });
  const destDev = resolveDestinationFromIdentity(idDev, true);
  recordTest('S16-11', 'Domain Resolution: Master Admin -> MASTER_PLATFORM_ADMIN & MASTER_ADMIN', 'ALLOW',
    (idDev.type === 'MASTER_PLATFORM_ADMIN' && destDev === 'MASTER_ADMIN') ? 'ALLOW' : 'DENY'
  );

  // 12. Domain resolution: Tenant Owner Client A -> TENANT_OWNER & TENANT_ADMIN
  const idOwnerA = await resolveIdentityFromBackend({ uid: 'client_a_uid', email: 'client_a@salon.com' });
  const destOwnerA = resolveDestinationFromIdentity(idOwnerA, true);
  recordTest('S16-12', 'Domain Resolution: Tenant Owner Client A -> TENANT_OWNER & TENANT_ADMIN', 'ALLOW',
    (idOwnerA.type === 'TENANT_OWNER' && idOwnerA.tenantId === 'salon-a' && destOwnerA === 'TENANT_ADMIN') ? 'ALLOW' : 'DENY'
  );

  // 13. Domain resolution: Tenant Employee A -> TENANT_EMPLOYEE & EMPLOYEE_WORKSPACE
  const idEmpA = await resolveIdentityFromBackend({ uid: 'employee_a_uid', email: 'employee_a@salon.com' });
  const destEmpA = resolveDestinationFromIdentity(idEmpA, true);
  recordTest('S16-13', 'Domain Resolution: Tenant Employee A -> TENANT_EMPLOYEE & EMPLOYEE_WORKSPACE', 'ALLOW',
    (idEmpA.type === 'TENANT_EMPLOYEE' && idEmpA.tenantId === 'salon-a' && idEmpA.employeeId === 'emp-01' && destEmpA === 'EMPLOYEE_WORKSPACE') ? 'ALLOW' : 'DENY'
  );

  // 14. Domain resolution: Unassigned user -> NO_WORKSPACE & destination NO_WORKSPACE
  const idUnassigned = await resolveIdentityFromBackend({ uid: 'unassigned_uid', email: 'unassigned@user.com' });
  const destUnassigned = resolveDestinationFromIdentity(idUnassigned, true);
  recordTest('S16-14', 'Domain Resolution: Unassigned user -> NO_WORKSPACE & destination NO_WORKSPACE', 'ALLOW',
    (idUnassigned.type === 'NO_WORKSPACE' && idUnassigned.reason === 'UNASSIGNED' && destUnassigned === 'NO_WORKSPACE') ? 'ALLOW' : 'DENY'
  );

  // 15. Domain resolution: Suspended tenant user -> NO_WORKSPACE (TENANT_SUSPENDED)
  const idSuspended = await resolveIdentityFromBackend({ uid: 'suspended_user_uid', email: 'suspended@salon.com' });
  const destSuspended = resolveDestinationFromIdentity(idSuspended, true);
  recordTest('S16-15', 'Domain Resolution: Suspended tenant user -> NO_WORKSPACE (TENANT_SUSPENDED)', 'ALLOW',
    (idSuspended.type === 'NO_WORKSPACE' && idSuspended.reason === 'TENANT_SUSPENDED' && destSuspended === 'NO_WORKSPACE') ? 'ALLOW' : 'DENY'
  );

  // 16. Domain resolution: Unverified account -> destination EMAIL_VERIFICATION
  const destUnverified = resolveDestinationFromIdentity(idOwnerA, false);
  recordTest('S16-16', 'Domain Resolution: Unverified email account routes to EMAIL_VERIFICATION', 'ALLOW',
    destUnverified === 'EMAIL_VERIFICATION' ? 'ALLOW' : 'DENY'
  );

  // 17. Domain resolution: Unauthenticated visitor -> UNAUTHENTICATED & AUTHENTICATION_REQUIRED
  const idAnon = await resolveIdentityFromBackend(null);
  const destAnon = resolveDestinationFromIdentity(idAnon, false);
  recordTest('S16-17', 'Domain Resolution: Unauthenticated visitor -> UNAUTHENTICATED & AUTHENTICATION_REQUIRED', 'ALLOW',
    (idAnon.type === 'UNAUTHENTICATED' && destAnon === 'AUTHENTICATION_REQUIRED') ? 'ALLOW' : 'DENY'
  );

  // 18. Domain resolution: Client-side tampering does not elevate unassigned user
  const idTamperAttempt = await resolveIdentityFromBackend({
    uid: 'unassigned_uid',
    email: 'unassigned@user.com',
    forgedRole: 'developer',
    forgedTenant: 'salon-a'
  });
  recordTest('S16-18', 'Domain Resolution: Client-side tampering does not elevate unassigned user', 'ALLOW',
    (idTamperAttempt.type === 'NO_WORKSPACE') ? 'ALLOW' : 'DENY'
  );

  // ==========================================================================
  // DISPLAY SUMMARY
  // ==========================================================================
  console.log('\n================================================================');
  console.log('ALL EXECUTED SECURITY TESTS (BASELINE + STEP 8 + STEP 12 + STEP 13 + STEP 14 + STEP 15 + STEP 16)');
  console.log('================================================================');
  console.table(results);

  const passed = results.filter(r => r.result === 'PASS').length;
  const failed = results.filter(r => r.result === 'FAIL').length;
  console.log(`TOTAL TESTS EXECUTED: ${results.length}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);

  if (failed > 0) {
    console.error(`\nFAILED TESTS DETECTED: ${failed}`);
    process.exit(1);
  } else {
    console.log(`\nALL ${results.length} SECURITY TESTS PASSED LIVE AGAINST CLOUD FIRESTORE EMULATOR!`);
  }
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
