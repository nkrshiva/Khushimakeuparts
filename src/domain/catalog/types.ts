export interface PriceVariant {
  id: string;
  label: string; // e.g. 'Short Hair', 'Shoulder Length', 'Senior Stylist'
  price: string; // e.g. '₹1,500'
  priceNum: number;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  price: string;
  priceNum: number;
  durationMinutes?: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: string;
  priceNum: number;
  duration: string;
  inclusions: string[];
  category: string;
  badge?: string;
  iconName: string;
  imageUrl?: string;
  hidden?: boolean;

  // Modular Extensions
  bookingMode?: 'wedding' | 'timeslot' | 'both';
  durationMinutes?: number;
  priceVariants?: PriceVariant[];
  addOns?: ServiceAddOn[];
  eligibleStaffIds?: string[];
}

export interface BridalPackage {
  id: string;
  name: string;
  tier: string;
  description: string;
  features: string[];
  isRecommended?: boolean;
  popular?: boolean;
  hidden?: boolean;
}
