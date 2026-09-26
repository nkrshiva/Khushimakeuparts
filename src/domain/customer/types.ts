export * from '../enquiry/types';

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  totalAppointments?: number;
  totalEnquiries?: number;
  createdAt: string;
  updatedAt?: string;
}
