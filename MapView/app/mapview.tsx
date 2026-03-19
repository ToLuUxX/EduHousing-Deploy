"use client";

import { useEffect, useRef, useState } from "react";
import { HousingListing, MapLocation } from "@/types";

interface MapViewProps {
  location: MapLocation | null;
  listings: HousingListing[];
}

type MapLibreWindow = Window & {
  maplibregl?: any;
};

const MAPLIBRE_SCRIPT_ID = "maplibre-gl-script";
const OPENFREEMAP_STYLE_URL =
  process.env.NEXT_PUBLIC_OPENFREEMAP_STYLE_URL || "https://tiles.openfreemap.org/styles/liberty";
const FRANCE_CENTER: [number, number] = [1.888334, 46.603354];
const FRANCE_BOUNDS: [[number, number], [number, number]] = [
  [-5.5, 41.0],
  [9.8, 51.5],
];

function loadMapLibre(): Promise<any> {
  return new Promise((resolve, reject) => {
    const mapWindow = window as MapLibreWindow;

    if (mapWindow.maplibregl) {
      resolve(mapWindow.maplibregl);
      return;
    }

    const existing = document.getElementById(MAPLIBRE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        if (mapWindow.maplibregl) {
          resolve(mapWindow.maplibregl);
          return;
        }
        reject(new Error("MapLibre n'est pas disponible apres le chargement."));
      });
      existing.addEventListener("error", () => reject(new Error("Echec de chargement de MapLibre.")));
      return;
    }

    const script = document.createElement("script");
    script.id = MAPLIBRE_SCRIPT_ID;
    script.src = "https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (mapWindow.maplibregl) {
        resolve(mapWindow.maplibregl);
        return;
      }
      reject(new Error("MapLibre n'est pas disponible apres le chargement."));
    };
    script.onerror = () => reject(new Error("Echec de chargement de MapLibre."));
    document.head.appendChild(script);
  });
}

export default function MapView({ location, listings }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const listingMarkersRef = useRef<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let cancelled = false;

    loadMapLibre()
      .then((maplibregl) => {
        if (!mapRef.current || cancelled) return;

        const map = new maplibregl.Map({
          container: mapRef.current,
          style: OPENFREEMAP_STYLE_URL,
          center: FRANCE_CENTER,
          zoom: 6,
          minZoom: 5,
          maxBounds: FRANCE_BOUNDS,
          attributionControl: true,
        });

        map.addControl(new maplibregl.NavigationControl(), "bottom-right");
        map.fitBounds(FRANCE_BOUNDS, { padding: 20, duration: 0 });
        mapInstanceRef.current = map;
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setErrorMessage(
            `${error.message} Verifie NEXT_PUBLIC_OPENFREEMAP_STYLE_URL si besoin.`
          );
        }
      });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!location || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const maplibregl = (window as MapLibreWindow).maplibregl;
    if (!maplibregl) return;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const popup = new maplibregl.Popup({ offset: 20 }).setHTML(
      `<div style="font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; color: #1a202c;">📍 ${location.name}</div>`
    );

    markerRef.current = new maplibregl.Marker({ color: "#1976d2" })
      .setLngLat([location.lon, location.lat])
      .setPopup(popup)
      .addTo(map);

    map.flyTo({
      center: [location.lon, location.lat],
      zoom: 10,
      speed: 0.9,
      curve: 1.1,
      essential: true,
    });
    markerRef.current.togglePopup();
  }, [location]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const maplibregl = (window as MapLibreWindow).maplibregl;
    if (!maplibregl) return;

    listingMarkersRef.current.forEach((marker) => marker.remove());
    listingMarkersRef.current = [];

    if (!listings.length) return;

    const bounds = new maplibregl.LngLatBounds();

    const markers = listings.map((listing) => {
      const priceText = listing.price !== undefined ? `${listing.price.toLocaleString("fr-FR")} €` : "Prix N/A";
      const imageBlock = listing.imageUrl
        ? `<img src="${listing.imageUrl}" alt="${listing.title}" style="width:100%;height:95px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
        : "";
      const popupHtml = `
        <div style="font-family:'Sora',sans-serif;min-width:180px;">
          ${imageBlock}
          <div style="font-size:13px;font-weight:700;color:#0f172a;">${listing.title}</div>
          <div style="font-size:12px;color:#334155;margin-top:4px;">${listing.city}${listing.country ? `, ${listing.country}` : ""}</div>
          <div style="font-size:13px;font-weight:700;color:#16a34a;margin-top:6px;">${priceText}</div>
        </div>
      `;

      const marker = new maplibregl.Marker({ color: "#ef4444" })
        .setLngLat([listing.lon, listing.lat])
        .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(popupHtml))
        .addTo(map);

      bounds.extend([listing.lon, listing.lat]);
      return marker;
    });

    listingMarkersRef.current = markers;

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 700 });
    }
  }, [listings]);

  return (
    <div className="map-root">
      <div ref={mapRef} className="map-canvas" />
      {errorMessage && (
        <div className="map-error">
          <p>{errorMessage}</p>
        </div>
      )}
      <style jsx>{`
        .map-root {
          position: relative;
          width: 100%;
          height: 100%;
          background: #edf5ff;
        }

        .map-canvas {
          width: 100%;
          height: 100%;
        }

        .map-error {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          color: #0f172a;
          font-size: 14px;
          font-weight: 500;
          z-index: 10;
        }

        .map-error p {
          margin: 0;
          max-width: 520px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
