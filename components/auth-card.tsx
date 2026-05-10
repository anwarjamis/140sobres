"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { CountrySelect } from "@/components/country-select";

type Mode = "login" | "signup";

export function AuthCard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, country, city }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "No se pudo crear la cuenta");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.ok) {
        setError(
          mode === "login"
            ? "Email o contraseña inválidos"
            : "Cuenta creada pero falló el login. Intentá ingresar.",
        );
        setLoading(false);
        return;
      }

      router.replace("/album");
      router.refresh();
    } catch {
      setError("Algo falló. Probá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full md:max-w-md md:mx-auto md:py-10">
      {/* header */}
      <div className="px-5 row between items-center pt-2">
        <Link href="/" className="chip" aria-label="Volver">
          ←
        </Link>
        <Logo size={16} />
        <span style={{ width: 32 }} />
      </div>

      <div className="px-5" style={{ paddingTop: 24 }}>
        <h1 className="display" style={{ fontSize: 36, color: "var(--ink)" }}>
          Sumate al
          <br />
          álbum.
        </h1>
        <p
          className="ui"
          style={{ fontSize: 13.5, color: "var(--ink-3)", marginTop: 8 }}
        >
          Tu colección, tus repes, tus matches.
        </p>

        {/* segmented toggle */}
        <div
          style={{
            marginTop: 18,
            padding: 4,
            background: "#ececea",
            borderRadius: 14,
            display: "flex",
            gap: 0,
          }}
        >
          {(["signup", "login"] as Mode[]).map((m) => {
            const active = mode === m;
            const href = m === "signup" ? "/signup" : "/login";
            return (
              <Link
                key={m}
                href={href}
                replace
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px 0",
                  borderRadius: 11,
                  background: active ? "#fff" : "transparent",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 600,
                  fontSize: 13,
                  color: active ? "var(--ink)" : "var(--ink-3)",
                  boxShadow: active ? "0 1px 3px #00000010" : "none",
                  textDecoration: "none",
                }}
              >
                {m === "signup" ? "Crear cuenta" : "Iniciar sesión"}
              </Link>
            );
          })}
        </div>

        {/* form */}
        <form onSubmit={handleSubmit} className="col gap-2 mt-4">
          {mode === "signup" && (
            <div className="field">
              <label htmlFor="username">usuario</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: mateo_r"
                required
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@140sobres.com"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="mínimo 8 caracteres"
              required
              minLength={mode === "signup" ? 8 : undefined}
            />
          </div>
          {mode === "signup" && (
            <>
              <div className="row gap-2">
                <div className="grow">
                  <CountrySelect
                    value={country}
                    onChange={setCountry}
                    disabled={loading}
                  />
                </div>
                <div className="field grow">
                  <label htmlFor="city">Comuna/Ciudad</label>
                  <input
                    id="city"
                    type="text"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ñuñoa"
                    required
                  />
                </div>
              </div>
              <p
                className="micro muted"
                style={{ padding: "0 4px", lineHeight: 1.4 }}
              >
                Usamos tu ubicación para sugerirte matches cerca tuyo. Lo podés
                cambiar después.
              </p>
            </>
          )}

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 4,
                padding: "10px 12px",
                background: "#fdebec",
                color: "var(--red)",
                border: "1px solid var(--red)",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-red mt-4"
            style={{
              width: "100%",
              justifyContent: "space-between",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "…"
              : mode === "signup"
                ? "Crear mi álbum"
                : "Entrar"}
            {!loading && (
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
            )}
          </button>

          {mode === "signup" && (
            <p
              className="micro muted mt-4"
              style={{ textAlign: "center", lineHeight: 1.5 }}
            >
              Al continuar aceptás los <u>términos</u> y la{" "}
              <u>política de privacidad</u>.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
