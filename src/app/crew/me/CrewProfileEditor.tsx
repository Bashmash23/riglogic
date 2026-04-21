"use client";

// Profile editor form. Handles create + update in one flow (the
// API route is a PUT upsert). Photo + CV uploads hit
// /api/crew/upload which writes to Vercel Blob and updates the row
// in one shot.

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { ALL_ROLES } from "@/lib/crewTypes";
import type {
  CrewProfileFull,
  PortfolioLink,
  SocialLinks,
} from "@/lib/crewTypes";

interface Props {
  initial: CrewProfileFull | null;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function CrewProfileEditor({ initial }: Props) {
  const router = useRouter();

  // ------- form state -------------------------------------------------
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [roles, setRoles] = useState<string[]>(initial?.roles ?? []);
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [availabilityText, setAvailabilityText] = useState(
    initial?.availabilityText ?? "",
  );
  const [portfolioLinks, setPortfolioLinks] = useState<PortfolioLink[]>(
    initial?.portfolioLinks ?? [],
  );
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(
    initial?.socialLinks ?? {},
  );

  // Photo + CV are managed server-side (uploads return URLs that
  // are saved to the row immediately). Local state here mirrors
  // the row for instant UI feedback.
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    initial?.photoUrl ?? null,
  );
  const [cvUrl, setCvUrl] = useState<string | null>(initial?.cvUrl ?? null);
  const [cvFileName, setCvFileName] = useState<string | null>(
    initial?.cvFileName ?? null,
  );
  const [photoBusy, setPhotoBusy] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Visibility toggle. Default: published. The current value is
  // sent on every save so flipping the switch and clicking Save
  // immediately updates the public directory.
  const [isPublished, setIsPublished] = useState<boolean>(
    initial?.isPublished ?? true,
  );

  // After the very first successful save we know a row exists in
  // the DB, so the upload endpoints will accept files. The server-
  // rendered `initial` prop stays null in this client component
  // even after `router.refresh()` — without this local flag the
  // photo + CV buttons stay disabled forever after first save.
  const [hasProfile, setHasProfile] = useState<boolean>(Boolean(initial));

  const canSave = useMemo(
    () => displayName.trim().length > 0 && saveState !== "saving",
    [displayName, saveState],
  );

  // ------- actions ----------------------------------------------------

  const saveProfile = async () => {
    if (!canSave) return;
    setSaveState("saving");
    setSaveMessage(null);
    try {
      const res = await fetch("/api/crew/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          headline: headline.trim() || undefined,
          bio: bio.trim() || undefined,
          city: city.trim() || undefined,
          roles,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          availabilityText: availabilityText.trim() || undefined,
          portfolioLinks: portfolioLinks.filter(
            (l) => l.label.trim() && l.url.trim(),
          ),
          socialLinks: Object.fromEntries(
            Object.entries(socialLinks).filter(([, v]) =>
              typeof v === "string" && v.trim().length > 0,
            ),
          ),
          isPublished,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setSaveState("error");
        setSaveMessage(
          data.error === "invalid_input"
            ? "Check the required fields."
            : "Couldn't save. Try again.",
        );
        return;
      }
      const data = (await res.json()) as {
        profile: { slug: string; isPublished: boolean };
      };
      setSaveState("saved");
      // Once a row exists, photo + CV uploads are unlocked even
      // though the server-rendered `initial` prop is still null.
      setHasProfile(true);
      setSaveMessage(
        data.profile.isPublished
          ? `Saved. Public at /crew/${data.profile.slug}`
          : `Saved as hidden. Toggle visible to list on /crew.`,
      );
      // Refresh so the next edit reads from the updated DB row
      // (slug may have been generated on first save).
      router.refresh();
    } catch {
      setSaveState("error");
      setSaveMessage("Network error. Try again.");
    }
  };

  const uploadFile = async (kind: "photo" | "cv", file: File) => {
    if (!hasProfile) {
      setUploadError(
        "Save your profile once first, then you can upload files.",
      );
      return;
    }
    setUploadError(null);
    if (kind === "photo") setPhotoBusy(true);
    else setCvBusy(true);
    try {
      const fd = new FormData();
      fd.append("kind", kind);
      fd.append("file", file);
      const res = await fetch("/api/crew/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          hint?: string;
        };
        setUploadError(
          data.hint ??
            {
              blob_not_configured:
                "File storage isn't set up yet — ask the admin.",
              invalid_photo_type: "Photo must be an image file.",
              photo_too_large: "Photo is too large (max 5MB).",
              cv_must_be_pdf: "CV must be a PDF.",
              cv_too_large: "CV is too large (max 10MB).",
              no_profile_yet: "Save your profile once first.",
            }[data.error ?? ""] ??
            "Upload failed. Try again.",
        );
        return;
      }
      const data = (await res.json()) as {
        url: string;
        cvFileName?: string;
      };
      if (kind === "photo") {
        setPhotoUrl(data.url);
      } else {
        setCvUrl(data.url);
        setCvFileName(data.cvFileName ?? file.name);
      }
    } catch {
      setUploadError("Upload failed. Try again.");
    } finally {
      if (kind === "photo") setPhotoBusy(false);
      else setCvBusy(false);
    }
  };

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const updateLink = (i: number, field: keyof PortfolioLink, v: string) => {
    setPortfolioLinks((prev) =>
      prev.map((l, idx) => (idx === i ? { ...l, [field]: v } : l)),
    );
  };

  const removeLink = (i: number) =>
    setPortfolioLinks((prev) => prev.filter((_, idx) => idx !== i));

  const addLink = () =>
    setPortfolioLinks((prev) => [...prev, { label: "", url: "" }]);

  // ------- render ------------------------------------------------------

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        saveProfile();
      }}
    >
      {/* Visibility toggle — sits at the top so freelancers see it
          before scrolling. Hidden profiles are excluded from the
          public /crew grid AND 404 on /crew/[slug] for everyone
          except the owner. */}
      <VisibilityToggle
        value={isPublished}
        onChange={setIsPublished}
        hasSavedBefore={hasProfile}
      />

      {/* Section: photo + identity */}
      <Section title="Identity">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <PhotoUpload
            url={photoUrl}
            busy={photoBusy}
            onFile={(f) => uploadFile("photo", f)}
            onClear={() => setPhotoUrl(null)}
            canUpload={hasProfile}
          />
          <div className="flex flex-1 flex-col gap-4">
            <Field label="Full name" required>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sara El-Masri"
                maxLength={80}
                className={inputClass}
              />
            </Field>
            <Field label="Headline" hint="A one-liner shown under your name">
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Freelance DP · Dubai"
                maxLength={120}
                className={inputClass}
              />
            </Field>
            <Field label="City">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dubai"
                maxLength={60}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Section: roles */}
      <Section
        title="Roles"
        subtitle="Pick every role you'd take on set. Crew search filters by these."
      >
        <div className="flex flex-wrap gap-1.5">
          {ALL_ROLES.map((role) => {
            const on = roles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  on
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Section: bio */}
      <Section title="Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A few sentences about your work. What you shoot, who you've worked with, what you bring to set."
          rows={6}
          maxLength={2000}
          className={`${inputClass} resize-y`}
        />
        <p className="mt-1 text-[11px] text-neutral-500">
          {bio.length} / 2000
        </p>
      </Section>

      {/* Section: portfolio links */}
      <Section
        title="Portfolio links"
        subtitle="Vimeo, Instagram, Behance, YouTube, personal site — anywhere that shows your work."
      >
        <div className="space-y-2">
          {portfolioLinks.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="Label (e.g. Reel 2025)"
                maxLength={40}
                className={`${inputClass} w-44`}
              />
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="https://vimeo.com/…"
                maxLength={500}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="rounded-md border border-neutral-800 px-2 text-neutral-400 hover:text-red-400"
                aria-label="Remove link"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="text-xs text-accent hover:underline"
          >
            + Add another link
          </button>
        </div>
      </Section>

      {/* Section: socials */}
      <Section title="Socials">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SocialField
            label="Website"
            value={socialLinks.website ?? ""}
            onChange={(v) => setSocialLinks({ ...socialLinks, website: v })}
          />
          <SocialField
            label="Instagram"
            value={socialLinks.instagram ?? ""}
            onChange={(v) => setSocialLinks({ ...socialLinks, instagram: v })}
          />
          <SocialField
            label="Behance"
            value={socialLinks.behance ?? ""}
            onChange={(v) => setSocialLinks({ ...socialLinks, behance: v })}
          />
          <SocialField
            label="Vimeo"
            value={socialLinks.vimeo ?? ""}
            onChange={(v) => setSocialLinks({ ...socialLinks, vimeo: v })}
          />
          <SocialField
            label="YouTube"
            value={socialLinks.youtube ?? ""}
            onChange={(v) => setSocialLinks({ ...socialLinks, youtube: v })}
          />
          <SocialField
            label="IMDb"
            value={socialLinks.imdb ?? ""}
            onChange={(v) => setSocialLinks({ ...socialLinks, imdb: v })}
          />
          <SocialField
            label="LinkedIn"
            value={socialLinks.linkedin ?? ""}
            onChange={(v) => setSocialLinks({ ...socialLinks, linkedin: v })}
          />
        </div>
      </Section>

      {/* Section: contact + availability */}
      <Section
        title="Contact &amp; availability"
        subtitle="Used by productions to reach out. Will become Pro-only to view later — you'll still be able to see and edit yours."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              maxLength={120}
              className={inputClass}
            />
          </Field>
          <Field label="Phone / WhatsApp">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+971 50 …"
              maxLength={30}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Availability note">
            <textarea
              value={availabilityText}
              onChange={(e) => setAvailabilityText(e.target.value)}
              placeholder="e.g. Based in Dubai. Open for commercials, music videos, features. Day rate on request."
              rows={3}
              maxLength={1000}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      </Section>

      {/* Section: CV */}
      <Section
        title="CV"
        subtitle="Upload a PDF. Productions can download it from your profile."
      >
        <CvUpload
          url={cvUrl}
          fileName={cvFileName}
          busy={cvBusy}
          onFile={(f) => uploadFile("cv", f)}
          onClear={() => {
            setCvUrl(null);
            setCvFileName(null);
          }}
          canUpload={hasProfile}
        />
      </Section>

      {uploadError && (
        <div className="rounded-md border border-red-900 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {uploadError}
        </div>
      )}

      {/* Save bar — sticky so it's always reachable */}
      <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-950/95 p-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-neutral-500">
            {initial
              ? "Changes go live on /crew as soon as you save."
              : "Save once to publish your profile. You can keep editing afterwards."}
          </div>
          <button
            type="submit"
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-neutral-950 hover:bg-accent-soft disabled:opacity-60"
          >
            {saveState === "saving" ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving
              </>
            ) : saveState === "saved" ? (
              <>
                <Check size={14} />
                Saved
              </>
            ) : (
              "Save profile"
            )}
          </button>
        </div>
        {saveMessage && (
          <p
            className={`text-xs ${
              saveState === "error" ? "text-red-300" : "text-neutral-400"
            }`}
          >
            {saveMessage}
          </p>
        )}
      </div>
    </form>
  );
}

// -------- small building blocks ------------------------------------

function VisibilityToggle({
  value,
  onChange,
  hasSavedBefore,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  hasSavedBefore: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
      <div>
        <div className="flex items-center gap-2">
          {value ? (
            <Eye size={14} className="text-accent" />
          ) : (
            <EyeOff size={14} className="text-neutral-500" />
          )}
          <span className="text-sm font-medium text-neutral-100">
            {value ? "Visible on /crew" : "Hidden from /crew"}
          </span>
        </div>
        <p className="mt-1 max-w-md text-xs text-neutral-500">
          {value
            ? "Your profile shows up in the public directory and on its own page. Anyone can find you."
            : "Your profile is saved but no one else can see it. Toggle on whenever you're ready."}
          {!hasSavedBefore && " Save once for the toggle to take effect."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          value ? "bg-accent" : "bg-neutral-700"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-neutral-100 shadow transition-transform ${
            value ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-accent";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-xs font-medium text-neutral-400">
        {label}
        {required && <span className="text-accent">*</span>}
      </span>
      {hint && <span className="text-[11px] text-neutral-500">{hint}</span>}
      <div className="mt-1">{children}</div>
    </label>
  );
}

function SocialField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://"
        maxLength={300}
        className={inputClass}
      />
    </Field>
  );
}

function PhotoUpload({
  url,
  busy,
  onFile,
  onClear,
  canUpload,
}: {
  url: string | null;
  busy: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
  canUpload: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3 sm:w-40">
      <div className="relative h-40 w-40 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-600">
            <Upload size={28} />
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/70">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        )}
      </div>
      <label
        className={`cursor-pointer rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 ${
          !canUpload ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {url ? "Change photo" : "Upload photo"}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            // Allow re-selecting the same file.
            e.target.value = "";
          }}
        />
      </label>
      {!canUpload && (
        <p className="text-center text-[11px] text-neutral-500">
          Save once, then upload.
        </p>
      )}
      {url && (
        <button
          type="button"
          onClick={onClear}
          className="text-[11px] text-neutral-500 hover:text-red-300"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function CvUpload({
  url,
  fileName,
  busy,
  onFile,
  onClear,
  canUpload,
}: {
  url: string | null;
  fileName: string | null;
  busy: boolean;
  onFile: (f: File) => void;
  onClear: () => void;
  canUpload: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {url ? (
        <div className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-4 py-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm text-accent hover:underline"
          >
            {fileName ?? "Current CV"}
          </a>
          <button
            type="button"
            onClick={onClear}
            className="ml-4 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-red-300"
          >
            <Trash2 size={12} />
            Remove
          </button>
        </div>
      ) : null}
      <label
        className={`inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 ${
          !canUpload ? "pointer-events-none opacity-50" : ""
        } ${busy ? "opacity-60" : ""}`}
      >
        {busy ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            Uploading
          </>
        ) : (
          <>
            <Upload size={12} />
            {url ? "Replace CV" : "Upload PDF"}
          </>
        )}
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
            e.target.value = "";
          }}
        />
      </label>
      {!canUpload && (
        <p className="text-[11px] text-neutral-500">
          Save your profile once, then you can upload a CV.
        </p>
      )}
    </div>
  );
}
