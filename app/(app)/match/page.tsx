"use client";

import { useMatches, type Match } from "@/hooks/use-matches";
import { Sticker } from "@/components/sticker";
import { colorOf } from "@/lib/groups";

export default function MatchPage() {
  const { data, isLoading } = useMatches();
  const matches = data?.matches ?? [];
  const featured = matches[0];
  const rest = matches.slice(1);

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
              cambios disponibles
            </div>
            <h1 className="display" style={{ fontSize: 28 }}>
              Tus matches
            </h1>
          </div>
          <div className="chip">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            filtros
          </div>
        </div>
      </div>

      {isLoading && (
        <div
          className="micro muted text-center"
          style={{ padding: 40 }}
        >
          buscando matches…
        </div>
      )}

      {!isLoading && matches.length === 0 && (
        <div className="px-4 mt-3">
          <div
            className="card"
            style={{
              padding: 20,
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <div
              className="display"
              style={{ fontSize: 16, color: "var(--ink)" }}
            >
              Todavía no hay matches
            </div>
            <div className="mono micro mt-2">
              marcá tus láminas y tus repes para que aparezcan
            </div>
          </div>
        </div>
      )}

      {/* hero featured match */}
      {featured && <FeaturedMatch m={featured} />}

      {/* rest of list */}
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
                <CompactMatch key={m.user.id} m={m} />
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function avatarColor(seed: string) {
  const palette = [
    "var(--blue)",
    "var(--purple)",
    "var(--green)",
    "var(--red)",
    "var(--orange)",
    "var(--pink)",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function FeaturedMatch({ m }: { m: Match }) {
  const initial = m.user.username.slice(0, 1).toUpperCase();
  const location = [m.user.city, m.user.country].filter(Boolean).join(", ");
  return (
    <div className="px-4 mt-3">
      <div
        style={{
          borderRadius: 24,
          padding: 18,
          background:
            "linear-gradient(135deg, var(--purple) 0%, var(--red) 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="halftone"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            color: "#fff",
          }}
        />
        <div
          className="row between items-start"
          style={{ position: "relative" }}
        >
          <div className="row gap-2 items-center">
            <div
              className="avatar"
              style={{
                background: "#fff",
                color: "var(--purple)",
                border: "2px solid #fff",
              }}
            >
              {initial}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                @{m.user.username}
              </div>
              <div className="mono" style={{ fontSize: 11, opacity: 0.85 }}>
                📍 {location || "ubicación desconocida"}
              </div>
            </div>
          </div>
          <span
            className="tag"
            style={{ background: "var(--yellow)", color: "var(--ink)" }}
          >
            ★ {m.score}% match
          </span>
        </div>

        <div
          className="row items-center gap-3 mt-3"
          style={{ position: "relative" }}
        >
          <div className="grow" style={{ textAlign: "center" }}>
            <div className="micro" style={{ opacity: 0.8 }}>
              VOS LE DAS
            </div>
            <div className="display" style={{ fontSize: 36 }}>
              {m.giveCount}
            </div>
          </div>
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 99,
              background: "#fff",
              color: "var(--ink)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7h14l-3-3M21 17H7l3 3" />
            </svg>
          </div>
          <div className="grow" style={{ textAlign: "center" }}>
            <div className="micro" style={{ opacity: 0.8 }}>
              TE DA
            </div>
            <div className="display" style={{ fontSize: 36 }}>
              {m.getCount}
            </div>
          </div>
        </div>

        <div
          className="row gap-1 mt-3"
          style={{ position: "relative" }}
        >
          {m.get.slice(0, 5).map((s) => (
            <div key={s.id} style={{ flex: 1 }}>
              <Sticker
                num={String(s.number).padStart(2, "0")}
                color={colorOf(s.teamCode)}
              />
            </div>
          ))}
          {m.get.length === 0 &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div
                  style={{
                    aspectRatio: "3/4",
                    borderRadius: 8,
                    background: "#ffffff22",
                  }}
                />
              </div>
            ))}
        </div>

        <button
          className="btn btn-yellow mt-3"
          style={{
            width: "100%",
            justifyContent: "space-between",
            color: "var(--ink)",
          }}
          onClick={() =>
            alert("Próximamente: flujo de propuesta de cambio")
          }
        >
          Proponer cambio
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function CompactMatch({ m }: { m: Match }) {
  const initial = m.user.username.slice(0, 1).toUpperCase();
  const location = [m.user.city, m.user.country].filter(Boolean).join(", ");
  const mutualCountries = Array.from(
    new Set([...m.give, ...m.get].map((s) => s.teamCode)),
  );
  return (
    <div className="card row gap-3 items-center" style={{ padding: 12 }}>
      <div
        className="avatar"
        style={{
          background: avatarColor(m.user.username),
          width: 44,
          height: 44,
        }}
      >
        {initial}
      </div>
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="row items-center gap-2 between">
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            @{m.user.username}
          </div>
          <span
            className="tag"
            style={{ background: "#f1f0ec", color: "var(--ink)" }}
          >
            ★ {m.score}%
          </span>
        </div>
        <div
          className="mono"
          style={{
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 2,
          }}
        >
          📍 {location || "—"}
        </div>
        <div className="row items-center gap-2 mt-2">
          <div
            className="row items-center gap-1"
            style={{
              padding: "3px 8px",
              background: "#eaf7ee",
              borderRadius: 99,
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--green)",
              }}
            >
              ↑{m.giveCount}
            </span>
          </div>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#777"
            strokeWidth="2"
          >
            <path d="M3 7h14l-3-3M21 17H7l3 3" />
          </svg>
          <div
            className="row items-center gap-1"
            style={{
              padding: "3px 8px",
              background: "#fdebec",
              borderRadius: 99,
            }}
          >
            <span
              className="mono"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--red)",
              }}
            >
              ↓{m.getCount}
            </span>
          </div>
          <div className="row gap-1" style={{ marginLeft: "auto" }}>
            {mutualCountries.slice(0, 2).map((c) => (
              <span key={c} className="tag" style={{ background: "#f1f0ec" }}>
                {c}
              </span>
            ))}
            {mutualCountries.length > 2 && (
              <span className="tag" style={{ background: "#f1f0ec" }}>
                +{mutualCountries.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
