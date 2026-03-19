"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SearchResult, MapLocation } from "@/types";

interface SearchBarProps {
  onSelect: (location: MapLocation) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (value: string) => {
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&addressdetails=1&limit=8&countrycodes=fr&bounded=1&viewbox=-5.5,51.5,9.8,41.0`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data: SearchResult[] = await res.json();
      const frenchResults = data.filter((item) => item.address?.country_code?.toLowerCase() === "fr");
      setResults(frenchResults);
      setOpen(frenchResults.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 350);
  };

  const handleSelect = (result: SearchResult) => {
    const city =
      result.address?.city ||
      result.address?.town ||
      result.address?.village ||
      result.display_name.split(",")[0];

    const country = result.address?.country || "";
    const name = country ? `${city}, ${country}` : city;

    setQuery(city);
    setOpen(false);
    onSelect({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name,
      country,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="search-wrapper">
      <div className={`search-box ${focused ? "focused" : ""}`}>
        <span className="search-icon">
          {loading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="31.4" strokeDashoffset="10">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
              </circle>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
          )}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); if (results.length > 0) setOpen(true); }}
          placeholder="Rechercher une ville en France…"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            className="clear-btn"
            onClick={() => { setQuery(""); setResults([]); setOpen(false); inputRef.current?.focus(); }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="dropdown">
          {results.map((r) => {
            const city =
              r.address?.city || r.address?.town || r.address?.village || r.display_name.split(",")[0];
            const country = r.address?.country || "";
            const sub = r.display_name.split(",").slice(1, 3).join(",").trim();
            return (
              <li key={r.place_id} onMouseDown={() => handleSelect(r)}>
                <span className="result-pin">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </span>
                <span className="result-text">
                  <strong>{city}</strong>
                  {sub && <small>{sub}</small>}
                </span>
                {country && (
                  <span className="result-country">
                    {r.address?.country_code?.toUpperCase()}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <style jsx>{`
        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          font-family: 'Sora', sans-serif;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1.5px solid #d6dde8;
          border-radius: 16px;
          padding: 0 16px;
          height: 52px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .search-box.focused {
          border-color: #64a9ff;
          box-shadow: 0 0 0 3px rgba(100, 169, 255, 0.18);
        }

        .search-icon {
          color: #94a3b8;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .search-box.focused .search-icon {
          color: #1976d2;
        }

        input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #0f172a;
          font-size: 15px;
          font-family: inherit;
          letter-spacing: 0.01em;
        }

        input::placeholder {
          color: #94a3b8;
        }

        .clear-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 50%;
          transition: color 0.15s, background 0.15s;
        }

        .clear-btn:hover {
          color: #0f172a;
          background: #eef2f7;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          list-style: none;
          margin: 0;
          padding: 4px;
          z-index: 9999;
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.15);
          animation: dropIn 0.15s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown li {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.12s;
        }

        .dropdown li:hover {
          background: #f1f7ff;
        }

        .result-pin {
          color: #3b82f6;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .result-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1px;
          overflow: hidden;
        }

        .result-text strong {
          font-size: 13.5px;
          color: #0f172a;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-text small {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .result-country {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #2563eb;
          background: #eaf2ff;
          border: 1px solid #cfe0ff;
          border-radius: 4px;
          padding: 2px 5px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
