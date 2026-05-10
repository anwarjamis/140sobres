"use client";

import { useMemo, useState } from "react";
import { useAlbum } from "@/hooks/use-album";
import { useMarkSticker } from "@/hooks/use-mark-sticker";
import { Sticker } from "@/components/sticker";
import { colorOf } from "@/lib/groups";

type Filter = "all" | "x3" | "country";

export default function RepesPage() {
  const { data, isLoading } = useAlbum();
  const mark = useMarkSticker();
  const [filter, setFilter] = useState<Filter>("all");

  const all = useMemo(() => data?.stickers ?? [], [data]);

  const dupes = useMemo(() => {
    let list = all.filter((s) => s.count > 1);
    if (filter === "x3") list = list.filter((s) => s.count >= 3);
    if (filter === "country") {
      list = [...list].sort((a, b) => a.teamCode.localeCompare(b.teamCode));
    } else {
      list = [...list].sort((a, b) => b.count - a.count);
    }
    return list;
  }, [all, filter]);

  // Total "available to trade" copies = sum(count - 1) over duplicated stickers.
  const totalRepes = useMemo(
    () =>
      all
        .filter((s) => s.count > 1)
        .reduce((sum, s) => sum + (s.count - 1), 0),
    [all],
  );

  const uniqueDupes = all.filter((s) => s.count > 1).length;

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
              tu inventario
            </div>
            <h1 className="display" style={{ fontSize: 28 }}>
              Mis repes
            </h1>
          </div>
        </div>
      </div>

      {/* total */}
      <div className="px-4 mt-3">
        <div
          className="card"
          style={{
            padding: "18px 20px",
            background: "var(--ink)",
            color: "#fff",
            borderColor: "var(--ink)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="halftone"
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.08,
              color: "#fff",
            }}
          />
          <div style={{ position: "relative" }}>
            <div className="micro" style={{ opacity: 0.7 }}>
              TOTAL REPETIDAS
            </div>
            <div
              className="display"
              style={{
                fontSize: 54,
                color: "var(--yellow)",
                marginTop: 4,
              }}
            >
              {totalRepes}
            </div>
            <div
              className="mono"
              style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}
            >
              {totalRepes === 0
                ? "marcá repes desde la vista de país"
                : `${uniqueDupes} láminas distintas listas para cambio`}
            </div>
          </div>
        </div>
      </div>

      {/* filter chips */}
      <div className="px-4 mt-3">
        <div className="row gap-1" style={{ flexWrap: "wrap" }}>
          <button
            type="button"
            className={`chip ${filter === "all" ? "chip-dark" : ""}`}
            onClick={() => setFilter("all")}
          >
            todas · {uniqueDupes}
          </button>
          <button
            type="button"
            className={`chip ${filter === "x3" ? "chip-dark" : ""}`}
            onClick={() => setFilter("x3")}
          >
            x3 o más
          </button>
          <button
            type="button"
            className={`chip ${filter === "country" ? "chip-dark" : ""}`}
            onClick={() => setFilter("country")}
          >
            por país
          </button>
        </div>
      </div>

      {/* list */}
      <div className="px-4 mt-3" style={{ paddingBottom: 10 }}>
        {isLoading && (
          <div className="micro muted text-center" style={{ padding: 24 }}>
            cargando…
          </div>
        )}

        {!isLoading && dupes.length === 0 && (
          <div
            className="card"
            style={{
              padding: 20,
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            <div className="display" style={{ fontSize: 16, color: "var(--ink)" }}>
              Todavía no tenés repes
            </div>
            <div className="mono micro mt-2">
              cuando marques una lámina más de una vez, aparece acá
            </div>
          </div>
        )}

        <div className="col gap-2">
          {dupes.map((d) => {
            const color = colorOf(d.teamCode);
            const numStr = String(d.number).padStart(2, "0");
            const inFlight = mark.isPending && mark.variables?.stickerId === d.id;
            return (
              <div
                key={d.id}
                className="card row gap-3 items-center"
                style={{ padding: 10 }}
              >
                {/* sticker thumb with stack effect */}
                <div
                  style={{ width: 54, flex: "none", position: "relative" }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      transform: "translate(4px, 4px) rotate(2deg)",
                      opacity: 0.4,
                    }}
                  >
                    <Sticker
                      num={numStr}
                      name={d.playerName ?? d.code}
                      pos={d.position ?? ""}
                      color={color}
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <Sticker
                      num={numStr}
                      name={d.playerName ?? d.code}
                      pos={d.position ?? ""}
                      color={color}
                    />
                  </div>
                </div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="row items-center gap-2">
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {d.playerName ?? d.code}
                    </div>
                  </div>
                  <div
                    className="mono"
                    style={{
                      fontSize: 11.5,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {d.teamCode} · #{numStr}
                    {d.position ? ` · ${d.position}` : ""}
                  </div>
                  <div className="row gap-1 mt-2 items-center">
                    {Array.from({ length: Math.min(d.count, 5) }).map(
                      (_, j) => (
                        <span
                          key={j}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 99,
                            background: "var(--ink)",
                          }}
                        />
                      ),
                    )}
                    {d.count > 5 && (
                      <span className="mono micro muted">
                        +{d.count - 5}
                      </span>
                    )}
                  </div>
                </div>
                {/* stepper */}
                <div className="col items-center" style={{ gap: 4 }}>
                  <div
                    className="row items-center"
                    style={{
                      background: "#fff",
                      border: "1px solid var(--line-2)",
                      borderRadius: 99,
                      padding: 2,
                    }}
                  >
                    <button
                      type="button"
                      aria-label="Quitar una copia"
                      disabled={inFlight}
                      onClick={() =>
                        mark.mutate({
                          stickerId: d.id,
                          count: Math.max(1, d.count - 1),
                        })
                      }
                      style={{
                        width: 24,
                        height: 24,
                        border: "none",
                        background: "transparent",
                        fontSize: 16,
                        color: "var(--ink-3)",
                        cursor: "pointer",
                      }}
                    >
                      −
                    </button>
                    <div
                      className="mono"
                      style={{
                        minWidth: 28,
                        textAlign: "center",
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      ×{d.count}
                    </div>
                    <button
                      type="button"
                      aria-label="Sumar una copia"
                      disabled={inFlight}
                      onClick={() =>
                        mark.mutate({
                          stickerId: d.id,
                          count: d.count + 1,
                        })
                      }
                      style={{
                        width: 24,
                        height: 24,
                        border: "none",
                        background: "var(--ink)",
                        color: "#fff",
                        borderRadius: 99,
                        fontSize: 14,
                        cursor: "pointer",
                      }}
                    >
                      +
                    </button>
                  </div>
                  <div className="micro muted">para cambio</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
