// Shared types for the Crew directory. Kept separate from the
// Prisma-generated types so the client bundle doesn't pull in the
// Prisma runtime, and so API response shapes can diverge from the
// raw row shape (stripped contact fields, etc.).

export interface PortfolioLink {
  label: string;
  url: string;
}

export interface SocialLinks {
  website?: string;
  instagram?: string;
  behance?: string;
  vimeo?: string;
  youtube?: string;
  imdb?: string;
  linkedin?: string;
}

/** What a free/public viewer always sees. */
export interface CrewProfilePublic {
  id: string;
  slug: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  roles: string[];
  photoUrl: string | null;
  portfolioLinks: PortfolioLink[];
  socialLinks: SocialLinks;
  tier: "free" | "pro";
  updatedAt: string;
}

/** Additional fields unlocked when `canViewContactDetails` is true. */
export interface CrewProfileContact {
  email: string | null;
  phone: string | null;
  availabilityText: string | null;
  cvUrl: string | null;
  cvFileName: string | null;
}

/** Full profile object as returned to owner / Pro viewer. */
export type CrewProfileFull = CrewProfilePublic & CrewProfileContact;

/** Input shape accepted by the profile write API. */
export interface CrewProfileInput {
  displayName: string;
  headline?: string;
  bio?: string;
  city?: string;
  roles?: string[];
  email?: string;
  phone?: string;
  availabilityText?: string;
  portfolioLinks?: PortfolioLink[];
  socialLinks?: SocialLinks;
}

export const ALL_ROLES = [
  "DP / Cinematographer",
  "Camera Operator",
  "1st AC / Focus Puller",
  "2nd AC",
  "DIT",
  "Steadicam Operator",
  "Gimbal Operator",
  "Drone Pilot",
  "Gaffer",
  "Best Boy Electric",
  "Key Grip",
  "Best Boy Grip",
  "Sound Mixer",
  "Boom Operator",
  "Director",
  "Assistant Director",
  "Producer",
  "Production Manager",
  "Line Producer",
  "Script Supervisor",
  "Editor",
  "Colorist",
  "VFX Supervisor",
  "Motion Graphics",
  "Stills Photographer",
  "Art Director",
  "Production Designer",
  "Wardrobe / Stylist",
  "Hair & Makeup",
  "Location Manager",
  "Runner / PA",
] as const;

export type CrewRole = (typeof ALL_ROLES)[number];
