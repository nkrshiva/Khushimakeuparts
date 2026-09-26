/**
 * Backward-Compatibility Type Barrel
 *
 * All domain types have been decomposed into domain-specific modules under `src/domain/`:
 * - `src/domain/booking/types`
 * - `src/domain/customer/types`
 * - `src/domain/staff/types`
 * - `src/domain/catalog/types`
 * - `src/domain/portfolio/types`
 * - `src/domain/reviews/types`
 * - `src/domain/tenant/types`
 * - `src/domain/shared/types`
 *
 * This file serves purely as a backward-compatible re-export facade.
 * Legacy unused types (BookingFormData, StoredBooking, AdminSessionContext) have been removed.
 */

export * from './domain/booking/types';
export * from './domain/customer/types';
export * from './domain/enquiry/types';
export * from './domain/staff/types';
export * from './domain/catalog/types';
export * from './domain/portfolio/types';
export * from './domain/review/types';
export * from './domain/reviews/types';
export * from './domain/content/types';
export * from './domain/tenant/types';
export * from './domain/shared/types';
