import { NextRequest, NextResponse } from 'next/server'
import { getPgPool } from '@/lib/db'
import type { HousingListing } from '@/types/housing'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_TABLE = 'logements'

function asNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

type DbRow = {
  id: string | number | null
  title: string | null
  city: string | null
  country: string | null
  price: number | string | null
  lat: number | string | null
  lon: number | string | null
  image_url: string | null
  type_logement: string | null
  surface: number | string | null
  nb_pieces: number | string | null
  meuble: boolean | null
  disponible_le: string | Date | null
  description: string | null
  adresse: string | null
}

function toListing(row: DbRow, index: number): HousingListing | null {
  const lat = asNumber(row.lat)
  const lon = asNumber(row.lon)
  if (lat === null || lon === null) return null

  let available_from: string | undefined = undefined
  if (row.disponible_le) {
    if (row.disponible_le instanceof Date) {
      available_from = row.disponible_le.toISOString().slice(0, 10)
    } else {
      const d = new Date(row.disponible_le)
      available_from = Number.isNaN(d.getTime())
        ? String(row.disponible_le)
        : d.toISOString().slice(0, 10)
    }
  }

  return {
    id: String(row.id ?? `listing-${index}`),
    title: row.title ? String(row.title) : String(row.city ?? 'Logement'),
    city: row.city ? String(row.city) : '',
    country: row.country ? String(row.country) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    price: asNumber(row.price) ?? undefined,
    lat,
    lon,
    type: row.type_logement ? String(row.type_logement) : undefined,
    surface: asNumber(row.surface) ?? undefined,
    rooms: asNumber(row.nb_pieces) ?? undefined,
    furnished: row.meuble != null ? Boolean(row.meuble) : undefined,
    available_from,
    description: row.description ? String(row.description) : undefined,
    address: row.adresse ? String(row.adresse) : undefined,
  }
}

function safeTableRef(name: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)?$/.test(name)) {
    throw new Error('Invalid table name.')
  }
  return name.split('.').map((p) => `"${p}"`).join('.')
}

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')?.trim()
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') ?? '250'), 500)

  if (!city) return NextResponse.json({ listings: [] })

  try {
    const pool = getPgPool()
    const tableRef = safeTableRef(process.env.PG_LOGEMENTS_TABLE ?? DEFAULT_TABLE)

    const sql = `
      SELECT
        id,
        "titre"          AS title,
        "ville"          AS city,
        "pays"           AS country,
        "prix"           AS price,
        "latitude"       AS lat,
        "longitude"      AS lon,
        "image_url"      AS image_url,
        "type_logement"  AS type_logement,
        "surface"        AS surface,
        "nb_pieces"      AS nb_pieces,
        "meuble"         AS meuble,
        "disponible_le"  AS disponible_le,
        "description"    AS description,
        "adresse"        AS adresse
      FROM ${tableRef}
      WHERE lower("ville") LIKE lower($1)
      AND lower(coalesce("pays", 'france')) IN ('france', 'fr')
      LIMIT $2;
    `

    const { rows } = await pool.query<DbRow>(sql, [`%${city}%`, limit])
    const listings = rows
      .map((row, i) => toListing(row, i))
      .filter((l): l is HousingListing => l !== null)

    return NextResponse.json({ listings })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[/api/logements]', message)
    return NextResponse.json(
      { error: 'Impossible de charger les logements.', details: message },
      { status: 500 }
    )
  }
}
