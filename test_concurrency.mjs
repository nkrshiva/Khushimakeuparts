// Concurrency & Atomic Booking Test Suite for Master Beauty SaaS
// Verifies Scenarios A through G

class MockFirestore {
  constructor() {
    this.store = new Map(); // key -> { exists: boolean, data: any, version: number }
    this.versionCounter = 1;
  }

  getDocKey(pathParts) {
    return pathParts.join('/');
  }

  getDoc(key) {
    if (!this.store.has(key)) {
      return { exists: false, data: null, version: 0 };
    }
    const item = this.store.get(key);
    return { exists: item.exists, data: JSON.parse(JSON.stringify(item.data)), version: item.version };
  }

  // Simulates Firestore optimistic concurrency runTransaction with automatic retry
  async runTransaction(updateFunction, maxRetries = 5) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const readVersions = new Map(); // key -> version read
      const pendingWrites = new Map(); // key -> { type: 'set'|'delete', data: any }

      const transactionContext = {
        get: async (ref) => {
          // Artificial micro-jitter to provoke interleaving in concurrent calls
          await new Promise((r) => setTimeout(r, Math.random() * 8));
          const doc = this.getDoc(ref.key);
          readVersions.set(ref.key, doc.version);
          return {
            exists: () => doc.exists,
            data: () => doc.data,
          };
        },
        set: (ref, data) => {
          pendingWrites.set(ref.key, { type: 'set', data: JSON.parse(JSON.stringify(data)) });
        },
        delete: (ref) => {
          pendingWrites.set(ref.key, { type: 'delete' });
        },
      };

      try {
        const result = await updateFunction(transactionContext);

        // Commit phase: atomic check of all readVersions against current database state
        // In real Firestore, this is done atomically on the server
        let conflict = false;
        for (const [key, ver] of readVersions.entries()) {
          const currentDoc = this.getDoc(key);
          if (currentDoc.version !== ver) {
            conflict = true;
            break;
          }
        }

        if (conflict) {
          // Version collision detected, retry transaction (Firestore OCC semantics)
          await new Promise((r) => setTimeout(r, Math.random() * 10 + 2));
          continue;
        }

        // Commit all pending writes atomically
        this.versionCounter++;
        for (const [key, op] of pendingWrites.entries()) {
          if (op.type === 'set') {
            this.store.set(key, { exists: true, data: op.data, version: this.versionCounter });
          } else if (op.type === 'delete') {
            this.store.set(key, { exists: false, data: null, version: this.versionCounter });
          }
        }

        return result;
      } catch (err) {
        // If an explicit application error like 'SLOT_TAKEN' was thrown, abort immediately
        // No writes are committed.
        throw err;
      }
    }
    throw new Error('TRANSACTION_MAX_RETRIES_EXCEEDED');
  }
}

// Emulates the booking logic from ContentContext.tsx
async function executeBooking(db, content, activeClientId, appointment) {
  let startMin = appointment.startMinute;
  let endMin = appointment.endMinute;
  const duration = appointment.durationMinutes || 30;

  if (typeof startMin !== 'number') {
    const [timeStr, ampm] = (appointment.timeSlot || '10:00 AM').split(' ');
    const [hStr, mStr] = (timeStr || '10:00').split(':');
    let hour = parseInt(hStr, 10);
    const minute = parseInt(mStr || '0', 10);
    if (ampm?.toUpperCase() === 'PM' && hour < 12) hour += 12;
    if (ampm?.toUpperCase() === 'AM' && hour === 12) hour = 0;
    startMin = hour * 60 + minute;
  }
  if (typeof endMin !== 'number') {
    endMin = startMin + duration;
  }

  // 15-minute quanta blocks for deterministic locking (including buffer)
  const buffer = content.businessHours?.bufferMinutes || 0;
  const effectiveEndMin = endMin + buffer;
  const BLOCK_SIZE = 15;
  const blockMinutes = [];
  for (let m = Math.floor(startMin / BLOCK_SIZE) * BLOCK_SIZE; m < effectiveEndMin; m += BLOCK_SIZE) {
    blockMinutes.push(m);
  }

  const dateObj = new Date(`${appointment.date}T00:00:00`);
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = dayNames[dateObj.getDay()];

  let candidateStaffList = [];
  if (appointment.staffId) {
    const staffMember = (content.staff || []).find((s) => s.id === appointment.staffId);
    if (staffMember && (staffMember.active === false || (staffMember.workingDays && !staffMember.workingDays.includes(dayOfWeek)))) {
      return { success: false, error: 'INVALID_STAFF' };
    }
    candidateStaffList = [
      { id: appointment.staffId, name: appointment.staffName || staffMember?.name || 'Specialist' }
    ];
  } else {
    // "Any Specialist"
    const activeSvc = (content.services || []).find((s) => s.id === appointment.serviceId);
    const eligibleStaff = (content.staff || []).filter((st) => {
      if (st.active === false) return false;
      if (st.workingDays && !st.workingDays.includes(dayOfWeek)) return false;
      if (activeSvc?.eligibleStaffIds && activeSvc.eligibleStaffIds.length > 0) {
        return activeSvc.eligibleStaffIds.includes(st.id);
      }
      return true;
    });

    if (content.enabledModules?.staffManagement && content.staff && content.staff.length > 0) {
      if (eligibleStaff.length === 0) {
        return { success: false, error: 'CLOSED' };
      }
      candidateStaffList = eligibleStaff.map((s) => ({ id: s.id, name: s.name }));
    } else {
      // Solo atelier / Khushi MUA
      candidateStaffList = [{ id: 'solo', name: content.brand?.founder || 'Lead Artist' }];
    }
  }

  const newAptId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const nowIso = new Date().toISOString();

  try {
    const txResult = await db.runTransaction(async (transaction) => {
      // --- READ PHASE: Must read all lock documents across all candidates before writing ---
      const staffChecks = candidateStaffList.map((st) => ({
        staff: st,
        locks: blockMinutes.map((bMin) => {
          const lockId = `${appointment.date}_${st.id}_${bMin}`;
          const key = `clients/${activeClientId}/slot_locks/${lockId}`;
          return { lockId, blockMinute: bMin, ref: { key } };
        }),
      }));

      const readPromises = [];
      for (const sc of staffChecks) {
        for (const lock of sc.locks) {
          readPromises.push(
            transaction.get(lock.ref).then((snap) => ({
              staffId: sc.staff.id,
              lockId: lock.lockId,
              exists: snap.exists(),
              blockMinute: lock.blockMinute,
              ref: lock.ref,
            }))
          );
        }
      }

      const readResults = await Promise.all(readPromises);

      // Find first candidate staff member who has zero conflicting locks
      let chosenStaff = null;
      let chosenLocks = [];

      for (const sc of staffChecks) {
        const staffLocks = readResults.filter((r) => r.staffId === sc.staff.id);
        const isBlocked = staffLocks.some((r) => r.exists);
        if (!isBlocked) {
          chosenStaff = sc.staff;
          chosenLocks = sc.locks;
          break;
        }
      }

      if (!chosenStaff || chosenLocks.length === 0) {
        throw new Error('SLOT_TAKEN');
      }

      // --- WRITE PHASE: Atomically write locks + appointment + busy_slot ---
      const lockIds = chosenLocks.map((l) => l.lockId);

      for (const lock of chosenLocks) {
        const lockData = {
          id: lock.lockId,
          clientId: activeClientId,
          appointmentId: newAptId,
          date: appointment.date,
          staffId: chosenStaff.id,
          blockMinute: lock.blockMinute,
          startMinute: startMin,
          endMinute: endMin,
          createdAt: nowIso,
        };
        transaction.set(lock.ref, lockData);
      }

      const aptRef = { key: `clients/${activeClientId}/appointments/${newAptId}` };
      const finalAppointment = {
        ...appointment,
        id: newAptId,
        clientId: activeClientId,
        staffId: chosenStaff.id,
        staffName: chosenStaff.name,
        startMinute: startMin,
        endMinute: endMin,
        status: 'pending',
        createdAt: nowIso,
        lockIds,
      };
      transaction.set(aptRef, finalAppointment);

      const busyRef = { key: `clients/${activeClientId}/busy_slots/${newAptId}` };
      const finalBusySlot = {
        id: newAptId,
        date: appointment.date,
        startMinute: startMin,
        endMinute: endMin,
        staffId: chosenStaff.id,
      };
      transaction.set(busyRef, finalBusySlot);

      return {
        appointment: finalAppointment,
        busySlot: finalBusySlot,
        assignedStaff: chosenStaff,
      };
    });

    return {
      success: true,
      appointmentId: newAptId,
      assignedStaff: txResult.assignedStaff,
    };
  } catch (err) {
    if (err?.message === 'SLOT_TAKEN' || err?.message?.includes('SLOT_TAKEN')) {
      return { success: false, error: 'SLOT_TAKEN' };
    }
    return { success: false, error: err?.message || 'TRANSACTION_FAILED' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST RUNNER
// ─────────────────────────────────────────────────────────────────────────────

async function runAllTests() {
  console.log('================================================================');
  console.log('STARTING CONCURRENCY & ATOMIC BOOKING TEST SUITE (SCENARIOS A-G)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    } else {
      console.log(`✅ PASSED: ${message}`);
      passed++;
    }
  }

  // Standard Salon Tenant Setup
  const salonContent = {
    brand: { name: 'Glamour Salon', founder: 'Pooja Verma' },
    archetype: 'salon',
    enabledModules: { staffManagement: true },
    businessHours: {
      bufferMinutes: 15,
      slotIntervalMinutes: 30,
      schedule: [
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '20:00' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '20:00' }
      ]
    },
    staff: [
      { id: 'staff-1', name: 'Riya Sen', role: 'Hair Stylist', active: true, workingDays: ['wednesday', 'thursday'] },
      { id: 'staff-2', name: 'Ananya Roy', role: 'Colorist', active: true, workingDays: ['wednesday', 'thursday'] }
    ],
    services: [
      { id: 'haircut', title: 'Haircut & Styling', durationMinutes: 45 }
    ]
  };

  // Solo MUA Tenant Setup (Khushi)
  const khushiContent = {
    brand: { name: 'Khushi Makeup Arts', founder: 'Khushi Kumari' },
    archetype: 'solo_mua',
    enabledModules: { staffManagement: false },
    businessHours: { bufferMinutes: 0 },
    staff: [],
    services: [
      { id: 'bridal', title: 'HD Bridal Makeup', durationMinutes: 120 }
    ]
  };

  // ---------------------------------------------------------------------------
  // SCENARIO A: Two simultaneous attempts for same staff + same interval -> exactly 1 succeeds
  // ---------------------------------------------------------------------------
  console.log('--- SCENARIO A: Same Staff, Same Interval Concurrency ---');
  {
    const db = new MockFirestore();
    const req1 = {
      customerName: 'Client Alpha',
      staffId: 'staff-1',
      date: '2026-10-07', // Wednesday
      timeSlot: '10:00 AM',
      startMinute: 600,
      durationMinutes: 60,
    };
    const req2 = {
      customerName: 'Client Beta',
      staffId: 'staff-1',
      date: '2026-10-07',
      timeSlot: '10:00 AM',
      startMinute: 600,
      durationMinutes: 60,
    };

    const [res1, res2] = await Promise.all([
      executeBooking(db, salonContent, 'glamour', req1),
      executeBooking(db, salonContent, 'glamour', req2),
    ]);

    const successes = [res1, res2].filter((r) => r.success);
    const errors = [res1, res2].filter((r) => !r.success);

    assert(successes.length === 1, 'Exactly one simultaneous booking succeeds for the exact same slot');
    assert(errors.length === 1 && errors[0].error === 'SLOT_TAKEN', 'Losing request fails with SLOT_TAKEN');
  }

  // ---------------------------------------------------------------------------
  // SCENARIO B: Overlapping intervals (10:00-11:00 vs 10:30-11:30) -> exactly 1 succeeds
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO B: Same Staff, Overlapping Intervals Concurrency ---');
  {
    const db = new MockFirestore();
    const req1 = {
      customerName: 'Client 1 (10:00-11:00)',
      staffId: 'staff-1',
      date: '2026-10-07',
      startMinute: 600, // 10:00
      endMinute: 660,   // 11:00
      durationMinutes: 60,
    };
    const req2 = {
      customerName: 'Client 2 (10:30-11:30)',
      staffId: 'staff-1',
      date: '2026-10-07',
      startMinute: 630, // 10:30
      endMinute: 690,   // 11:30
      durationMinutes: 60,
    };

    const [res1, res2] = await Promise.all([
      executeBooking(db, salonContent, 'glamour', req1),
      executeBooking(db, salonContent, 'glamour', req2),
    ]);

    const successes = [res1, res2].filter((r) => r.success);
    const errors = [res1, res2].filter((r) => !r.success);

    assert(successes.length === 1, 'Exactly one overlapping interval booking succeeds');
    assert(errors.length === 1 && errors[0].error === 'SLOT_TAKEN', 'Overlapping contender rejected with SLOT_TAKEN');
  }

  // ---------------------------------------------------------------------------
  // SCENARIO C: Two simultaneous "Any Specialist" attempts when only 1 specialist is available -> exactly 1 succeeds
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO C: Any Specialist with 1 Available Specialist ---');
  {
    const db = new MockFirestore();
    // Content with only 1 staff member working
    const singleStaffContent = {
      ...salonContent,
      staff: [
        { id: 'staff-solo', name: 'Pooja', role: 'Senior Stylist', active: true, workingDays: ['wednesday'] }
      ]
    };

    const req1 = {
      customerName: 'Guest 1',
      serviceId: 'haircut',
      date: '2026-10-07',
      startMinute: 600, // 10:00
      durationMinutes: 45,
    };
    const req2 = {
      customerName: 'Guest 2',
      serviceId: 'haircut',
      date: '2026-10-07',
      startMinute: 600, // 10:00
      durationMinutes: 45,
    };

    const [res1, res2] = await Promise.all([
      executeBooking(db, singleStaffContent, 'glamour', req1),
      executeBooking(db, singleStaffContent, 'glamour', req2),
    ]);

    const successes = [res1, res2].filter((r) => r.success);
    const errors = [res1, res2].filter((r) => !r.success);

    assert(successes.length === 1, 'Only 1 "Any Specialist" request succeeds when 1 specialist is available');
    assert(errors.length === 1 && errors[0].error === 'SLOT_TAKEN', 'Contending "Any Specialist" request returns SLOT_TAKEN');
  }

  // ---------------------------------------------------------------------------
  // SCENARIO D: Two simultaneous "Any Specialist" attempts when 2 specialists are available -> both succeed with distinct staff
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO D: Any Specialist with 2 Available Specialists ---');
  {
    const db = new MockFirestore();
    const req1 = {
      customerName: 'Customer X',
      serviceId: 'haircut',
      date: '2026-10-07',
      startMinute: 600, // 10:00
      durationMinutes: 45,
    };
    const req2 = {
      customerName: 'Customer Y',
      serviceId: 'haircut',
      date: '2026-10-07',
      startMinute: 600, // 10:00
      durationMinutes: 45,
    };

    const [res1, res2] = await Promise.all([
      executeBooking(db, salonContent, 'glamour', req1),
      executeBooking(db, salonContent, 'glamour', req2),
    ]);

    assert(res1.success === true, 'First customer succeeds');
    assert(res2.success === true, 'Second customer succeeds via retry / parallel staff allocation');
    assert(res1.assignedStaff.id !== res2.assignedStaff.id, `Customers assigned to distinct specialists (${res1.assignedStaff.name} vs ${res2.assignedStaff.name})`);
  }

  // ---------------------------------------------------------------------------
  // SCENARIO E: Failed transaction leaves no orphan appointment or orphan lock
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO E: No Orphan Documents on Transaction Failure ---');
  {
    const db = new MockFirestore();
    const req1 = {
      customerName: 'Valid Winner',
      staffId: 'staff-1',
      date: '2026-10-07',
      startMinute: 600, // 10:00 - 10:30 (blocks 600, 615, + buffer 630)
      durationMinutes: 30,
    };
    const req2 = {
      customerName: 'Failing Loser',
      staffId: 'staff-1',
      date: '2026-10-07',
      startMinute: 600,
      durationMinutes: 30,
    };

    // First do booking 1
    const res1 = await executeBooking(db, salonContent, 'glamour', req1);
    assert(res1.success === true, 'Initial booking succeeds');

    // Count store entries before failing booking
    const entriesBefore = Array.from(db.store.entries()).filter(([_, v]) => v.exists);

    // Now attempt conflicting booking 2
    const res2 = await executeBooking(db, salonContent, 'glamour', req2);
    assert(res2.success === false && res2.error === 'SLOT_TAKEN', 'Conflicting booking fails');

    // Count store entries after failing booking
    const entriesAfter = Array.from(db.store.entries()).filter(([_, v]) => v.exists);

    assert(entriesBefore.length === entriesAfter.length, `Database has exact same active document count before (${entriesBefore.length}) and after (${entriesAfter.length})`);
    
    // Ensure no appointment exists for Failing Loser
    const loserDocs = entriesAfter.filter(([k, v]) => v.data?.customerName === 'Failing Loser');
    assert(loserDocs.length === 0, 'No orphan appointment document exists for failed transaction');
  }

  // ---------------------------------------------------------------------------
  // SCENARIO F: Buffer rule blocks candidate booking during buffer period
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO F: Buffer Rule Blocks Booking in Buffer Window ---');
  {
    const db = new MockFirestore();
    // bufferMinutes is 15. Booking 1: 10:00 AM (startMin 600, duration 30 -> ends at 630).
    // Buffer extends lock to 630 + 15 = 645.
    // Booking 2 attempts 10:30 AM (startMin 630). This falls right inside the buffer!
    const req1 = {
      customerName: 'Prior Client',
      staffId: 'staff-1',
      date: '2026-10-07',
      startMinute: 600, // 10:00 - 10:30
      durationMinutes: 30,
    };
    const req2 = {
      customerName: 'Buffer Contender',
      staffId: 'staff-1',
      date: '2026-10-07',
      startMinute: 630, // 10:30 (falls inside 15-min buffer window of req1)
      durationMinutes: 30,
    };

    const res1 = await executeBooking(db, salonContent, 'glamour', req1);
    assert(res1.success === true, 'Prior booking succeeds');

    const res2 = await executeBooking(db, salonContent, 'glamour', req2);
    assert(res2.success === false && res2.error === 'SLOT_TAKEN', 'Booking directly adjacent within buffer window is blocked with SLOT_TAKEN');

    // Booking at 10:45 AM (startMin 645) is AFTER the buffer and must succeed
    const req3 = {
      customerName: 'Post-Buffer Client',
      staffId: 'staff-1',
      date: '2026-10-07',
      startMinute: 645, // 10:45 (after buffer)
      durationMinutes: 30,
    };
    const res3 = await executeBooking(db, salonContent, 'glamour', req3);
    assert(res3.success === true, 'Booking right after buffer window (10:45 AM) successfully succeeds');
  }

  // ---------------------------------------------------------------------------
  // SCENARIO G: Khushi solo_mua flow remains intact
  // ---------------------------------------------------------------------------
  console.log('\n--- SCENARIO G: Khushi solo_mua Flow Integrity ---');
  {
    const db = new MockFirestore();
    // In solo_mua mode (staffManagement disabled), candidate is automatically assigned to 'solo' (Khushi Kumari)
    const req1 = {
      customerName: 'Bride Shreya',
      serviceId: 'bridal',
      date: '2026-11-20',
      timeSlot: '11:00 AM',
      startMinute: 660,
      durationMinutes: 120, // 2 hour bridal makeup
    };

    const res1 = await executeBooking(db, khushiContent, 'khushi', req1);
    assert(res1.success === true, 'Khushi solo bridal appointment succeeds');
    assert(res1.assignedStaff.id === 'solo' && res1.assignedStaff.name === 'Khushi Kumari', 'Assigned directly to founder "Khushi Kumari" under solo id');

    // Attempt concurrent overlapping booking on Khushi's calendar
    const req2 = {
      customerName: 'Bride Pooja',
      serviceId: 'bridal',
      date: '2026-11-20',
      timeSlot: '12:00 PM',
      startMinute: 720, // Overlaps with 660-780
      durationMinutes: 120,
    };
    const res2 = await executeBooking(db, khushiContent, 'khushi', req2);
    assert(res2.success === false && res2.error === 'SLOT_TAKEN', 'Overlapping booking on Khushi calendar is protected and returns SLOT_TAKEN');
  }

  console.log('\n================================================================');
  console.log(`TEST SUITE COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Test runner encountered fatal error:', e);
  process.exit(1);
});
