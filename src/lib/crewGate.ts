// Feature flag for the Crew directory "Pro gate".
//
// Phase 1 behaviour: flag is OFF, so anyone can see every field on
// every profile — we want adoption while we build the freelancer
// supply side.
//
// Phase 2 behaviour (future): flip this to true and the contact
// fields (email, phone, availability text, CV download) become
// visible only to:
//   - The owner of the profile
//   - Viewers whose CrewProfile.tier === "pro"
//
// The single source of truth is this constant. Every page and API
// route that returns profile data imports `canViewContactDetails`
// and strips the sensitive fields server-side before responding,
// so gating survives copy-paste of the public URL.
export const CREW_PREMIUM_GATE_ENABLED = false;

export interface ViewerContext {
  /** Clerk userId of the viewer, or null if signed out. */
  userId: string | null;
  /** Tier of the viewer's own CrewProfile, if they have one. */
  tier: "free" | "pro" | null;
}

export interface ProfileOwnerContext {
  /** Clerk userId of the profile's owner. */
  ownerUserId: string;
}

/**
 * Returns true if the viewer is allowed to see contact/availability
 * fields on the given profile. Call this server-side, then strip
 * those fields from the response payload when false.
 */
export function canViewContactDetails(
  viewer: ViewerContext,
  owner: ProfileOwnerContext,
): boolean {
  // Gate off? Everybody sees everything.
  if (!CREW_PREMIUM_GATE_ENABLED) return true;

  // Gate on — owner always sees their own profile in full.
  if (viewer.userId && viewer.userId === owner.ownerUserId) return true;

  // Pro viewers see everything.
  if (viewer.tier === "pro") return true;

  // Free or signed-out: contact fields are masked.
  return false;
}
