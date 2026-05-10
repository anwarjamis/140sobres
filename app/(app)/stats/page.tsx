"use client";

import { useStats } from "@/hooks/use-stats";
import { Sticker } from "@/components/sticker";
import { colorOf } from "@/lib/groups";

const HEATMAP_SCALE = ["#ececea", "#dfe8df", "#a9d8b8", "#5bb789", "#1fa56a"];


export default function StatsPage() {
  const { data, isLoading } = useStats();

  const sobres = data?.sobresAbiertos ?? 0;

  const projectedPacks = data?.projectedPacks ?? 0;
  const ratio = data?.ratio ?? 1;
  const progressFraction = data?.progressFraction ?? 0;
  const dupesCount = data?.dupesCount ?? 0;
  const masCargas = data?.masCargas ?? [];
  const masRaras = data?.masRaras ?? [];
  const heatmap = data?.heatmap ?? Array.from({ length: 30 }, () => 0);

  const heatmapTotal = heatmap.reduce((a, b) => a + b, 0);
  const maxBar = Math.max(1, ...masCargas.map((m) => m.count));

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
              la temporada en números
            </div>
            <h1 className="display" style={{ fontSize: 28 }}>
              Stats
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
              <path d="M3 12h4l2-7 4 14 2-7h6" />
            </svg>
            esta semana
          </div>
        </div>
      </div>

      <div className="px-4 mt-3" style={{ paddingBottom: 10 }}>
        {/* KPI strip */}
        <div className="row gap-2">
          <div
            className="card grow"
            style={{
              padding: 12,
              background: "var(--ink)",
              color: "#fff",
              borderColor: "var(--ink)",
            }}
          >
            <div className="micro" style={{ opacity: 0.7 }}>
              SOBRES ABIERTOS
            </div>
            <div className="display" style={{ fontSize: 30, marginTop: 2 }}>
              {sobres}
            </div>
            <div className="mono micro" style={{ opacity: 0.7 }}>
              estimado
            </div>
          </div>
          <div
            className="card grow"
            style={{
              padding: 12,
              background: "var(--green)",
              color: "#fff",
              borderColor: "var(--green)",
            }}
          >
            <div className="micro" style={{ opacity: 0.85 }}>
              REPES
            </div>
            <div className="display" style={{ fontSize: 30, marginTop: 2 }}>
              {dupesCount}
            </div>
            <div className="mono micro" style={{ opacity: 0.85 }}>
              para cambio
            </div>
          </div>
          <div className="card grow" style={{ padding: 12 }}>
            <div className="micro muted">COMPLETAS</div>
            <div className="display" style={{ fontSize: 30, marginTop: 2 }}>
              {Math.round(progressFraction * 100)}%
            </div>
            <div className="mono micro muted">del álbum</div>
          </div>
        </div>

        {/* projection */}
        <div
          className="card mt-3"
          style={{
            padding: 14,
            background: "var(--yellow)",
            borderColor: "var(--ink)",
          }}
        >
          <div className="row between items-center">
            <div>
              <div className="micro" style={{ fontWeight: 700 }}>
                PROYECCIÓN
              </div>
              <div
                className="display"
                style={{ fontSize: 22, marginTop: 2 }}
              >
                te faltan ~{projectedPacks} sobres
              </div>
              <div
                className="mono"
                style={{
                  fontSize: 11.5,
                  color: "var(--ink-3)",
                  marginTop: 3,
                }}
              >
                al ritmo actual · sin cambios
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                className="display"
                style={{ fontSize: 34, color: "var(--ink)" }}
              >
                {ratio}×
              </div>
              <div className="micro" style={{ color: "var(--ink-3)" }}>
                vs. ideal (140)
              </div>
            </div>
          </div>
          <div
            className="progress-track mt-3"
            style={{ background: "#00000022" }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${Math.round(progressFraction * 100)}%`,
                background: "var(--ink)",
              }}
            />
          </div>
          <div className="row between mt-1">
            <span className="mono micro">{sobres} abiertos</span>
            <span className="mono micro">~{projectedPacks} estimados</span>
          </div>
        </div>

        {/* rarest stickers */}
        <div className="row between items-end mt-4 mb-2">
          <div className="display" style={{ fontSize: 18 }}>
            Las más raras
          </div>
          <span className="micro muted">% que las tiene</span>
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {masRaras.length === 0 && (
            <div className="micro muted" style={{ padding: 14 }}>
              completaste el álbum (o todavía no marcaste nada)
            </div>
          )}
          {masRaras.map((s, i) => (
            <div
              key={s.stickerId}
              className="row gap-3 items-center"
              style={{
                padding: "10px 12px",
                borderBottom:
                  i < masRaras.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div style={{ width: 28, textAlign: "center" }}>
                <div
                  className="display"
                  style={{
                    fontSize: 18,
                    color: i === 0 ? "var(--red)" : "var(--ink)",
                  }}
                >
                  {i + 1}
                </div>
              </div>
              <div style={{ width: 38, flex: "none" }}>
                <Sticker
                  num={String(s.number).padStart(2, "0")}
                  name={s.playerName ?? s.code}
                  color={colorOf(s.teamCode)}
                />
              </div>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row gap-2 items-center">
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {s.playerName ?? s.code}
                  </div>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  {s.teamCode} · #{String(s.number).padStart(2, "0")}
                </div>
                <div className="row items-center gap-2 mt-1">
                  <div
                    className="progress-track grow"
                    style={{ height: 5, background: "#ececea" }}
                  >
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, s.rarity * 8)}%`,
                        background: "var(--red)",
                      }}
                    />
                  </div>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--red)",
                    }}
                  >
                    {s.rarity}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* most duplicated */}
        <div className="row between items-end mt-4 mb-2">
          <div className="display" style={{ fontSize: 18 }}>
            Las que más cargás
          </div>
          <span className="micro muted">tus dobles · top 5</span>
        </div>
        <div className="card" style={{ padding: 14 }}>
          {masCargas.length === 0 ? (
            <div
              className="micro muted text-center"
              style={{ padding: 8 }}
            >
              todavía no tenés repes
            </div>
          ) : (
            <>
              <div
                className="row items-end gap-2"
                style={{ height: 130 }}
              >
                {masCargas.map((b) => (
                  <div
                    key={b.stickerId}
                    className="grow col items-center"
                    style={{ height: "100%" }}
                  >
                    <div
                      className="grow"
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: `${(b.count / maxBar) * 100}%`,
                          background: colorOf(b.teamCode),
                          border: "1px solid var(--ink)",
                          borderRadius: "6px 6px 2px 2px",
                          position: "relative",
                        }}
                      >
                        <div
                          className="mono"
                          style={{
                            position: "absolute",
                            top: -18,
                            left: "50%",
                            transform: "translateX(-50%)",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--ink)",
                          }}
                        >
                          ×{b.count}
                        </div>
                      </div>
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: 9.5,
                        fontWeight: 600,
                        color: "var(--ink-3)",
                        marginTop: 6,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {b.code.slice(0, 6)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="divider mt-3" />
              <div className="row between mt-2">
                <span className="micro muted">
                  {dupesCount} copias para cambio
                </span>
                <span
                  className="mono micro"
                  style={{ fontWeight: 700 }}
                >
                  ≈ {dupesCount} cambios posibles
                </span>
              </div>
            </>
          )}
        </div>

        {/* heatmap */}
        <div className="row between items-end mt-4 mb-2">
          <div className="display" style={{ fontSize: 18 }}>
            Tu actividad · 30 días
          </div>
          <span className="micro muted">láminas/día</span>
        </div>
        <div className="card" style={{ padding: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(15, 1fr)",
              gap: 4,
            }}
          >
            {heatmap.map((v, i) => {
              const idx = Math.min(4, Math.max(0, v));
              return (
                <div
                  key={i}
                  title={`día ${i + 1}: ${v}`}
                  style={{
                    aspectRatio: "1/1",
                    borderRadius: 4,
                    background: HEATMAP_SCALE[idx],
                  }}
                />
              );
            })}
          </div>
          <div className="row gap-2 items-center mt-3 between">
            <div className="row gap-2 items-center">
              <span className="mono micro muted">menos</span>
              {HEATMAP_SCALE.map((b, i) => (
                <span
                  key={i}
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: b,
                  }}
                />
              ))}
              <span className="mono micro muted">más</span>
            </div>
            <span className="mono micro" style={{ fontWeight: 700 }}>
              {heatmapTotal} marcadas
            </span>
          </div>
        </div>

        {/* insight */}
        <div
          className="card mt-3"
          style={{
            padding: 14,
            background:
              "linear-gradient(135deg, var(--purple), var(--red))",
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
              opacity: 0.1,
              color: "#fff",
            }}
          />
          <div
            className="row gap-3 items-start"
            style={{ position: "relative" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#ffffff22",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div className="grow">
              <div className="micro" style={{ opacity: 0.85 }}>
                INSIGHT DEL DÍA
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 16,
                  marginTop: 3,
                  lineHeight: 1.25,
                }}
              >
                {dupesCount > 0
                  ? `Tenés ${dupesCount} copias listas para cambio. Andá a /match y mirá quién las necesita.`
                  : "Cuando empieces a cargar repes, te vamos a sugerir matches con otros coleccionistas."}
              </div>
              <a
                href="/match"
                className="btn btn-yellow btn-sm mt-3"
                style={{ color: "var(--ink)" }}
              >
                Ver matches sugeridos →
              </a>
            </div>
          </div>
        </div>

        {isLoading && (
          <div
            className="micro muted text-center"
            style={{ padding: 16 }}
          >
            cargando…
          </div>
        )}
      </div>
    </>
  );
}
