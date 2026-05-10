type Props = {
  size?: number;
  className?: string;
};

export function Logo({ size = 18, className }: Props) {
  return (
    <span
      className={`display ${className ?? ""}`}
      style={{
        fontSize: size,
        letterSpacing: "-0.04em",
      }}
    >
      <span style={{ color: "var(--red)" }}>140</span>
      sobres
      <span style={{ color: "var(--purple)" }}>.</span>
    </span>
  );
}
