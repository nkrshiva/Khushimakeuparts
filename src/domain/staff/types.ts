import type { DayOfWeek } from '../booking/types';

export interface PublicStaffProfile {
  id: string;
  name: string;
  role: string;                // 'Senior Hair Stylist', 'Skin Aesthetician', 'Lead Artist'
  avatarUrl?: string;
  assignedServiceIds: string[]; // IDs of services this staff member can deliver
  workingDays: DayOfWeek[];
  active: boolean;
}

export interface StaffMember extends PublicStaffProfile {
  phone?: string;
  internalNotes?: string;
}
