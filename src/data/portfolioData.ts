/**
 * Portfolio Data — Khushi Makeup Arts
 *
 * Structure:
 *   PORTFOLIO_CATEGORIES  (4 categories)
 *     └── models[]        (multiple models per category)
 *           ├── thumbnail   (card image)
 *           └── galleryImages[]  (all images for this model's lightbox — dynamic up to 20)
 *
 * Models support dynamic gallery counts (e.g. 5 photos, 12 photos, or up to 20 photos).
 * The lightbox showcases exactly the number of photos uploaded for each model.
 */

export interface PortfolioModel {
  id: string;
  name: string;
  thumbnail: string;
  galleryImages: string[];
  hidden?: boolean;
}

export interface PortfolioCategory {
  id: 'bridal' | 'party' | 'haldi' | 'mehendi';
  label: string;
  tagline: string;
  description: string;
  models: PortfolioModel[];
  hidden?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Real Local High-Resolution Photos from public/ and public/portfolio/
// ─────────────────────────────────────────────────────────────────────────────

const REAL_BRIDAL_SET_1 = [
  '/portfolio/model-01.jpg',   // Bridal look 01
  '/portfolio/model-02.jpg',   // Bridal look 02
  '/portfolio/model-03.jpg',   // Bridal look 03
  '/portfolio/model-04.jpg',   // Bridal look 04
  '/portfolio/model-05.jpeg',  // Bridal look 05
  '/portfolio/model-06.jpeg',  // Bridal look 06
  '/portfolio/model-07.jpeg',  // Bridal look 07
  '/portfolio/model-08.jpeg',  // Bridal look 08
  '/portfolio/model-09.jpeg',  // Bridal look 09
  '/portfolio/model-10.jpeg',  // Bridal look 10
];

const REAL_BRIDAL_SET_2 = [
  '/portfolio/model2-01.jpeg',  // Bridal look 01
  '/portfolio/model2-02.jpeg',  // Bridal look 02
  '/portfolio/model2-03.jpeg',  // Bridal look 03
  '/portfolio/model2-04.jpeg',  // Bridal look 04
  '/portfolio/model2-05.jpeg',  // Bridal look 05
  '/portfolio/model2-06.jpeg',  // Bridal look 06
  '/portfolio/model2-07.jpeg',  // Bridal look 07
  '/portfolio/model2-08.jpeg',  // Bridal look 08
  '/portfolio/model2-09.jpeg',  // Bridal look 09
  '/portfolio/model2-10.jpeg',  // Bridal look 10
];

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
        name: 'Pushpanjali 💕',
        thumbnail: REAL_BRIDAL_SET_1[0],
        galleryImages: [...REAL_BRIDAL_SET_1],
      },
      {
        id: 'bridal-model-02',
        name: 'Khushboo 💕',
        thumbnail: REAL_BRIDAL_SET_2[0],
        galleryImages: [...REAL_BRIDAL_SET_2],
      },
      {
        id: 'bridal-model-03',
        name: 'Ritu',
        thumbnail: REAL_BRIDAL_SET_1[2],
        galleryImages: [
          REAL_BRIDAL_SET_1[2],
          REAL_BRIDAL_SET_1[0],
          REAL_BRIDAL_SET_1[1],
          REAL_BRIDAL_SET_1[3],
          REAL_BRIDAL_SET_1[4],
          REAL_BRIDAL_SET_1[5],
          REAL_BRIDAL_SET_1[6],
        ],
      },
      {
        id: 'bridal-model-04',
        name: 'Kavya',
        thumbnail: REAL_BRIDAL_SET_2[3],
        galleryImages: [
          REAL_BRIDAL_SET_2[3],
          REAL_BRIDAL_SET_2[0],
          REAL_BRIDAL_SET_2[1],
          REAL_BRIDAL_SET_2[2],
          REAL_BRIDAL_SET_2[4],
          REAL_BRIDAL_SET_2[5],
        ],
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
        thumbnail: '/party-icon.jpg',
        galleryImages: [
          '/party-icon.jpg',
          REAL_BRIDAL_SET_2[3],
          REAL_BRIDAL_SET_2[4],
          REAL_BRIDAL_SET_2[5],
          REAL_BRIDAL_SET_2[6],
        ],
      },
      {
        id: 'party-model-02',
        name: 'Shruti',
        thumbnail: '/occasion-icon.jpg',
        galleryImages: [
          '/occasion-icon.jpg',
          REAL_BRIDAL_SET_1[4],
          REAL_BRIDAL_SET_1[5],
          REAL_BRIDAL_SET_1[6],
          REAL_BRIDAL_SET_1[7],
        ],
      },
      {
        id: 'party-model-03',
        name: 'Megha',
        thumbnail: REAL_BRIDAL_SET_2[5],
        galleryImages: [
          REAL_BRIDAL_SET_2[5],
          REAL_BRIDAL_SET_2[6],
          REAL_BRIDAL_SET_2[7],
          REAL_BRIDAL_SET_2[8],
        ],
      },
      {
        id: 'party-model-04',
        name: 'Pooja',
        thumbnail: REAL_BRIDAL_SET_1[6],
        galleryImages: [
          REAL_BRIDAL_SET_1[6],
          REAL_BRIDAL_SET_1[7],
          REAL_BRIDAL_SET_1[8],
          REAL_BRIDAL_SET_1[9],
        ],
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
        thumbnail: '/haldi-icon.jpg',
        galleryImages: [
          '/haldi-icon.jpg',
          REAL_BRIDAL_SET_1[1],
          REAL_BRIDAL_SET_1[2],
          REAL_BRIDAL_SET_1[3],
          REAL_BRIDAL_SET_1[7],
        ],
      },
      {
        id: 'haldi-model-02',
        name: 'Sunita',
        thumbnail: REAL_BRIDAL_SET_2[1],
        galleryImages: [
          REAL_BRIDAL_SET_2[1],
          REAL_BRIDAL_SET_2[2],
          REAL_BRIDAL_SET_2[4],
          REAL_BRIDAL_SET_2[8],
        ],
      },
      {
        id: 'haldi-model-03',
        name: 'Anita',
        thumbnail: REAL_BRIDAL_SET_1[3],
        galleryImages: [
          REAL_BRIDAL_SET_1[3],
          REAL_BRIDAL_SET_1[4],
          REAL_BRIDAL_SET_1[8],
        ],
      },
      {
        id: 'haldi-model-04',
        name: 'Radha',
        thumbnail: REAL_BRIDAL_SET_2[2],
        galleryImages: [
          REAL_BRIDAL_SET_2[2],
          REAL_BRIDAL_SET_2[3],
          REAL_BRIDAL_SET_2[7],
        ],
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
        thumbnail: '/mehendi-icon.jpg',
        galleryImages: [
          '/mehendi-icon.jpg',
          REAL_BRIDAL_SET_2[6],
          REAL_BRIDAL_SET_2[7],
          REAL_BRIDAL_SET_2[8],
        ],
      },
      {
        id: 'mehendi-model-02',
        name: 'Swati',
        thumbnail: '/engagement-icon.jpg',
        galleryImages: [
          '/engagement-icon.jpg',
          REAL_BRIDAL_SET_1[4],
          REAL_BRIDAL_SET_1[5],
          REAL_BRIDAL_SET_1[9],
        ],
      },
      {
        id: 'mehendi-model-03',
        name: 'Pallavi',
        thumbnail: REAL_BRIDAL_SET_1[5],
        galleryImages: [
          REAL_BRIDAL_SET_1[5],
          REAL_BRIDAL_SET_1[7],
          REAL_BRIDAL_SET_1[8],
        ],
      },
      {
        id: 'mehendi-model-04',
        name: 'Deepa',
        thumbnail: REAL_BRIDAL_SET_2[7],
        galleryImages: [
          REAL_BRIDAL_SET_2[7],
          REAL_BRIDAL_SET_2[8],
          REAL_BRIDAL_SET_2[9],
        ],
      },
    ],
  },
];
