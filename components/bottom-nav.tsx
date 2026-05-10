"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { NAV_ITEMS } from "@/components/nav-items";
import { useMe } from "@/hooks/use-me";
import { usePings } from "@/hooks/use-pings";

// Mobile-only: hidden at md+ where the Sidebar takes over.
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState("");

  const { data: me } = useMe();
  const { data: pings } = usePings();
  const qc = useQueryClient();

  const pendingCount =
    pings?.received.filter((p) => p.status === "pending").length ?? 0;

  const activate = useMutation({
    mutationFn: async (wa: string) => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchActive: true, whatsapp: wa }),
      });
      if (!res.ok) throw new Error("Error activando");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      setModalOpen(false);
      router.push("/match");
    },
  });

  function handleMatchClick() {
    if (me?.matchActive) {
      router.push("/match");
    } else {
      setWhatsapp(me?.whatsapp ?? "");
      setError("");
      setModalOpen(true);
    }
  }

  function handleActivate() {
    const cleaned = whatsapp.trim().replace(/\s+/g, "");
    if (cleaned.length < 8) {
      setError("Ingresá un número válido");
      return;
    }
    activate.mutate(cleaned);
  }

  return (
    <>
      <nav className="navbar md:hidden">
        {NAV_ITEMS.map((it) => {
          const isMatch = it.href === "/match";
          const active = it.match(pathname);

          if (isMatch) {
            return (
              <button
                key={it.href}
                type="button"
                onClick={handleMatchClick}
                className={`navitem ${active ? "on" : ""}`}
                style={{ background: "none", border: "none", cursor: "pointer", position: "relative" }}
              >
                {it.icon}
                <span>{it.label}</span>
                {pendingCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 4,
                      right: "50%",
                      transform: "translateX(10px)",
                      background: "var(--red)",
                      color: "#fff",
                      borderRadius: 99,
                      fontSize: 9,
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      minWidth: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingLeft: 4,
                      paddingRight: 4,
                      border: "1.5px solid var(--paper)",
                    }}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={it.href}
              href={it.href}
              className={`navitem ${active ? "on" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {it.icon}
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Activation modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "#00000066",
            display: "flex",
            alignItems: "flex-end",
            padding: "0 0 0 0",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 430,
              margin: "0 auto",
              background: "var(--paper)",
              borderRadius: "24px 24px 0 0",
              padding: "24px 20px 36px",
            }}
          >
            {/* handle bar */}
            <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line-2)", margin: "0 auto 20px" }} />

            {/* icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 7h14l-3-3M21 17H7l3 3" />
              </svg>
            </div>

            <div className="display" style={{ fontSize: 22 }}>
              Intercambio de láminas
            </div>
            <p
              className="ui"
              style={{ fontSize: 14, color: "var(--ink-3)", lineHeight: 1.5, marginTop: 8, marginBottom: 20 }}
            >
              Cruzamos tus repetidas con las que le faltan a otros coleccionistas, y viceversa.
              Cuando hay match, se coordinan los cambios por WhatsApp — pero{" "}
              <strong>ambos tienen que aceptar primero</strong> antes de compartir el número.
            </p>

            <label className="ui" style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 6 }}>
              TU NÚMERO DE WHATSAPP
            </label>
            <input
              type="tel"
              placeholder="+54 11 1234-5678"
              value={whatsapp}
              onChange={(e) => { setWhatsapp(e.target.value); setError(""); }}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 12,
                border: error ? "1.5px solid var(--red)" : "1.5px solid var(--line-2)",
                padding: "0 14px",
                fontSize: 15,
                fontFamily: "var(--font-ui)",
                background: "#fff",
                color: "var(--ink)",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <div className="mono" style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleActivate}
              disabled={activate.isPending}
              className="btn"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 16,
                background: "var(--ink)",
                color: "#fff",
                height: 48,
                fontSize: 15,
              }}
            >
              {activate.isPending ? "Activando…" : "Activar intercambios →"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-ghost"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            >
              Ahora no
            </button>
          </div>
        </div>
      )}
    </>
  );
}
