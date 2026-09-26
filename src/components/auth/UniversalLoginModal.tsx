import React, { useState } from 'react';
import { X, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { identityResolutionService } from '../../services/identity/IdentityResolutionService';
import type { IdentityResolutionResult } from '../../domain/identity/types';

interface UniversalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (resolution: IdentityResolutionResult) => void;
}

/** Google "G" logo rendered as inline SVG — no external image dependency. */
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const UniversalLoginModal: React.FC<UniversalLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { signInWithGoogle } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    const res = await signInWithGoogle();

    // User cancelled the popup — dismiss silently, no error message.
    if (!res.success && !res.error) {
      setIsSubmitting(false);
      return;
    }

    if (!res.success || !res.user) {
      setIsSubmitting(false);
      setError(res.error || 'Google sign-in failed. Please try again.');
      return;
    }

    try {
      // Authoritative Step-16 identity resolution from real Firebase credentials.
      // Role is NEVER inferred from the Google account; it comes from Firestore /users/{uid}.
      const resolution = await identityResolutionService.resolve({
        uid: res.user.uid,
        email: res.user.email,
        emailVerified: res.user.emailVerified,
      });

      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess(resolution);
      }
      handleClose();
    } catch (err: any) {
      setIsSubmitting(false);

      // Bootstrap errors must surface as modal errors — NOT as NO_WORKSPACE navigation.
      // When the developer's /users/{uid} profile write fails, routing them to NO_WORKSPACE
      // would incorrectly imply they have no access rather than showing a recoverable error.
      // The [BOOTSTRAP_ERROR] tag is set by IdentityResolutionService.resolveIdentity().
      if (err?.message?.includes('[BOOTSTRAP_ERROR]')) {
        console.error('[UniversalLoginModal] Developer bootstrap failure:', err);
        setError(err.message.replace('[BOOTSTRAP_ERROR] ', ''));
        return;
      }

      // Graceful fallback for other unexpected identity resolution errors (e.g. network blip
      // when reading a non-developer user profile). Route to NO_WORKSPACE rather than crashing.
      console.warn('[UniversalLoginModal] Identity resolution notice:', err);
      if (onLoginSuccess) {
        onLoginSuccess({
          identity: {
            type: 'NO_WORKSPACE',
            uid: res.user.uid,
            email: res.user.email || '',
            reason: 'UNASSIGNED',
            tenantId: null,
          },
          destination: 'NO_WORKSPACE',
          requiresEmailVerification: false,
          emailVerified: res.user.emailVerified,
          redirectPath: '#no-workspace',
        });
      }
      handleClose();
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
          onClick={handleClose}
          aria-label="Close authentication modal"
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#fed488] disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6c2e3e] via-[#b89758] to-[#fed488] flex items-center justify-center mb-3 shadow-lg shadow-[#6c2e3e]/50 border border-white/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>

          <span className="text-[10px] text-[#fed488] uppercase tracking-[0.25em] font-semibold">
            Universal Platform Entry
          </span>
          <h2 id="universal-login-title" className="font-['Playfair_Display'] text-2xl text-white font-medium mt-1">
            Sign In to Workspace
          </h2>
          <p className="text-xs text-[#dfc3c9] mt-1.5 max-w-xs leading-relaxed">
            Unified authentication for Platform Admins, Salon Owners, and Studio Staff.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-white hover:bg-gray-50 active:scale-[0.99] text-gray-800 text-sm font-semibold transition-all shadow-lg flex items-center justify-center gap-3 cursor-pointer border border-gray-200/80 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              {/* Animated spinner */}
              <svg
                className="w-5 h-5 animate-spin text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Authenticating with Google…</span>
            </>
          ) : (
            <>
              <GoogleLogo />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-6 pt-4 border-t border-white/10 text-center text-[10px] text-zinc-500">
          Atelier Platform Identity Engine · Protected by Cloud Firestore Security Rules
        </div>
      </div>
    </div>
  );
};
