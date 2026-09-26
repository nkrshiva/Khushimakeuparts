export type EnquiryStatus = 'new' | 'contacted' | 'booked' | 'completed';

export interface EnquiryItem {
  id: string;
  clientName: string;
  phone: string;
  serviceId?: string;
  ceremonyType?: string;
  eventDate?: string;
  location?: string;
  notes?: string;
  status: EnquiryStatus;
  createdAt: string;
}
