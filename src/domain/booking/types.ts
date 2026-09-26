import type { ServiceAddOn } from '../catalog/types';

export type AvailabilityStatus = 'booked' | 'limited' | 'available';

export interface DateAvailabilityItem {
  date: string; // ISO date 'YYYY-MM-DD'
  status: AvailabilityStatus;
  note?: string; // e.g. "Evening Muhurat Booked"
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  openTime: string;    // '10:00'
  closeTime: string;   // '20:00'
  breakStart?: string; // '14:00'
  breakEnd?: string;   // '15:00'
}

export interface BusinessHoursConfig {
  timezone: string;            // 'Asia/Kolkata'
  slotIntervalMinutes: number; // 30 | 45 | 60
  bufferMinutes: number;       // 10
  schedule: DaySchedule[];
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface AppointmentItem {
  id: string;
  clientId: string;            // Multi-tenant key (strict activeClientId)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceId: string;
  serviceTitle: string;
  variantId?: string;
  variantLabel?: string;
  selectedAddOns?: ServiceAddOn[];
  staffId?: string;
  staffName?: string;
  date: string;                // 'YYYY-MM-DD'
  timeSlot: string;            // '11:00 AM'
  endTime?: string;            // '12:30 PM'
  startMinute: number;         // Minutes from midnight (e.g. 660 for 11:00 AM)
  endMinute: number;           // Minutes from midnight (e.g. 750 for 12:30 PM)
  durationMinutes: number;     // Total duration (base service + all add-ons)
  price: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
  source: 'website' | 'phone' | 'walk_in';
  lockIds?: string[];          // Deterministic slot lock document IDs
}

export interface BusySlotItem {
  id: string;
  date: string;
  startMinute: number;
  endMinute: number;
  staffId?: string;
}

export interface SlotLockItem {
  id: string;                  // Deterministic lock key: `${date}_${staffId}_${blockMinute}`
  clientId: string;            // Multi-tenant key
  appointmentId: string;
  date: string;
  staffId: string;
  blockMinute: number;
  startMinute: number;
  endMinute: number;
  createdAt: string;
}
