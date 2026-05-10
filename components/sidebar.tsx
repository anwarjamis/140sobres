"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/logo";
import { NAV_ITEMS } from "@/components/nav-items";

// Desktop-only sidebar shell. Hidden below md.
export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const username = session?.user?.name ?? "";
  const initial = username.slice(0, 1).toUpperCase() || "·";

  return (
    <aside className="hidden md:flex w-[240px] shrink-0 bg-ink text-white flex-col h-dvh sticky top-0">
      <div className="px-5 pt-6 pb-4">
        <Logo size={22} />
      </div>
      <div className="h-px bg-white/10 mx-4 mb-3" />

      <nav className="flex-1 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map((it) => {
          const active = it.match(pathname);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                active
                  ? "bg-white text-ink"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="w-[18px] h-[18px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full">
                {it.icon}
              </span>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="avatar shrink-0"
            style={{ background: "var(--blue)", borderColor: "#fff" }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">
              {username || "—"}
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-white/60 hover:text-white"
            >
              cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
