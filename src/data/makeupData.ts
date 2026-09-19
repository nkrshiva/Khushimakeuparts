import {
  ServiceItem,
  PortfolioItem,
  VideoShowcaseItem,
  WhyKhushiBenefit,
  BridalPackage,
  FAQItem
} from '../types';

export const BRAND = {
  name: 'Khushi Makeup Arts',
  founder: 'Khushi',
  tagline: 'Beauty, Enhanced. Confidence, Unforgettable.',
  subtitle: 'Professional Makeup Artist in Siwan',
  servicesList: 'Bridal · Engagement · Party · Mehendi · Haldi · Occasion Makeup',
  location: 'Siwan, Bihar, India',
  primaryServiceArea: 'Siwan',
  phone: '9162143273',
  phoneDisplay: '+91 9162143273',
  phoneHref: 'tel:+919162143273',
  instagram: '@khushimakeuparts',
  instagramProfileUrl: 'https://instagram.com/khushimakeuparts',
  instagramDmUrl: 'https://ig.me/m/khushimakeuparts',
  whatsappUrl:
    'https://wa.me/919162143273?text=' +
    encodeURIComponent(
      'Hello Khushi! ✨\n\nI would like to enquire about booking a makeup session with Khushi Makeup Arts:\n\n💄 Service: Bridal Makeup (Signature)\n💰 Price: ₹10,000\n⏱ Estimated Duration: 3.5 – 4 Hours\n📍 Service Location: Siwan (Home Service)\n\n✨ Key Inclusions Requested:\n• Comprehensive skin hydration prep & pore-refining base\n• High Definition (HD) photography-ready foundation matching\n• Intricate bridal eye artistry & waterproof cut-crease detailing\n• Custom silk lashes, lenses consultation & brow sculpting\n• Traditional bun or contemporary bridal hairstyling\n• Lehenga, saree & double-dupatta draping with secure pinning\n• Emergency touch-up kit\n\nPlease let me know your upcoming availability and booking details. Thank you!'
    ),
  logoUrl: '/logo.jpg?v=3',
  heroPhotoUrl: '/khushi-hero.jpeg',
  artistPhotoUrl: '/khushi-hero.jpeg',
  homeServiceNotice: 'Home service available across Siwan. Travel outside Siwan arranged upon request (travel charges additional).',
};

export const SERVICES: ServiceItem[] = [
  {
    id: 'bridal',
    title: 'Bridal Makeup',
    tagline: 'Polished, long-lasting and photography-ready bridal looks.',
    description: 'A comprehensive, ritual-ready bridal experience built to withstand tears, stage lighting, and long hours while maintaining a radiant, dewy finish.',
    price: '₹10,000',
    priceNum: 10000,
    duration: '3.5 – 4 Hours',
    category: 'bridal',
    badge: 'Signature',
    iconName: 'diamond',
    inclusions: [
      'Comprehensive skin hydration prep & pore-refining base',
      'High Definition (HD) photography-ready foundation matching',
      'Intricate bridal eye artistry & waterproof cut-crease detailing',
      'Custom silk lashes, lenses consultation & brow sculpting',
      'Traditional bun or contemporary bridal hairstyling',
      'Lehenga, saree & double-dupatta draping with secure pinning',
      'Emergency touch-up kit for on-venue rituals'
    ]
  },
  {
    id: 'engagement',
    title: 'Engagement Makeup',
    tagline: 'Elegant and camera-ready makeup for engagement and ring ceremonies.',
    description: 'Radiant, romantic makeup crafted to complement pastel lehengas, evening gowns, or ethnic silks for ring ceremonies and intimate sangeets.',
    price: '₹8,000',
    priceNum: 8000,
    duration: '2.5 – 3 Hours',
    category: 'bridal',
    badge: 'Popular',
    iconName: 'favorite',
    inclusions: [
      'Luminous dewy or velvet-matte skin preparation',
      'Soft glam eye makeup with rose gold or champagne accents',
      'Wispy natural lashes and waterproof winged liner',
      'Romantic waves, textured braid or chic contemporary updo',
      'Dupatta or gown draping and jewelry setting',
      'Transfer-resistant lipstick and setting veil'
    ]
  },
  {
    id: 'party',
    title: 'Party Makeup',
    tagline: 'Glamorous yet personalized looks for parties, celebrations and special occasions.',
    description: 'Customized glam for reception guests, bridesmaids, sisters of the bride/groom, and cocktail soirees.',
    price: '₹5,000',
    priceNum: 5000,
    duration: '1.5 – 2 Hours',
    category: 'party',
    iconName: 'celebration',
    inclusions: [
      'Flash-proof, non-cakey skin base matching your exact undertone',
      'Smokey, halo or soft-shimmer eye makeup',
      'Featherweight lashes and defined brows',
      'Classic blowout, Hollywood curls or elegant pinning',
      'Saree, lehenga or gown draping assistance',
      'Sweat-resistant finishing mist'
    ]
  },
  {
    id: 'haldi',
    title: 'Haldi Makeup',
    tagline: 'Fresh, radiant and celebration-ready looks for Haldi ceremonies.',
    description: 'A breathable, water-resistant look designed to glow under natural outdoor daylight, withstand ritual moisture, and complement yellow floral outfits.',
    price: '₹5,000',
    priceNum: 5000,
    duration: '2 Hours',
    category: 'festive',
    badge: 'Daytime Glow',
    iconName: 'wb_sunny',
    inclusions: [
      'Waterproof skin primer creating a barrier against turmeric',
      'Sun-kissed golden highlights and peach-tinted blush',
      'Minimalist smudge-proof eye enhancement',
      'Floral accessory hairstyling with curls or braided crown',
      'Dupatta draping suited for seated ceremonies',
      'Natural lip tint and glow lock'
    ]
  },
  {
    id: 'mehendi',
    title: 'Mehendi Makeup',
    tagline: 'Beautiful occasion makeup designed to complement Mehendi celebrations.',
    description: 'Artful, festive makeup that balances colorful lehengas, floral jewelry, and relaxed celebratory vibes with effortless comfort.',
    price: '₹5,000',
    priceNum: 5000,
    duration: '2 Hours',
    category: 'festive',
    badge: 'Festive',
    iconName: 'spa',
    inclusions: [
      'Hydrated glass-skin finish with playful pops of color',
      'Defined lash line, waterproof mascara & subtle shimmer',
      'Bohemian open curls, half-up twists or bubble braids',
      'Floral jewelry and maang tikka secure pinning',
      'Comfort-focused draping for seated mehendi application'
    ]
  },
  {
    id: 'occasion',
    title: 'Special Occasion Makeup',
    tagline: 'Customized makeup for other important celebrations and events.',
    description: 'Tailored aesthetic for pre-wedding portraits, maternity photoshoots, anniversary galas, or festive pujas.',
    price: 'Custom Consultation',
    priceNum: 0,
    duration: '2 – 2.5 Hours',
    category: 'party',
    badge: 'Bespoke',
    iconName: 'edit_note',
    inclusions: [
      'Consultation matching wardrobe concept, lighting and venue',
      'Pro skin-prep adapted to indoor studio flash or outdoor golden hour',
      'Artistic eye detailing tailored to your eye shape',
      'Customized hair design and draping styling',
      'High-grade professional cosmetic kit application'
    ]
  }
];

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'port-1',
    title: 'The Royal Bihari Bride',
    subtitle: 'Traditional HD Bridal',
    description: 'Luminous dewy glass base, antique gold choker accents, raw silk drape. Traditional Bihari red and gold magnificence.',
    category: 'bridal',
    mediaType: 'image',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgEQ0yIsj60TM_fMreP_PHE6G0HE3Xfv3KSZJlaBff6hkEymrgoqN6aArizCrycxxTMBhO7bo_H68ESSG7qwca4rHNxaNuoj7xKM_7FfFlWCEYckyXt8x-vRjCDiv6fMV2WIyg1zxjXiNU__I8xsY8yWjCgYWBKNt01jKDBV8a_mXVO9rR86bw0VBtM5Y5TVbAcat-OQ5LLWHThBto2LzW2yBY23LSFuMAnVuiBXM8BTst1zOE4hve',
    alt: 'High luxury editorial bridal portrait of an Indian bride from Bihar, styled in an opulent deep crimson raw silk lehenga with intricate antique zardozi embroidery.',
    tag: 'Royal Bihari',
    badge: 'Cathedral Arch Frame',
    highlightText: 'authentic radiance',
    frameType: 'arch'
  },
  {
    id: 'port-2',
    title: 'Ethereal Pastel',
    subtitle: 'Engagement & Ring Ceremony',
    description: 'Rose gold eyelid shimmer, romantic waves & natural wispy lashes for champagne and blush couture.',
    category: 'bridal',
    mediaType: 'image',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAefqtfJQZ9TS0PXgSONalvdfQkW-7bwG4kerp-wE0gdR6srYlGwOnufa51mpQfOqMrrtLxtwEfXIVAwb3W4TueGhLVkE-zK8mRvyfnDbFIsg74s62gj1BWWeaz8L5pZHeBUI0T09Bf6PUfbiO1aQQoVKeUJN3XlynBnUw_qR3BW2l-V4s124x7mBVdiALXqaPItVzQcQz8IBpCmweYaadFhOTtcZe7yD8my5MSEy0zCIDUalDTGkVC',
    alt: 'Modern Indian engagement bride wearing a pastel blush pink and champagne net lehenga with fine pearl sequin details.',
    tag: 'Soft Glam',
    badge: 'Lookbook N° 02',
    highlightText: 'dewy elegance',
    frameType: 'asymmetric-1'
  },
  {
    id: 'port-3',
    title: 'Sunset Haldi Glow',
    subtitle: 'Haldi Ritual Ceremony',
    description: 'Golden undertones, waterproof & turmeric barrier prep. Radiating warm yellow celebration joy.',
    category: 'festive',
    mediaType: 'image',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWcjh1C7dA2KqSCvozPMtMoOKfH4ZMHiqUDfEPfy4uTITZGXzU47ahtiDVS5pu7JVOj2d8XLGM9iCcfgNIqYO8Nn9SQtp0MqiEgakPCpX0gGAH5WIIE6PSkpjTKdAEw5SOmE-Wq94H2EvZFA_yWmtNsfHSIlGpr3TpjYS94OonK39hqFoF5P4aIiCCeHgUBrYTwQ_JgivIs7LE1cm1MAfmvvgPJ_HzFHedQ1CNFHXnbst5KvEVkjmk',
    alt: 'Vibrant Haldi ceremony portrait of a radiant Indian bride smiling joyfully, styled in canary yellow.',
    tag: 'Haldi Dew',
    badge: 'Sun-Kissed Oval',
    highlightText: '100% Breathable',
    frameType: 'oval'
  },
  {
    id: 'port-4',
    title: 'Velvet Reception',
    subtitle: 'Cocktail & Reception Evening',
    description: 'Sculpted soft contour, berry lips & flash-proof setting for twilight celebrations.',
    category: 'party',
    mediaType: 'image',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD97MHYIqEGw7ca3wjAMOV3bVkHE-dxGoDhL3ZtjE4vF0gG4R-SGtFCEDKpps3ppanTHxTRTjVqnQoSv_KMQQLhty1Di_we4hgx55jygkjnc2vOM4cUA41YvdKsPHI_-0lopJrdaW7_zK9GhqSqbHtrQhW2jHnAmywy5dVxMqBiuBYGoDLr55nAhoHp71hVDp_XJLDAyQc1GB1j7e19ywccu5cr2Nh7_ZbJF3ceKRIFiGq3yML9TqPO',
    alt: 'Sophisticated evening reception beauty look of a chic South Asian woman in a midnight wine velvet evening gown.',
    tag: 'High Glam',
    badge: 'Editorial Contour',
    highlightText: 'HD Flash Proof',
    frameType: 'asymmetric-2'
  }
];

export const VIDEO_SHOWCASE_ITEMS: VideoShowcaseItem[] = [
  {
    id: 'video-1',
    title: 'Bridal — Full Reveal',
    subtitle: 'Bare skin to royal glow',
    tag: 'Reveal',
    duration: '0:45',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoEo6RYQwLa3sIYS0titRG-P3Eou8TbBMPPRETewa4ff_bAs1LCg3u-xwUfWCOz7CpucD7RHx4m0KQ8h-7WzpQyKNub9TqMlV8VNyFPc2NifK7GLHH6PClYuDQYTMPwV4mdixmZuezQml-1TP08MjESzLncSJNRskMwB6y-8WSRbBIYnO_hRPHkoKo__aRDMzUf7Vd0q4CH9KPg3IiH9PUdb9tJsJqUUAsdwERK3SfF1mf4RwJDR_P',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-beautiful-woman-getting-makeup-done-by-an-artist-41584-large.mp4',
    description: 'Complete transformation video documenting bespoke skin preparation, base layering, and the breath-taking ceremonial reveal.'
  },
  {
    id: 'video-2',
    title: 'Bridal — Portrait',
    subtitle: 'Eye & Drape Harmony',
    tag: 'Portrait',
    duration: '0:32',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWP4utgQaYgf41nsl8HUoCUIhX-W8eFQ-ZxdrVk9BJdrzSQvLgiqqlUpQuPIo_rSRU0JSgfzaGGtb_zenTtncjz8AKPuiOLUMYUH5Zilaai32xemGu1hu_DrmT5oJ1xsC3fdj-smTVAZKmXpirgPLGduAIhCqZdm_IG-wJV0qxDiYB05WuG7Fsi0sSpUbOz9l0He9g7Ic-uGIuAhstbBMAFIWzMDixjhMLDgeyeCobmVFMwPeeSOpQ',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-face-makeup-closing-her-eyes-41586-large.mp4',
    description: 'Close-up camera sweep highlighting delicate shimmer blending, featherweight lash application, and jewelry balance.'
  },
  {
    id: 'video-3',
    title: 'Occasion Look',
    subtitle: 'Sangeet & Mehendi glam',
    tag: 'Mehendi',
    duration: '0:28',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1aeg4nRmnb5JV0NlmMGSeplk0kOJ2EdxRdJWXzfbysezQZbJagLp1JYpfAQPPjCLmkFV0n72TdJnjUAfdu-wk7hpcYfum2cWcHJGH89Nu2jhalM3xAc8lZwlewgeC-iaKkzylKcAYfcXFOnJzMiDOMdFN2FJG2uMYPC7hpphfB9X60oyDeTWgktDekIQetQwCzCAoh0doKoVeiL5-WoQU6WpXS6VppzzCiveaitI5w8aCKXC3Qz6r',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-makeup-artist-applying-eye-shadow-on-a-young-woman-41587-large.mp4',
    description: 'Fresh daytime glow with radiant natural skin, light floral styling, and cheerful movement.'
  },
  {
    id: 'video-4',
    title: 'Party Look',
    subtitle: 'Effortless celebration glam',
    tag: 'Party',
    duration: '0:40',
    posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIJcHgbxG9Pl_chz5uIVlD6HUiAozHJWGCOs785OmXE2wCWwaImTsXxZN64CVgsAOWr3AVBb3bYtaByCW52VEUavrDRD7Au4HUIwIskcJVAaygfo37YNuUdBFLco7xBFEwOlSyqDW0TkvniApx50gDIM983wfprPSRWhpLOkGn7hTIrR4BrjuyaSQOnYgs6pY6foQdDrqQ95QGm05ToqXeXvm6ikED7cbOwUehkJCDTgcRdkj0cP-z',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-makeup-artist-applying-lip-gloss-with-a-brush-to-a-41585-large.mp4',
    description: 'Sophisticated evening transformation with berry stained velvet lips and radiant highlight.'
  }
];

export const WHY_KHUSHI_BENEFITS: WhyKhushiBenefit[] = [
  {
    id: 'benefit-1',
    title: 'Personalized Makeup',
    description: 'Every look is adapted to your skin type, face shape and preferences.',
    iconType: 'palette'
  },
  {
    id: 'benefit-2',
    title: 'Professional Products',
    description: 'Khushi works with professional and high-end products, including Nykaa Professional.',
    iconType: 'products'
  },
  {
    id: 'benefit-3',
    title: 'Occasion-Specific Looks',
    description: 'From bridal glam to fresh Haldi looks, makeup is adapted to the event and outfit.',
    iconType: 'occasion'
  },
  {
    id: 'benefit-4',
    title: 'Home Service',
    description: 'Convenient makeup services at your location, primarily across Siwan.',
    iconType: 'home'
  },
  {
    id: 'benefit-5',
    title: 'Growing Expertise',
    description: '2 years of professional experience, with continuous learning in technique and style.',
    iconType: 'expertise'
  }
];

export const BRIDAL_PACKAGES: BridalPackage[] = [
  {
    id: 'pkg-basic',
    name: 'BASIC BRIDAL',
    tier: 'Essential Suite',
    description: 'Timeless traditional artistry focused on balanced bridal elegance and clean execution.',
    features: [
      'Professional Classic Bridal Makeup',
      'Traditional Bun or Structured Hairstyling',
      'Saree or Dupatta Draping & Pinning',
      'Standard Eyelashes & Bindi Placement'
    ]
  },
  {
    id: 'pkg-premium',
    name: 'PREMIUM BRIDAL',
    tier: 'Recommended / Signature',
    description: 'Our most beloved lookbook suite. Engineered for high-definition 4K photography and 16-hour ritual endurance.',
    isRecommended: true,
    features: [
      'High Definition (HD) Long-wear Makeup',
      'Signature Couture Bridal Hairstyling with Accessories',
      'Luxury Double-Dupatta & Lehenga Draping',
      'Premium Silk Eyelashes & Lenses Consultation',
      'Complimentary Emergency On-venue Touch-up Kit'
    ]
  },
  {
    id: 'pkg-luxury',
    name: 'LUXURY BRIDAL',
    tier: 'Couture Bespoke',
    description: 'The ultimate royal experience including pre-makeup cellular hydration infusion and micro-airbrush technique.',
    features: [
      'HD Airbrush Flawless Micro-Mist Finish',
      'Luxury Pre-makeup Skin Prep & Deep Hydration Infusion',
      'Bespoke Haute Hairstyling with Fresh Floral Setting',
      'Royal Dual-Dupatta Couture Styling & Jewelry Pinning',
      'Custom Featherweight 3D Lashes'
    ]
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Do you provide home-service makeup?',
    answer: 'Yes. Home-service makeup is available, with Siwan as the primary service area.'
  },
  {
    id: 'faq-2',
    question: 'Do you travel outside Siwan?',
    answer: 'Yes. Travel outside Siwan can be arranged depending on the booking and location. Travel charges are additional.'
  },
  {
    id: 'faq-3',
    question: 'What types of makeup do you offer?',
    answer: 'Bridal, engagement, party, Haldi, Mehendi and other occasion makeup.'
  },
  {
    id: 'faq-4',
    question: 'Are hairstyling and draping available?',
    answer: 'Yes, they are included in the applicable bridal package or service.'
  },
  {
    id: 'faq-5',
    question: 'Do you provide makeup trials?',
    answer: 'Makeup trials are not currently included.'
  },
  {
    id: 'faq-6',
    question: 'Can I book through Instagram?',
    answer: 'Yes. Send Khushi a direct message on Instagram, or call her, to enquire about a booking.'
  },
  {
    id: 'faq-7',
    question: 'How should I book?',
    answer: "Send Khushi a DM on Instagram with your event date, makeup requirement and location, and she'll get back to you."
  }
];

export interface EnquiryDetails {
  serviceTitle: string;
  categoryOrTier?: string;
  price?: string;
  duration?: string;
  inclusions?: string[];
  clientName?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  specialNotes?: string;
}

export function formatEnquiryMessage(details: EnquiryDetails): string {
  const parts: string[] = [
    'Hello Khushi! ✨',
    'I would like to enquire about booking a makeup session with Khushi Makeup Arts:\n',
    `💄 Service: ${details.serviceTitle}${details.categoryOrTier ? ` (${details.categoryOrTier})` : ''}`
  ];

  if (details.price) {
    parts.push(`💰 Price: ${details.price}`);
  }
  if (details.duration) {
    parts.push(`⏱ Estimated Duration: ${details.duration}`);
  }

  if (details.clientName && details.clientName.trim()) {
    parts.push(`👤 Client / Bride Name: ${details.clientName.trim()}`);
  }

  if (details.eventDate && details.eventDate.trim()) {
    parts.push(`📅 Event Date: ${details.eventDate.trim()}`);
  } else {
    parts.push(`📅 Event Date: To be confirmed based on availability`);
  }

  if (details.eventTime && details.eventTime.trim()) {
    parts.push(`⏰ Event Function / Time: ${details.eventTime.trim()}`);
  }

  if (details.location && details.location.trim()) {
    parts.push(`📍 Service Location: ${details.location.trim()}`);
  } else {
    parts.push(`📍 Service Location: Siwan (Home Service)`);
  }

  if (details.inclusions && details.inclusions.length > 0) {
    parts.push('\n✨ Key Inclusions Requested:');
    details.inclusions.forEach((inc) => {
      parts.push(`• ${inc}`);
    });
  }

  if (details.specialNotes && details.specialNotes.trim()) {
    parts.push(`\n📝 Special Request / Details: ${details.specialNotes.trim()}`);
  }

  parts.push('\nPlease let me know your availability and the procedure to lock the booking. Thank you!');

  return parts.join('\n');
}

export function getWhatsAppBookingUrl(message: string): string {
  return `https://wa.me/919162143273?text=${encodeURIComponent(message)}`;
}


