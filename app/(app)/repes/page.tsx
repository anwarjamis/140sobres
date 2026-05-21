"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useAlbum } from "@/hooks/use-album";
import { useMarkSticker } from "@/hooks/use-mark-sticker";
import { Sticker } from "@/components/sticker";
import { colorOf, groupOf } from "@/lib/groups";
import type { AlbumSticker } from "@/lib/types";

type Filter = "all" | "x3" | "country" | "group";

export default function RepesPage() {
  const { data, isLoading } = useAlbum();
  const mark = useMarkSticker();
  const [filter, setFilter] = useState<Filter>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [qty, setQty] = useState(1);
  const [matchedSticker, setMatchedSticker] = useState<AlbumSticker | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [keepAdding, setKeepAdding] = useState(false);
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when modal opens, reset everything.
  useEffect(() => {
    if (modalOpen) {
      setCodeInput("");
      setQty(1);
      setMatchedSticker(null);
      setNotFound(false);
      setKeepAdding(false);
      setTimeout(() => codeRef.current?.focus(), 80);
    }
  }, [modalOpen]);

  function resetForm() {
    setCodeInput("");
    setQty(1);
    setMatchedSticker(null);
    setNotFound(false);
    setTimeout(() => codeRef.current?.focus(), 80);
  }

  // Live-search sticker by code as user types.
  useEffect(() => {
    const q = codeInput.trim().toUpperCase();
    if (!q || !data) {
      setMatchedSticker(null);
      setNotFound(false);
      return;
    }
    // Try exact match first, then with zero-padded number (ARG7 → ARG07).
    const sticker =
      data.stickers.find((s) => s.code === q) ??
      data.stickers.find((s) => {
        const letters = q.match(/^[A-Z]+/)?.[0] ?? "";
        const digits = q.match(/\d+$/)?.[0] ?? "";
        if (!letters || !digits) return false;
        return s.code === `${letters}${digits.padStart(2, "0")}`;
      });
    if (sticker) {
      setMatchedSticker(sticker);
      setNotFound(false);
      // Always start at 1 — if sticker already has repes we add on top
      setQty(1);
    } else {
      setMatchedSticker(null);
      setNotFound(true);
    }
  }, [codeInput, data]);

  function buildShareText(): string {
    const sorted = [...all]
      .filter((s) => s.count > 0)
      .sort((a, b) => {
        const ga = groupOf(a.teamCode) ?? "ZZ";
        const gb = groupOf(b.teamCode) ?? "ZZ";
        if (ga !== gb) return ga.localeCompare(gb);
        if (a.teamCode !== b.teamCode) return a.teamCode.localeCompare(b.teamCode);
        return a.number - b.number;
      });
    if (sorted.length === 0) return "No tengo repes todavía";

    const lines: string[] = ["Láminas repetidas para cambiar:", ""];
    let lastGroup = "";
    for (const s of sorted) {
      const grp = groupOf(s.teamCode);
      const grpLabel = grp ? `Grupo ${grp}` : s.section === "FWC" ? "FWC" : "Especiales";
      if (grpLabel !== lastGroup) {
        if (lastGroup !== "") lines.push("");
        lines.push(grpLabel);
        lastGroup = grpLabel;
      }
      const num = String(s.number).padStart(2, "0");
      const name = s.playerName ? ` · ${s.playerName}` : "";
      const count = s.count > 1 ? ` ×${s.count}` : "";
      lines.push(`${s.teamCode} ${num}${name}${count}`);
    }
    return lines.join("\n");
  }

  async function handleShare() {
    const text = buildShareText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // nothing we can do
    }
  }

  function handleAdd() {
    if (!matchedSticker) return;
    const newCount = (matchedSticker.count ?? 0) + qty;
    mark.mutate(
      { stickerId: matchedSticker.id, count: newCount },
      {
        onSuccess: () => {
          if (keepAdding) {
            resetForm();
          } else {
            setModalOpen(false);
          }
        },
      },
    );
  }

  const all = useMemo(() => data?.stickers ?? [], [data]);

  const dupes = useMemo(() => {
    let list = all.filter((s) => s.count > 0);
    if (filter === "x3") list = list.filter((s) => s.count >= 3);
    if (filter === "country") {
      list = [...list].sort((a, b) => a.teamCode.localeCompare(b.teamCode));
    } else if (filter === "group") {
      list = [...list].sort((a, b) => {
        const ga = groupOf(a.teamCode) ?? "Z";
        const gb = groupOf(b.teamCode) ?? "Z";
        if (ga !== gb) return ga.localeCompare(gb);
        if (a.teamCode !== b.teamCode) return a.teamCode.localeCompare(b.teamCode);
        return a.number - b.number;
      });
    } else {
      list = [...list].sort((a, b) => b.count - a.count);
    }
    return list;
  }, [all, filter]);

  // Total extras = sum of all count values (count = extras directly).
  const totalRepes = useMemo(
    () => all.filter((s) => s.count > 0).reduce((sum, s) => sum + s.count, 0),
    [all],
  );

  const uniqueDupes = all.filter((s) => s.count > 0).length;

  return (
    <>
      {/* header */}
      <div className="px-4" style={{ paddingTop: 16 }}>
        <div className="row between items-center">
          <div>
            <div
              className="ui"
              style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}
            >
              tu inventario
            </div>
            <h1 className="display" style={{ fontSize: 28 }}>
              Mis repes
            </h1>
          </div>
          <div className="row gap-2">
            <button
              type="button"
              onClick={handleShare}
              disabled={totalRepes === 0}
              aria-label="Compartir repes"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1.5px solid var(--line-2)",
                background: copied ? "#eaf7ee" : "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
                opacity: totalRepes === 0 ? 0.35 : 1,
                transition: "background 0.15s",
              }}
            >
              {copied ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.6" strokeLinecap="round">
                  <path d="m20 6-11 11-5-5" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn btn-red"
              style={{ gap: 6, paddingLeft: 12, paddingRight: 14 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Agregar
            </button>
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
                ? "usá el botón + Agregar para cargar tus repetidas"
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
          <button
            type="button"
            className={`chip ${filter === "group" ? "chip-dark" : ""}`}
            onClick={() => setFilter("group")}
          >
            por grupo
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
                    {Array.from({ length: Math.min(d.count, 5) }).map((_, j) => (
                      <span
                        key={j}
                        style={{ width: 8, height: 8, borderRadius: 99, background: "var(--ink)" }}
                      />
                    ))}
                    {d.count > 5 && (
                      <span className="mono micro muted">+{d.count - 5}</span>
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
                          count: Math.max(0, d.count - 1),
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

      {/* modal: agregar repetida */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#00000066",
            zIndex: 100,
            display: "flex",
            alignItems: "flex-end",
            padding: "0 0 16px",
          }}
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 430,
              margin: "0 auto",
              background: "var(--paper)",
              borderRadius: "24px 24px 16px 16px",
              padding: "20px 20px 24px",
              boxShadow: "0 -8px 40px #00000022",
            }}
          >
            {/* drag handle */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--line)" }} />
            </div>

            <div className="display" style={{ fontSize: 20, marginBottom: 16 }}>
              Agregar repetida
            </div>

            {/* código */}
            <div className="field">
              <label>código de lámina</label>
              <input
                ref={codeRef}
                type="text"
                placeholder="ej: ARG7 o MEX03"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                style={{ textTransform: "uppercase" }}
                autoComplete="off"
              />
            </div>

            {/* preview del sticker encontrado */}
            {matchedSticker && (
              <>
                <div
                  className="row gap-3 items-center"
                  style={{
                    marginTop: 10,
                    padding: "10px 12px",
                    background: "#f5f4f0",
                    borderRadius: 12,
                    border: "1px solid var(--line)",
                  }}
                >
                  <div style={{ width: 40, flex: "none" }}>
                    <Sticker
                      num={String(matchedSticker.number).padStart(2, "0")}
                      name={matchedSticker.playerName ?? matchedSticker.code}
                      pos={matchedSticker.position ?? ""}
                      color={colorOf(matchedSticker.teamCode)}
                    />
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
                      {matchedSticker.playerName ?? matchedSticker.code}
                    </div>
                    <div className="mono micro muted" style={{ marginTop: 2 }}>
                      {matchedSticker.teamCode} · #{String(matchedSticker.number).padStart(2, "0")}
                    </div>
                  </div>
                </div>
                {matchedSticker.count > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 12px",
                      background: "#eef4ff",
                      border: "1px solid #b8d0f5",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "#1a4a8a",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>ℹ️</span>
                    Ya tenés <strong>×{matchedSticker.count}</strong> de esta lámina — se van a sumar las que agregues.
                  </div>
                )}
                {!matchedSticker.owned && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 12px",
                      background: "#fff8e6",
                      border: "1px solid #f5d87a",
                      borderRadius: 10,
                      fontSize: 12,
                      color: "#7a5c00",
                    }}
                  >
                    ⚠️ Esta lámina no está marcada en tu álbum. Marcala primero desde la vista del país.
                  </div>
                )}
              </>
            )}

            {notFound && codeInput.trim().length >= 3 && (
              <div className="mono micro" style={{ marginTop: 8, color: "var(--red)" }}>
                No se encontró la lámina &ldquo;{codeInput.toUpperCase()}&rdquo;
              </div>
            )}

            {/* cantidad */}
            {matchedSticker && (
              <div className="field" style={{ marginTop: 12 }}>
                <label>
                  {matchedSticker.count > 0 ? "¿cuántas más agregás?" : "¿cuántas repetidas tenés?"}
                </label>
                <div className="row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(0, q - 1))}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: "1px solid var(--line)", background: "#fff",
                      fontSize: 18, cursor: "pointer", flex: "none",
                    }}
                  >−</button>
                  <div className="display" style={{ fontSize: 28, minWidth: 40, textAlign: "center" }}>
                    {qty}
                  </div>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      border: "1px solid var(--ink)", background: "var(--ink)",
                      color: "#fff", fontSize: 18, cursor: "pointer", flex: "none",
                    }}
                  >+</button>
                  <span className="mono micro muted">
                    {qty === 0 ? "ninguna para cambio" : `${qty} para cambio`}
                  </span>
                </div>
              </div>
            )}

            {/* toggle: seguir cargando */}
            {matchedSticker && (
              <div
                className="row items-center gap-2"
                style={{ marginTop: 14, cursor: "pointer", userSelect: "none" }}
                onClick={() => setKeepAdding((k) => !k)}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${keepAdding ? "var(--ink)" : "var(--line-2)"}`,
                    background: keepAdding ? "var(--ink)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                    transition: "all 0.12s",
                  }}
                >
                  {keepAdding && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round">
                      <path d="m20 6-11 11-5-5" />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: "var(--font-ui)",
                    color: keepAdding ? "var(--ink)" : "var(--ink-3)",
                    fontWeight: keepAdding ? 600 : 400,
                    transition: "color 0.12s",
                  }}
                >
                  Seguir cargando al guardar
                </span>
              </div>
            )}

            {/* actions */}
            <div className="col gap-2" style={{ marginTop: 16 }}>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!matchedSticker || mark.isPending}
                className="btn btn-red"
                style={{ width: "100%", justifyContent: "center", opacity: !matchedSticker ? 0.4 : 1 }}
              >
                {mark.isPending
                  ? "Guardando…"
                  : keepAdding
                  ? "Guardar y cargar otra"
                  : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
