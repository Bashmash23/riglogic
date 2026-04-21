// GET /api/crew — public listing of all published crew profiles.
// Used by the /crew directory page. No contact fields returned here;
// the directory card only needs public metadata.

import { NextResponse } from "next/server";
import { listPublishedProfiles } from "@/lib/crewQueries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profiles = await listPublishedProfiles();
    return NextResponse.json({ profiles });
  } catch (err) {
    console.error("GET /api/crew failed", err);
    return NextResponse.json(
      { error: "internal_error" },
      { status: 500 },
    );
  }
}
