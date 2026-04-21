// POST /api/crew/upload — upload a photo or CV for the signed-in
// user's crew profile. Stores the file in Vercel Blob and updates
// the CrewProfile row with the resulting URL.
//
// Request: multipart/form-data with:
//   kind: "photo" | "cv"
//   file: the file
//
// Response: { url: string, cvFileName?: string }
//
// Limits (enforced both client-side for UX and server-side for
// safety):
//   photo: 5 MB, image/* only
//   cv:    10 MB, application/pdf only
//
// Requires BLOB_READ_WRITE_TOKEN env var. If missing the route
// returns a clear 503 so the UI can show "file storage not
// configured" instead of a cryptic error.
//
// First-upload-before-save behaviour: if the user uploads a photo
// or CV before they've ever saved their profile, this endpoint
// auto-creates a hidden stub row so the blob has somewhere to
// attach. The stub stays isPublished=false so it never leaks to
// the public directory; the user's first real Save fills in their
// fields and (via the visibility toggle default) flips it public.

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { slugify, slugifyWithSuffix } from "@/lib/crewSlug";

export const dynamic = "force-dynamic";
// Allow a slightly larger body for CV uploads.
export const maxDuration = 30;

const PHOTO_MAX = 5 * 1024 * 1024; // 5 MB
const CV_MAX = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error: "blob_not_configured",
        hint:
          "Admin: create a Vercel Blob store and set BLOB_READ_WRITE_TOKEN",
      },
      { status: 503 },
    );
  }

  const form = await req.formData();
  const kind = form.get("kind");
  const file = form.get("file");

  if (kind !== "photo" && kind !== "cv") {
    return NextResponse.json(
      { error: "invalid_kind" },
      { status: 400 },
    );
  }
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "missing_file" },
      { status: 400 },
    );
  }

  if (kind === "photo") {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "invalid_photo_type" },
        { status: 400 },
      );
    }
    if (file.size > PHOTO_MAX) {
      return NextResponse.json(
        { error: "photo_too_large", maxBytes: PHOTO_MAX },
        { status: 413 },
      );
    }
  } else {
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "cv_must_be_pdf" },
        { status: 400 },
      );
    }
    if (file.size > CV_MAX) {
      return NextResponse.json(
        { error: "cv_too_large", maxBytes: CV_MAX },
        { status: 413 },
      );
    }
  }

  // Namespace every user's files under their Clerk userId so
  // people can't overwrite each other's uploads by guessing paths.
  // Random suffix avoids collisions with previous uploads from the
  // same user (e.g. two photos).
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
  const pathname = `crew/${userId}/${kind}/${Date.now()}-${safeName}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: file.type,
    });

    // Ensure a CrewProfile row exists. If the user is uploading
    // before their first explicit Save, create a hidden stub now
    // so the blob has somewhere to attach. We pull a sensible
    // default name from Clerk so the editor doesn't show "" — the
    // user will overwrite it before clicking Save anyway.
    const existing = await prisma.crewProfile.findUnique({
      where: { userId },
    });
    if (!existing) {
      const user = await currentUser().catch(() => null);
      const clerkName =
        [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
        user?.username ||
        "Crew member";
      // Slug collision handling matches the PUT route — try the
      // clean slug first, fall back to suffixed.
      const baseSlug = slugify(clerkName);
      const collision = await prisma.crewProfile.findUnique({
        where: { slug: baseSlug },
      });
      const slug = collision ? slugifyWithSuffix(clerkName) : baseSlug;
      await prisma.crewProfile.create({
        data: {
          userId,
          slug,
          displayName: clerkName,
          // Stays hidden until the user explicitly saves with the
          // visibility toggle on. Prevents half-baked profiles
          // from leaking into /crew before the user has a chance
          // to fill them in.
          isPublished: false,
        },
      });
    }

    if (kind === "photo") {
      await prisma.crewProfile.update({
        where: { userId },
        data: { photoUrl: blob.url },
      });
      return NextResponse.json({ url: blob.url });
    } else {
      await prisma.crewProfile.update({
        where: { userId },
        data: { cvUrl: blob.url, cvFileName: file.name },
      });
      return NextResponse.json({ url: blob.url, cvFileName: file.name });
    }
  } catch (err) {
    console.error("POST /api/crew/upload failed", err);
    return NextResponse.json(
      { error: "upload_failed" },
      { status: 500 },
    );
  }
}
