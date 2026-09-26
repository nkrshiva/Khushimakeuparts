import type {
  AppointmentItem,
  AppointmentStatus,
  BusySlotItem,
  DayOfWeek,
  BusinessHoursConfig,
} from '../../domain/booking/types';
import type { StaffMember } from '../../domain/staff/types';
import type { ServiceItem } from '../../domain/catalog/types';
import {
  bookingRepository,
  IBookingRepository,
  CandidateStaff,
} from '../../repositories/booking/BookingRepository';

export interface CreateAppointmentRequest {
  appointment: Omit<AppointmentItem, 'id' | 'createdAt' | 'status' | 'startMinute' | 'endMinute'> & {
    startMinute?: number;
    endMinute?: number;
  };
  activeClientId: string;
  businessHours?: BusinessHoursConfig;
  staffList?: StaffMember[];
  servicesList?: ServiceItem[];
  brandFounder?: string;
  isStaffManagementEnabled?: boolean;
}

export interface CreateAppointmentResponse {
  success: boolean;
  error?: 'SLOT_TAKEN' | 'CLOSED' | 'INVALID_STAFF' | string;
  appointmentId?: string;
  assignedStaff?: CandidateStaff;
  appointment?: AppointmentItem;
  busySlot?: BusySlotItem;
}

/**
 * BookingService
 *
 * Application service boundary encapsulating booking orchestration, staff eligibility,
 * time block quanta calculations, and status transitions.
 * Delegates data-access persistence and Firestore transactions to BookingRepository.
 *
 * Architectural Rule:
 * - Has ZERO direct dependencies on React, UI state, or the Firebase SDK.
 */
export class BookingService {
  private repository: IBookingRepository;

  constructor(repository: IBookingRepository = bookingRepository) {
    this.repository = repository;
  }

  /**
   * Orchestrates the complete appointment creation flow:
   * 1. Normalizes times and parses start/end minutes.
   * 2. Calculates 15-minute quanta blocks for deterministic collision locking.
   * 3. Evaluates eligible candidate staff members according to working days and services.
   * 4. Atomically reserves slot locks and persists appointment + busy slot documents via repository.
   */
  async createAppointment(request: CreateAppointmentRequest): Promise<CreateAppointmentResponse> {
    try {
      const {
        appointment,
        activeClientId,
        businessHours,
        staffList = [],
        servicesList = [],
        brandFounder,
        isStaffManagementEnabled = false,
      } = request;

      if (!activeClientId) {
        return { success: false, error: 'MISSING_CLIENT_ID' };
      }

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

      const endH24 = Math.floor(endMin / 60);
      const endMins = endMin % 60;
      const endAmPm = endH24 >= 12 ? 'PM' : 'AM';
      const endH12 = endH24 % 12 === 0 ? 12 : endH24 % 12;
      const calculatedEndTime = `${endH12.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')} ${endAmPm}`;

      // 1. Calculate 15-minute quanta blocks for deterministic locking (including buffer)
      const buffer = businessHours?.bufferMinutes || 0;
      const effectiveEndMin = endMin + buffer;
      const BLOCK_SIZE = 15;
      const blockMinutes: number[] = [];
      for (let m = Math.floor(startMin / BLOCK_SIZE) * BLOCK_SIZE; m < effectiveEndMin; m += BLOCK_SIZE) {
        blockMinutes.push(m);
      }

      // 2. Identify candidate staff member(s)
      const dateObj = new Date(`${appointment.date}T00:00:00`);
      const dayNames: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayOfWeek = dayNames[dateObj.getDay()];

      let candidateStaffList: CandidateStaff[] = [];

      if (appointment.staffId) {
        // Specific specialist requested
        const staffMember = staffList.find((s) => s.id === appointment.staffId);
        if (
          staffMember &&
          (staffMember.active === false || (staffMember.workingDays && !staffMember.workingDays.includes(dayOfWeek)))
        ) {
          return { success: false, error: 'INVALID_STAFF' };
        }
        candidateStaffList = [
          { id: appointment.staffId, name: appointment.staffName || staffMember?.name || 'Specialist' },
        ];
      } else {
        // "Any Specialist"
        const activeSvc = servicesList.find((s) => s.id === appointment.serviceId);
        const eligibleStaff = staffList.filter((st) => {
          if (st.active === false) return false;
          if (st.workingDays && !st.workingDays.includes(dayOfWeek)) return false;
          if (activeSvc?.eligibleStaffIds && activeSvc.eligibleStaffIds.length > 0) {
            return activeSvc.eligibleStaffIds.includes(st.id);
          }
          if (st.assignedServiceIds && st.assignedServiceIds.length > 0 && activeSvc) {
            return st.assignedServiceIds.includes(activeSvc.id);
          }
          return true;
        });

        if (isStaffManagementEnabled && staffList.length > 0) {
          if (eligibleStaff.length === 0) {
            return { success: false, error: 'CLOSED' };
          }
          candidateStaffList = eligibleStaff.map((s) => ({ id: s.id, name: s.name }));
        } else {
          // Solo atelier / Khushi MUA
          candidateStaffList = [{ id: 'solo', name: brandFounder || 'Lead Artist' }];
        }
      }

      const newAptId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const nowIso = new Date().toISOString();

      const txResult = await this.repository.createAppointmentWithLocks({
        activeClientId,
        appointmentData: appointment,
        candidateStaffList,
        blockMinutes,
        startMinute: startMin,
        endMinute: endMin,
        durationMinutes: duration,
        calculatedEndTime,
        newAptId,
        nowIso,
      });

      return {
        success: true,
        appointmentId: newAptId,
        assignedStaff: txResult.assignedStaff,
        appointment: txResult.appointment,
        busySlot: txResult.busySlot,
      };
    } catch (e: any) {
      if (e?.message === 'SLOT_TAKEN' || e?.message?.includes('SLOT_TAKEN')) {
        return { success: false, error: 'SLOT_TAKEN' };
      }
      console.warn('BookingService: Failed to record appointment atomically:', e);
      return { success: false, error: e?.message || 'TRANSACTION_FAILED' };
    }
  }

  /**
   * Updates an existing appointment status and handles slot lock / busy slot cleanups on cancellation.
   */
  async updateAppointmentStatus(
    activeClientId: string,
    appointmentId: string,
    status: AppointmentStatus,
    lockIds?: string[]
  ): Promise<boolean> {
    try {
      await this.repository.updateAppointmentStatus(activeClientId, appointmentId, status, lockIds);
      return true;
    } catch (e) {
      console.warn('BookingService: Failed to update appointment status:', e);
      return false;
    }
  }

  /**
   * Deletes an appointment and cleans up associated busy slots and slot locks.
   */
  async deleteAppointment(
    activeClientId: string,
    appointmentId: string,
    lockIds?: string[]
  ): Promise<boolean> {
    try {
      await this.repository.deleteAppointment(activeClientId, appointmentId, lockIds);
      return true;
    } catch (e) {
      console.warn('BookingService: Failed to delete appointment:', e);
      return false;
    }
  }

  /**
   * Subscribes to real-time appointments stream.
   */
  subscribeAppointments(
    activeClientId: string,
    onData: (appointments: AppointmentItem[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return this.repository.subscribeAppointments(activeClientId, onData, onError);
  }

  /**
   * Subscribes to real-time busy slots stream.
   */
  subscribeBusySlots(
    activeClientId: string,
    onData: (busySlots: BusySlotItem[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return this.repository.subscribeBusySlots(activeClientId, onData, onError);
  }
}

export const bookingService = new BookingService();
