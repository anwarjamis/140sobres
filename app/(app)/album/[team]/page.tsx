"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import { useAlbum } from "@/hooks/use-album";
import { useMarkSticker } from "@/hooks/use-mark-sticker";
import {
  COUNTRY_NAMES,
  GROUPS,
  colorOf,
  groupOf,
} from "@/lib/groups";
import { Flag } from "@/components/flag";
import { Sticker, MissingSticker } from "@/components/sticker";

const ALL_TEAMS = new Set(Object.values(GROUPS).flat());

export default function CountryDetailPage({
  params,
}: {
  params: { team: string };
}) {
  const team = params.team.toUpperCase();
  if (!ALL_TEAMS.has(team)) notFound();

  const { data } = useAlbum();
  const mark = useMarkSticker();

  const players = useMemo(() => {
    if (!data) return [];
    return data.stickers
      .filter((s) => s.section === "COUNTRY" && s.teamCode === team)
      .sort((a, b) => a.number - b.number);
  }, [data, team]);

  const have = players.filter((p) => p.owned).length;
  const total = 20;
  const remaining = total - have;
  const pct = (have / total) * 100;

  const color = colorOf(team);
  const group = groupOf(team);
  const countryName = COUNTRY_NAMES[team] ?? team;

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
              <div className="micro muted">
                {group ? `grupo ${group} · selección` : "selección"}
              </div>
              <h1
                className="display"
                style={{ fontSize: 24, marginTop: 1 }}
              >
                {countryName}
              </h1>
            </div>
          </div>
          <Flag color={color} w={36} h={26} />
        </div>
      </div>

      {/* progress card */}
      <div className="px-4 mt-3">
        <div
          className="card"
          style={{
            padding: 14,
            background: `linear-gradient(135deg, ${color} 0%, color-mix(in oklch, ${color} 65%, #fff) 100%)`,
            color: "#fff",
            borderColor: "transparent",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="halftone"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.12,
              color: "#fff",
            }}
          />
          <div
            className="row between items-end"
            style={{ position: "relative" }}
          >
            <div>
              <div className="micro" style={{ opacity: 0.85 }}>
                TENÉS
              </div>
              <div className="row items-end gap-1 mt-1">
                <div className="display" style={{ fontSize: 42 }}>
                  {have}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 13, opacity: 0.85, paddingBottom: 5 }}
                >
                  / {total}
                </div>
              </div>
            </div>
            <div
              className="col"
              style={{ alignItems: "flex-end", gap: 6 }}
            >
              <span className="micro" style={{ opacity: 0.85 }}>
                {remaining > 0
                  ? `te faltan ${remaining}`
                  : "completaste la selección"}
              </span>
            </div>
          </div>
          <div
            className="progress-track mt-3"
            style={{ background: "#ffffff33" }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${pct}%`,
                background: "var(--yellow)",
              }}
            />
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="px-4 mt-3 row between items-center">
        <div className="row gap-3 items-center">
          <div className="row gap-1 items-center">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: color,
                border: "1px solid var(--ink)",
              }}
            />
            <span className="micro muted">tengo</span>
          </div>
          <div className="row gap-1 items-center">
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: "#e5e3dc",
                border: "1px dashed #c8c5bb",
              }}
            />
            <span className="micro muted">me falta</span>
          </div>
        </div>
        <span className="micro muted">tap para marcar</span>
      </div>

      {/* sticker grid */}
      <div className="px-4 mt-3" style={{ paddingBottom: 10 }}>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {players.map((p) => {
            const localNum = String(p.number).padStart(2, "0");
            if (p.owned) {
              return (
                <Sticker
                  key={p.id}
                  num={localNum}
                  name={p.playerName ?? p.code}
                  pos={p.position ?? ""}
                  color={color}
                />
              );
            }
            return (
              <MissingSticker
                key={p.id}
                num={localNum}
                name={p.playerName ?? p.code}
                pos={p.position ?? ""}
                onMark={() =>
                  mark.mutate({ stickerId: p.id, owned: true, count: 1 })
                }
                disabled={mark.isPending}
              />
            );
          })}

          {!data &&
            Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: "3/4",
                  borderRadius: 8,
                  background: "#ececea",
                }}
              />
            ))}
        </div>
      </div>
    </>
  );
}
