"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";
import { COUNTRY_NAMES } from "@/lib/groups";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  country: string | null;
  city: string | null;
  createdAt: string;
};

async function fetchMe(): Promise<UserProfile> {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("Error cargando perfil");
  return res.json();
}

export default function PerfilPage() {
  const { data: session } = useSession();
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
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

        {/* logout */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
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
