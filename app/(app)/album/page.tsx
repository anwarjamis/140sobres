"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAlbum } from "@/hooks/use-album";
import {
  GROUPS,
  GROUP_LETTERS,
  COUNTRY_NAMES,
  colorOf,
} from "@/lib/groups";
import { Flag } from "@/components/flag";

export default function AlbumPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useAlbum();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      setOpenGroup(filteredGroupLetters[0]);
    } else if (!searchTerm) {
      setOpenGroup(null);
    }
  }, [searchTerm, filteredGroupLetters]);
  const pct = Math.round((totalOwned / totalAll) * 100);

  const username = session?.user?.name ?? "";
  const initial = username.slice(0, 1).toUpperCase() || "·";

  function jumpToGroup(g: string) {
    setOpenGroup(g);
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
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 4,
          }}
        >
          {GROUP_LETTERS.map((g) => (
            <button
              key={g}
              onClick={() => jumpToGroup(g)}
              className={`gjump ${openGroup === g ? "on" : ""}`}
              style={{
                minWidth: 0,
                padding: 0,
                height: 28,
                fontSize: 12,
              }}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* groups list */}
      <div className="px-4 mt-3" style={{ paddingBottom: 10 }}>
        <div className="col gap-3">
          {filteredGroupLetters.length === 0 && (
            <div className="micro muted text-center" style={{ padding: 16 }}>
              No se encontraron selecciones para &quot;{searchTerm}&quot;
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
                  onClick={() => setOpenGroup(isOpen ? null : g)}
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
