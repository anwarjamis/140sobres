"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { COUNTRY_NAMES } from "@/lib/groups";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  country: string | null;
  city: string | null;
  availableForSwap: boolean;
  createdAt: string;
};

async function fetchMe(): Promise<UserProfile> {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("Error cargando perfil");
  return res.json();
}

export default function PerfilPage() {
  const { data: session } = useSession();
  const qc = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });

  const toggleSwap = useMutation({
    mutationFn: async (value: boolean) => {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableForSwap: value }),
      });
      if (!res.ok) throw new Error("Error actualizando");
      return res.json();
    },
    onMutate: async (value) => {
      await qc.cancelQueries({ queryKey: ["me"] });
      const prev = qc.getQueryData<UserProfile>(["me"]);
      if (prev) qc.setQueryData<UserProfile>(["me"], { ...prev, availableForSwap: value });
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
    ? new Date(user.createdAt).toLocaleDateString("es", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      {/* header */}
      <div className="px-4" style={{ paddingTop: 16 }}>
        <div
          className="ui"
          style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}
        >
          tu cuenta
        </div>
        <h1 className="display" style={{ fontSize: 28 }}>
          Perfil
        </h1>
      </div>

      <div className="px-4 mt-4" style={{ paddingBottom: 10 }}>
        {/* avatar card */}
        <div
          className="card"
          style={{
            padding: "24px 20px",
            background: "var(--ink)",
            borderColor: "var(--ink)",
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
              opacity: 0.06,
              color: "#fff",
            }}
          />
          <div
            className="col items-center"
            style={{ gap: 10, position: "relative" }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: "var(--blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 28,
                color: "#fff",
                border: "2px solid #ffffff30",
              }}
            >
              {initial}
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                className="display"
                style={{ fontSize: 22, color: "#fff" }}
              >
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
          <InfoRow
            label="email"
            value={user?.email ?? session?.user?.email ?? "—"}
            loading={isLoading}
          />
          <InfoRow
            label="país"
            value={countryName ?? "—"}
            loading={isLoading}
          />
          <InfoRow
            label="ciudad"
            value={user?.city ?? "—"}
            loading={isLoading}
            last
          />
        </div>

        {/* disponibilidad de intercambio */}
        <div
          className="card mt-3"
          style={{ padding: "14px 16px" }}
        >
          <div className="row between items-center">
            <div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14 }}>
                Disponible para intercambios
              </div>
              <div className="mono micro muted" style={{ marginTop: 3 }}>
                {user?.availableForSwap
                  ? "aparecés en los resultados de match"
                  : "no aparecés en los resultados de match"}
              </div>
            </div>
            <button
              type="button"
              disabled={isLoading || toggleSwap.isPending}
              onClick={() => toggleSwap.mutate(!(user?.availableForSwap ?? true))}
              style={{
                width: 48,
                height: 28,
                borderRadius: 99,
                border: "none",
                cursor: "pointer",
                background: user?.availableForSwap ? "var(--green)" : "#ccc",
                transition: "background 0.2s",
                position: "relative",
                flex: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: user?.availableForSwap ? 23 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: 99,
                  background: "#fff",
                  boxShadow: "0 1px 3px #00000033",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>
        </div>

        {/* logout */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
          className="btn mt-4"
          style={{
            width: "100%",
            justifyContent: "center",
            background: "#fdebec",
            color: "var(--red)",
            border: "1px solid #f8c8ca",
          }}
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
      style={{
        padding: "14px 16px",
        borderBottom: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span
        className="mono"
        style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {label}
      </span>
      {loading ? (
        <div
          style={{
            width: 80,
            height: 14,
            borderRadius: 4,
            background: "#ececea",
          }}
        />
      ) : (
        <span
          style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14 }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
