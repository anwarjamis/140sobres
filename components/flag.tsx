import { flagEmoji } from "@/lib/groups";

type Props = {
  code?: string;   // FIFA 3-letter code → emoji flag
  color?: string;  // fallback colored rectangle
  w?: number;
  h?: number;
  className?: string;
};

export function Flag({
  code,
  color = "var(--blue)",
  w = 22,
  h = 15,
  className,
}: Props) {
  const emoji = code ? flagEmoji(code) : null;

  if (emoji) {
    return (
      <span
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: w,
          height: h,
          fontSize: Math.round(Math.min(w, h) * 1.35),
          lineHeight: 1,
          flex: "none",
        }}
      >
        {emoji}
      </span>
    );
  }

  // Fallback: colored rectangle (used for FWC / 00 / unknown codes)
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        width: w,
        height: h,
        background: color,
        border: "1px solid var(--ink)",
        borderRadius: 3,
        flex: "none",
      }}
    />
  );
}
