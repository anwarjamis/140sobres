type Props = {
  items?: string[];
  className?: string;
};

const DEFAULT_ITEMS = [
  "★ MUNDIAL 26",
  "· INTERCAMBIA SIN REPES",
  "· MAKE THE ALBUM YOURS",
  "★",
];

// Black bar with horizontally scrolling text. Doubled content keeps the
// loop seamless.
export function Ticker({ items = DEFAULT_ITEMS, className }: Props) {
  const all = [...items, ...items, ...items, ...items];
  return (
    <div className={`ticker overflow-hidden ${className ?? ""}`}>
      <div className="ticker-track">
        {all.map((t, i) => (
          <span key={i} className="px-2">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
