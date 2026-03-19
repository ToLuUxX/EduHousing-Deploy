export interface MapLocation {
  lat: number
  lon: number
  name: string
  country: string
}

export interface NominatimResult {
  place_id: number
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    village?: string
    country?: string
    country_code?: string
  }
}

export interface HousingListing {
  id: string
  title: string
  city: string
  country?: string
  imageUrl?: string
  price?: number
  lat: number
  lon: number
}
