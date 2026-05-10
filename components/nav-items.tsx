import type { ReactNode } from "react";

export type NavItem = {
  label: string;
  href: string;
  match: (path: string) => boolean;
  icon: ReactNode;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Álbum",
    href: "/album",
    match: (p) => p === "/album" || p.startsWith("/album/"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 3v18M16 3v18" />
      </svg>
    ),
  },
  {
    label: "Repes",
    href: "/repes",
    match: (p) => p.startsWith("/repes"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="7" width="14" height="13" rx="2" />
        <rect x="7" y="3" width="14" height="13" rx="2" />
      </svg>
    ),
  },
  {
    label: "Match",
    href: "/match",
    match: (p) => p.startsWith("/match"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7h14l-3-3M21 17H7l3 3" />
      </svg>
    ),
  },
  {
    label: "Stats",
    href: "/stats",
    match: (p) => p.startsWith("/stats"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    ),
  },
  {
    label: "Perfil",
    href: "/perfil",
    match: (p) => p.startsWith("/perfil"),
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];
