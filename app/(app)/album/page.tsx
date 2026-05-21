"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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

export default function AlbumPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useAlbum();
  const mark = useMarkSticker();

  // Groups start open; user clicks to close individual ones.
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set());
  // Track last jump for jump-rail highlight.
  const [lastJumped, setLastJumped] = useState<string | null>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

  function toggleGroup(g: string) {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g); else next.add(g);
      return next;
    });
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

  const stickersByTeam = useMemo(() => {
    const m: Record<string, AlbumSticker[]> = {};
    for (const s of stickers) {
      if (s.section !== "COUNTRY") continue;
      if (!m[s.teamCode]) m[s.teamCode] = [];
      m[s.teamCode].push(s);
    }
    for (const tc of Object.keys(m)) {
      m[tc].sort((a, b) => a.number - b.number);
    }
    return m;
  }, [stickers]);

  const fwcStickers = useMemo(
    () => stickers.filter((s) => s.section === "FWC").sort((a, b) => a.number - b.number),
    [stickers],
  );
  const specialStickers = useMemo(
    () => stickers.filter((s) => s.section === "SPECIAL").sort((a, b) => a.number - b.number),
    [stickers],
  );

  // On first data load, auto-close any section that is already complete.
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!data || hasInitialized.current) return;
    hasInitialized.current = true;

    const toClose = new Set<string>();

    if (specialStickers.length > 0 && specialStickers.every((s) => s.owned)) {
      toClose.add("00");
    }
    if (fwcStickers.length > 0 && fwcStickers.every((s) => s.owned)) {
      toClose.add("FWC");
    }
    for (const g of GROUP_LETTERS) {
      const teams = GROUPS[g];
      const total = teams.reduce((a, t) => a + (ownedByTeam[t] ?? 0), 0);
      const max = teams.length * 20;
      if (max > 0 && total === max) toClose.add(g);
    }

    if (toClose.size > 0) setClosedGroups(toClose);
  }, [data, specialStickers, fwcStickers, ownedByTeam]);

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

  // When search narrows to one group, ensure it's open.
  useEffect(() => {
    if (searchTerm && filteredGroupLetters.length === 1) {
      setClosedGroups((prev) => {
        const next = new Set(prev);
        next.delete(filteredGroupLetters[0]);
        return next;
      });
    }
  }, [searchTerm, filteredGroupLetters]);

  const pct = Math.round((totalOwned / totalAll) * 100);
  const username = session?.user?.name ?? "";
  const initial = username.slice(0, 1).toUpperCase() || "·";

  function jumpToGroup(g: string) {
    setLastJumped(g);
    // Ensure group is open when jumping to it.
    setClosedGroups((prev) => {
      const next = new Set(prev);
      next.delete(g);
      return next;
    });
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
              className={`gjump ${lastJumped === g ? "on" : ""}`}
              style={{ minWidth: 0, padding: 0, height: 28, fontSize: 12 }}
            >
              {g}
            </button>
          ))}
          <button
            onClick={() => jumpToGroup("FWC")}
            className={`gjump ${lastJumped === "FWC" ? "on" : ""}`}
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
              isOpen={!closedGroups.has("00")}
              onToggleOpen={() => toggleGroup("00")}
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
              isOpen={!closedGroups.has("FWC")}
              onToggleOpen={() => toggleGroup("FWC")}
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
            const isOpen = !closedGroups.has(g);
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
                  onClick={() => toggleGroup(g)}
                  className="row items-center between w-full text-left"
                  style={{
                    padding: "8px 12px",
                    background: "var(--paper-2)",
                    borderBottom: isOpen ? "1px solid var(--line)" : "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-expanded={isOpen}
                >
                  <div className="row items-center gap-2">
                    <div
                      className="gletter"
                      style={{
                        background: isOpen ? "var(--red)" : "var(--ink)",
                        width: 22,
                        height: 22,
                        fontSize: 11,
                      }}
                    >
                      {g}
                    </div>
                    <div>
                      <div className="display" style={{ fontSize: 13 }}>
                        Grupo {g}
                      </div>
                      <div className="micro muted" style={{ fontSize: 10 }}>
                        {teams.length} selecciones
                      </div>
                    </div>
                  </div>
                  <div
                    className="col"
                    style={{ alignItems: "flex-end", gap: 3 }}
                  >
                    <div
                      className="mono"
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      {total}/{max}
                    </div>
                    <div
                      style={{ width: 44, height: 3 }}
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
                    maxHeight: isOpen ? 1200 : 0,
                    overflow: "hidden",
                    transition: "max-height 280ms ease-out",
                  }}
                >
                  <div style={{ paddingBottom: 6 }}>
                    {teams.map((teamCode, ti) => {
                      const teamStickers = stickersByTeam[teamCode] ?? [];
                      const count = ownedByTeam[teamCode] ?? 0;
                      const badgeColor = colorOf(teamCode);
                      // light colors need dark text
                      const badgeTextColor = ["var(--yellow)", "var(--orange)", "#fafafa", "var(--sand)"].includes(badgeColor)
                        ? "var(--ink)"
                        : "#fff";
                      return (
                        <div key={teamCode}>
                          {ti > 0 && (
                            <div
                              style={{
                                height: 1,
                                background: "var(--line)",
                                margin: "0 14px",
                              }}
                            />
                          )}
                          {/* country header */}
                          <div
                            className="row between items-center"
                            style={{ padding: "9px 14px 5px" }}
                          >
                            <Link
                              href={`/album/${teamCode}`}
                              className="row items-center gap-2"
                              style={{ color: "var(--ink)", textDecoration: "none" }}
                            >
                              <Flag code={teamCode} w={20} h={14} />
                              <span
                                style={{
                                  fontFamily: "var(--font-ui)",
                                  fontWeight: 600,
                                  fontSize: 13,
                                }}
                              >
                                {COUNTRY_NAMES[teamCode] ?? teamCode}
                              </span>
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#bbb"
                                strokeWidth="2"
                                strokeLinecap="round"
                              >
                                <path d="m9 6 6 6-6 6" />
                              </svg>
                            </Link>
                            <span
                              className="mono"
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: count === 20 ? "var(--green)" : "var(--muted)",
                              }}
                            >
                              {count}/20{count === 20 ? " ✓" : ""}
                            </span>
                          </div>
                          {/* badge grid */}
                          <div
                            style={{
                              padding: "0 14px 10px",
                              display: "grid",
                              gridTemplateColumns: "repeat(10, 1fr)",
                              gap: 3,
                            }}
                          >
                            {teamStickers.map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => toggleSticker(s)}
                                title={s.playerName ?? s.code}
                                style={{
                                  aspectRatio: "1",
                                  borderRadius: 5,
                                  border: s.owned ? "none" : "1.5px solid var(--line-2)",
                                  background: s.owned ? badgeColor : "#f4f4f2",
                                  color: s.owned ? badgeTextColor : "var(--muted)",
                                  fontFamily: "var(--font-mono)",
                                  fontWeight: 700,
                                  fontSize: 10,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  padding: 0,
                                  transition: "background 0.12s",
                                  WebkitTapHighlightColor: "transparent",
                                }}
                              >
                                {s.number}
                              </button>
                            ))}
                          </div>
                        </div>
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
          padding: "8px 12px",
          background: "var(--paper-2)",
          borderBottom: isOpen ? "1px solid var(--line)" : "none",
          border: "none",
          cursor: "pointer",
        }}
        aria-expanded={isOpen}
      >
        <div className="row items-center gap-2">
          <div
            className="gletter"
            style={{
              background: isOpen ? color : "var(--ink)",
              width: 22,
              height: 22,
              fontSize: 11,
            }}
          >
            {label}
          </div>
          <div>
            <div className="display" style={{ fontSize: 13 }}>{label}</div>
            <div className="micro muted" style={{ fontSize: 10 }}>{sublabel}</div>
          </div>
        </div>
        <div className="col" style={{ alignItems: "flex-end", gap: 3 }}>
          <div className="mono" style={{ fontSize: 11, fontWeight: 600 }}>
            {owned}/{total}
          </div>
          <div style={{ width: 44, height: 3 }} className="progress-track">
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
