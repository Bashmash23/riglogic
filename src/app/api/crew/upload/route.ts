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

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";

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

    // Ensure the CrewProfile row exists before updating; if the
    // user uploaded a photo before creating their profile, we
    // bail so they hit the editor first.
    const existing = await prisma.crewProfile.findUnique({
      where: { userId },
    });
    if (!existing) {
      return NextResponse.json(
        {
          error: "no_profile_yet",
          hint: "Create your profile first, then upload.",
        },
        { status: 409 },
      );
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
