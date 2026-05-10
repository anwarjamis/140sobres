import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GROUPS: Record<string, string[]> = {
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
};

type SeedRow = {
  code: string;
  number: number;
  section: "SPECIAL" | "FWC" | "COUNTRY";
  teamCode: string;
  group: string | null;
};

function buildRows(): SeedRow[] {
  const rows: SeedRow[] = [];

  // 1 special sticker
  rows.push({
    code: "00",
    number: 0,
    section: "SPECIAL",
    teamCode: "00",
    group: null,
  });

  // 19 FIFA World Cup stickers (FWC1 .. FWC19)
  for (let n = 1; n <= 19; n++) {
    rows.push({
      code: `FWC${n}`,
      number: n,
      section: "FWC",
      teamCode: "FWC",
      group: null,
    });
  }

  // 48 country teams × 20 stickers each = 960
  for (const [group, teams] of Object.entries(GROUPS)) {
    for (const team of teams) {
      for (let n = 1; n <= 20; n++) {
        rows.push({
          code: `${team}${n}`,
          number: n,
          section: "COUNTRY",
          teamCode: team,
          group,
        });
      }
    }
  }

  return rows;
}

async function main() {
  const rows = buildRows();

  if (rows.length !== 980) {
    throw new Error(`Expected 980 rows, got ${rows.length}`);
  }

  console.log(`Seeding ${rows.length} stickers…`);

  // Idempotent: upsert by unique code so re-running the seed is safe.
  for (const row of rows) {
    await prisma.sticker.upsert({
      where: { code: row.code },
      create: row,
      update: {
        number: row.number,
        section: row.section,
        teamCode: row.teamCode,
        group: row.group,
      },
    });
  }

  const counts = {
    total: await prisma.sticker.count(),
    special: await prisma.sticker.count({ where: { section: "SPECIAL" } }),
    fwc: await prisma.sticker.count({ where: { section: "FWC" } }),
    country: await prisma.sticker.count({ where: { section: "COUNTRY" } }),
  };
  console.log("Done:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
