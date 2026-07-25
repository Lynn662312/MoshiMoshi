"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const storageKey = "moshi-theme";

function getPreferredTheme(): Theme {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle({ className }: { className?: string }) {
  useEffect(() => {
    applyTheme(getPreferredTheme());

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystemTheme = () => {
      if (window.localStorage.getItem(storageKey)) return;
      applyTheme(media.matches ? "dark" : "light");
    };

    media.addEventListener("change", followSystemTheme);
    return () => media.removeEventListener("change", followSystemTheme);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      className={cn("theme-toggle", className)}
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <Sun className="size-3.5" />
        <Moon className="size-3.5" />
        <span className="theme-toggle-thumb" />
      </span>
      <span className="hidden text-xs font-semibold sm:inline">
        <span className="theme-label-light">Light</span>
        <span className="theme-label-dark">Dark</span>
      </span>
    </button>
  );
}
