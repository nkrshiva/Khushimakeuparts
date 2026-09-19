/**
 * Portfolio Data — Khushi Makeup Arts
 *
 * Structure:
 *   PORTFOLIO_CATEGORIES  (4 categories)
 *     └── models[]        (multiple models per category)
 *           ├── thumbnail   (card image)
 *           └── galleryImages[]  (all images for this model's lightbox — at least 10)
 *
 * To add a new model:
 *   1. Find the right category in PORTFOLIO_CATEGORIES
 *   2. Push a new object into its `models` array:
 *      {
 *        id: "bridal-model-05",
 *        name: "Sneha",
 *        thumbnail: "/portfolio/bridal/sneha-thumb.jpg",
 *        galleryImages: [
 *          "/portfolio/bridal/sneha-01.jpg",
 *          "/portfolio/bridal/sneha-02.jpg",
 *          // ...add as many as needed (10+ recommended)
 *        ]
 *      }
 *
 * To add a gallery image to an existing model:
 *   Append the URL to that model's galleryImages[] array.
 *
 * Recommended image folder structure:
 *   public/
 *     portfolio/
 *       bridal/    model-01-thumb.jpg  model-01-01.jpg ...
 *       party/
 *       haldi/
 *       mehendi/
 */

export interface PortfolioModel {
  id: string;
  name: string;
  thumbnail: string;
  galleryImages: string[];
}

export interface PortfolioCategory {
  id: 'bridal' | 'party' | 'haldi' | 'mehendi';
  label: string;
  tagline: string;
  description: string;
  models: PortfolioModel[];
}

// ---------------------------------------------------------------------------
// Placeholder URLs — replace with your own photos when ready.
// All current URLs are public sample images from the existing site build.
// ---------------------------------------------------------------------------

// 10 distinct placeholder URLs (mix of existing CDN images)
const PH = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAgEQ0yIsj60TM_fMreP_PHE6G0HE3Xfv3KSZJlaBff6hkEymrgoqN6aArizCrycxxTMBhO7bo_H68ESSG7qwca4rHNxaNuoj7xKM_7FfFlWCEYckyXt8x-vRjCDiv6fMV2WIyg1zxjXiNU__I8xsY8yWjCgYWBKNt01jKDBV8a_mXVO9rR86bw0VBtM5Y5TVbAcat-OQ5LLWHThBto2LzW2yBY23LSFuMAnVuiBXM8BTst1zOE4hve', // bridal1
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAefqtfJQZ9TS0PXgSONalvdfQkW-7bwG4kerp-wE0gdR6srYlGwOnufa51mpQfOqMrrtLxtwEfXIVAwb3W4TueGhLVkE-zK8mRvyfnDbFIsg74s62gj1BWWeaz8L5pZHeBUI0T09Bf6PUfbiO1aQQoVKeUJN3XlynBnUw_qR3BW2l-V4s124x7mBVdiALXqaPItVzQcQz8IBpCmweYaadFhOTtcZe7yD8my5MSEy0zCIDUalDTGkVC', // bridal2
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDWcjh1C7dA2KqSCvozPMtMoOKfH4ZMHiqUDfEPfy4uTITZGXzU47ahtiDVS5pu7JVOj2d8XLGM9iCcfgNIqYO8Nn9SQtp0MqiEgakPCpX0gGAH5WIIE6PSkpjTKdAEw5SOmE-Wq94H2EvZFA_yWmtNsfHSIlGpr3TpjYS94OonK39hqFoF5P4aIiCCeHgUBrYTwQ_JgivIs7LE1cm1MAfmvvgPJ_HzFHedQ1CNFHXnbst5KvEVkjmk', // haldi1
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD97MHYIqEGw7ca3wjAMOV3bVkHE-dxGoDhL3ZtjE4vF0gG4R-SGtFCEDKpps3ppanTHxTRTjVqnQoSv_KMQQLhty1Di_we4hgx55jygkjnc2vOM4cUA41YvdKsPHI_-0lopJrdaW7_zK9GhqSqbHtrQhW2jHnAmywy5dVxMqBiuBYGoDLr55nAhoHp71hVDp_XJLDAyQc1GB1j7e19ywccu5cr2Nh7_ZbJF3ceKRIFiGq3yML9TqPO', // party1
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBoEo6RYQwLa3sIYS0titRG-P3Eou8TbBMPPRETewa4ff_bAs1LCg3u-xwUfWCOz7CpucD7RHx4m0KQ8h-7WzpQyKNub9TqMlV8VNyFPc2NifK7GLHH6PClYuDQYTMPwV4mdixmZuezQml-1TP08MjESzLncSJNRskMwB6y-8WSRbBIYnO_hRPHkoKo__aRDMzUf7Vd0q4CH9KPg3IiH9PUdb9tJsJqUUAsdwERK3SfF1mf4RwJDR_P', // vid1
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCWP4utgQaYgf41nsl8HUoCUIhX-W8eFQ-ZxdrVk9BJdrzSQvLgiqqlUpQuPIo_rSRU0JSgfzaGGtb_zenTtncjz8AKPuiOLUMYUH5Zilaai32xemGu1hu_DrmT5oJ1xsC3fdj-smTVAZKmXpirgPLGduAIhCqZdm_IG-wJV0qxDiYB05WuG7Fsi0sSpUbOz9l0He9g7Ic-uGIuAhstbBMAFIWzMDixjhMLDgeyeCobmVFMwPeeSOpQ', // vid2
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC1aeg4nRmnb5JV0NlmMGSeplk0kOJ2EdxRdJWXzfbysezQZbJagLb1JYpfAQPPjCLmkFV0n72TdJnjUAfdu-wk7hpcYfum2cWcHJGH89Nu2jhalM3xAc8lZwlewgeC-iaKkzylKcAYfcXFOnJzMiDOMdFN2FJG2uMYPC7hpphfB9X60oyDeTWgktDekIQetQwCzCAoh0doKoVeiL5-WoQU6WpXS6VppzzCiveaitI5w8aCKXC3Qz6r', // vid3
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAIJcHgbxG9Pl_chz5uIVlD6HUiAozHJWGCOs785OmXE2wCWwaImTsXxZN64CVgsAOWr3AVBb3bYtaByCW52VEUavrDRD7Au4HUIwIskcJVAaygfo37YNuUdBFLco7xBFEwOlSyqDW0TkvniApx50gDIM983wfprPSRWhpLOkGn7hTIrR4BrjuyaSQOnYgs6pY6foQdDrqQ95QGm05ToqXeXvm6ikED7cbOwUehkJCDTgcRdkj0cP-z', // vid4
  // Two extra: reuse bridal icon & hero as additional placeholders
  '/bridal-icon.jpg',
  '/khushi-hero.jpeg',
];

// Helper: build a 10-image gallery starting from a seed index (cycles through PH)
const gallery = (startIndex: number): string[] =>
  Array.from({ length: 10 }, (_, i) => PH[(startIndex + i) % PH.length]);

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // BRIDAL
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'bridal',
    label: 'Bridal',
    tagline: 'Timeless Beauty For Your Big Day',
    description:
      'Luminous HD bridal looks crafted for long-lasting radiance through every ceremony ritual and photograph.',
    models: [
      {
        id: 'bridal-model-01',
        name: 'Priya',
        thumbnail: PH[0],
        galleryImages: gallery(0),
      },
      {
        id: 'bridal-model-02',
        name: 'Anjali',
        thumbnail: PH[1],
        galleryImages: gallery(1),
      },
      {
        id: 'bridal-model-03',
        name: 'Ritu',
        thumbnail: PH[4],
        galleryImages: gallery(2),
      },
      {
        id: 'bridal-model-04',
        name: 'Kavya',
        thumbnail: PH[5],
        galleryImages: gallery(3),
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PARTY
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'party',
    label: 'Party',
    tagline: 'Glam That Steals the Spotlight',
    description:
      'Statement glamour looks built for cocktail evenings, receptions, and every celebration in between.',
    models: [
      {
        id: 'party-model-01',
        name: 'Neha',
        thumbnail: PH[3],
        galleryImages: gallery(4),
      },
      {
        id: 'party-model-02',
        name: 'Shruti',
        thumbnail: PH[7],
        galleryImages: gallery(5),
      },
      {
        id: 'party-model-03',
        name: 'Megha',
        thumbnail: PH[5],
        galleryImages: gallery(6),
      },
      {
        id: 'party-model-04',
        name: 'Pooja',
        thumbnail: PH[6],
        galleryImages: gallery(7),
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HALDI
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'haldi',
    label: 'Haldi',
    tagline: 'Sun-Kissed Glow for the Golden Ritual',
    description:
      'Waterproof breathable looks that celebrate the joy of Haldi with radiant, turmeric-ready skin.',
    models: [
      {
        id: 'haldi-model-01',
        name: 'Divya',
        thumbnail: PH[2],
        galleryImages: gallery(2),
      },
      {
        id: 'haldi-model-02',
        name: 'Sunita',
        thumbnail: PH[6],
        galleryImages: gallery(3),
      },
      {
        id: 'haldi-model-03',
        name: 'Anita',
        thumbnail: PH[7],
        galleryImages: gallery(4),
      },
      {
        id: 'haldi-model-04',
        name: 'Radha',
        thumbnail: PH[1],
        galleryImages: gallery(5),
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MEHENDI
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'mehendi',
    label: 'Mehendi',
    tagline: 'Fresh Daytime Beauty for Sangeet & Mehendi',
    description:
      'Light, natural and luminous looks that complement the colours and joy of Mehendi and Sangeet ceremonies.',
    models: [
      {
        id: 'mehendi-model-01',
        name: 'Komal',
        thumbnail: PH[6],
        galleryImages: gallery(6),
      },
      {
        id: 'mehendi-model-02',
        name: 'Swati',
        thumbnail: PH[1],
        galleryImages: gallery(7),
      },
      {
        id: 'mehendi-model-03',
        name: 'Pallavi',
        thumbnail: PH[4],
        galleryImages: gallery(8),
      },
      {
        id: 'mehendi-model-04',
        name: 'Deepa',
        thumbnail: PH[2],
        galleryImages: gallery(9),
      },
    ],
  },
];
