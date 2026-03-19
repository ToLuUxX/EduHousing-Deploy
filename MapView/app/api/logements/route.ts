import { NextRequest, NextResponse } from "next/server";
import { getPgPool } from "@/lib/db";
import { HousingListing } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_TABLE = "logements";

function asNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

type DbLogementRow = {
  id: string | number | null;
  title: string | null;
  city: string | null;
  country: string | null;
  price: number | string | null;
  lat: number | string | null;
  lon: number | string | null;
  image_url: string | null;
};

function toListing(row: DbLogementRow, index: number): HousingListing | null {
  const lat = asNumber(row.lat);
  const lon = asNumber(row.lon);
  if (lat === null || lon === null) {
    return null;
  }

  const id = String(row.id ?? `listing-${index}`);
  const city = row.city ? String(row.city) : "";
  const title = row.title ? String(row.title) : `${city || "Logement"}`;
  const price = asNumber(row.price);

  return {
    id,
    title,
    city,
    country: row.country ? String(row.country) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    price: price ?? undefined,
    lat,
    lon,
  };
}

function safeTableRef(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$/.test(name)) {
    throw new Error("Nom de table invalide. Utilise 'logements' ou 'schema.logements'.");
  }
  return name
    .split(".")
    .map((part) => `"${part}"`)
    .join(".");
}

export async function GET(req: NextRequest) {
  const cityQuery = req.nextUrl.searchParams.get("city")?.trim();
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? "250"), 500);

  if (!cityQuery) {
    return NextResponse.json({ listings: [] as HousingListing[] });
  }

  try {
    const pgPool = getPgPool();
    const tableRef = safeTableRef(process.env.PG_LOGEMENTS_TABLE || DEFAULT_TABLE);

    const sql = `
      SELECT
        id,
        "titre" AS title,
        "ville" AS city,
        "pays" AS country,
        "prix" AS price,
        "latitude" AS lat,
        "longitude" AS lon,
        "image_url" AS image_url
      FROM ${tableRef}
      WHERE lower("ville") LIKE lower($1)
      AND lower(coalesce("pays", 'france')) IN ('france', 'fr')
      LIMIT $2;
    `;

    const { rows } = await pgPool.query<DbLogementRow>(sql, [`%${cityQuery}%`, limit]);

    const listings = rows
      .map((row, index) => toListing(row, index))
      .filter((listing): listing is HousingListing => listing !== null);

    return NextResponse.json({ listings });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[/api/logements] ", message);
    return NextResponse.json(
      {
        error: "Impossible de charger les logements.",
        details: message,
      },
      { status: 500 }
    );
  }
}
