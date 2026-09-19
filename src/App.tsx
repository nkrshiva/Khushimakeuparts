import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { IntroPhilosophy } from './components/IntroPhilosophy';
import { Services } from './components/Services';
import { Portfolio } from './components/Portfolio';
import { VideoShowcase } from './components/VideoShowcase';
import { WhyKhushi } from './components/WhyKhushi';
import { AboutKhushi } from './components/AboutKhushi';
import { Pricing } from './components/Pricing';
import { BridalPackages } from './components/BridalPackages';
import { BookingSystem, BookingSelection } from './components/BookingSystem';
import { FAQ } from './components/FAQ';
import { FinalCta } from './components/FinalCta';
import { Footer } from './components/Footer';
import { BRAND } from './data/makeupData';
import { Phone, Instagram } from 'lucide-react';

export default function App() {
  const [bookingSelection, setBookingSelection] = useState<BookingSelection | null>({
    type: 'service',
    id: 'bridal',
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceId: string) => {
    setBookingSelection({ type: 'service', id: serviceId });
    scrollToSection('booking-concierge');
  };

  const handleAskPackage = (packageId: string) => {
    setBookingSelection({ type: 'package', id: packageId });
    scrollToSection('booking-concierge');
  };

  const handleGeneralBook = () => {
    setBookingSelection({ type: 'service', id: 'bridal' });
    scrollToSection('booking-concierge');
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[#f7ecee] dark:bg-[#12090d] text-[#25181c] dark:text-[#fcecee] flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-[#6c2e3e] dark:selection:bg-[#b89758] selection:text-white transition-colors duration-300 relative">
        {/* Navigation Header */}
        <Header
          onBookClick={handleGeneralBook}
          onNavigateToBooking={handleGeneralBook}
          onNavigate={scrollToSection}
        />

        <main className="flex-1 w-full flex flex-col">
          {/* Section 1: Hero */}
          <Hero
            onBookClick={handleGeneralBook}
            onPortfolioClick={() => scrollToSection('lookbook-portfolio')}
          />

          {/* Section 2: Intro & Philosophy */}
          <IntroPhilosophy />

          {/* Section 3: Bespoke Services */}
          <Services onBookService={handleBookService} />

          {/* Section 4: Curated Asymmetric Editorial Portfolio & Lightbox */}
          <Portfolio />

          {/* Section 5: Video Showcase ("See the Transformation") */}
          <VideoShowcase />

          {/* Section 6: Why Khushi (5 Benefits with Hand-drawn Line Illustrations) */}
          <WhyKhushi />

          {/* Section 7: About Khushi & Atelier Story */}
          <AboutKhushi />

          {/* Section 8: Pricing Menu & Inclusions */}
          <Pricing onBookService={handleBookService} />

          {/* Section 9: Bridal Packages (Basic, Recommended Premium, Luxury) */}
          <BridalPackages onAskPackage={handleAskPackage} />

          {/* Section 10: Contact / Booking — WhatsApp & Instagram DM */}
          <BookingSystem selection={bookingSelection} />

          {/* Section 11: Animated FAQ Accordion */}
          <FAQ />

          {/* Section 12: Final Call-to-Action */}
          <FinalCta onEnquireClick={handleGeneralBook} />
        </main>

        {/* Production Footer */}
        <Footer
          onScrollToTop={handleScrollToTop}
          onNavigateSection={scrollToSection}
        />

        {/* Floating Quick Contact Bar — mobile only */}
        <aside
          aria-label="Quick contact options"
          className="fixed bottom-4 right-4 z-40 flex flex-col gap-2.5 items-end sm:hidden"
        >
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-[#25d366] text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="WhatsApp Khushi"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.853L.054 23.625a.75.75 0 00.921.921l5.772-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.506-5.23-1.388l-.374-.22-3.876.993.993-3.875-.22-.374A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
          </a>
          <a
            href={BRAND.instagramDmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-lg border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Instagram DM"
          >
            <Instagram className="w-5 h-5 text-white" />
          </a>
        </aside>
      </div>
    </ThemeProvider>
  );
}
