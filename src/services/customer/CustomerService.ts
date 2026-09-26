import type { CustomerItem } from '../../domain/customer/types';
import type { EnquiryItem } from '../../domain/enquiry/types';
import {
  customerRepository,
  ICustomerRepository,
} from '../../repositories/customer/CustomerRepository';

/**
 * CustomerService
 *
 * Application service boundary encapsulating customer profile management,
 * directory lookups, and customer record synthesis from interactions.
 * Delegates data-access persistence to CustomerRepository.
 *
 * Architectural Rule:
 * - Has ZERO direct dependencies on React, UI state, or the Firebase SDK.
 */
export class CustomerService {
  private repository: ICustomerRepository;

  constructor(repository: ICustomerRepository = customerRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves an individual customer profile.
   */
  async getCustomer(clientId: string, customerId: string): Promise<CustomerItem | null> {
    try {
      if (!clientId || !customerId) return null;
      return await this.repository.getCustomer(clientId, customerId);
    } catch (err) {
      console.warn('CustomerService: Failed to get customer:', err);
      return null;
    }
  }

  /**
   * Persists a customer record with normalized phone and fields.
   */
  async saveCustomer(clientId: string, customer: CustomerItem): Promise<boolean> {
    try {
      if (!clientId || !customer.id) return false;
      const normalized: CustomerItem = {
        ...customer,
        name: customer.name.trim(),
        phone: customer.phone.replace(/[^0-9]/g, ''),
        updatedAt: new Date().toISOString(),
      };
      await this.repository.saveCustomer(clientId, normalized);
      return true;
    } catch (err) {
      console.warn('CustomerService: Failed to save customer:', err);
      return false;
    }
  }

  /**
   * Deletes a customer record.
   */
  async deleteCustomer(clientId: string, customerId: string): Promise<boolean> {
    try {
      if (!clientId || !customerId) return false;
      await this.repository.deleteCustomer(clientId, customerId);
      return true;
    } catch (err) {
      console.warn('CustomerService: Failed to delete customer:', err);
      return false;
    }
  }

  /**
   * Lists all customers for a tenant.
   */
  async listCustomers(clientId: string): Promise<CustomerItem[]> {
    try {
      if (!clientId) return [];
      return await this.repository.listCustomers(clientId);
    } catch (err) {
      console.warn('CustomerService: Failed to list customers:', err);
      return [];
    }
  }

  /**
   * Creates or updates a customer CRM profile from an incoming enquiry.
   */
  async recordCustomerFromEnquiry(
    clientId: string,
    enquiry: EnquiryItem
  ): Promise<CustomerItem | null> {
    try {
      if (!clientId || !enquiry.clientName || !enquiry.phone) return null;
      const cleanPhone = enquiry.phone.replace(/[^0-9]/g, '');
      const customerId = `cust_${cleanPhone || enquiry.id}`;

      const existing = await this.repository.getCustomer(clientId, customerId);
      const nowIso = new Date().toISOString();

      const customer: CustomerItem = {
        id: customerId,
        name: enquiry.clientName.trim(),
        phone: cleanPhone || enquiry.phone,
        notes: enquiry.notes || existing?.notes,
        totalEnquiries: (existing?.totalEnquiries || 0) + 1,
        totalAppointments: existing?.totalAppointments || 0,
        createdAt: existing?.createdAt || nowIso,
        updatedAt: nowIso,
      };

      await this.repository.saveCustomer(clientId, customer);
      return customer;
    } catch (err) {
      console.warn('CustomerService: Failed to record customer from enquiry:', err);
      return null;
    }
  }

  /**
   * Subscribes to real-time customer directory updates.
   */
  subscribeCustomers(
    clientId: string,
    onData: (customers: CustomerItem[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return this.repository.subscribeCustomers(clientId, onData, onError);
  }
}

export const customerService = new CustomerService();
