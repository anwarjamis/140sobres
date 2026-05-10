"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMatches, type Match } from "@/hooks/use-matches";
import { usePings, type ReceivedPing } from "@/hooks/use-pings";
import { useMe } from "@/hooks/use-me";
import { Sticker } from "@/components/sticker";
import { colorOf } from "@/lib/groups";
import { COUNTRY_NAMES } from "@/lib/groups";

export default function MatchPage() {
  const { data, isLoading } = useMatches();
  const { data: pings } = usePings();
  const { data: me } = useMe();
  const qc = useQueryClient();

  const matches = data?.matches ?? [];
  const featured = matches[0];
  const rest = matches.slice(1);

  const pendingReceived = pings?.received.filter((p) => p.status === "pending") ?? [];

  const respondPing = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "accepted" | "rejected" }) => {
      const res = await fetch(`/api/pings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pings"] });
      qc.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  const sendPing = useMutation({
    mutationFn: async (toUserId: string) => {
      const res = await fetch("/api/pings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId }),
      });
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["pings"] });
    },
  });

  // matchActive guard — shown when user arrives without activating
  if (!isLoading && me && !me.matchActive) {
    return <InactiveState />;
  }

  return (
    <>
      {/* header */}
      <div className="px-4" style={{ paddingTop: 16 }}>
        <div>
          <div className="ui" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
            cambios disponibles
          </div>
          <h1 className="display" style={{ fontSize: 28 }}>
            Tus matches
          </h1>
        </div>
      </div>

      {/* pending received pings */}
      {pendingReceived.length > 0 && (
        <div className="px-4 mt-3">
          <div className="display" style={{ fontSize: 15, marginBottom: 8, color: "var(--ink)" }}>
            Solicitudes recibidas
          </div>
          <div className="col gap-2">
            {pendingReceived.map((p) => (
              <ReceivedPingCard
                key={p.id}
                ping={p}
                onAccept={() => respondPing.mutate({ id: p.id, status: "accepted" })}
                onReject={() => respondPing.mutate({ id: p.id, status: "rejected" })}
                isPending={respondPing.isPending}
              />
            ))}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="micro muted text-center" style={{ padding: 40 }}>
          buscando matches…
        </div>
      )}

      {!isLoading && matches.length === 0 && (
        <div className="px-4 mt-3">
          <div className="card" style={{ padding: 20, textAlign: "center", color: "var(--muted)" }}>
            <div className="display" style={{ fontSize: 16, color: "var(--ink)" }}>
              Todavía no hay matches
            </div>
            <div className="mono micro mt-2">
              marcá tus láminas y tus repes para que aparezcan
            </div>
          </div>
        </div>
      )}

      {featured && (
        <FeaturedMatch
          m={featured}
          onPing={() => sendPing.mutate(featured.user.id)}
          isPingPending={sendPing.isPending}
        />
      )}

      {rest.length > 0 && (
        <>
          <div className="px-4 mt-3 row between items-center">
            <div className="display" style={{ fontSize: 18 }}>
              {rest.length} match{rest.length === 1 ? "" : "es"} más
            </div>
            <span className="micro muted">ordenado por % match</span>
          </div>
          <div className="px-4 mt-2" style={{ paddingBottom: 10 }}>
            <div className="col gap-2">
              {rest.map((m) => (
                <CompactMatch
                  key={m.user.id}
                  m={m}
                  onPing={() => sendPing.mutate(m.user.id)}
                  isPingPending={sendPing.isPending}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ---------- sub-components ----------

function InactiveState() {
  return (
    <div className="px-4" style={{ paddingTop: 60, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔄</div>
      <div className="display" style={{ fontSize: 22 }}>Intercambios desactivados</div>
      <p className="ui" style={{ fontSize: 14, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
        Activá los intercambios desde la barra de navegación para ver tus matches.
      </p>
    </div>
  );
}

function ReceivedPingCard({
  ping,
  onAccept,
  onReject,
  isPending,
}: {
  ping: ReceivedPing;
  onAccept: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  const initial = ping.from.username.slice(0, 1).toUpperCase();
  const location = [ping.from.city, ping.from.country ? (COUNTRY_NAMES[ping.from.country] ?? ping.from.country) : null]
    .filter(Boolean).join(", ");

  return (
    <div
      className="card row items-center gap-3"
      style={{ padding: "12px 14px", border: "1.5px solid var(--yellow)" }}
    >
      <div className="avatar" style={{ background: avatarColor(ping.from.username), flex: "none" }}>
        {initial}
      </div>
      <div className="grow" style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
          @{ping.from.username}
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
          📍 {location || "—"} · quiere intercambiar
        </div>
      </div>
      <div className="row gap-2" style={{ flex: "none" }}>
        <button
          type="button"
          onClick={onReject}
          disabled={isPending}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: "1.5px solid var(--line-2)", background: "#fff",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={isPending}
          style={{
            width: 36, height: 36, borderRadius: 10,
            border: "none", background: "var(--green)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
            <path d="m20 6-11 11-5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PingButton({
  ping,
  onPing,
  isPingPending,
  whatsapp,
  style,
}: {
  ping: Match["ping"];
  onPing: () => void;
  isPingPending: boolean;
  whatsapp: string | null;
  style?: React.CSSProperties;
}) {
  if (ping?.status === "accepted" && whatsapp) {
    return (
      <a
        href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-green"
        style={{ width: "100%", justifyContent: "center", textDecoration: "none", ...style }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Contactar por WhatsApp
      </a>
    );
  }

  if (ping?.status === "pending_sent") {
    return (
      <div
        className="btn"
        style={{ width: "100%", justifyContent: "center", background: "#f1f0ec", color: "var(--muted)", cursor: "default", ...style }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
        Solicitud enviada
      </div>
    );
  }

  if (ping?.status === "pending_received") {
    return (
      <div
        className="btn"
        style={{ width: "100%", justifyContent: "center", background: "#fffbea", color: "var(--ink)", border: "1.5px solid var(--yellow)", cursor: "default", ...style }}
      >
        ⏳ Esperando tu respuesta (revisá solicitudes arriba)
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onPing}
      disabled={isPingPending}
      className="btn"
      style={{ width: "100%", justifyContent: "space-between", background: "var(--ink)", color: "#fff", ...style }}
    >
      Proponer intercambio
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </button>
  );
}

function avatarColor(seed: string) {
  const palette = ["var(--blue)", "var(--purple)", "var(--green)", "var(--red)", "var(--orange)"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function FeaturedMatch({
  m,
  onPing,
  isPingPending,
}: {
  m: Match;
  onPing: () => void;
  isPingPending: boolean;
}) {
  const initial = m.user.username.slice(0, 1).toUpperCase();
  const location = [m.user.city, m.user.country].filter(Boolean).join(", ");
  return (
    <div className="px-4 mt-3">
      <div
        style={{
          borderRadius: 24,
          padding: 18,
          background: "linear-gradient(135deg, var(--purple) 0%, var(--red) 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="halftone" style={{ position: "absolute", inset: 0, opacity: 0.1, color: "#fff" }} />
        <div className="row between items-start" style={{ position: "relative" }}>
          <div className="row gap-2 items-center">
            <div className="avatar" style={{ background: "#fff", color: "var(--purple)", border: "2px solid #fff" }}>
              {initial}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 }}>
                @{m.user.username}
              </div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
                📍 {location || "ubicación desconocida"}
              </div>
            </div>
          </div>
          <span className="tag" style={{ background: "var(--yellow)", color: "var(--ink)" }}>
            ★ {m.score}% match
          </span>
        </div>

        <div className="row items-center gap-3 mt-3" style={{ position: "relative" }}>
          <div className="grow" style={{ textAlign: "center" }}>
            <div className="micro" style={{ opacity: 0.8 }}>VOS LE DAS</div>
            <div className="display" style={{ fontSize: 36 }}>{m.giveCount}</div>
          </div>
          <div style={{ width: 46, height: 46, borderRadius: 99, background: "#fff", color: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7h14l-3-3M21 17H7l3 3" />
            </svg>
          </div>
          <div className="grow" style={{ textAlign: "center" }}>
            <div className="micro" style={{ opacity: 0.8 }}>TE DA</div>
            <div className="display" style={{ fontSize: 36 }}>{m.getCount}</div>
          </div>
        </div>

        <div className="row gap-1 mt-3" style={{ position: "relative" }}>
          {m.get.slice(0, 5).map((s) => (
            <div key={s.id} style={{ flex: 1 }}>
              <Sticker num={String(s.number).padStart(2, "0")} color={colorOf(s.teamCode)} />
            </div>
          ))}
          {m.get.length === 0 && Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ flex: 1 }}>
              <div style={{ aspectRatio: "3/4", borderRadius: 8, background: "#ffffff22" }} />
            </div>
          ))}
        </div>

        <div style={{ position: "relative", marginTop: 12 }}>
          <PingButton
            ping={m.ping}
            onPing={onPing}
            isPingPending={isPingPending}
            whatsapp={m.user.whatsapp}
            style={{ color: m.ping?.status === "accepted" ? "#fff" : undefined }}
          />
        </div>
      </div>
    </div>
  );
}

function CompactMatch({
  m,
  onPing,
  isPingPending,
}: {
  m: Match;
  onPing: () => void;
  isPingPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const initial = m.user.username.slice(0, 1).toUpperCase();
  const location = [m.user.city, m.user.country].filter(Boolean).join(", ");
  const mutualCountries = Array.from(new Set([...m.give, ...m.get].map((s) => s.teamCode)));

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="row gap-3 items-center w-full text-left"
        style={{ padding: 12, border: "none", background: "none", cursor: "pointer" }}
      >
        <div className="avatar" style={{ background: avatarColor(m.user.username), width: 44, height: 44, flex: "none" }}>
          {initial}
        </div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="row items-center gap-2 between">
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
              @{m.user.username}
            </div>
            <span className="tag" style={{ background: "#f1f0ec", color: "var(--ink)" }}>
              ★ {m.score}%
            </span>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            📍 {location || "—"}
          </div>
          <div className="row items-center gap-2 mt-2">
            <div className="row items-center gap-1" style={{ padding: "3px 8px", background: "#eaf7ee", borderRadius: 99 }}>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--green)" }}>↑{m.giveCount}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2">
              <path d="M3 7h14l-3-3M21 17H7l3 3" />
            </svg>
            <div className="row items-center gap-1" style={{ padding: "3px 8px", background: "#fdebec", borderRadius: 99 }}>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: "var(--red)" }}>↓{m.getCount}</span>
            </div>
            <div className="row gap-1" style={{ marginLeft: "auto" }}>
              {mutualCountries.slice(0, 2).map((c) => (
                <span key={c} className="tag" style={{ background: "#f1f0ec" }}>{c}</span>
              ))}
              {mutualCountries.length > 2 && (
                <span className="tag" style={{ background: "#f1f0ec" }}>+{mutualCountries.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: "0 12px 12px", borderTop: "1px solid var(--line)" }}>
          <PingButton
            ping={m.ping}
            onPing={onPing}
            isPingPending={isPingPending}
            whatsapp={m.user.whatsapp}
            style={{ marginTop: 10 }}
          />
        </div>
      )}
    </div>
  );
}
