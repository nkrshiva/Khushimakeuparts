import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, Sparkles, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { identityResolutionService } from '../../services/identity/IdentityResolutionService';
import type { IdentityResolutionResult } from '../../domain/identity/types';

interface UniversalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (resolution: IdentityResolutionResult) => void;
}

export const UniversalLoginModal: React.FC<UniversalLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (isResetMode) {
      const res = await resetPassword(email);
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(`A secure password recovery link has been dispatched to ${email}. Please check your inbox or spam directory.`);
      } else {
        setError(res.error || 'Failed to dispatch reset link.');
      }
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setIsSubmitting(false);
      setError(res.error || 'Invalid platform credentials.');
      return;
    }

    try {
      // Execute Authoritative Step 16 Universal Identity Resolution
      const resolution = await identityResolutionService.resolve({
        uid: email, // Fallback until auth context populates user
        email,
      });

      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess(resolution);
      }
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      console.warn('Identity resolution notice:', err);
      if (onLoginSuccess) {
        onLoginSuccess({
          identity: { type: 'NO_WORKSPACE', uid: email, email, reason: 'UNASSIGNED', tenantId: null },
          destination: 'NO_WORKSPACE',
          requiresEmailVerification: false,
          emailVerified: true,
          redirectPath: '#no-workspace',
        });
      }
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="universal-login-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-opacity duration-300"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-[#1d0e15] border border-[#b89758]/50 shadow-2xl p-6 sm:p-8 text-[#fcecee]">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fed488]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6c2e3e] via-[#b89758] to-[#fed488] flex items-center justify-center mb-3 shadow-lg shadow-[#6c2e3e]/50 border border-white/20">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <span className="text-[10px] text-[#fed488] uppercase tracking-[0.25em] font-semibold">
            Universal Platform Entry
          </span>
          <h2 id="universal-login-title" className="font-['Playfair_Display'] text-2xl text-white font-medium mt-1">
            {isResetMode ? 'Reset Credentials' : 'Sign In to Workspace'}
          </h2>
          <p className="text-xs text-[#dfc3c9] mt-1.5 max-w-xs leading-relaxed">
            {isResetMode
              ? 'Provide your registered platform email to receive an authoritative recovery link.'
              : 'Unified authentication for Platform Super Admins, Salon Owners, and Studio Staff.'}
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div role="alert" className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1.5">
              Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#dfc3c9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488] focus:ring-1 focus:ring-[#fed488] transition-colors"
              />
            </div>
          </div>

          {!isResetMode && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(true);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] text-[#fed488]/80 hover:text-[#fed488] underline transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#dfc3c9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488] focus:ring-1 focus:ring-[#fed488] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] via-[#8c3b50] to-[#b89758] hover:opacity-95 active:scale-[0.99] text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-lg shadow-[#6c2e3e]/40 flex items-center justify-center gap-2 cursor-pointer border border-[#fed488]/40 mt-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-[#fed488]" />
            {isSubmitting
              ? isResetMode
                ? 'Dispatched Reset Link...'
                : 'Verifying Authority...'
              : isResetMode
              ? 'Send Recovery Link'
              : 'Enter Authorized Workspace'}
          </button>

          {isResetMode && (
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setError(null);
                setSuccessMsg(null);
              }}
              className="w-full py-2 text-center text-xs text-[#dfc3c9] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to login</span>
            </button>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-zinc-500">
          Atelier Platform Identity Engine · Protected by Cloud Firestore Security Rules
        </div>
      </div>
    </div>
  );
};
