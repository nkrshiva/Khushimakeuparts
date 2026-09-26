import type { EnquiryItem, EnquiryStatus } from '../../domain/enquiry/types';
import {
  enquiryRepository,
  IEnquiryRepository,
} from '../../repositories/enquiry/EnquiryRepository';

export interface SubmitEnquiryResult {
  success: boolean;
  enquiry?: EnquiryItem;
  isUpdate?: boolean;
  error?: string;
}

/**
 * EnquiryService
 *
 * Application service boundary encapsulating enquiry business logic, 30-minute deduplication,
 * phone sanitization, and lifecycle status management.
 * Delegates persistence mechanics to EnquiryRepository.
 *
 * Architectural Rule:
 * - Has ZERO direct dependencies on React, UI state, or the Firebase SDK.
 */
export class EnquiryService {
  private repository: IEnquiryRepository;

  constructor(repository: IEnquiryRepository = enquiryRepository) {
    this.repository = repository;
  }

  /**
   * Submits a customer enquiry with deduplication protection.
   * If an enquiry with the same phone or identity arrived within 30 minutes, merges notes.
   * Otherwise, generates a new unique ID and sets initial status to 'new'.
   */
  async submitEnquiry(
    clientId: string,
    enquiryData: Omit<EnquiryItem, 'id' | 'createdAt' | 'status'>,
    currentEnquiries: EnquiryItem[] = []
  ): Promise<SubmitEnquiryResult> {
    try {
      if (!clientId) {
        return { success: false, error: 'MISSING_CLIENT_ID' };
      }

      const clientName = enquiryData.clientName?.trim();
      const rawPhone = enquiryData.phone?.trim();

      if (!clientName || !rawPhone) {
        return { success: false, error: 'VALIDATION_FAILED' };
      }

      const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

      // Check 30-minute deduplication window
      const existingIdx = currentEnquiries.findIndex((item) => {
        const itemCleanPhone = (item.phone || '').replace(/[^0-9]/g, '');
        const hasMatchingPhone = cleanPhone && itemCleanPhone && cleanPhone === itemCleanPhone;
        const hasMatchingIdentity =
          item.clientName?.trim().toLowerCase() === clientName.toLowerCase() &&
          item.ceremonyType === enquiryData.ceremonyType &&
          item.location === enquiryData.location;

        if (hasMatchingPhone || hasMatchingIdentity) {
          const existingTime = new Date(item.createdAt).getTime();
          const diffMinutes = (Date.now() - existingTime) / (1000 * 60);
          return diffMinutes < 30;
        }
        return false;
      });

      let finalEnquiry: EnquiryItem;
      let isUpdate = false;

      if (existingIdx !== -1) {
        const existing = currentEnquiries[existingIdx];
        isUpdate = true;
        finalEnquiry = {
          ...existing,
          ...enquiryData,
          clientName,
          phone: rawPhone,
          notes: enquiryData.notes || existing.notes,
          createdAt: new Date().toISOString(),
        };
      } else {
        const targetId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        finalEnquiry = {
          ...enquiryData,
          id: targetId,
          clientName,
          phone: rawPhone,
          status: 'new',
          createdAt: new Date().toISOString(),
        };
      }

      await this.repository.saveEnquiry(clientId, finalEnquiry);

      return {
        success: true,
        enquiry: finalEnquiry,
        isUpdate,
      };
    } catch (err: any) {
      console.warn('EnquiryService: Failed to record enquiry:', err);
      return { success: false, error: err?.message || 'ENQUIRY_FAILED' };
    }
  }

  /**
   * Updates an existing enquiry status.
   */
  async updateEnquiryStatus(
    clientId: string,
    enquiryId: string,
    status: EnquiryStatus
  ): Promise<boolean> {
    try {
      if (!clientId || !enquiryId) return false;
      await this.repository.updateEnquiryStatus(clientId, enquiryId, status);
      return true;
    } catch (err) {
      console.warn('EnquiryService: Failed to update enquiry status:', err);
      return false;
    }
  }

  /**
   * Deletes an individual enquiry document.
   */
  async deleteEnquiry(clientId: string, enquiryId: string): Promise<boolean> {
    try {
      if (!clientId || !enquiryId) return false;
      await this.repository.deleteEnquiry(clientId, enquiryId);
      return true;
    } catch (err) {
      console.warn('EnquiryService: Failed to delete enquiry:', err);
      return false;
    }
  }

  /**
   * Clears all enquiries in batch.
   */
  async clearAllEnquiries(clientId: string, enquiryIds: string[]): Promise<boolean> {
    try {
      if (!clientId || !enquiryIds.length) return false;
      await this.repository.clearAllEnquiries(clientId, enquiryIds);
      return true;
    } catch (err) {
      console.warn('EnquiryService: Failed to clear all enquiries:', err);
      return false;
    }
  }

  /**
   * Subscribes to the real-time enquiries stream for a given tenant.
   */
  subscribeEnquiries(
    clientId: string,
    onData: (enquiries: EnquiryItem[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return this.repository.subscribeEnquiries(clientId, onData, onError);
  }
}

export const enquiryService = new EnquiryService();
