import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, Sparkles, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
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
        setSuccessMsg(`A password reset link has been dispatched to ${email}. Please check your inbox or spam folder.`);
      } else {
        setError(res.error || 'Failed to send reset link.');
      }
      return;
    }

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      onLoginSuccess();
      onClose();
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl bg-[#1d0e15] border border-[#b89758]/40 shadow-2xl p-6 sm:p-8 text-[#fcecee]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6c2e3e] to-[#b89758] flex items-center justify-center mb-3 shadow-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <span className="text-[10px] text-[#fed488] uppercase tracking-[0.25em] font-semibold">
            Private Atelier Management
          </span>
          <h3 className="font-['Playfair_Display'] text-2xl text-white font-medium mt-1">
            {isResetMode ? 'Reset Admin Password' : 'Admin Portal Access'}
          </h3>
          <p className="text-xs text-[#dfc3c9] mt-1 max-w-xs">
            {isResetMode
              ? 'Enter your registered email address to receive a secure recovery link.'
              : 'Log in to customize photos, bridal pricing, portfolios, and studio details.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] text-[#fed488] uppercase tracking-wider font-semibold block mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#dfc3c9] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artist@salon.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488] transition-colors"
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
                <KeyRound className="w-4 h-4 text-[#dfc3c9] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/20 text-sm text-white focus:outline-none focus:border-[#fed488] transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] hover:opacity-95 active:scale-98 text-white text-xs font-semibold uppercase tracking-widest transition-all shadow-lg shadow-[#6c2e3e]/40 flex items-center justify-center gap-2 cursor-pointer border border-[#fed488]/40 mt-2"
          >
            <Sparkles className="w-4 h-4 text-[#fed488]" />
            {isSubmitting
              ? isResetMode
                ? 'Sending Reset Link...'
                : 'Authenticating...'
              : isResetMode
              ? 'Send Recovery Link'
              : 'Enter Admin Dashboard'}
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
      </div>
    </div>
  );
};
