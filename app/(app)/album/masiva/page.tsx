"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import Link from "next/link";
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

export default function MasivaPage() {
  return (
    <Suspense>
      <MasivaContent />
    </Suspense>
  );
}

type GroupFilter = "todos" | string; // string = group letter | "FWC" | "CC"

function MasivaContent() {
  const { data, isLoading } = useAlbum();
  const mark = useMarkSticker();
  const [filter, setFilter] = useState<GroupFilter>("todos");
  const chipsRef = useRef<HTMLDivElement>(null);

  const stickers = useMemo(() => data?.stickers ?? [], [data]);

  // ---------- derived: country sections ----------
  const allTeams = useMemo(() => Object.values(GROUPS).flat(), []);

  // teamCode → group letter
  const teamGroup = useMemo(() => {
    const m: Record<string, string> = {};
    for (const [letter, teams] of Object.entries(GROUPS)) {
      for (const t of teams) m[t] = letter;
    }
    return m;
  }, []);

  // stickers by teamCode
  const stickersByTeam = useMemo(() => {
    const m: Record<string, AlbumSticker[]> = {};
    for (const s of stickers) {
      if (!m[s.teamCode]) m[s.teamCode] = [];
      m[s.teamCode].push(s);
    }
    // sort each team's stickers by number
    for (const k of Object.keys(m)) {
      m[k].sort((a, b) => a.number - b.number);
    }
    return m;
  }, [stickers]);

  // FWC stickers
  const fwcStickers = useMemo(
    () =>
      stickers
        .filter((s) => s.section === "FWC")
        .sort((a, b) => a.number - b.number),
    [stickers],
  );

  // Special stickers
  const specialStickers = useMemo(
    () =>
      stickers
        .filter((s) => s.section === "SPECIAL")
        .sort((a, b) => a.number - b.number),
    [stickers],
  );

  // Teams to show based on filter
  const visibleTeams = useMemo(() => {
    if (filter === "todos" || filter === "FWC" || filter === "CC")
      return filter === "todos" ? allTeams : [];
    return GROUPS[filter] ? [...GROUPS[filter]] : [];
  }, [filter, allTeams]);

  const showFwc = filter === "todos" || filter === "FWC";
  const showSpecial = filter === "todos" || filter === "CC";

  function toggle(s: AlbumSticker) {
    const nextOwned = !s.owned;
    mark.mutate({
      stickerId: s.id,
      owned: nextOwned,
      count: nextOwned ? s.count : 0,
    });
  }

  const CHIPS: { label: string; value: GroupFilter }[] = [
    { label: "Todos", value: "todos" },
    ...GROUP_LETTERS.map((g) => ({ label: `Grupo ${g}`, value: g })),
    { label: "FWC", value: "FWC" },
    { label: "Especiales", value: "CC" },
  ];

  return (
    <>
      {/* header */}
      <div className="px-4" style={{ paddingTop: 16 }}>
        <div className="row between items-center">
          <div className="row gap-2 items-center">
            <Link
              href="/album"
              aria-label="Volver al álbum"
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: "#fff",
                border: "1px solid var(--line-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--ink)",
                textDecoration: "none",
                flex: "none",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 6-6 6 6 6" />
              </svg>
            </Link>
            <div>
              <div
                className="ui"
                style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}
              >
                álbum
              </div>
              <h1 className="display" style={{ fontSize: 22, lineHeight: 1 }}>
                Carga masiva
              </h1>
            </div>
          </div>
          {isLoading && (
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 99,
                border: "2px solid var(--line-2)",
                borderTopColor: "var(--ink)",
                animation: "spin 0.7s linear infinite",
              }}
            />
          )}
        </div>
      </div>

      {/* group filter chips — sticky */}
      <div
        ref={chipsRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--paper)",
          paddingTop: 12,
          paddingBottom: 10,
          overflowX: "auto",
          display: "flex",
          gap: 6,
          paddingLeft: 16,
          paddingRight: 16,
          scrollbarWidth: "none",
        }}
      >
        {CHIPS.map((chip) => {
          const active = filter === chip.value;
          return (
            <button
              key={chip.value}
              type="button"
              onClick={() => setFilter(chip.value)}
              style={{
                flex: "none",
                height: 30,
                paddingLeft: 12,
                paddingRight: 12,
                borderRadius: 99,
                border: active
                  ? "1.5px solid var(--ink)"
                  : "1.5px solid var(--line-2)",
                background: active ? "var(--ink)" : "#fff",
                color: active ? "#fff" : "var(--ink)",
                fontFamily: "var(--font-ui)",
                fontWeight: 600,
                fontSize: 12,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* content */}
      <div className="px-4" style={{ paddingBottom: 112 }}>
        {/* Special (00) — always first */}
        {showSpecial && specialStickers.length > 0 && (
          <SpecialSection
            title="00"
            subtitle="Lámina especial"
            stickers={specialStickers}
            onToggle={toggle}
          />
        )}

        {/* FWC — second */}
        {showFwc && fwcStickers.length > 0 && (
          <SpecialSection
            title="FWC"
            subtitle="FIFA World Cup"
            stickers={fwcStickers}
            onToggle={toggle}
          />
        )}

        {/* country sections */}
        {visibleTeams.map((teamCode) => {
          const teamStickers = stickersByTeam[teamCode] ?? [];
          const owned = teamStickers.filter((s) => s.owned).length;
          const total = 20;
          const color = colorOf(teamCode);
          const group = teamGroup[teamCode];
          const name = COUNTRY_NAMES[teamCode] ?? teamCode;

          return (
            <TeamSection
              key={teamCode}
              teamCode={teamCode}
              name={name}
              groupLabel={`Grupo ${group}`}
              color={color}
              stickers={teamStickers}
              owned={owned}
              total={total}
              onToggle={toggle}
            />
          );
        })}

        {/* empty state */}
        {visibleTeams.length === 0 && !showFwc && !showSpecial && (
          <div
            className="col items-center"
            style={{ gap: 8, paddingTop: 60, color: "var(--muted)" }}
          >
            <span style={{ fontSize: 32 }}>🔍</span>
            <span className="mono micro">nada por aquí</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}

// ---------- sub-components ----------

function TeamSection({
  teamCode,
  name,
  groupLabel,
  color,
  stickers,
  owned,
  total,
  onToggle,
}: {
  teamCode: string;
  name: string;
  groupLabel: string;
  color: string;
  stickers: AlbumSticker[];
  owned: number;
  total: number;
  onToggle: (s: AlbumSticker) => void;
}) {
  const pct = Math.round((owned / total) * 100);

  return (
    <div className="card mt-3" style={{ padding: "14px 14px 12px" }}>
      {/* team header */}
      <div className="row between items-center" style={{ marginBottom: 10 }}>
        <div className="row gap-2 items-center">
          <Flag code={teamCode} color={color} w={22} h={15} />
          <span
            className="display"
            style={{ fontSize: 16 }}
          >
            {name}
          </span>
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--muted)", letterSpacing: "0.04em" }}
          >
            {groupLabel}
          </span>
        </div>
        <span
          className="mono"
          style={{ fontSize: 11, color: pct === 100 ? "var(--green)" : "var(--muted)" }}
        >
          {owned}/{total}
        </span>
      </div>

      {/* badge grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gap: 4,
        }}
      >
        {stickers.map((s) => (
          <StickerBadge
            key={s.id}
            sticker={s}
            color={color}
            onToggle={onToggle}
          />
        ))}
        {/* fill empty slots if stickers not yet seeded */}
        {stickers.length === 0 &&
          Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                borderRadius: 6,
                background: "#ececea",
              }}
            />
          ))}
      </div>
    </div>
  );
}

function SpecialSection({
  title,
  subtitle,
  stickers,
  onToggle,
}: {
  title: string;
  subtitle: string;
  stickers: AlbumSticker[];
  onToggle: (s: AlbumSticker) => void;
}) {
  const owned = stickers.filter((s) => s.owned).length;
  const total = stickers.length;

  return (
    <div className="card mt-3" style={{ padding: "14px 14px 12px" }}>
      <div className="row between items-center" style={{ marginBottom: 10 }}>
        <div className="row gap-2 items-center">
          <span className="display" style={{ fontSize: 16 }}>
            {title}
          </span>
          <span
            className="mono"
            style={{ fontSize: 10, color: "var(--muted)" }}
          >
            {subtitle}
          </span>
        </div>
        <span
          className="mono"
          style={{
            fontSize: 11,
            color:
              owned === total && total > 0 ? "var(--green)" : "var(--muted)",
          }}
        >
          {owned}/{total}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(10, 1fr)",
          gap: 4,
        }}
      >
        {stickers.map((s) => (
          <StickerBadge
            key={s.id}
            sticker={s}
            color="var(--yellow)"
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

function StickerBadge({
  sticker,
  color,
  onToggle,
}: {
  sticker: AlbumSticker;
  color: string;
  onToggle: (s: AlbumSticker) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(sticker)}
      title={sticker.playerName ?? sticker.code}
      style={{
        aspectRatio: "1",
        borderRadius: 6,
        border: sticker.owned ? "none" : "1.5px solid var(--line-2)",
        background: sticker.owned ? color : "#f4f4f2",
        color: sticker.owned ? contrastColor(color) : "var(--muted)",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
        fontSize: 11,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        padding: 0,
        transition: "background 0.12s, border 0.12s",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {sticker.number === 0 ? "00" : sticker.number}
    </button>
  );
}

// Very simple contrast: use white on dark colors, ink on light ones.
function contrastColor(cssVar: string): string {
  const light = ["var(--yellow)", "var(--orange)", "#fafafa"];
  return light.includes(cssVar) ? "var(--ink)" : "#fff";
}
