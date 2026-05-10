// Source of truth for the 48 World Cup 2026 country codes by group.
// Used both at seed time and at runtime (e.g. building the album view).

export const GROUPS: Record<string, readonly string[]> = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "IRQ", "NOR"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"],
} as const;

export const GROUP_LETTERS = Object.keys(GROUPS) as (keyof typeof GROUPS)[];

// Country code → human-readable Spanish name.
// Add to this map when we get the canonical localized list.
export const COUNTRY_NAMES: Record<string, string> = {
  MEX: "México",
  RSA: "Sudáfrica",
  KOR: "Corea del Sur",
  CZE: "República Checa",
  CAN: "Canadá",
  BIH: "Bosnia",
  QAT: "Qatar",
  SUI: "Suiza",
  BRA: "Brasil",
  MAR: "Marruecos",
  HAI: "Haití",
  SCO: "Escocia",
  USA: "Estados Unidos",
  PAR: "Paraguay",
  AUS: "Australia",
  TUR: "Turquía",
  GER: "Alemania",
  CUW: "Curazao",
  CIV: "Costa de Marfil",
  ECU: "Ecuador",
  NED: "Países Bajos",
  JPN: "Japón",
  SWE: "Suecia",
  TUN: "Túnez",
  BEL: "Bélgica",
  EGY: "Egipto",
  IRN: "Irán",
  NZL: "Nueva Zelanda",
  ESP: "España",
  CPV: "Cabo Verde",
  KSA: "Arabia Saudita",
  URU: "Uruguay",
  FRA: "Francia",
  SEN: "Senegal",
  IRQ: "Irak",
  NOR: "Noruega",
  ARG: "Argentina",
  ALG: "Argelia",
  AUT: "Austria",
  JOR: "Jordania",
  POR: "Portugal",
  COD: "RD del Congo",
  UZB: "Uzbekistán",
  COL: "Colombia",
  ENG: "Inglaterra",
  CRO: "Croacia",
  GHA: "Ghana",
  PAN: "Panamá",
};

export function groupOf(teamCode: string): keyof typeof GROUPS | null {
  for (const [g, teams] of Object.entries(GROUPS)) {
    if ((teams as readonly string[]).includes(teamCode))
      return g as keyof typeof GROUPS;
  }
  return null;
}

// Country code → flag color (CSS var or hex). Used as a placeholder
// flag-blob and as the sticker accent color until real flag artwork ships.
export const COUNTRY_COLORS: Record<string, string> = {
  // Group A
  MEX: "var(--green)",
  RSA: "var(--yellow)",
  KOR: "var(--red)",
  CZE: "var(--red)",
  // Group B
  CAN: "var(--red)",
  BIH: "var(--blue)",
  QAT: "var(--purple)",
  SUI: "var(--red)",
  // Group C
  BRA: "var(--yellow)",
  MAR: "var(--orange)",
  HAI: "var(--blue)",
  SCO: "var(--blue)",
  // Group D
  USA: "var(--blue)",
  PAR: "var(--red)",
  AUS: "var(--yellow)",
  TUR: "var(--red)",
  // Group E
  GER: "var(--ink)",
  CUW: "var(--blue)",
  CIV: "var(--orange)",
  ECU: "var(--yellow)",
  // Group F
  NED: "var(--orange)",
  JPN: "#fafafa",
  SWE: "var(--blue)",
  TUN: "var(--red)",
  // Group G
  BEL: "var(--red)",
  EGY: "var(--red)",
  IRN: "var(--green)",
  NZL: "var(--ink)",
  // Group H
  ESP: "var(--red)",
  CPV: "var(--blue)",
  KSA: "var(--green)",
  URU: "var(--blue)",
  // Group I
  FRA: "var(--blue)",
  SEN: "var(--green)",
  IRQ: "var(--red)",
  NOR: "var(--red)",
  // Group J
  ARG: "var(--blue)",
  ALG: "var(--green)",
  AUT: "var(--red)",
  JOR: "var(--ink)",
  // Group K
  POR: "var(--purple)",
  COD: "var(--blue)",
  UZB: "var(--blue)",
  COL: "var(--yellow)",
  // Group L
  ENG: "#fafafa",
  CRO: "var(--red)",
  GHA: "var(--green)",
  PAN: "var(--red)",
};

export function colorOf(teamCode: string): string {
  return COUNTRY_COLORS[teamCode] ?? "var(--blue)";
}
