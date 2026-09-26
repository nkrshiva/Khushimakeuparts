import React from 'react';
import { ShieldAlert, LogOut, Mail, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { NoWorkspaceReason } from '../../domain/identity/types';

interface NoWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: NoWorkspaceReason;
  userEmail?: string | null;
  tenantId?: string | null;
}

export const NoWorkspaceModal: React.FC<NoWorkspaceModalProps> = ({
  isOpen,
  onClose,
  reason = 'UNASSIGNED',
  userEmail,
  tenantId,
}) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  const getReasonMessage = () => {
    switch (reason) {
      case 'TENANT_PENDING_ACTIVATION':
        return `The tenant workspace (${tenantId || 'assigned tenant'}) has been provisioned but is pending invitation acceptance. Please check your invitation link to activate access.`;
      case 'TENANT_SUSPENDED':
        return `The tenant workspace (${tenantId || 'assigned tenant'}) is currently set to suspended or inactive in the Master Registry. Please reach out to the Platform Developer for billing or reactivation details.`;
      case 'TENANT_NOT_FOUND':
        return `The assigned tenant workspace (${tenantId}) could not be located in the platform database. It may have been unprovisioned or decommissioned.`;
      case 'INACTIVE_ACCOUNT':
        return 'Your account record is marked as inactive by the tenant administrator.';
      case 'UNASSIGNED':
      default:
        return 'Your authenticated account currently has no tenant website or platform administration assignment linked to it.';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="no-workspace-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#1d0e15] border border-amber-500/40 shadow-2xl p-6 sm:p-8 text-[#fcecee] text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-400">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <span className="text-[10px] text-amber-400 uppercase tracking-[0.25em] font-semibold">
          Identity Checkpoint
        </span>
        <h2 id="no-workspace-title" className="font-['Playfair_Display'] text-2xl text-white font-medium mt-1">
          No Workspace Available
        </h2>

        {userEmail && (
          <div className="mt-2 text-xs text-[#dfc3c9] flex items-center justify-center gap-1.5 bg-white/5 py-1 px-3 rounded-full w-fit mx-auto border border-white/10">
            <Mail className="w-3.5 h-3.5 text-[#fed488]" />
            <span>{userEmail}</span>
          </div>
        )}

        <p className="text-xs text-[#dfc3c9] mt-3 leading-relaxed">
          {getReasonMessage()}
        </p>

        <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-left text-xs text-[#dfc3c9] space-y-2">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              If you are a salon owner or staff member, request your platform administrator to link your UID to your assigned tenant.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out & Return to Home</span>
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
