import {
  collection,
  doc,
  runTransaction,
  setDoc,
  deleteDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../infrastructure/firebase';
import type {
  AppointmentItem,
  AppointmentStatus,
  BusySlotItem,
  SlotLockItem,
} from '../../domain/booking/types';

export interface CandidateStaff {
  id: string;
  name: string;
}

export interface CreateAppointmentWithLocksParams {
  activeClientId: string;
  appointmentData: Omit<AppointmentItem, 'id' | 'createdAt' | 'status' | 'startMinute' | 'endMinute'>;
  candidateStaffList: CandidateStaff[];
  blockMinutes: number[];
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
  calculatedEndTime: string;
  newAptId: string;
  nowIso: string;
}

export interface CreateAppointmentWithLocksResult {
  appointment: AppointmentItem;
  busySlot: BusySlotItem;
  assignedStaff: CandidateStaff;
}

export interface IBookingRepository {
  createAppointmentWithLocks(
    params: CreateAppointmentWithLocksParams
  ): Promise<CreateAppointmentWithLocksResult>;

  updateAppointmentStatus(
    activeClientId: string,
    appointmentId: string,
    status: AppointmentStatus,
    lockIds?: string[]
  ): Promise<void>;

  deleteAppointment(
    activeClientId: string,
    appointmentId: string,
    lockIds?: string[]
  ): Promise<void>;

  subscribeAppointments(
    activeClientId: string,
    onData: (appointments: AppointmentItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe;

  subscribeBusySlots(
    activeClientId: string,
    onData: (busySlots: BusySlotItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe;
}

/**
 * BookingRepository
 *
 * Implements persistence and concurrency mechanics for the Booking domain.
 * Governs `/clients/{clientId}/appointments`, `/clients/{clientId}/slot_locks`,
 * and `/clients/{clientId}/busy_slots` subcollections in Firestore.
 */
export class BookingRepository implements IBookingRepository {
  /**
   * Atomically verifies candidate slot locks and commits:
   * 1. Deterministic slot lock documents in /slot_locks
   * 2. Appointment document in /appointments
   * 3. Anonymized public collision slot in /busy_slots
   */
  async createAppointmentWithLocks(
    params: CreateAppointmentWithLocksParams
  ): Promise<CreateAppointmentWithLocksResult> {
    const {
      activeClientId,
      appointmentData,
      candidateStaffList,
      blockMinutes,
      startMinute,
      endMinute,
      durationMinutes,
      calculatedEndTime,
      newAptId,
      nowIso,
    } = params;

    if (!db) {
      // Local offline / development fallback
      const chosenStaff = candidateStaffList[0] || { id: 'solo', name: 'Specialist' };
      const lockIds = blockMinutes.map((b) => `${appointmentData.date}_${chosenStaff.id}_${b}`);
      const fallbackAppointment: AppointmentItem = {
        ...appointmentData,
        id: newAptId,
        clientId: activeClientId,
        staffId: chosenStaff.id,
        staffName: chosenStaff.name,
        startMinute,
        endMinute,
        endTime: appointmentData.endTime || calculatedEndTime,
        durationMinutes,
        status: 'pending',
        createdAt: nowIso,
        lockIds,
      };
      const fallbackBusySlot: BusySlotItem = {
        id: newAptId,
        date: appointmentData.date,
        startMinute,
        endMinute,
        staffId: chosenStaff.id,
      };
      return {
        appointment: fallbackAppointment,
        busySlot: fallbackBusySlot,
        assignedStaff: chosenStaff,
      };
    }

    return await runTransaction(db, async (transaction) => {
      // --- READ PHASE: Must read all lock documents across all candidates before writing ---
      type StaffCheck = {
        staff: CandidateStaff;
        locks: { lockId: string; blockMinute: number; ref: any }[];
      };

      const staffChecks: StaffCheck[] = candidateStaffList.map((st) => ({
        staff: st,
        locks: blockMinutes.map((bMin) => {
          const lockId = `${appointmentData.date}_${st.id}_${bMin}`;
          const ref = doc(db, 'clients', activeClientId, 'slot_locks', lockId);
          return { lockId, blockMinute: bMin, ref };
        }),
      }));

      const readPromises: Promise<{
        staffId: string;
        lockId: string;
        exists: boolean;
        blockMinute: number;
        ref: any;
      }>[] = [];

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
      let chosenStaff: CandidateStaff | null = null;
      let chosenLocks: { lockId: string; blockMinute: number; ref: any }[] = [];

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
        const lockData: SlotLockItem = {
          id: lock.lockId,
          clientId: activeClientId,
          appointmentId: newAptId,
          date: appointmentData.date,
          staffId: chosenStaff.id,
          blockMinute: lock.blockMinute,
          startMinute,
          endMinute,
          createdAt: nowIso,
        };
        transaction.set(lock.ref, lockData);
      }

      const aptDocRef = doc(db, 'clients', activeClientId, 'appointments', newAptId);
      const finalAppointment: AppointmentItem = {
        ...appointmentData,
        id: newAptId,
        clientId: activeClientId,
        staffId: chosenStaff.id,
        staffName: chosenStaff.name,
        startMinute,
        endMinute,
        endTime: appointmentData.endTime || calculatedEndTime,
        durationMinutes,
        status: 'pending',
        createdAt: nowIso,
        lockIds,
      };
      transaction.set(aptDocRef, finalAppointment);

      const busyDocRef = doc(db, 'clients', activeClientId, 'busy_slots', newAptId);
      const finalBusySlot: BusySlotItem = {
        id: newAptId,
        date: appointmentData.date,
        startMinute,
        endMinute,
        staffId: chosenStaff.id,
      };
      transaction.set(busyDocRef, finalBusySlot);

      return {
        appointment: finalAppointment,
        busySlot: finalBusySlot,
        assignedStaff: chosenStaff,
      };
    });
  }

  /**
   * Updates an appointment status. If cancelled, safely removes associated busy_slot and slot_locks.
   */
  async updateAppointmentStatus(
    activeClientId: string,
    appointmentId: string,
    status: AppointmentStatus,
    lockIds?: string[]
  ): Promise<void> {
    if (!db) return;

    const aptDocRef = doc(db, 'clients', activeClientId, 'appointments', appointmentId);
    await setDoc(aptDocRef, { status }, { merge: true });

    if (status === 'cancelled') {
      try {
        await deleteDoc(doc(db, 'clients', activeClientId, 'busy_slots', appointmentId));
      } catch (err) {
        console.warn('Could not delete busy slot on cancellation:', err);
      }

      if (lockIds && Array.isArray(lockIds)) {
        for (const lockId of lockIds) {
          try {
            await deleteDoc(doc(db, 'clients', activeClientId, 'slot_locks', lockId));
          } catch (err) {
            console.warn('Could not release slot lock on cancellation:', err);
          }
        }
      }
    }
  }

  /**
   * Deletes an appointment document and cascades deletion to associated busy_slot and slot_locks.
   */
  async deleteAppointment(
    activeClientId: string,
    appointmentId: string,
    lockIds?: string[]
  ): Promise<void> {
    if (!db) return;

    await deleteDoc(doc(db, 'clients', activeClientId, 'appointments', appointmentId));

    try {
      await deleteDoc(doc(db, 'clients', activeClientId, 'busy_slots', appointmentId));
    } catch (err) {
      console.warn('Could not delete busy slot on appointment delete:', err);
    }

    if (lockIds && Array.isArray(lockIds)) {
      for (const lockId of lockIds) {
        try {
          await deleteDoc(doc(db, 'clients', activeClientId, 'slot_locks', lockId));
        } catch (err) {
          console.warn('Could not delete slot lock on appointment delete:', err);
        }
      }
    }
  }

  /**
   * Subscribes to real-time updates for an active client's private appointments subcollection.
   */
  subscribeAppointments(
    activeClientId: string,
    onData: (appointments: AppointmentItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!db || !activeClientId) {
      return () => {};
    }

    const aptColRef = collection(db, 'clients', activeClientId, 'appointments');
    return onSnapshot(
      aptColRef,
      (snapshot) => {
        const list: AppointmentItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as AppointmentItem);
        });
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onData(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }

  /**
   * Subscribes to real-time updates for an active client's anonymized busy slots subcollection.
   */
  subscribeBusySlots(
    activeClientId: string,
    onData: (busySlots: BusySlotItem[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    if (!db || !activeClientId) {
      return () => {};
    }

    const busyColRef = collection(db, 'clients', activeClientId, 'busy_slots');
    return onSnapshot(
      busyColRef,
      (snapshot) => {
        const list: BusySlotItem[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), id: d.id } as BusySlotItem);
        });
        onData(list);
      },
      (err) => {
        if (onError) onError(err);
      }
    );
  }
}

export const bookingRepository = new BookingRepository();
