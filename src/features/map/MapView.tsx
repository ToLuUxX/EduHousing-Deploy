'use client'

import { useEffect, useRef, useState } from 'react'
import type { HousingListing, MapLocation } from '@/types/housing'

interface MapViewProps {
  location: MapLocation | null
  listings: HousingListing[]
}

type MapLibreWindow = Window & { maplibregl?: any }

const SCRIPT_ID = 'maplibre-gl-script'
const STYLE_URL =
  process.env.NEXT_PUBLIC_OPENFREEMAP_STYLE_URL ||
  'https://tiles.openfreemap.org/styles/liberty'
const FRANCE_CENTER: [number, number] = [1.888334, 46.603354]
const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [-5.5, 41.0],
  [9.8, 51.5],
]

function loadMapLibre(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as MapLibreWindow
    if (w.maplibregl) return resolve(w.maplibregl)

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () =>
        w.maplibregl ? resolve(w.maplibregl) : reject(new Error('MapLibre unavailable'))
      )
      existing.addEventListener('error', () => reject(new Error('MapLibre load failed')))
      return
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js'
    script.async = true
    script.onload = () =>
      w.maplibregl ? resolve(w.maplibregl) : reject(new Error('MapLibre unavailable'))
    script.onerror = () => reject(new Error('MapLibre load failed'))
    document.head.appendChild(script)

    // Inject CSS once
    if (!document.getElementById('maplibre-gl-css')) {
      const link = document.createElement('link')
      link.id = 'maplibre-gl-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'
      document.head.appendChild(link)
    }
  })
}

export default function MapView({ location, listings }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const listingMarkersRef = useRef<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    let cancelled = false

    loadMapLibre()
      .then((mgl) => {
        if (!mapRef.current || cancelled) return
        const map = new mgl.Map({
          container: mapRef.current,
          style: STYLE_URL,
          center: FRANCE_CENTER,
          zoom: 5.5,
          minZoom: 4,
          maxBounds: FRANCE_BOUNDS,
        })
        map.addControl(new mgl.NavigationControl(), 'bottom-right')
        map.fitBounds(FRANCE_BOUNDS, { padding: 20, duration: 0 })
        mapInstanceRef.current = map
        // Signal that the map instance is ready so pending fly-to can run
        if (!cancelled) setMapReady(true)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Fly to searched location — depends on mapReady so it also fires after async map init
  useEffect(() => {
    if (!location || !mapInstanceRef.current) return
    const mgl = (window as MapLibreWindow).maplibregl
    if (!mgl) return

    markerRef.current?.remove()
    const popup = new mgl.Popup({ offset: 20 }).setHTML(
      `<div style="font-family:'Sora',sans-serif;font-size:13px;font-weight:600;color:#0f172a;">📍 ${location.name}</div>`
    )
    markerRef.current = new mgl.Marker({ color: '#1976d2' })
      .setLngLat([location.lon, location.lat])
      .setPopup(popup)
      .addTo(mapInstanceRef.current)

    mapInstanceRef.current.flyTo({
      center: [location.lon, location.lat],
      zoom: 11,
      speed: 0.9,
      curve: 1.1,
      essential: true,
    })
    markerRef.current.togglePopup()
  }, [location, mapReady])

  // Render listing markers
  useEffect(() => {
    if (!mapInstanceRef.current) return
    const mgl = (window as MapLibreWindow).maplibregl
    if (!mgl) return

    listingMarkersRef.current.forEach((m) => m.remove())
    listingMarkersRef.current = []
    if (!listings.length) return

    const bounds = new mgl.LngLatBounds()

    listingMarkersRef.current = listings.map((l) => {
      const priceText = l.price != null ? `${l.price.toLocaleString('fr-FR')} €` : 'Prix N/A'
      const imgHtml = l.imageUrl
        ? `<img src="${l.imageUrl}" alt="${l.title}" style="width:100%;height:90px;object-fit:cover;border-radius:8px;margin-bottom:6px;" />`
        : ''
      const popup = new mgl.Popup({ offset: 20 }).setHTML(`
        <div style="font-family:'Sora',sans-serif;min-width:180px;max-width:220px;">
          ${imgHtml}
          <div style="font-size:13px;font-weight:700;color:#0f172a;">${l.title}</div>
          <div style="font-size:12px;color:#334155;margin-top:3px;">${l.city}</div>
          <div style="font-size:13px;font-weight:700;color:#16a34a;margin-top:5px;">${priceText}</div>
        </div>
      `)
      const marker = new mgl.Marker({ color: '#ef4444' })
        .setLngLat([l.lon, l.lat])
        .setPopup(popup)
        .addTo(mapInstanceRef.current)
      bounds.extend([l.lon, l.lat])
      return marker
    })

    if (!bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 700 })
    }
  }, [listings, mapReady])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#edf5ff' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {error && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.9)', color: '#0f172a', fontSize: 14, padding: 24, textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </div>
  )
}
