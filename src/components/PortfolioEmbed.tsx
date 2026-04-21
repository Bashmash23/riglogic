// Portfolio link renderer. For YouTube or Vimeo URLs, embeds the
// video player inline. Everything else falls back to the existing
// outbound-link card.
//
// Server component — no interactive state needed. That keeps the
// /crew/[slug] page cacheable and the iframe loading deferred until
// the user scrolls it into view (browser-native lazy iframe).

import { ExternalLink } from "lucide-react";
import type { PortfolioLink } from "@/lib/crewTypes";

// --- URL parsers -----------------------------------------------------

/** Strip wrapping whitespace + accept bare IDs. */
function cleanUrl(u: string): string {
  return u.trim();
}

/** Extract an 11-char YouTube video ID from any standard URL form. */
function getYouTubeId(u: string): string | null {
  const url = cleanUrl(u);
  // youtu.be/<id>
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  // youtube.com/watch?v=<id>
  const watch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watch) return watch[1];
  // youtube.com/embed/<id>
  const embed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embed) return embed[1];
  // youtube.com/shorts/<id>
  const shorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shorts) return shorts[1];
  return null;
}

/** Extract a Vimeo ID (all-digits) from any standard Vimeo URL. */
function getVimeoId(u: string): string | null {
  const url = cleanUrl(u);
  // vimeo.com/<id>
  const pub = url.match(/vimeo\.com\/(\d+)/);
  if (pub) return pub[1];
  // player.vimeo.com/video/<id>
  const player = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (player) return player[1];
  return null;
}

// --- renderer --------------------------------------------------------

export function PortfolioEmbed({ link }: { link: PortfolioLink }) {
  const yt = getYouTubeId(link.url);
  if (yt) {
    return (
      <EmbedFrame
        src={`https://www.youtube-nocookie.com/embed/${yt}`}
        title={link.label}
        url={link.url}
      />
    );
  }
  const vimeo = getVimeoId(link.url);
  if (vimeo) {
    return (
      <EmbedFrame
        src={`https://player.vimeo.com/video/${vimeo}?dnt=1`}
        title={link.label}
        url={link.url}
      />
    );
  }
  // Fallback: link card (same look as before embeds existed).
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-sm hover:border-neutral-700"
    >
      <span className="truncate text-neutral-200">{link.label}</span>
      <ExternalLink
        size={12}
        className="shrink-0 text-neutral-500 group-hover:text-neutral-300"
      />
    </a>
  );
}

function EmbedFrame({
  src,
  title,
  url,
}: {
  src: string;
  title: string;
  url: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-neutral-800 bg-neutral-950">
      <div className="relative aspect-video">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-neutral-800 px-3 py-2 text-xs">
        <span className="truncate text-neutral-300">{title}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-neutral-500 hover:text-neutral-300"
        >
          Open
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
