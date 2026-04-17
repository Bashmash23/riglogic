// Shared types for RigLogic.

export type Category =
  | "Cameras"
  | "Lenses"
  | "Lighting"
  | "Grip"
  | "Audio"
  | "Monitoring"
  | "Power"
  | "Media"
  | "Accessories";

export const CATEGORIES: Category[] = [
  "Cameras",
  "Lenses",
  "Lighting",
  "Grip",
  "Audio",
  "Monitoring",
  "Power",
  "Media",
  "Accessories",
];

export interface RentalHouse {
  id: string;
  name: string;
  website: string;
  specialty: string;
}

export interface GearItem {
  id: string;
  name: string;
  category: Category;
  dayRateAED: number;
  rentalHouseId: string;
  tags: string[];
  isPrimary: boolean;
  blurb: string;
}

/**
 * A single line in the user's kit. `lineId` is unique per line so duplicates
 * of the same gear item can be represented as separate lines.
 */
export interface KitLine {
  lineId: string;
  gearItemId: string;
  quantity: number;
  addedAt: number;
}

export interface Kit {
  projectName: string;
  startDate: string | null; // YYYY-MM-DD
  endDate: string | null;
  lines: KitLine[];
  dismissedSuggestions: string[]; // primaryItemId:suggestionId pairs
}
