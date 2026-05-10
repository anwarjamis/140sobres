type Props = {
  color?: string;
  w?: number;
  h?: number;
  className?: string;
};

// Placeholder flag — colored rounded rectangle with ink border.
// Will be replaced with real flag art when assets ship.
export function Flag({
  color = "var(--blue)",
  w = 22,
  h = 15,
  className,
}: Props) {
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
