import React, { useEffect } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms';

interface PlatformLegalModalProps {
  isOpen: boolean;
  activeDoc: LegalDocType;
  onClose: () => void;
  onSwitchDoc: (doc: LegalDocType) => void;
}

export const PlatformLegalModal: React.FC<PlatformLegalModalProps> = ({
  isOpen,
  activeDoc,
  onClose,
  onSwitchDoc,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0e070a] border border-[#b89758]/40 shadow-2xl shadow-black text-white overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#160a10]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6c2e3e]/40 border border-[#b89758]/50 flex items-center justify-center text-[#fed488]">
              {activeDoc === 'privacy' ? (
                <ShieldCheck className="w-5 h-5 text-[#fed488]" />
              ) : (
                <FileText className="w-5 h-5 text-[#fed488]" />
              )}
            </div>
            <div>
              <h2
                id="legal-modal-title"
                className="font-['Playfair_Display'] text-lg sm:text-xl font-medium text-white"
              >
                {activeDoc === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <span className="text-[11px] text-zinc-400 font-light block">
                Atly Platform &bull; Last updated: October 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switcher */}
            <div className="hidden sm:flex items-center bg-black/40 rounded-full p-1 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => onSwitchDoc('privacy')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  activeDoc === 'privacy'
                    ? 'bg-[#b89758] text-[#0e070a]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => onSwitchDoc('terms')}
                className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  activeDoc === 'terms'
                    ? 'bg-[#b89758] text-[#0e070a]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Terms
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close legal modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Legal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-zinc-300 font-light leading-relaxed">
          {activeDoc === 'privacy' ? (
            /* ────────────────────────── PRIVACY POLICY ────────────────────────── */
            <div className="space-y-6">
              <section className="space-y-2">
                <p>
                  Welcome to <strong>Atly</strong> (<span className="text-[#fed488]">https://atly.in</span>). We provide a digital studio and website management platform tailored for beauty studios, makeup artists, and salon businesses.
                </p>
                <p>
                  This Privacy Policy describes the categories of information processed when you use the Atly platform or visit tenant websites hosted on our infrastructure, and explains how that information is handled.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  1. Information We Process
                </h3>
                <p>Depending on your interaction with Atly, we may process:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li>
                    <strong className="text-zinc-200">Account &amp; Authentication Information:</strong> Name, email address, and authentication identifiers received when logging in or accepting workspace invitations via authorized third-party sign-in providers (such as Google Authentication).
                  </li>
                  <li>
                    <strong className="text-zinc-200">Business &amp; Profile Information:</strong> Business name, founder details, service location, phone numbers, social media links, and operating hours provided by salon or artist owners.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Storefront Content &amp; Media:</strong> Descriptions, service catalogues, bridal package details, portfolio photos, before-and-after imagery, and video links provided by account administrators.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Enquiries &amp; Booking Details:</strong> Customer name, wedding or event dates, selected services, and phone numbers submitted by visitors through storefront enquiry forms.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Technical Data:</strong> Browser type, device details, and standard HTTP server logs necessary to operate, optimize, and protect the service.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  2. Purposes of Processing
                </h3>
                <p>We process information exclusively for the following operational purposes:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li>Operating, hosting, and maintaining the Atly platform and tenant websites.</li>
                  <li>Authenticating authorized business owners and staff members.</li>
                  <li>Presenting customized public storefronts and service menus to visitors.</li>
                  <li>Facilitating customer enquiries and forwarding appointment requests to the relevant business.</li>
                  <li>Monitoring system reliability, performance, and application security.</li>
                  <li>Preventing unauthorized access, fraud, spam, and abuse.</li>
                  <li>Communicating essential service announcements or account-related notices.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  3. Service Providers &amp; Infrastructure
                </h3>
                <p>
                  We use third-party services to help provide authentication, hosting, storage, analytics, and other platform functionality. These service providers process data on our behalf strictly to operate and deliver the service in accordance with reasonable security standards.
                </p>
                <p>
                  We do not sell, rent, or trade your personal information or your business content to third parties for advertising or marketing brokers.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  4. Data Ownership &amp; Retention
                </h3>
                <p>
                  Business owners retain ownership of all branding assets, portfolio images, and text uploaded to their respective workspaces. Data is retained for as long as your workspace account is active, or until you choose to delete or update specific content within your Admin Panel.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  5. Contact Us
                </h3>
                <p>
                  If you have questions, comments, or requests regarding this Privacy Policy or your data, you can reach out to our team at:
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-[#fed488]">
                  support@atly.in &bull; contact@atly.in
                </div>
              </section>
            </div>
          ) : (
            /* ────────────────────────── TERMS OF SERVICE ────────────────────────── */
            <div className="space-y-6">
              <section className="space-y-2">
                <p>
                  Welcome to <strong>Atly</strong>. By accessing or using the platform at <span className="text-[#fed488]">https://atly.in</span> or any designated tenant workspace, you agree to comply with and be bound by these Terms of Service.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  1. Platform Purpose &amp; Scope
                </h3>
                <p>
                  Atly provides website creation, storefront hosting, and digital administration tools tailored for makeup artists, hair stylists, nail technicians, and beauty studios. The service allows business owners to manage online visibility, display service offerings, and receive customer booking enquiries.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  2. Account Responsibilities
                </h3>
                <p>
                  You are responsible for safeguarding your login credentials and maintaining the confidentiality of your workspace administrative access. You agree to notify Atly promptly if you detect any unauthorized access or breach of security.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  3. Content Ownership &amp; Acceptable Use
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                  <li>
                    <strong className="text-zinc-200">Ownership:</strong> You retain all intellectual property rights and ownership of the logos, photographs, pricing, and text you upload to your storefront.
                  </li>
                  <li>
                    <strong className="text-zinc-200">License to Host:</strong> You grant Atly a non-exclusive, worldwide license to host, display, resize, and transmit your content solely as required to operate your website and provide the platform features.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Accurate Information:</strong> You represent that all business details, service rates, and customer disclosures published on your storefront are accurate and truthful.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Prohibited Conduct:</strong> You agree not to upload content that infringes upon third-party copyrights or trademarks, contains malicious code, or engages in misleading, fraudulent, or unlawful conduct.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  4. Third-Party Infrastructure
                </h3>
                <p>
                  We use third-party services to help provide authentication, hosting, storage, analytics, and other platform functionality. While we strive to maintain high service availability, third-party operational interruptions may occasionally impact platform availability.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  5. Service Availability &amp; Disclaimer
                </h3>
                <p>
                  Atly is provided on an <em>&ldquo;as is&rdquo;</em> and <em>&ldquo;as available&rdquo;</em> basis. While we make continuous efforts to provide a smooth and dependable experience, we do not warrant that the service will be entirely error-free or uninterrupted at all times.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  6. Limitation of Liability
                </h3>
                <p>
                  To the maximum extent permitted under applicable law, Atly and its operators shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of, or inability to use, the platform or tenant storefronts.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  7. Changes to Terms
                </h3>
                <p>
                  We may revise these Terms of Service periodically. Continued use of Atly following posted modifications constitutes your acceptance of the updated terms.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-['Playfair_Display'] text-base font-semibold text-white">
                  8. Contact Information
                </h3>
                <p>
                  For any questions concerning these Terms of Service, please reach out to us:
                </p>
                <div className="p-3 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-[#fed488]">
                  support@atly.in &bull; contact@atly.in
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#160a10] flex items-center justify-between shrink-0">
          <div className="sm:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSwitchDoc(activeDoc === 'privacy' ? 'terms' : 'privacy')}
              className="text-xs text-[#fed488] underline underline-offset-2 cursor-pointer"
            >
              Switch to {activeDoc === 'privacy' ? 'Terms of Service' : 'Privacy Policy'}
            </button>
          </div>
          <div className="hidden sm:block text-xs text-zinc-500">
            © {new Date().getFullYear()} Atly. All rights reserved.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
