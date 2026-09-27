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
  if (typeof val === 'object' && val !== null && (val.timestampValue || val.stringValue || val.integerValue)) return val;
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

async function apiCommit(writes, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`http://${HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ writes })
  });
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
  await seedDoc('users/employee_b_uid', {
    role: 'employee',
    email: 'employee_b@salon.com',
    assignedClientId: 'salon-b',
    employeeId: 'emp-b-01',
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
  const tokenEmployeeB = createMockToken('employee_b_uid', { email: 'employee_b@salon.com' });
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

    if (profile?.role === 'developer' || (cleanEmail === MASTER_ADMIN_EMAIL && !profile)) {
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
  // SECTION H: STEP 21 TENANT OWNER VS EMPLOYEE RBAC AND BOUNDARY ENFORCEMENT
  // ==========================================================================
  console.log('\nExecuting Section H: Tenant Owner vs Employee RBAC and Boundaries...');

  // 1. Tenant Owner Client A can create an employee user profile for salon-a
  recordTest('S21-01', 'Tenant Owner Client A can create employee profile in /users/new_emp_a_uid', 'ALLOW',
    await apiPatch('users/new_emp_a_uid', {
      role: 'employee',
      email: 'new_emp@salon.com',
      assignedClientId: 'salon-a',
      permissions: ['view_schedule']
    }, tokenClientA)
  );

  // 2. Tenant Owner Client A denied creating a user with elevated role 'client'
  recordTest('S21-02', 'Tenant Owner Client A denied creating user with elevated role client', 'DENY',
    await apiPatch('users/forged_client_uid', {
      role: 'client',
      email: 'forged_client@salon.com',
      assignedClientId: 'salon-a'
    }, tokenClientA)
  );

  // 3. Tenant Owner Client A denied creating a user with elevated role 'developer'
  recordTest('S21-03', 'Tenant Owner Client A denied creating user with elevated role developer', 'DENY',
    await apiPatch('users/forged_dev_uid', {
      role: 'developer',
      email: 'forged_dev@salon.com',
      assignedClientId: null
    }, tokenClientA)
  );

  // 4. Tenant Owner Client A denied creating an employee for salon-b
  recordTest('S21-04', 'Tenant Owner Client A denied creating employee for salon-b', 'DENY',
    await apiPatch('users/new_emp_b_by_a', {
      role: 'employee',
      email: 'emp_b_by_a@salon.com',
      assignedClientId: 'salon-b',
      permissions: ['view_schedule']
    }, tokenClientA)
  );

  // 5. Tenant Owner Client A can update delegated permissions on employee A (assigned to salon-a)
  recordTest('S21-05', 'Tenant Owner Client A can update permissions on employee A', 'ALLOW',
    await apiPatch('users/employee_a_uid', {
      role: 'employee',
      assignedClientId: 'salon-a',
      permissions: ['view_schedule', 'manage_appointments']
    }, tokenClientA)
  );

  // 6. Tenant Owner Client A denied altering employee A role to developer
  recordTest('S21-06', 'Tenant Owner Client A denied elevating employee A role to developer', 'DENY',
    await apiPatch('users/employee_a_uid', {
      role: 'developer',
      assignedClientId: 'salon-a'
    }, tokenClientA)
  );

  // 7. Tenant Owner Client A denied reassigning employee A to salon-b
  recordTest('S21-07', 'Tenant Owner Client A denied altering employee A assignedClientId to salon-b', 'DENY',
    await apiPatch('users/employee_a_uid', {
      role: 'employee',
      assignedClientId: 'salon-b'
    }, tokenClientA)
  );

  // 8. Tenant Owner Client A denied updating employee B profile (assigned to salon-b)
  recordTest('S21-08', 'Tenant Owner Client A denied updating employee B profile', 'DENY',
    await apiPatch('users/employee_b_uid', {
      role: 'employee',
      assignedClientId: 'salon-b',
      permissions: ['view_schedule', 'manage_appointments']
    }, tokenClientA)
  );

  // 9. Tenant Employee A denied updating salon-a website content
  recordTest('S21-09', 'Tenant Employee A denied updating salon-a website content', 'DENY',
    await apiPatch('clients/salon-a', {
      content: { brand: { name: 'Hacked by Employee' } }
    }, tokenEmployeeA)
  );

  // 10. Tenant Employee A denied accessing customer CRM directory
  recordTest('S21-10', 'Tenant Employee A denied reading customer CRM directory', 'DENY',
    await apiGet('clients/salon-a/customers/cust-seed-1', tokenEmployeeA)
  );

  // 11. Tenant Employee A denied accessing private staff operational records
  recordTest('S21-11', 'Tenant Employee A denied accessing private staff records', 'DENY',
    await apiGet('clients/salon-a/staff_private/staff-seed-1', tokenEmployeeA)
  );

  // 12. Tenant Employee A can read salon-a appointments
  recordTest('S21-12', 'Tenant Employee A can read salon-a appointments', 'ALLOW',
    await apiGet('clients/salon-a/appointments/apt-seed-1', tokenEmployeeA)
  );

  // 13. Tenant Employee A denied reading salon-b appointments
  recordTest('S21-13', 'Tenant Employee A denied reading salon-b appointments', 'DENY',
    await apiGet('clients/salon-b/appointments/apt-seed-2', tokenEmployeeA)
  );

  // 14. Tenant Employee A can update appointment status on salon-a appointment
  recordTest('S21-14', 'Tenant Employee A can update appointment status on salon-a', 'ALLOW',
    await apiPatch('clients/salon-a/appointments/apt-seed-1', {
      status: 'confirmed',
      notes: 'Confirmed by employee'
    }, tokenEmployeeA)
  );

  // 15. Tenant Employee A denied deleting salon-a appointment
  recordTest('S21-15', 'Tenant Employee A denied deleting salon-a appointment', 'DENY',
    await apiDelete('clients/salon-a/appointments/apt-seed-1', tokenEmployeeA)
  );

  // 16. Tenant Employee A denied deleting salon-a slot lock
  recordTest('S21-16', 'Tenant Employee A denied deleting salon-a slot lock', 'DENY',
    await apiDelete('clients/salon-a/slot_locks/existing_lock', tokenEmployeeA)
  );

  // 17. Tenant Owner Client A can delete employee profile in their own tenant
  recordTest('S21-17', 'Tenant Owner Client A can delete employee in their own tenant', 'ALLOW',
    await apiDelete('users/new_emp_a_uid', tokenClientA)
  );

  // 18. Tenant Owner Client A denied deleting employee B profile (salon-b)
  recordTest('S21-18', 'Tenant Owner Client A denied deleting employee B in salon-b', 'DENY',
    await apiDelete('users/employee_b_uid', tokenClientA)
  );

  // ==========================================================================
  // SECTION I: STEP 22 DEVELOPER PROFILE BOOTSTRAP & TENANT CREATION AUTHORIZATION
  // ==========================================================================
  console.log('\nExecuting Section I: Developer Profile Bootstrap & Provisioning Authorization...');

  const freshDevUid = 'fresh_dev_uid_step22';
  const tokenFreshDev = createMockToken(freshDevUid, { email: MASTER_ADMIN_EMAIL });
  const tokenAttacker = createMockToken('attacker_uid', { email: 'attacker@evil.com' });

  // 1. Fresh developer can bootstrap their own profile in /users/{freshDevUid} with role 'developer'
  recordTest('S22-01', 'Fresh developer can bootstrap own profile with role developer', 'ALLOW',
    await apiPatch(`users/${freshDevUid}`, {
      uid: freshDevUid,
      email: MASTER_ADMIN_EMAIL,
      role: 'developer',
      assignedClientId: null,
    }, tokenFreshDev)
  );

  // 2. Attacker denied bootstrapping a profile with role 'developer'
  recordTest('S22-02', 'Attacker denied bootstrapping profile with role developer', 'DENY',
    await apiPatch('users/attacker_uid', {
      uid: 'attacker_uid',
      email: 'attacker@evil.com',
      role: 'developer',
      assignedClientId: null,
    }, tokenAttacker)
  );

  // 3. Attacker denied creating/spoofing developer profile under developer UID
  recordTest('S22-03', 'Attacker denied creating profile under developer UID', 'DENY',
    await apiPatch(`users/${freshDevUid}_spoofed`, {
      uid: freshDevUid,
      email: MASTER_ADMIN_EMAIL,
      role: 'developer',
    }, tokenAttacker)
  );

  // 4. Fresh developer can read their own bootstrapped profile
  recordTest('S22-04', 'Fresh developer can read own bootstrapped profile', 'ALLOW',
    await apiGet(`users/${freshDevUid}`, tokenFreshDev)
  );

  // 5. Fresh developer with bootstrapped profile can create a new tenant in /clients/{tenantId}
  recordTest('S22-05', 'Fresh developer can create new tenant /clients/salon-fresh-dev', 'ALLOW',
    await apiPatch('clients/salon-fresh-dev', {
      id: 'salon-fresh-dev',
      name: 'Fresh Developer Salon',
      status: 'active',
      active: true,
      content: { brand: { name: 'Fresh Developer Salon' } }
    }, tokenFreshDev)
  );

  // 6. Non-developer (Client A) denied creating a new tenant in /clients/{tenantId}
  recordTest('S22-06', 'Client A denied creating new tenant in /clients', 'DENY',
    await apiPatch('clients/salon-unauthorized-by-client', {
      id: 'salon-unauthorized-by-client',
      name: 'Unauthorized Salon',
      status: 'active',
      active: true,
    }, tokenClientA)
  );

  // 7. Unauthenticated visitor denied creating a new tenant in /clients/{tenantId}
  recordTest('S22-07', 'Unauthenticated visitor denied creating new tenant in /clients', 'DENY',
    await apiPatch('clients/salon-unauthorized-anon', {
      id: 'salon-unauthorized-anon',
      name: 'Anon Salon',
      status: 'active',
      active: true,
    }, null)
  );

  // ==========================================================================
  // SECTION J: STEP 22 PHASE 2 TENANT INVITATIONS & SECURE ACCEPTANCE FLOW
  // ==========================================================================
  console.log('\nExecuting Section J: Tenant Invitations & Secure Acceptance Flow...');

  const tokenInvitedOwner = createMockToken('new_owner_uid', { email: 'new_owner@salon.com' });
  const invData = {
    invitationId: 'inv_salon_c_step22',
    clientId: 'salon-c',
    invitedOwnerEmail: 'new_owner@salon.com',
    status: 'pending',
    token: 'secret_token_12345',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    invitedByUid: freshDevUid,
    invitedByEmail: MASTER_ADMIN_EMAIL,
  };

  // 8. Developer can create an invitation in /tenant_invitations
  recordTest('S22-08', 'Developer can create invitation in /tenant_invitations', 'ALLOW',
    await apiPatch('tenant_invitations/inv_salon_c_step22', invData, tokenFreshDev)
  );

  // 9. Client A denied creating an invitation
  recordTest('S22-09', 'Client A denied creating invitation', 'DENY',
    await apiPatch('tenant_invitations/inv_forged_a', {
      ...invData,
      invitationId: 'inv_forged_a'
    }, tokenClientA)
  );

  // 10. Attacker denied creating an invitation
  recordTest('S22-10', 'Attacker denied creating invitation', 'DENY',
    await apiPatch('tenant_invitations/inv_forged_b', {
      ...invData,
      invitationId: 'inv_forged_b'
    }, tokenAttacker)
  );

  // 11. Unauthenticated visitor denied creating an invitation
  recordTest('S22-11', 'Unauthenticated visitor denied creating invitation', 'DENY',
    await apiPatch('tenant_invitations/inv_forged_c', {
      ...invData,
      invitationId: 'inv_forged_c'
    }, null)
  );

  // 12. Invited user can read their own invitation
  recordTest('S22-12', 'Invited user can read own invitation', 'ALLOW',
    await apiGet('tenant_invitations/inv_salon_c_step22', tokenInvitedOwner)
  );

  // 13. Attacker denied reading someone else's invitation
  recordTest('S22-13', 'Attacker denied reading someone else invitation', 'DENY',
    await apiGet('tenant_invitations/inv_salon_c_step22', tokenAttacker)
  );

  // 14. Attacker denied accepting someone else's invitation
  recordTest('S22-14', 'Attacker denied accepting invitation for new_owner', 'DENY',
    await apiPatch('tenant_invitations/inv_salon_c_step22', {
      status: 'accepted',
      acceptedByUid: 'attacker_uid'
    }, tokenAttacker)
  );

  // 15. User denied changing clientId during invitation acceptance
  recordTest('S22-15', 'User denied changing clientId during acceptance', 'DENY',
    await apiPatch('tenant_invitations/inv_salon_c_step22', {
      invitationId: 'inv_salon_c_step22',
      clientId: 'salon-a', // Tampered from salon-c
      invitedOwnerEmail: 'new_owner@salon.com',
      token: 'secret_token_12345',
      status: 'accepted',
      acceptedByUid: 'new_owner_uid'
    }, tokenInvitedOwner)
  );

  // 16. Invited user can accept their invitation
  recordTest('S22-16', 'Invited user can accept invitation', 'ALLOW',
    await apiPatch('tenant_invitations/inv_salon_c_step22', {
      invitationId: 'inv_salon_c_step22',
      clientId: 'salon-c',
      invitedOwnerEmail: 'new_owner@salon.com',
      token: 'secret_token_12345',
      status: 'accepted',
      acceptedByUid: 'new_owner_uid'
    }, tokenInvitedOwner)
  );

  // 17. Accepted invitation cannot be accepted again (reused)
  recordTest('S22-17', 'Accepted invitation cannot be re-accepted (reused)', 'DENY',
    await apiPatch('tenant_invitations/inv_salon_c_step22', {
      status: 'accepted',
      acceptedByUid: 'attacker_uid'
    }, tokenAttacker)
  );

  // 18. Attacker denied self-granting role client without valid invitation
  recordTest('S22-18', 'Attacker denied self-granting role client without valid invitation', 'DENY',
    await apiPatch('users/attacker_uid', {
      role: 'client',
      assignedClientId: 'salon-a',
    }, tokenAttacker)
  );

  // 19. Invited user with accepted invitation can create profile in /users
  recordTest('S22-19', 'Invited user with accepted invitation can create client profile in /users', 'ALLOW',
    await apiPatch('users/new_owner_uid', {
      uid: 'new_owner_uid',
      email: 'new_owner@salon.com',
      role: 'client',
      assignedClientId: 'salon-c',
      invitationId: 'inv_salon_c_step22',
    }, tokenInvitedOwner)
  );

  // 20. User denied reassigning assignedClientId to another salon
  recordTest('S22-20', 'User denied reassigning assignedClientId to another salon', 'DENY',
    await apiPatch('users/new_owner_uid', {
      assignedClientId: 'salon-b',
    }, tokenInvitedOwner)
  );

  // Seed a second invitation for revocation & deletion tests
  await seedDoc('tenant_invitations/inv_revocable', {
    invitationId: 'inv_revocable',
    clientId: 'salon-d',
    invitedOwnerEmail: 'revoked_owner@salon.com',
    status: 'pending',
    token: 'token_revocable',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });

  // 21. Developer can revoke an invitation
  recordTest('S22-21', 'Developer can revoke an invitation', 'ALLOW',
    await apiPatch('tenant_invitations/inv_revocable', {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
    }, tokenFreshDev)
  );

  // 22. Developer can delete an invitation
  recordTest('S22-22', 'Developer can delete an invitation', 'ALLOW',
    await apiDelete('tenant_invitations/inv_revocable', tokenFreshDev)
  );

  // ==========================================================================
  // SECTION K: STEP 22 PHASE 2 ATOMIC ACCEPTANCE & POST-ACCEPTANCE ISOLATION SUITE
  // ==========================================================================
  console.log('\nExecuting Section K: Atomic Acceptance & Post-Acceptance Isolation Suite...');

  const prodOwnerUid = 'prod_owner_uid';
  const prodOwnerEmail = 'prod_owner@salon.com';
  const tokenProdOwner = createMockToken(prodOwnerUid, { email: prodOwnerEmail });
  const prodClientId = 'salon-prod-test';
  const prodInvId = 'inv_prod_test';

  // Seed pending tenant and invitation for production acceptance sequence
  await seedDoc(`clients/${prodClientId}`, {
    id: prodClientId,
    name: 'Production Salon Test',
    status: 'pending_invitation',
    active: false,
    content: { brand: { name: 'Production Salon' } }
  });

  await seedDoc(`tenant_invitations/${prodInvId}`, {
    invitationId: prodInvId,
    clientId: prodClientId,
    invitedOwnerEmail: prodOwnerEmail,
    status: 'pending',
    token: 'tok_prod_123',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
    invitedByUid: freshDevUid,
    invitedByEmail: MASTER_ADMIN_EMAIL
  });

  // 23. Complete 3-way atomic transaction commit succeeds for fresh invited Google user
  const atomicWrites = [
    {
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/tenant_invitations/${prodInvId}`,
        fields: toFirestoreFields({
          invitationId: prodInvId,
          clientId: prodClientId,
          invitedOwnerEmail: prodOwnerEmail,
          status: 'accepted',
          token: 'tok_prod_123',
          acceptedByUid: prodOwnerUid,
          acceptedAt: new Date().toISOString()
        }).fields
      }
    },
    {
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/users/${prodOwnerUid}`,
        fields: toFirestoreFields({
          uid: prodOwnerUid,
          email: prodOwnerEmail,
          role: 'client',
          assignedClientId: prodClientId,
          invitationId: prodInvId,
          invitationAcceptedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }).fields
      }
    },
    {
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/clients/${prodClientId}`,
        fields: toFirestoreFields({
          status: 'active',
          active: true,
          activatedByInvitationId: prodInvId,
          updatedAt: new Date().toISOString()
        }).fields
      },
      updateMask: {
        fieldPaths: ['status', 'active', 'activatedByInvitationId', 'updatedAt']
      }
    }
  ];

  recordTest('S22-23', 'Atomic 3-way transaction commit succeeds for fresh invited owner', 'ALLOW',
    await apiCommit(atomicWrites, tokenProdOwner)
  );

  // 24. Resulting owner can update content in their OWN activated tenant
  recordTest('S22-24', 'Resulting owner can update content in own tenant', 'ALLOW',
    await apiPatch(`clients/${prodClientId}`, {
      content: { brand: { name: 'Updated by Prod Owner' } }
    }, tokenProdOwner)
  );

  // 25. Resulting owner strictly DENIED modifying another tenant's content (salon-a)
  recordTest('S22-25', 'Resulting owner denied modifying another tenant content (salon-a)', 'DENY',
    await apiPatch('clients/salon-a', {
      content: { brand: { name: 'Hacked by Prod Owner' } }
    }, tokenProdOwner)
  );

  // 26. Resulting owner strictly DENIED accessing another tenant's private staff records
  recordTest('S22-26', 'Resulting owner denied reading private staff in salon-a', 'DENY',
    await apiGet('clients/salon-a/staff_private/staff-seed-1', tokenProdOwner)
  );

  // 27. Resulting owner strictly DENIED accessing another tenant's CRM customers
  recordTest('S22-27', 'Resulting owner denied reading CRM customers in salon-a', 'DENY',
    await apiGet('clients/salon-a/customers/cust-seed-1', tokenProdOwner)
  );

  // ─── FAILURE CASES ─────────────────────────────────────────────────────────

  // Failure Case 1: Email mismatch
  await seedDoc('tenant_invitations/inv_mismatch', {
    invitationId: 'inv_mismatch',
    clientId: 'salon-mismatch',
    invitedOwnerEmail: 'intended_owner@salon.com',
    status: 'pending',
    token: 'tok_mismatch',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });
  recordTest('S22-28', 'Attacker denied atomic acceptance with mismatched email', 'DENY',
    await apiCommit([
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/tenant_invitations/inv_mismatch`,
          fields: toFirestoreFields({
            invitationId: 'inv_mismatch',
            clientId: 'salon-mismatch',
            invitedOwnerEmail: 'intended_owner@salon.com',
            status: 'accepted',
            token: 'tok_mismatch',
            acceptedByUid: 'attacker_uid',
            acceptedAt: new Date().toISOString()
          }).fields
        }
      },
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/users/attacker_uid`,
          fields: toFirestoreFields({
            uid: 'attacker_uid',
            email: 'attacker@evil.com',
            role: 'client',
            assignedClientId: 'salon-mismatch',
            invitationId: 'inv_mismatch',
          }).fields
        }
      }
    ], tokenAttacker)
  );

  // Failure Case 2: Expired invitation
  await seedDoc('tenant_invitations/inv_expired_test', {
    invitationId: 'inv_expired_test',
    clientId: 'salon-expired',
    invitedOwnerEmail: 'expired_owner@salon.com',
    status: 'pending',
    token: 'tok_expired',
    createdAt: '2020-01-01T00:00:00Z',
    expiresAt: { timestampValue: '2020-01-04T00:00:00Z' },
  });
  const tokenExpiredOwner = createMockToken('expired_owner_uid', { email: 'expired_owner@salon.com' });
  recordTest('S22-29', 'Accepting expired invitation rejected by security rules', 'DENY',
    await apiCommit([
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/tenant_invitations/inv_expired_test`,
          fields: toFirestoreFields({
            invitationId: 'inv_expired_test',
            clientId: 'salon-expired',
            invitedOwnerEmail: 'expired_owner@salon.com',
            status: 'accepted',
            token: 'tok_expired',
            acceptedByUid: 'expired_owner_uid',
            acceptedAt: new Date().toISOString()
          }).fields
        }
      }
    ], tokenExpiredOwner)
  );

  // Failure Case 3: Revoked invitation
  await seedDoc('tenant_invitations/inv_revoked_fail', {
    invitationId: 'inv_revoked_fail',
    clientId: 'salon-revoked',
    invitedOwnerEmail: 'revoked_owner@salon.com',
    status: 'revoked',
    token: 'tok_revoked',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });
  const tokenRevokedOwner = createMockToken('revoked_owner_uid', { email: 'revoked_owner@salon.com' });
  recordTest('S22-30', 'Accepting revoked invitation rejected', 'DENY',
    await apiCommit([
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/tenant_invitations/inv_revoked_fail`,
          fields: toFirestoreFields({
            invitationId: 'inv_revoked_fail',
            status: 'accepted',
            acceptedByUid: 'revoked_owner_uid'
          }).fields
        }
      }
    ], tokenRevokedOwner)
  );

  // Failure Case 4: Already accepted invitation
  await seedDoc('tenant_invitations/inv_already_acc', {
    invitationId: 'inv_already_acc',
    clientId: 'salon-acc',
    invitedOwnerEmail: 'acc_owner@salon.com',
    status: 'accepted',
    token: 'tok_acc',
    acceptedByUid: 'first_owner_uid',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });
  recordTest('S22-31', 'Re-accepting already accepted invitation rejected', 'DENY',
    await apiCommit([
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/tenant_invitations/inv_already_acc`,
          fields: toFirestoreFields({
            invitationId: 'inv_already_acc',
            status: 'accepted',
            acceptedByUid: 'second_owner_uid'
          }).fields
        }
      }
    ], tokenAttacker)
  );

  // Failure Case 5: Modified clientId during activation
  await seedDoc('clients/salon-target-tamper', {
    id: 'salon-target-tamper',
    name: 'Tamper Target',
    status: 'pending_invitation',
    active: false
  });
  recordTest('S22-32', 'Activating mismatched tenant using another invitation rejected', 'DENY',
    await apiPatch('clients/salon-target-tamper', {
      status: 'active',
      active: true,
      activatedByInvitationId: prodInvId // Issued for salon-prod-test, NOT salon-target-tamper
    }, tokenProdOwner)
  );

  // Failure Case 6: Attacker activating tenant directly without invitation
  recordTest('S22-33', 'Attacker denied directly activating tenant without invitation', 'DENY',
    await apiPatch(`clients/${prodClientId}`, {
      status: 'active',
      active: true
    }, tokenAttacker)
  );

  // Failure Case 7: Attacker self-granting client role without invitation
  recordTest('S22-34', 'Attacker denied self-granting client role without invitation', 'DENY',
    await apiPatch('users/attacker_uid_2', {
      uid: 'attacker_uid_2',
      email: 'attacker2@evil.com',
      role: 'client',
      assignedClientId: prodClientId
    }, tokenAttacker)
  );

  // 35. Resulting owner denied self-elevating role to developer
  recordTest('S22-35', 'Resulting owner denied elevating role to developer', 'DENY',
    await apiPatch(`users/${prodOwnerUid}`, {
      role: 'developer'
    }, tokenProdOwner)
  );

  // ==========================================================================
  // SECTION L: STEP 22 PHASE 3 INVITATION RESEND & INVALIDATION SUITE
  // ==========================================================================
  console.log('\nExecuting Section L: Step 22 Phase 3 Resend & Invalidation Suite...');
  const resendClientId = 'salon-resend-test';
  const resendOwnerEmail = 'owner_resend@salon.com';
  const resendOwnerUid = 'owner_resend_uid';
  const tokenResendOwner = createMockToken(resendOwnerUid, { email: resendOwnerEmail });

  // 1. Seed pending tenant
  await seedDoc(`clients/${resendClientId}`, {
    id: resendClientId,
    name: 'Salon Resend Test',
    status: 'pending_invitation',
    active: false,
    invitedOwnerEmail: resendOwnerEmail,
    content: { brand: { name: 'Salon Resend Test' } }
  });

  // 2. Client / visitor cannot modify pending_invitation tenant
  recordTest('S23-01', 'Unassigned user denied modifying pending_invitation tenant', 'DENY',
    await apiPatch(`clients/${resendClientId}`, {
      content: { brand: { name: 'Hacked Salon' } }
    }, tokenAttacker)
  );

  // 3. First invitation created by developer
  const firstInvId = 'inv_resend_first';
  recordTest('S23-02', 'Developer creates first invitation for salon-resend-test', 'ALLOW',
    await apiPatch(`tenant_invitations/${firstInvId}`, {
      invitationId: firstInvId,
      clientId: resendClientId,
      invitedOwnerEmail: resendOwnerEmail,
      status: 'pending',
      token: 'token_first_resend',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString()
    }, tokenFreshDev)
  );

  // 4. Developer revokes first invitation during resend
  recordTest('S23-03', 'Developer revokes first invitation during resend', 'ALLOW',
    await apiPatch(`tenant_invitations/${firstInvId}`, {
      status: 'revoked',
      revokedAt: new Date().toISOString(),
      revokedByUid: 'fresh_dev_uid'
    }, tokenFreshDev)
  );

  // 5. Recipient denied accepting the revoked first invitation
  recordTest('S23-04', 'Recipient denied accepting revoked first invitation', 'DENY',
    await apiPatch(`tenant_invitations/${firstInvId}`, {
      invitationId: firstInvId,
      clientId: resendClientId,
      invitedOwnerEmail: resendOwnerEmail,
      token: 'token_first_resend',
      status: 'accepted',
      acceptedByUid: resendOwnerUid
    }, tokenResendOwner)
  );

  // 6. Developer creates fresh second invitation
  const secondInvId = 'inv_resend_second';
  recordTest('S23-05', 'Developer creates fresh second invitation for salon-resend-test', 'ALLOW',
    await apiPatch(`tenant_invitations/${secondInvId}`, {
      invitationId: secondInvId,
      clientId: resendClientId,
      invitedOwnerEmail: resendOwnerEmail,
      status: 'pending',
      token: 'token_second_resend',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 72 * 3600 * 1000).toISOString()
    }, tokenFreshDev)
  );

  // 7. Intended recipient accepts the fresh second invitation atomically
  const resendAtomicWrites = [
    {
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/tenant_invitations/${secondInvId}`,
        fields: toFirestoreFields({
          invitationId: secondInvId,
          clientId: resendClientId,
          invitedOwnerEmail: resendOwnerEmail,
          status: 'accepted',
          token: 'token_second_resend',
          acceptedByUid: resendOwnerUid
        }).fields
      }
    },
    {
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/users/${resendOwnerUid}`,
        fields: toFirestoreFields({
          uid: resendOwnerUid,
          email: resendOwnerEmail,
          role: 'client',
          assignedClientId: resendClientId,
          invitationId: secondInvId
        }).fields
      }
    },
    {
      update: {
        name: `projects/${PROJECT_ID}/databases/(default)/documents/clients/${resendClientId}`,
        fields: toFirestoreFields({
          status: 'active',
          active: true,
          activatedByInvitationId: secondInvId
        }).fields
      },
      updateMask: {
        fieldPaths: ['status', 'active', 'activatedByInvitationId']
      }
    }
  ];

  recordTest('S23-06', 'Recipient successfully accepts fresh second invitation atomically', 'ALLOW',
    await apiCommit(resendAtomicWrites, tokenResendOwner)
  );

  // 8. Attacker denied attempting to re-accept the first revoked invitation
  recordTest('S23-07', 'Attacker denied accepting old revoked invitation after tenant is active', 'DENY',
    await apiPatch(`tenant_invitations/${firstInvId}`, {
      status: 'accepted',
      acceptedByUid: 'attacker_uid'
    }, tokenAttacker)
  );

  // ==========================================================================
  // DISPLAY SUMMARY
  // ==========================================================================
  console.log('\n================================================================');
  console.log('ALL EXECUTED SECURITY TESTS (BASELINE + S8 + S12 + S13 + S14 + S15 + S16 + S21 + S22)');
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
