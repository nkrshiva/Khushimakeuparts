import { auth } from '../../firebase';

export interface SendInvitationDeliveryResult {
  success: boolean;
  messageId?: string;
  recipientEmail?: string;
  clientId?: string;
  error?: string;
  code?: string;
}

export class InvitationDeliveryService {
  /**
   * Dispatches an invitation transactional email via the Vercel serverless function /api/send-invitation.
   * Authorizes the call with the caller's Firebase ID token.
   */
  async sendInvitationEmail(params: {
    invitationId: string;
    token: string;
  }): Promise<SendInvitationDeliveryResult> {
    if (!params.invitationId) {
      return { success: false, error: 'Invitation ID is required to dispatch email.' };
    }

    // 1. Obtain current user's Firebase Auth ID token
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      return {
        success: false,
        error: 'Authentication required. Please sign in as the platform administrator.',
      };
    }

    let idToken: string;
    try {
      idToken = await currentUser.getIdToken(true);
    } catch (tokenErr: any) {
      return {
        success: false,
        error: `Could not retrieve administrator authentication token: ${tokenErr?.message || tokenErr}`,
      };
    }

    // 2. Dispatch request to /api/send-invitation
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      console.log('[InvitationDeliveryService] POSTing to /api/send-invitation for:', params.invitationId);
      const response = await fetch('/api/send-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          invitationId: params.invitationId,
          token: params.token,
          origin,
        }),
      });

      console.log('[InvitationDeliveryService] /api/send-invitation HTTP response status:', response.status);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        console.error('[InvitationDeliveryService] /api/send-invitation rejected with status:', response.status, data);
        return {
          success: false,
          error: data?.error || `Server responded with status ${response.status}`,
          code: data?.code,
        };
      }

      return {
        success: true,
        messageId: data?.messageId,
        recipientEmail: data?.recipientEmail,
        clientId: data?.clientId,
      };
    } catch (err: any) {
      console.error('[InvitationDeliveryService] Network or unexpected error:', err);
      return {
        success: false,
        error: err?.message || 'Network error while attempting to send invitation email.',
      };
    }
  }
}

export const invitationDeliveryService = new InvitationDeliveryService();
