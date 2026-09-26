import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  RotateCcw,
  LogOut,
  ArrowRight,
  Clock,
  Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tenantService } from '../../services/tenant';
import { TenantInvitation, ClientTenantSummary } from '../../domain/tenant/types';

interface InvitationAcceptanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitationId: string;
  token: string;
  clientIdHint?: string;
  onAccepted: (clientId: string) => void;
}

export const InvitationAcceptanceModal: React.FC<InvitationAcceptanceModalProps> = ({
  isOpen,
  onClose,
  invitationId,
  token,
  clientIdHint,
  onAccepted,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<TenantInvitation | null>(null);
  const [tenantSummary, setTenantSummary] = useState<ClientTenantSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isAcceptedSuccess, setIsAcceptedSuccess] = useState(false);

  // Load tenant hint or invitation details
  useEffect(() => {
    if (!isOpen || !invitationId) return;

    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setErrorMessage(null);

      // 1. Fetch public client details if hint is provided
      if (clientIdHint) {
        try {
          const clientData = await tenantService['repository'].getTenant(clientIdHint);
          if (clientData && isMounted) {
            setTenantSummary(clientData as ClientTenantSummary);
          }
        } catch (e) {
          console.warn('[InvitationAcceptanceModal] Could not fetch client hint:', e);
        }
      }

      // 2. If user is signed in, attempt to read invitation document
      if (user && user.email) {
        try {
          const inv = await tenantService.getInvitation(invitationId);
          if (isMounted) {
            if (inv) {
              setInvitation(inv);
              // If clientSummary wasn't fetched yet, fetch with invitation.clientId
              if (!tenantSummary && inv.clientId) {
                const clientData = await tenantService['repository'].getTenant(inv.clientId);
                if (clientData && isMounted) {
                  setTenantSummary(clientData as ClientTenantSummary);
                }
              }
            } else {
              setErrorMessage('Invitation record not found or access is restricted.');
            }
          }
        } catch (err: any) {
          console.warn('[InvitationAcceptanceModal] Invitation read notice:', err);
          if (isMounted) {
            // Permission denied indicates email mismatch under Firestore security rules
            setErrorMessage(
              `Access denied for account ${user.email}. This invitation was sent to a different email address.`
            );
          }
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, invitationId, clientIdHint, user]);

  if (!isOpen) return null;

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('[InvitationAcceptanceModal] Google sign-in failed:', err);
      setErrorMessage(err?.message || 'Google sign in failed. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  // Handle Switching Google Account
  const handleSwitchAccount = async () => {
    try {
      await logout();
      setInvitation(null);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('[InvitationAcceptanceModal] Logout failed:', err);
    }
  };

  // Handle Accepting Invitation
  const handleAcceptInvitation = async () => {
    if (!user || !user.email || !user.uid) {
      setErrorMessage('You must be signed in with Google to accept this invitation.');
      return;
    }

    setIsAccepting(true);
    setErrorMessage(null);

    try {
      const result = await tenantService.acceptInvitation({
        invitationId,
        token: token.trim(),
        acceptingUser: {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
        },
      });

      if (!result.success || !result.clientId) {
        setErrorMessage(result.error || 'Failed to accept invitation.');
        setIsAccepting(false);
        return;
      }

      setIsAcceptedSuccess(true);
      // Let user view success screen briefly before transition
      setTimeout(() => {
        onAccepted(result.clientId!);
      }, 1800);
    } catch (err: any) {
      console.error('[InvitationAcceptanceModal] Acceptance failed:', err);
      setErrorMessage(err?.message || 'An unexpected error occurred while accepting invitation.');
    } finally {
      setIsAccepting(false);
    }
  };

  // Computed state
  const userEmail = user?.email?.toLowerCase().trim();
  const invitedEmail = invitation?.invitedOwnerEmail?.toLowerCase().trim();
  const isEmailMatch = userEmail && invitedEmail && userEmail === invitedEmail;
  const isEmailMismatch = userEmail && invitedEmail && userEmail !== invitedEmail;

  const isExpired =
    invitation?.status === 'expired' ||
    (invitation?.expiresAt && Date.now() > new Date(invitation.expiresAt).getTime());
  const isRevoked = invitation?.status === 'revoked';
  const isAlreadyAccepted = invitation?.status === 'accepted';

  return (
    <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#190d1b] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 text-[#fcecee] font-['Plus_Jakarta_Sans']">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] text-lg font-medium text-white">
                Workspace Invitation
              </h3>
              <p className="text-[10px] text-purple-300/60 uppercase tracking-wider font-semibold">
                AuraOS Platform
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tenant Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#220f26]/60 to-black/60 border border-purple-500/30 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base leading-tight">
                {tenantSummary?.name || clientIdHint || 'Salon Workspace'}
              </h4>
              <p className="text-xs text-purple-200/70">
                {tenantSummary?.city ? `${tenantSummary.city} • ` : ''}
                {tenantSummary?.founder || 'Salon Administrator'}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-purple-300/80 pt-1 border-t border-white/5">
            You have been invited to become the <strong>authoritative Tenant Owner</strong> for this salon website & booking suite.
          </p>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{errorMessage}</p>
              {user && (
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="text-rose-300 hover:text-white underline text-[11px] font-semibold cursor-pointer block mt-1"
                >
                  Sign out and switch Google account
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Status Branches ── */}

        {/* 1. Success State */}
        {isAcceptedSuccess && (
          <div className="p-5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-900/60 border border-emerald-400/50 flex items-center justify-center mx-auto text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Workspace Activated!</h4>
              <p className="text-xs text-emerald-200/80 mt-1">
                Your account is now bound as the Tenant Owner. Launching your workspace...
              </p>
            </div>
          </div>
        )}

        {/* 2. Expired Invitation */}
        {!isAcceptedSuccess && isExpired && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Clock className="w-4 h-4" />
              <span>Invitation Expired</span>
            </div>
            <p className="text-amber-200/80 text-[11px]">
              This single-use invitation link expired after 72 hours. Please contact the platform developer to request a new invitation.
            </p>
          </div>
        )}

        {/* 3. Revoked Invitation */}
        {!isAcceptedSuccess && isRevoked && (
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs space-y-2">
            <div className="flex items-center gap-2 text-zinc-300 font-semibold">
              <Lock className="w-4 h-4" />
              <span>Invitation Revoked</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              This invitation was revoked by the platform developer and can no longer be used.
            </p>
          </div>
        )}

        {/* 4. Already Accepted */}
        {!isAcceptedSuccess && isAlreadyAccepted && (
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Invitation Already Accepted</span>
            </div>
            <p className="text-purple-200/80 text-[11px]">
              This invitation has already been claimed and activated.
            </p>
            {invitation?.clientId && (
              <button
                type="button"
                onClick={() => onAccepted(invitation.clientId)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Enter Salon Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 5. Unauthenticated State (Prompt Google Sign-In) */}
        {!isAcceptedSuccess && !isExpired && !isRevoked && !isAlreadyAccepted && !user && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1.5">
              <span className="text-purple-300/70 font-semibold uppercase tracking-wider text-[10px] block">
                Verification Required
              </span>
              <p className="text-purple-100/90 text-xs">
                To accept ownership, please sign in with your <strong>Google Account</strong>. The system will verify that your email matches the invitation.
              </p>
            </div>

            <button
              type="button"
              disabled={isSigningIn}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              {isSigningIn ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Connecting with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 6. Authenticated & Ready to Accept */}
        {!isAcceptedSuccess && !isExpired && !isRevoked && !isAlreadyAccepted && user && (
          <div className="space-y-4">
            {/* Account Status Card */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-purple-300/70">Signed in as:</span>
                <span className="font-semibold text-white font-mono text-[11px]">{user.email}</span>
              </div>
              {invitedEmail && (
                <div className="flex items-center justify-between border-t border-white/5 pt-1.5">
                  <span className="text-purple-300/70">Invitation sent to:</span>
                  <span className="font-mono text-amber-300 text-[11px]">{invitedEmail}</span>
                </div>
              )}
            </div>

            {/* Email Mismatch Notice */}
            {isEmailMismatch && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Google Account Mismatch</span>
                </div>
                <p className="text-[11px] text-rose-200/90 leading-relaxed">
                  You are signed in as <strong>{user.email}</strong>, but this invitation was issued to{' '}
                  <strong>{invitedEmail}</strong>. You must sign in with the invited email address to accept.
                </p>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="w-full py-2 bg-rose-900/60 hover:bg-rose-800/80 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Switch Google Account</span>
                </button>
              </div>
            )}

            {/* Valid & Matching (Accept CTA) */}
            {(!invitedEmail || isEmailMatch) && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google account verified. You are authorized to claim this workspace.</span>
                </div>

                <button
                  type="button"
                  disabled={isAccepting}
                  onClick={handleAcceptInvitation}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-[#8a3350] to-[#b89758] hover:from-purple-500 hover:to-[#cbb075] text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAccepting ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Activating Tenant Workspace...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Accept Invitation & Activate Tenant</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSwitchAccount}
                    className="text-purple-300/60 hover:text-purple-200 text-[11px] underline cursor-pointer"
                  >
                    Switch account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
