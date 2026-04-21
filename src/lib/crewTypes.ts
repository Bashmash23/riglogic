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

/** What a free/public viewer always sees. Availability dates are
 *  treated as public (knowing when someone is free isn't sensitive
 *  the way contact details are) so productions can use the
 *  directory itself to plan around schedules. */
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
  /** ISO YYYY-MM-DD strings the freelancer marked as available. */
  availableDates: string[];
  /** When false, the public profile hides the calendar entirely
   *  even if availableDates is non-empty. Lets freelancers
   *  experiment with marking days privately. */
  showAvailabilityCalendar: boolean;
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

/** Full profile object as returned to owner / Pro viewer. The
 *  `isPublished` flag is included so the owner's editor can show
 *  the current visibility state — listings already filter by it
 *  server-side so other viewers never see this field on hidden
 *  profiles. */
export type CrewProfileFull = CrewProfilePublic &
  CrewProfileContact & {
    isPublished: boolean;
  };

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
  /** When false, the profile is hidden from /crew and 404s on
      /crew/[slug]. Owner can always see + edit. Default true. */
  isPublished?: boolean;
  /** Replaces the availability set entirely on each save (the
      editor sends the full current selection). */
  availableDates?: string[];
  /** When false, hide the calendar on the public profile. */
  showAvailabilityCalendar?: boolean;
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
