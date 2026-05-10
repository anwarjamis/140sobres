import type { CSSProperties } from "react";

type StickerProps = {
  num: string | number;
  name?: string;
  pos?: string;
  color?: string;
  size?: number;
  className?: string;
  onUnmark?: () => void;
};

// Canonical owned-sticker card. 3:4 aspect, gradient top with silhouette,
// white footer with name + position. Color is any CSS color (token vars OK).
export function Sticker({
  num,
  name = "",
  pos = "",
  color = "var(--blue)",
  size,
  className,
  onUnmark,
}: StickerProps) {
  const style: CSSProperties = {
    ...(size ? { width: size } : {}),
    ["--st-bg" as string]: `linear-gradient(180deg, ${color}, color-mix(in oklch, ${color} 70%, #000))`,
  };

  const inner = (
    <>
      <div className="top">
        <div className="silhouette" />
        <div className="num mono">{num}</div>
      </div>
      <div className="label">
        <div className="name">{name || "—"}</div>
        <div className="pos">{pos}</div>
      </div>
    </>
  );

  if (onUnmark) {
    return (
      <button
        type="button"
        onClick={onUnmark}
        aria-label={`Desmarcar ${name || `lámina ${num}`}`}
        className={`sticker ${className ?? ""}`}
        style={{ ...style, cursor: "pointer" }}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`sticker ${className ?? ""}`} style={style}>
      {inner}
    </div>
  );
}

type MissingProps = {
  num: string | number;
  name?: string;
  pos?: string;
  onMark?: () => void;
  disabled?: boolean;
};

// Missing sticker — desaturated grey with dashed border, faint silhouette,
// and a floating ink-bordered + button to invite tapping. Used on the
// country detail grid.
export function MissingSticker({
  num,
  name = "",
  pos = "",
  onMark,
  disabled,
}: MissingProps) {
  return (
    <button
      type="button"
      onClick={onMark}
      disabled={disabled}
      aria-label={`Marcar ${name || `lámina ${num}`} como obtenida`}
      style={{
        all: "unset",
        cursor: disabled ? "default" : "pointer",
        display: "block",
        position: "relative",
        aspectRatio: "3 / 4",
        borderRadius: 8,
        background: "linear-gradient(180deg, #e9e7df, #d8d6cd)",
        border: "1px dashed #b8b5ab",
        overflow: "hidden",
        filter: "saturate(0)",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "55%",
          transform: "translate(-50%, -50%)",
          width: "65%",
          height: "80%",
          background: "rgba(0,0,0,.10)",
          WebkitMask:
            "radial-gradient(circle at 50% 22%, #000 13%, transparent 14%) top/100% 35% no-repeat, radial-gradient(ellipse at 50% 75%, #000 60%, transparent 61%) bottom/100% 70% no-repeat",
          mask: "radial-gradient(circle at 50% 22%, #000 13%, transparent 14%) top/100% 35% no-repeat, radial-gradient(ellipse at 50% 75%, #000 60%, transparent 61%) bottom/100% 70% no-repeat",
        }}
      />
      <div
        className="mono"
        style={{
          position: "absolute",
          top: 6,
          left: 7,
          background: "#ffffff90",
          color: "#7c7a73",
          padding: "2px 5px",
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {num}
      </div>
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "30%",
          background: "#f1efe9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 4px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 10,
            lineHeight: 1,
            color: "#9c9a90",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {name || "—"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            color: "#bdbab0",
            marginTop: 2,
            letterSpacing: ".06em",
          }}
        >
          {pos}
        </div>
      </div>
      {/* floating + button */}
      <div
        style={{
          position: "absolute",
          top: "34%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 26,
          height: 26,
          borderRadius: 99,
          background: "#ffffff",
          border: "1.5px solid var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 0 var(--ink)",
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
    </button>
  );
}

type SlotProps = {
  num?: string | number;
  className?: string;
};

// Empty slot — dashed border, faint number, ready to be filled.
export function Slot({ num, className }: SlotProps) {
  return (
    <div className={`slot ${className ?? ""}`}>
      <span className="num">{num}</span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c0bdb3"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </div>
  );
}
