"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/,
  );
  return m ? m[1] : null;
}

function isYoutubeShort(url: string) {
  return /youtube\.com\/shorts\//.test(url);
}

function isInstagram(url: string) {
  return /instagram\.com\/(reel|p|tv)\//.test(url);
}

// Instagram's embed widget silently falls back to a plain "view on
// Instagram" link (no inline player) if the permalink isn't in its exact
// expected form - strips tracking params like ?igsh=... that break it.
function cleanInstagramPermalink(url: string): string {
  const m = url.match(/instagram\.com\/(reel|p|tv)\/([\w-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/` : url;
}

export function ProductVideos({ urls }: { urls: string[] }) {
  const hasInstagram = urls.some(isInstagram);

  useEffect(() => {
    if (!hasInstagram) return;
    if (window.instgrm) {
      window.instgrm.Embeds.process();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = () => window.instgrm?.Embeds.process();
    document.body.appendChild(script);
  }, [hasInstagram]);

  if (!urls.length) return null;

  return (
    <section className="product-videos">
      <h2 className="section-title" style={{ fontSize: "1.4rem" }}>
        As Seen On
      </h2>
      <div className="product-videos-grid">
        {urls.map((url) => {
          const ytId = youtubeId(url);
          if (ytId) {
            return (
              <div
                className={`product-video-embed${isYoutubeShort(url) ? " portrait" : " landscape"}`}
                key={url}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`}
                  title="Product video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            );
          }
          if (isInstagram(url)) {
            return (
              <div className="product-video-embed auto" key={url}>
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={cleanInstagramPermalink(url)}
                  data-instgrm-version="14"
                  style={{ margin: 0, width: "100%" }}
                />
              </div>
            );
          }
          return (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="product-video-link"
            >
              <i className="fas fa-play-circle" /> Watch video
            </a>
          );
        })}
      </div>
    </section>
  );
}
