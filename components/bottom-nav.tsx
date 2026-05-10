"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/nav-items";

// Mobile-only: hidden at md+ where the Sidebar takes over.
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="navbar md:hidden">
      {NAV_ITEMS.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={`navitem ${it.match(pathname) ? "on" : ""}`}
          aria-current={it.match(pathname) ? "page" : undefined}
        >
          {it.icon}
          <span>{it.label}</span>
        </Link>
      ))}
    </nav>
  );
}
