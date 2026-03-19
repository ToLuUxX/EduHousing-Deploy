"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { HousingListing, MapLocation } from "@/types";
import SearchBar from "@/app/searchbar";

// Import dynamique pour éviter le SSR côté carte
const MapView = dynamic(() => import("@/app/mapview"), { ssr: false });

export default function Home() {
  const [location, setLocation] = useState<MapLocation | null>(null);
  const [listings, setListings] = useState<HousingListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    function handleReset() {
      setLocation(null);
      setListings([]);
    }
    window.addEventListener("reset-map", handleReset);
    return () => window.removeEventListener("reset-map", handleReset);
  }, []);

  useEffect(() => {
    if (!location?.name) {
      setListings([]);
      return;
    }

    const controller = new AbortController();
    const cityQuery = location.name.split(",")[0]?.trim() || location.name;

    async function loadListings() {
      setLoadingListings(true);
      try {
        const res = await fetch(`/api/logements?city=${encodeURIComponent(cityQuery)}&limit=250`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setListings([]);
          return;
        }
        const data = (await res.json()) as { listings?: HousingListing[] };
        setListings(Array.isArray(data.listings) ? data.listings : []);
      } catch {
        if (!controller.signal.aborted) {
          setListings([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingListings(false);
        }
      }
    }

    loadListings();
    return () => controller.abort();
  }, [location]);

  return (
    <main className="app">
      <div className="app-shell">
        {/* Header */}
        <header className="app-header">
          <SearchBar onSelect={setLocation} />
          <div className="header-right">
            {location && (
              <div className="location-badge">
                <span className="badge-dot" />
                <span>
                  {location.name}
                  {loadingListings ? " • chargement..." : ` • ${listings.length} logement(s)`}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Map container */}
        <div className="map-container">
          <MapView location={location} listings={listings} />
        </div>
      </div>

      <style jsx>{`
        .app {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          height: calc(100vh - 60px);
          background: #f8fafc;
          font-family: 'Sora', sans-serif;
          box-sizing: border-box;
        }

        .app-shell {
          width: min(1200px, 100%);
          height: min(860px, calc(100vh - 60px - 56px));
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 26px;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 12px 24px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
          z-index: 1000;
        }

        .header-right {
          flex-shrink: 0;
          min-width: 160px;
          display: flex;
          justify-content: flex-end;
        }

        .location-badge {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: #334155;
          background: #f1f7ff;
          border: 1px solid #cde3ff;
          border-radius: 20px;
          padding: 5px 12px;
          animation: fadeIn 0.3s ease;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1976d2;
          box-shadow: 0 0 6px rgba(25, 118, 210, 0.7);
          flex-shrink: 0;
          animation: blink 2s ease infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .map-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          margin: 14px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
        }

        @media (max-width: 640px) {
          .app {
            padding: 12px;
          }
          .app-shell {
            height: calc(100vh - 60px - 24px);
            border-radius: 18px;
          }
          .app-header {
            padding: 10px 14px;
            gap: 10px;
          }
          .header-right {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
