import Link from "next/link";
import { Logo } from "@/components/logo";
import { Sticker, Slot } from "@/components/sticker";
import { Ticker } from "@/components/ticker";

export default function Landing() {
  return (
    <>
      {/* header — narrow on mobile, full-bleed on desktop */}
      <div className="px-5 pt-2 md:px-10 md:pt-6">
        <div className="row between items-center mx-auto md:max-w-6xl">
          <Logo size={18} />
          <Link href="/login" className="chip">
            Iniciar sesión →
          </Link>
        </div>
      </div>

      {/* hero — single column on mobile, 2-col on md+ */}
      <div className="md:flex-1 md:flex md:items-center">
        <div className="mx-auto w-full md:max-w-6xl md:px-10 md:py-12 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          {/* left: copy + CTAs */}
          <div className="px-5 pt-5 md:px-0 md:pt-0">
            <div
              className="display"
              style={{ color: "var(--ink)" }}
            >
              <span className="text-[64px] md:text-[112px] leading-[1.02]">
                980
                <br />
                láminas.
              </span>
            </div>
            <div
              className="display mt-1.5 md:mt-3"
              style={{ color: "var(--red)" }}
            >
              <span className="text-[42px] md:text-[72px] leading-[1.05]">
                140 sobres.
              </span>
            </div>
            <p
              className="ui mt-3 md:mt-6 max-w-[280px] md:max-w-[460px]"
              style={{
                fontSize: 14.5,
                color: "var(--ink-3)",
                lineHeight: 1.4,
              }}
            >
              La cuenta exacta para llenar el álbum del Mundial — si tu
              suerte fuera perfecta.{" "}
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                Spoiler: no lo es.
              </span>
            </p>

            {/* CTAs — appear here on desktop, after sticker card on mobile */}
            <div className="hidden md:block mt-8">
              <CTAs />
              <FootnoteRow />
            </div>
          </div>

          {/* right: sticker fan card */}
          <div className="mt-5 mx-4 md:mx-0 md:mt-0 relative">
            <div
              style={{
                background: "var(--ink)",
                color: "#fff",
                borderRadius: 24,
                padding: "18px 16px 22px",
                overflow: "hidden",
                position: "relative",
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
                className="row between items-center"
                style={{ position: "relative" }}
              >
                <span
                  className="tag"
                  style={{ background: "var(--yellow)", color: "var(--ink)" }}
                >
                  ★ tu colección
                </span>
                <span className="mono" style={{ fontSize: 11, opacity: 0.8 }}>
                  MMXXVI · MX/US/CA
                </span>
              </div>
              <div
                className="grid grid-cols-5 gap-1.5 mt-4"
                style={{ position: "relative" }}
              >
                <Sticker num="01" name="MESSI" pos="DEL" color="var(--blue)" />
                <Sticker
                  num="03"
                  name="VINICIUS"
                  pos="DEL"
                  color="var(--yellow)"
                />
                <Sticker num="07" name="MBAPPÉ" pos="DEL" color="var(--blue)" />
                <Sticker
                  num="11"
                  name="LAUTARO"
                  pos="DEL"
                  color="var(--blue)"
                />
                <Sticker
                  num="14"
                  name="BELLINGHAM"
                  pos="MED"
                  color="var(--red)"
                />
              </div>
              <div
                className="grid grid-cols-5 gap-1.5 mt-1.5"
                style={{ position: "relative" }}
              >
                <Sticker
                  num="22"
                  name="LOZANO"
                  pos="DEL"
                  color="var(--green)"
                />
                <Slot num="23" />
                <Sticker num="24" name="PEDRI" pos="MED" color="var(--red)" />
                <Slot num="25" />
                <Sticker num="26" name="CR7" pos="DEL" color="var(--purple)" />
              </div>
            </div>
            <div
              className="tag"
              style={{
                position: "absolute",
                top: -10,
                right: 14,
                background: "var(--red)",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: 99,
                transform: "rotate(6deg)",
                boxShadow: "0 4px 12px -3px #00000044",
              }}
            >
              + 12.430 hinchas
            </div>
          </div>
        </div>
      </div>

      {/* CTAs — appear here on mobile only */}
      <div className="md:hidden px-5 pt-5 mt-auto">
        <CTAs />
        <FootnoteRow />
      </div>

      <Ticker className="mt-4" />
    </>
  );
}

function CTAs() {
  return (
    <div className="col gap-2 md:max-w-[420px]">
      <Link
        href="/signup"
        className="btn btn-red"
        style={{ justifyContent: "space-between" }}
      >
        Completar mi álbum gratis
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
      </Link>
      <Link
        href="/login"
        className="btn btn-ghost"
        style={{ justifyContent: "center" }}
      >
        Ya tengo cuenta
      </Link>
    </div>
  );
}

function FootnoteRow() {
  return (
    <div
      className="row center mt-3 gap-3"
      style={{ fontSize: 11, color: "var(--muted)" }}
    >
      <span>· 980 láminas</span>
      <span>· 48 selecciones</span>
      <span>· Solo 140 sobres</span>
    </div>
  );
}
