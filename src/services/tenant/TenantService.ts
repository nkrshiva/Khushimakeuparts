import { isBootstrapDeveloperEmail } from '../../config/adminCredentials';
import type {
  ActiveTenantRole,
  TenantRole,
  ClientTenantSummary,
  TenantLifecycleStatus,
  CreateTenantInput,
  CreateTenantResult,
  SetTenantStatusResult,
  DeleteTenantResult,
  SyncModulesConfig,
  SyncClientsResult,
  TenantInvitation,
  AcceptInvitationInput,
  AcceptInvitationResult,
} from '../../domain/tenant/types';
import { DEFAULT_MAIN_CLIENT } from '../../domain/tenant/types';
import type { SiteContent } from '../../domain/content/types';
import { tenantRepository, ITenantRepository } from '../../repositories/tenant/TenantRepository';
import { authorizationService } from '../auth/AuthorizationService';
import { createTailoredSiteContent, mergeWithDefaults } from '../content';

export interface TenantResolution {
  role: ActiveTenantRole;
  assignedClientId: string | null;
}

/**
 * TenantService
 *
 * Application service boundary encapsulating tenant resolution, directory registry,
 * and lifecycle operations (provisioning, activation, suspension, archival, deletion, and sync).
 * Contains ZERO direct Firebase SDK dependencies.
 * Delegates all data-access persistence to TenantRepository.
 */
export class TenantService {
  private repository: ITenantRepository;

  constructor(repository: ITenantRepository = tenantRepository) {
    this.repository = repository;
  }

  /**
   * Resolves the user's role and assigned tenant from the underlying repository.
   * Preserves exact authoritative bootstrap developer verification and fallback logic.
   */
  async resolveUserTenant(uid: string, email: string | null | undefined): Promise<TenantResolution> {
    const cleanEmail = email?.toLowerCase().trim() || '';

    // 1. Query user profile via TenantRepository for role and assigned tenant mapping
    try {
      const data = await this.repository.getUserProfile(uid);
      if (data) {
        const isMasterAdmin = data?.role === 'developer' && isBootstrapDeveloperEmail(cleanEmail);
        const resolvedRole: ActiveTenantRole = isMasterAdmin
          ? 'developer'
          : (data?.role === 'employee' ? 'employee' : 'client');
        const tenantId = resolvedRole === 'developer' ? null : (data?.assignedClientId || null);
        return { role: resolvedRole, assignedClientId: tenantId };
      }
    } catch (err) {
      console.warn('Could not read user profile from repository:', err);
    }

    // 2. Check if email is in the platform bootstrap developer list
    if (isBootstrapDeveloperEmail(cleanEmail)) {
      try {
        await this.repository.saveUserProfile(uid, {
          uid,
          email: cleanEmail,
          role: 'developer',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Developer bootstrap sync notice:', err);
      }
      return { role: 'developer', assignedClientId: null };
    }

    // 3. Fallback: unassigned client role
    return { role: 'client', assignedClientId: null };
  }

  /**
   * Retrieves the global platform tenant registry.
   */
  async getClientsRegistry(): Promise<ClientTenantSummary[]> {
    try {
      const list = await this.repository.getClientsRegistry();
      if (list && list.length > 0) {
        return list;
      }
    } catch (err) {
      console.warn('TenantService getClientsRegistry warning:', err);
    }
    return [DEFAULT_MAIN_CLIENT];
  }

  /**
   * Subscribes to real-time updates for the platform tenant registry.
   */
  subscribeClientsRegistry(
    onData: (clients: ClientTenantSummary[]) => void,
    onError?: (err: Error) => void
  ): () => void {
    return this.repository.subscribeClientsRegistry(onData, onError);
  }

  /**
   * Provisions a brand new client website / tenant.
   * STRICT SECURITY: Only Platform Developers (Master Admin) can provision new tenants.
   */
  async createTenantSite(
    role: TenantRole,
    tenantData: CreateTenantInput,
    existingRegistry: ClientTenantSummary[]
  ): Promise<CreateTenantResult> {
    // Authoritative Authorization Guard
    if (!authorizationService.canManageTenantLifecycle(role)) {
      console.warn('[Authorization Guard] Unauthorized attempt to create tenant site');
      return {
        success: false,
        error: 'Unauthorized: Only developers can create new tenant websites.',
      };
    }

    try {
      const cleanName = tenantData.name.trim();
      if (!cleanName) {
        return { success: false, error: 'Salon / Brand name is required' };
      }

      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const id = slug || `client-${Date.now()}`;

      if (existingRegistry.some((c) => c.id === id)) {
        return { success: false, error: `A client website with ID "${id}" already exists.` };
      }

      const newSummary: ClientTenantSummary = {
        id,
        name: cleanName,
        founder: tenantData.founder.trim() || 'Lead Artist',
        city: tenantData.city.trim() || 'City',
        phone: tenantData.phone.trim() || '+91 98765 43210',
        instagram: tenantData.instagram.trim() || '@salon',
        customDomain: tenantData.customDomain?.trim() || undefined,
        archetype: tenantData.archetype || 'solo_mua',
        status: 'pending_invitation',
        active: false,
        invitedOwnerEmail: tenantData.invitedOwnerEmail?.trim().toLowerCase() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tailoredContent = createTailoredSiteContent(newSummary, tenantData.archetype || 'solo_mua');
      const updatedList = [...existingRegistry, newSummary];

      // Persist tenant document and update platform registry
      await this.repository.saveTenant(id, {
        ...newSummary,
        content: tailoredContent,
      });
      await this.repository.saveClientsRegistry(updatedList);

      // If invitedOwnerEmail is provided, create the onboarding invitation
      let invitation: TenantInvitation | undefined;
      if (tenantData.invitedOwnerEmail?.trim()) {
        invitation = await this.repository.createInvitation({
          clientId: id,
          invitedOwnerEmail: tenantData.invitedOwnerEmail.trim(),
          invitedByUid: 'master_developer',
          invitedByEmail: 'naveen.kr.shiva@gmail.com',
        });
      }

      return { success: true, id, summary: newSummary, invitation };
    } catch (err: any) {
      console.error('Failed to create client tenant site:', err);
      return { success: false, error: err?.message || 'Failed to create client website' };
    }
  }

  /**
   * Retrieves an invitation by ID.
   */
  async getInvitation(invitationId: string): Promise<TenantInvitation | null> {
    return this.repository.getInvitation(invitationId);
  }

  /**
   * Retrieves an invitation by secure token.
   */
  async getInvitationByToken(token: string): Promise<TenantInvitation | null> {
    return this.repository.getInvitationByToken(token);
  }

  /**
   * Retrieves all pending invitations for a specific tenant.
   */
  async getPendingInvitationsForTenant(clientId: string): Promise<TenantInvitation[]> {
    return this.repository.getPendingInvitationsForTenant(clientId);
  }

  /**
   * Accepts and consumes an onboarding invitation for an authenticated Google user.
   */
  async acceptInvitation(input: AcceptInvitationInput): Promise<AcceptInvitationResult> {
    return this.repository.acceptInvitation(input);
  }

  /**
   * Revokes an existing invitation (Developer only).
   */
  async revokeInvitation(role: TenantRole, invitationId: string, revokedByUid?: string): Promise<{ success: boolean; error?: string }> {
    if (!authorizationService.canManageTenantLifecycle(role)) {
      return { success: false, error: 'Unauthorized: Only developers can revoke invitations.' };
    }
    try {
      await this.repository.revokeInvitation(invitationId, revokedByUid);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to revoke invitation.' };
    }
  }

  /**
   * Resends an onboarding invitation for a pending tenant:
   * 1. Revokes any existing pending invitations for this tenant.
   * 2. Issues a fresh invitation record with a new token and 72h expiry.
   * STRICT SECURITY: Only Platform Developers can resend invitations.
   */
  async resendInvitation(
    role: TenantRole,
    clientId: string,
    invitedOwnerEmail: string,
    developerUid: string = 'master_developer',
    developerEmail: string = 'naveen.kr.shiva@gmail.com'
  ): Promise<{ success: boolean; invitation?: TenantInvitation; error?: string }> {
    if (!authorizationService.canManageTenantLifecycle(role)) {
      return { success: false, error: 'Unauthorized: Only developers can resend tenant invitations.' };
    }

    try {
      const cleanEmail = invitedOwnerEmail.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: 'Recipient email is required to resend invitation.' };
      }

      // 1. Invalidate any existing pending invitations for this client tenant
      const existingPending = await this.repository.getPendingInvitationsForTenant(clientId);
      for (const inv of existingPending) {
        await this.repository.revokeInvitation(inv.invitationId, developerUid);
      }

      // 2. Create a fresh single-use invitation
      const freshInvitation = await this.repository.createInvitation({
        clientId,
        invitedOwnerEmail: cleanEmail,
        invitedByUid: developerUid,
        invitedByEmail: developerEmail,
      });

      return { success: true, invitation: freshInvitation };
    } catch (err: any) {
      console.error('[TenantService] Failed to resend invitation:', err);
      return { success: false, error: err?.message || 'Failed to generate new invitation.' };
    }
  }

  /**
   * Sets tenant lifecycle status ('active' | 'suspended' | 'archived').
   * STRICT SECURITY: Only Platform Developers can alter tenant lifecycle status.
   */
  async setTenantLifecycleStatus(
    role: TenantRole,
    id: string,
    status: TenantLifecycleStatus,
    existingRegistry: ClientTenantSummary[]
  ): Promise<SetTenantStatusResult> {
    if (!authorizationService.canManageTenantLifecycle(role)) {
      console.warn('[Authorization Guard] Unauthorized attempt to change tenant lifecycle');
      return { success: false, error: 'Unauthorized: Only developers can change tenant lifecycle status.' };
    }

    try {
      const now = new Date().toISOString();
      await this.repository.saveTenant(id, {
        status,
        active: status === 'active',
        updatedAt: now,
      }, true);

      const updatedList = existingRegistry.map((c) =>
        c.id === id ? { ...c, status, active: status === 'active', updatedAt: now } : c
      );
      await this.repository.saveClientsRegistry(updatedList);

      return { success: true };
    } catch (err: any) {
      console.error('Failed to set tenant lifecycle status:', err);
      return { success: false, error: err?.message || 'Failed to update tenant status' };
    }
  }

  /**
   * Toggles tenant active/suspended status (backward compatibility alias).
   */
  async toggleClientStatus(
    role: TenantRole,
    id: string,
    active: boolean,
    existingRegistry: ClientTenantSummary[]
  ): Promise<SetTenantStatusResult> {
    return this.setTenantLifecycleStatus(role, id, active ? 'active' : 'suspended', existingRegistry);
  }

  /**
   * Scalably purges all subcollections and permanently deletes a tenant document.
   * STRICT SECURITY: Only Platform Developers (Master Admin) can delete tenants.
   */
  async permanentDeleteTenant(
    role: TenantRole,
    id: string,
    existingRegistry: ClientTenantSummary[],
    onProgress?: (msg: string) => void
  ): Promise<DeleteTenantResult> {
    if (!authorizationService.canManageTenantLifecycle(role)) {
      console.warn('[Authorization Guard] Unauthorized attempt to permanently delete tenant');
      return { success: false, error: 'Unauthorized: Only developers can permanently delete tenant websites.' };
    }

    try {
      onProgress?.('Preparing subcollection purge...');
      await this.repository.purgeTenantSubcollections(id, onProgress);

      onProgress?.('Deleting parent tenant document...');
      await this.repository.deleteTenant(id);

      const updatedList = existingRegistry.filter((c) => c.id !== id);
      await this.repository.saveClientsRegistry(updatedList);

      onProgress?.('Tenant deletion completed successfully.');
      return { success: true };
    } catch (err: any) {
      console.error('Failed to permanently delete tenant:', err);
      return { success: false, error: err?.message || 'Failed to permanently delete tenant' };
    }
  }

  /**
   * Broadcasts content updates from the Main Master Site to all client sites while preserving unique identities.
   * STRICT SECURITY: Only Platform Developers can perform global multi-tenant content synchronization.
   */
  async syncContentToAllClients(
    role: TenantRole,
    sourceContent: SiteContent,
    clientTenants: ClientTenantSummary[],
    modulesToSync?: SyncModulesConfig
  ): Promise<SyncClientsResult> {
    if (!authorizationService.canSyncAllTenants(role)) {
      console.warn('[Authorization Guard] Unauthorized attempt to sync content to all clients');
      return {
        success: false,
        updatedCount: 0,
        error: 'Unauthorized: Only developers can perform global multi-tenant content synchronization.',
      };
    }

    const nonMasterTenants = clientTenants.filter((c) => c.id !== 'khushi');
    if (nonMasterTenants.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const defaultModules = {
      services: true,
      preserveClientPricing: true,
      bridalPackages: true,
      portfolio: true,
      videos: true,
      faqs: true,
      sectionsVisibility: true,
      announcementBar: true,
      benefits: true,
      testimonials: true,
      ...modulesToSync,
    };

    try {
      let updatedCount = 0;

      for (const client of nonMasterTenants) {
        // 1. Get client's current content
        const remoteDoc = await this.repository.getTenant(client.id);
        const rawContent = remoteDoc?.content || remoteDoc;
        const currentClientContent: SiteContent = rawContent
          ? mergeWithDefaults(rawContent)
          : createTailoredSiteContent(client);

        // 2. Clone client content and carefully preserve client's unique brand identity
        const updated: SiteContent = {
          ...currentClientContent,
          brand: {
            ...currentClientContent.brand,
            name: client.name,
            founder: client.founder,
            location: client.city,
            primaryServiceArea: client.city,
            phone: client.phone,
            instagram: client.instagram,
          },
          // Synchronize only the selected modules from sourceContent
          ...(defaultModules.services
            ? {
                services: sourceContent.services.map((srcService) => {
                  if (defaultModules.preserveClientPricing) {
                    const existing = currentClientContent.services?.find((s) => s.id === srcService.id);
                    if (existing && (existing.price || existing.priceNum !== undefined)) {
                      return {
                        ...JSON.parse(JSON.stringify(srcService)),
                        price: existing.price,
                        priceNum: existing.priceNum,
                      };
                    }
                  }
                  return JSON.parse(JSON.stringify(srcService));
                }),
              }
            : {}),
          ...(defaultModules.bridalPackages ? { bridalPackages: JSON.parse(JSON.stringify(sourceContent.bridalPackages)) } : {}),
          ...(defaultModules.portfolio ? { portfolioCategories: JSON.parse(JSON.stringify(sourceContent.portfolioCategories)) } : {}),
          ...(defaultModules.videos ? { videos: JSON.parse(JSON.stringify(sourceContent.videos)) } : {}),
          ...(defaultModules.faqs ? { faqs: JSON.parse(JSON.stringify(sourceContent.faqs)) } : {}),
          ...(defaultModules.sectionsVisibility ? { sectionsVisibility: JSON.parse(JSON.stringify(sourceContent.sectionsVisibility)) } : {}),
          ...(defaultModules.announcementBar ? { announcementBar: JSON.parse(JSON.stringify(sourceContent.announcementBar)) } : {}),
          ...(defaultModules.benefits ? { benefits: JSON.parse(JSON.stringify(sourceContent.benefits)) } : {}),
          ...(defaultModules.testimonials ? { testimonials: JSON.parse(JSON.stringify(sourceContent.testimonials)) } : {}),
        };

        // 3. Persist update to tenant document
        await this.repository.saveTenant(client.id, {
          ...client,
          updatedAt: new Date().toISOString(),
          content: updated,
        }, true);

        updatedCount++;
      }

      return { success: true, updatedCount };
    } catch (err: any) {
      console.error('Error during global client sync:', err);
      return { success: false, updatedCount: 0, error: err?.message || 'Sync failed' };
    }
  }
}

export const tenantService = new TenantService();
