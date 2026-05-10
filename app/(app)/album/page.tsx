"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAlbum } from "@/hooks/use-album";
import { useMarkSticker } from "@/hooks/use-mark-sticker";
import {
  GROUPS,
  GROUP_LETTERS,
  COUNTRY_NAMES,
  colorOf,
} from "@/lib/groups";
import { Flag } from "@/components/flag";
import type { AlbumSticker } from "@/lib/types";

// useSearchParams() requires a Suspense boundary in Next.js 14.
export default function AlbumPage() {
  return (
    <Suspense>
      <AlbumContent />
    </Suspense>
  );
}

function AlbumContent() {
  const { data: session } = useSession();
  const { data, isLoading } = useAlbum();
  const mark = useMarkSticker();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Restore open group from URL param ?g=A when navigating back.
  const [openGroup, setOpenGroup] = useState<string | null>(
    searchParams.get("g"),
  );
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Keep URL in sync with open group.
  function setGroup(g: string | null) {
    setOpenGroup(g);
    const url = g ? `/album?g=${g}` : "/album";
    router.replace(url, { scroll: false });
  }

  const [searchTerm, setSearchTerm] = useState("");
  const stickers = useMemo(() => data?.stickers ?? [], [data]);

  // Counts owned per teamCode (only COUNTRY section).
  const ownedByTeam = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of stickers) {
      if (s.section !== "COUNTRY") continue;
      if (s.owned) m[s.teamCode] = (m[s.teamCode] ?? 0) + 1;
    }
    return m;
  }, [stickers]);

  const totalOwned = stickers.filter((s) => s.owned).length;
  const totalAll = 980;

  const fwcStickers = useMemo(
    () => stickers.filter((s) => s.section === "FWC").sort((a, b) => a.number - b.number),
    [stickers],
  );
  const specialStickers = useMemo(
    () => stickers.filter((s) => s.section === "SPECIAL").sort((a, b) => a.number - b.number),
    [stickers],
  );

  function toggleSticker(s: AlbumSticker) {
    mark.mutate({ stickerId: s.id, owned: !s.owned, count: s.owned ? 0 : s.count });
  }

  // Filter groups by search term (matches country name or code).
  const filteredGroupLetters = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return GROUP_LETTERS;
    return GROUP_LETTERS.filter((g) =>
      GROUPS[g].some(
        (code) =>
          code.toLowerCase().includes(q) ||
          (COUNTRY_NAMES[code] ?? "").toLowerCase().includes(q),
      ),
    );
  }, [searchTerm]);

  // Auto-open the single matching group when searching.
  useEffect(() => {
    if (searchTerm && filteredGroupLetters.length === 1) {
      setGroup(filteredGroupLetters[0]);
    } else if (!searchTerm) {
      setGroup(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filteredGroupLetters]);
  const pct = Math.round((totalOwned / totalAll) * 100);

  const username = session?.user?.name ?? "";
  const initial = username.slice(0, 1).toUpperCase() || "·";

  function jumpToGroup(g: string) {
    setGroup(g);
    requestAnimationFrame(() => {
      groupRefs.current[g]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <>
      {/* header */}
      <div className="px-4" style={{ paddingTop: 16 }}>
        <div className="row between items-center">
          <div>
            <div
              className="ui"
              style={{
                fontSize: 12,
                color: "var(--muted)",
                fontWeight: 600,
              }}
            >
              hola, {username || "—"}
            </div>
            <h1 className="display" style={{ fontSize: 28 }}>
              Mi álbum
            </h1>
          </div>
          <div className="avatar" style={{ background: "var(--blue)" }}>
            {initial}
          </div>
        </div>
      </div>

      {/* progress hero */}
      <div className="px-4 mt-3">
        <div
          style={{
            background: "var(--ink)",
            color: "#fff",
            borderRadius: 20,
            padding: "16px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="halftone"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              color: "#fff",
            }}
          />
          <div
            className="row between items-end"
            style={{ position: "relative" }}
          >
            <div>
              <div className="micro" style={{ opacity: 0.7 }}>
                PROGRESO
              </div>
              <div
                className="row items-end gap-1"
                style={{ marginTop: 4 }}
              >
                <div
                  className="display"
                  style={{ fontSize: 46, color: "var(--yellow)" }}
                >
                  {totalOwned}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 13, opacity: 0.7, paddingBottom: 6 }}
                >
                  /{totalAll}
                </div>
              </div>
            </div>
            <div
              className="col"
              style={{ alignItems: "flex-end", gap: 6 }}
            >
              <div
                className="tag"
                style={{ background: "var(--yellow)", color: "var(--ink)" }}
              >
                {pct}% completo
              </div>
              <div className="micro" style={{ opacity: 0.7 }}>
                faltan {totalAll - totalOwned} láminas
              </div>
            </div>
          </div>
          <div
            className="progress-track mt-3"
            style={{ background: "#3a3a3a" }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${pct}%`,
                background:
                  "linear-gradient(90deg, var(--green), var(--yellow))",
              }}
            />
          </div>
        </div>
      </div>

      {/* quick actions row */}
      <div className="px-4 mt-3 row gap-2">
        <Link
          href="/album/masiva"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 34,
            paddingLeft: 14,
            paddingRight: 14,
            borderRadius: 99,
            border: "1.5px solid var(--line-2)",
            background: "#fff",
            color: "var(--ink)",
            fontFamily: "var(--font-ui)",
            fontWeight: 600,
            fontSize: 13,
            textDecoration: "none",
            flex: "none",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Carga masiva
        </Link>
      </div>

      {/* search */}
      <div className="px-4 mt-3">
        <div className="search">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a8a8a8"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            placeholder="Buscar selección…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              flex: 1,
              fontSize: 14,
              color: "var(--ink)",
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "var(--muted)",
                padding: 0,
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* group jump rail */}
      <div className="px-4 mt-3">
        <div className="row between items-center mb-2">
          <div
            className="ui"
            style={{
              fontSize: 11,
              color: "var(--muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Grupos
          </div>
          <div className="micro muted">tap para saltar</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(13, 1fr)",
            gap: 4,
          }}
        >
          {GROUP_LETTERS.map((g) => (
            <button
              key={g}
              onClick={() => jumpToGroup(g)}
              className={`gjump ${openGroup === g ? "on" : ""}`}
              style={{ minWidth: 0, padding: 0, height: 28, fontSize: 12 }}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => jumpToGroup("FWC")}
            className={`gjump ${openGroup === "FWC" ? "on" : ""}`}
            style={{ minWidth: 0, padding: 0, height: 28, fontSize: 9, fontWeight: 700 }}
          >
            FWC
          </button>
        </div>
      </div>

      {/* groups list */}
      <div className="px-4 mt-3" style={{ paddingBottom: 10 }}>
        <div className="col gap-3">
          {/* 00 — single special sticker, always at top */}
          {!searchTerm && specialStickers.length > 0 && (
            <StickerSection
              label="00"
              sublabel="Lámina especial"
              stickers={specialStickers}
              color="var(--purple)"
              isOpen={openGroup === "00"}
              onToggleOpen={() => setGroup(openGroup === "00" ? null : "00")}
              onToggleSticker={toggleSticker}
              sectionRef={(el) => { groupRefs.current["00"] = el; }}
            />
          )}

          {/* FWC — 19 FIFA World Cup stickers */}
          {!searchTerm && fwcStickers.length > 0 && (
            <StickerSection
              label="FWC"
              sublabel="FIFA World Cup · 19 láminas"
              stickers={fwcStickers}
              color="var(--yellow)"
              isOpen={openGroup === "FWC"}
              onToggleOpen={() => setGroup(openGroup === "FWC" ? null : "FWC")}
              onToggleSticker={toggleSticker}
              sectionRef={(el) => { groupRefs.current["FWC"] = el; }}
            />
          )}

          {filteredGroupLetters.length === 0 && (
            <div className="micro muted text-center" style={{ padding: 16 }}>
              No se encontraron selecciones para &ldquo;{searchTerm}&rdquo;
            </div>
          )}
          {filteredGroupLetters.map((g) => {
            const teams = GROUPS[g];
            const total = teams.reduce(
              (a, t) => a + (ownedByTeam[t] ?? 0),
              0,
            );
            const max = teams.length * 20;
            const groupPct = Math.round((total / max) * 100);
            const isOpen = openGroup === g;
            return (
              <div
                key={g}
                ref={(el) => {
                  groupRefs.current[g] = el;
                }}
                className="card"
                style={{ padding: 0, overflow: "hidden" }}
              >
                <button
                  type="button"
                  onClick={() => setGroup(isOpen ? null : g)}
                  className="row items-center between w-full text-left"
                  style={{
                    padding: "12px 14px",
                    background: "var(--paper-2)",
                    borderBottom: isOpen ? "1px solid var(--line)" : "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-expanded={isOpen}
                >
                  <div className="row items-center gap-3">
                    <div
                      className="gletter"
                      style={{
                        background: isOpen ? "var(--red)" : "var(--ink)",
                      }}
                    >
                      {g}
                    </div>
                    <div>
                      <div className="display" style={{ fontSize: 16 }}>
                        Grupo {g}
                      </div>
                      <div className="micro muted">
                        {teams.length} selecciones
                      </div>
                    </div>
                  </div>
                  <div
                    className="col"
                    style={{ alignItems: "flex-end", gap: 4 }}
                  >
                    <div
                      className="mono"
                      style={{ fontSize: 12, fontWeight: 600 }}
                    >
                      {total}/{max}
                    </div>
                    <div
                      style={{ width: 54, height: 4 }}
                      className="progress-track"
                    >
                      <div
                        className="progress-fill"
                        style={{
                          width: `${groupPct}%`,
                          background:
                            groupPct === 100
                              ? "var(--green)"
                              : "var(--ink)",
                        }}
                      />
                    </div>
                  </div>
                </button>

                <div
                  style={{
                    maxHeight: isOpen ? 600 : 0,
                    overflow: "hidden",
                    transition: "max-height 220ms ease-out",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                    }}
                  >
                    {teams.map((teamCode, ti) => {
                      const count = ownedByTeam[teamCode] ?? 0;
                      const complete = count === 20;
                      const empty = count === 0;
                      return (
                        <Link
                          key={teamCode}
                          href={`/album/${teamCode}`}
                          className="row between items-center"
                          style={{
                            padding: "10px 12px",
                            borderRight:
                              ti % 2 === 0
                                ? "1px solid var(--line)"
                                : "none",
                            borderTop:
                              ti > 1 ? "1px solid var(--line)" : "none",
                            color: "var(--ink)",
                            textDecoration: "none",
                          }}
                        >
                          <div
                            className="row items-center gap-2"
                            style={{ minWidth: 0 }}
                          >
                            <Flag color={colorOf(teamCode)} w={20} h={14} />
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: "var(--font-ui)",
                                  fontWeight: 600,
                                  fontSize: 13.5,
                                  color: "var(--ink)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {COUNTRY_NAMES[teamCode] ?? teamCode}
                              </div>
                              <div
                                className="mono"
                                style={{
                                  fontSize: 10.5,
                                  color: empty
                                    ? "#bbb"
                                    : "var(--muted)",
                                }}
                              >
                                {count}/20 {complete ? "✓" : ""}
                              </div>
                            </div>
                          </div>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9c9c9c"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m9 6 6 6-6 6" />
                          </svg>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="micro muted text-center" style={{ padding: 8 }}>
              cargando…
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StickerSection({
  label,
  sublabel,
  stickers,
  color,
  isOpen,
  onToggleOpen,
  onToggleSticker,
  sectionRef,
}: {
  label: string;
  sublabel: string;
  stickers: AlbumSticker[];
  color: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onToggleSticker: (s: AlbumSticker) => void;
  sectionRef: (el: HTMLDivElement | null) => void;
}) {
  const owned = stickers.filter((s) => s.owned).length;
  const total = stickers.length;

  return (
    <div
      ref={sectionRef}
      className="card"
      style={{ padding: 0, overflow: "hidden" }}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="row items-center between w-full text-left"
        style={{
          padding: "12px 14px",
          background: "var(--paper-2)",
          borderBottom: isOpen ? "1px solid var(--line)" : "none",
          border: "none",
          cursor: "pointer",
        }}
        aria-expanded={isOpen}
      >
        <div className="row items-center gap-3">
          <div
            className="gletter"
            style={{ background: isOpen ? color : "var(--ink)", fontSize: 11 }}
          >
            {label}
          </div>
          <div>
            <div className="display" style={{ fontSize: 16 }}>{label}</div>
            <div className="micro muted">{sublabel}</div>
          </div>
        </div>
        <div className="col" style={{ alignItems: "flex-end", gap: 4 }}>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600 }}>
            {owned}/{total}
          </div>
          <div style={{ width: 54, height: 4 }} className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: total > 0 ? `${Math.round((owned / total) * 100)}%` : "0%",
                background: owned === total ? "var(--green)" : "var(--ink)",
              }}
            />
          </div>
        </div>
      </button>

      <div
        style={{
          maxHeight: isOpen ? 400 : 0,
          overflow: "hidden",
          transition: "max-height 220ms ease-out",
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 4,
          }}
        >
          {stickers.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onToggleSticker(s)}
              title={s.playerName ?? s.code}
              style={{
                aspectRatio: "1",
                borderRadius: 6,
                border: s.owned ? "none" : "1.5px solid var(--line-2)",
                background: s.owned ? color : "#f4f4f2",
                color: s.owned
                  ? ["var(--yellow)", "var(--orange)", "#fafafa"].includes(color) ? "var(--ink)" : "#fff"
                  : "var(--muted)",
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 11,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "background 0.12s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {s.number === 0 ? "00" : s.number}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
