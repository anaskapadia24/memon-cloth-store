"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  "/images/hero/hero1.png",
  "/images/hero/hero2.png",
  "/images/hero/hero3.png",
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hero-bg">
        {SLIDES.map((src, i) => (
          <div
            key={src}
            className={`hero-slide${i === active ? " active" : ""}`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}
      </div>
      <div className="hero-dots">
        {SLIDES.map((src, i) => (
          <button
            key={src}
            className={`hero-dot${i === active ? " active" : ""}`}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </>
  );
}
