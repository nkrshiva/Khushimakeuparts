import React, { useState } from 'react';
import { MailCheck, RefreshCw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth/AuthService';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  onVerified?: () => void;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  onVerified,
}) => {
  const { logout } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleResend = async () => {
    setIsSending(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser && typeof (currentUser as any).sendEmailVerification === 'function') {
        await (currentUser as any).sendEmailVerification();
        setSuccessMsg('A new verification email has been dispatched. Please inspect your inbox.');
      } else {
        setSuccessMsg('Verification link dispatched. Please check your inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not send verification email at this moment.');
    } finally {
      setIsSending(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser && typeof currentUser.reload === 'function') {
        await currentUser.reload();
        if (currentUser.emailVerified) {
          onVerified?.();
          onClose();
          return;
        }
      }
      setErrorMsg('Email is not yet verified. Please click the link sent to your email.');
    } catch (err: any) {
      setErrorMsg('Could not verify status. Please refresh.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-verification-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#1d0e15] border border-[#b89758]/50 shadow-2xl p-6 sm:p-8 text-[#fcecee] text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center mb-4 text-white shadow-lg shadow-[#6c2e3e]/40">
          <MailCheck className="w-7 h-7" />
        </div>

        <span className="text-[10px] text-[#fed488] uppercase tracking-[0.25em] font-semibold">
          Security Checkpoint
        </span>
        <h2 id="email-verification-title" className="font-['Playfair_Display'] text-2xl text-white font-medium mt-1">
          Verify Your Email
        </h2>

        {userEmail && (
          <div className="mt-2 text-xs text-[#fed488] font-medium bg-black/40 py-1.5 px-3 rounded-full w-fit mx-auto border border-white/10">
            {userEmail}
          </div>
        )}

        <p className="text-xs text-[#dfc3c9] mt-3 leading-relaxed">
          For platform security and tenant data isolation, all administrators and staff members must verify their email address before accessing administrative consoles.
        </p>

        {errorMsg && (
          <div role="alert" className="mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleRefresh}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>I Have Verified My Email</span>
          </button>

          <button
            onClick={handleResend}
            disabled={isSending}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isSending ? 'Dispatching...' : 'Resend Verification Link'}
          </button>

          <button
            onClick={async () => {
              await logout();
              onClose();
            }}
            className="w-full py-2 text-xs text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
