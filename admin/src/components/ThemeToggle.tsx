import { useState } from "react";
import { getTheme, toggleTheme, type Theme } from "../lib/theme.ts";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => getTheme());
  return (
    <button
      type="button"
      className="icon-btn"
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(toggleTheme())}
    >
      <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`} />
    </button>
  );
}
