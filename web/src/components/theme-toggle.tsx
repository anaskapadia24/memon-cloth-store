"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function systemPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("memon_theme") as Theme | null;
    setTheme(saved || (systemPrefersDark() ? "dark" : "light"));
  }, []);

  function toggle() {
    const next: Theme =
      (theme ?? (systemPrefersDark() ? "dark" : "light")) === "dark"
        ? "light"
        : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("memon_theme", next);
  }

  return { isDark: theme === "dark", toggle };
}

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <i
        key={isDark ? "sun" : "moon"}
        className={`fas ${isDark ? "fa-sun" : "fa-moon"} theme-toggle-icon`}
      />
    </button>
  );
}

// Labeled row variant for the mobile menu, matching the other menu links
export function ThemeToggleRow() {
  const { isDark, toggle } = useTheme();

  return (
    <button className="theme-toggle-row" onClick={toggle}>
      <i
        key={isDark ? "sun" : "moon"}
        className={`fas ${isDark ? "fa-sun" : "fa-moon"} theme-toggle-icon`}
      />
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
