"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Ports the legacy site's `.reveal` fade-up-on-scroll behavior: elements with
// class="reveal" start invisible and fade in once they enter the viewport.
export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const scan = () => {
      document
        .querySelectorAll(".reveal:not(.visible)")
        .forEach((el) => observer.observe(el));
    };

    scan();
    // Content streamed in after mount (client components, data fetches) needs a rescan.
    const rescan = setTimeout(scan, 300);

    return () => {
      observer.disconnect();
      clearTimeout(rescan);
    };
  }, [pathname]);

  return null;
}
