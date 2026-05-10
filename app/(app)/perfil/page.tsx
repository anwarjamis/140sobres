"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { useMe } from "@/hooks/use-me";
import { COUNTRY_NAMES } from "@/lib/groups";

export default function PerfilPage() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const { data: user, isLoading } = useMe();

  const [editingWa, setEditingWa] = useState(false);
  const [waInput, setWaInput] = useState("");

  const patchMe = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error actualizando");
      return res.json();
    },
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ["me"] });
      const prev = qc.getQueryData(["me"]);
      qc.setQueryData(["me"], (old: typeof user) => old ? { ...old, ...body } : old);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(["me"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });

  const username = session?.user?.name ?? "";
  const initial = username.slice(0, 1).toUpperCase() || "·";

  const countryName = user?.country
    ? (COUNTRY_NAMES[user.country] ?? user.country)
    : null;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es", { month: "long", year: "numeric" })
    : null;

  function saveWhatsapp() {
    const val = waInput.trim();
    patchMe.mutate({ whatsapp: val || null });
    setEditingWa(false);
  }

  return (
    <>
      {/* header */}
      <div className="px-4" style={{ paddingTop: 16 }}>
        <div className="ui" style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
          tu cuenta
        </div>
        <h1 className="display" style={{ fontSize: 28 }}>Perfil</h1>
      </div>

      <div className="px-4 mt-4" style={{ paddingBottom: 10 }}>
        {/* avatar card */}
        <div
          className="card"
          style={{ padding: "24px 20px", background: "var(--ink)", borderColor: "var(--ink)", color: "#fff", position: "relative", overflow: "hidden" }}
        >
          <div className="halftone" style={{ position: "absolute", inset: 0, opacity: 0.06, color: "#fff" }} />
          <div className="col items-center" style={{ gap: 10, position: "relative" }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: 20,
                background: "var(--blue)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: "#fff",
                border: "2px solid #ffffff30",
              }}
            >
              {initial}
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="display" style={{ fontSize: 22, color: "#fff" }}>
                {username || "—"}
              </div>
              {memberSince && (
                <div className="mono micro" style={{ opacity: 0.6, marginTop: 2 }}>
                  desde {memberSince}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* info rows */}
        <div className="card mt-3" style={{ padding: 0, overflow: "hidden" }}>
          <InfoRow label="email" value={user?.email ?? session?.user?.email ?? "—"} loading={isLoading} />
          <InfoRow label="país" value={countryName ?? "—"} loading={isLoading} />
          <InfoRow label="ciudad" value={user?.city ?? "—"} loading={isLoading} last />
        </div>

        {/* intercambios */}
        <div className="card mt-3" style={{ padding: "14px 16px" }}>
          <div className="row between items-center">
            <div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14 }}>
                Participar en intercambios
              </div>
              <div className="mono micro muted" style={{ marginTop: 3 }}>
                {user?.matchActive
                  ? "aparecés en los resultados de match"
                  : "no aparecés en los resultados de match"}
              </div>
            </div>
            <button
              type="button"
              disabled={isLoading || patchMe.isPending}
              onClick={() => patchMe.mutate({ matchActive: !user?.matchActive })}
              style={{
                width: 48, height: 28, borderRadius: 99,
                border: "none", cursor: "pointer",
                background: user?.matchActive ? "var(--green)" : "#ccc",
                transition: "background 0.2s",
                position: "relative", flex: "none",
              }}
            >
              <div
                style={{
                  position: "absolute", top: 3,
                  left: user?.matchActive ? 23 : 3,
                  width: 22, height: 22, borderRadius: 99,
                  background: "#fff", boxShadow: "0 1px 3px #00000033",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>

          {/* WhatsApp field — only shown when matchActive */}
          {user?.matchActive && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                WhatsApp
              </div>
              {editingWa ? (
                <div className="row gap-2">
                  <input
                    type="tel"
                    value={waInput}
                    onChange={(e) => setWaInput(e.target.value)}
                    placeholder="+54 11 1234-5678"
                    autoFocus
                    style={{
                      flex: 1, height: 36, borderRadius: 10,
                      border: "1.5px solid var(--line-2)",
                      padding: "0 10px", fontSize: 14,
                      fontFamily: "var(--font-ui)", color: "var(--ink)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={saveWhatsapp}
                    className="btn"
                    style={{ height: 36, padding: "0 14px", background: "var(--ink)", color: "#fff", fontSize: 13 }}
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingWa(false)}
                    className="btn btn-ghost"
                    style={{ height: 36, padding: "0 10px", fontSize: 13 }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="row between items-center">
                  <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14 }}>
                    {user?.whatsapp || <span style={{ color: "var(--muted)" }}>sin número</span>}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setWaInput(user?.whatsapp ?? ""); setEditingWa(true); }}
                    className="chip"
                    style={{ fontSize: 12 }}
                  >
                    editar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* logout */}
        <button
          type="button"
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/login";
          }}
          className="btn mt-4"
          style={{ width: "100%", justifyContent: "center", background: "#fdebec", color: "var(--red)", border: "1px solid #f8c8ca" }}
        >
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

function InfoRow({
  label,
  value,
  loading,
  last = false,
}: {
  label: string;
  value: string;
  loading?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className="row between items-center"
      style={{ padding: "14px 16px", borderBottom: last ? "none" : "1px solid var(--line)" }}
    >
      <span className="mono" style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
      {loading ? (
        <div style={{ width: 80, height: 14, borderRadius: 4, background: "#ececea" }} />
      ) : (
        <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14 }}>{value}</span>
      )}
    </div>
  );
}
