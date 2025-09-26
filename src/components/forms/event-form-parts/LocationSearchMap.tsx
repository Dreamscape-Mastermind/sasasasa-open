import React, { useEffect, useRef, useState } from "react";

const PHOTON_SEARCH_URL = "https://photon.komoot.io/api/?q=";
const PHOTON_REVERSE_URL =
  "https://photon.komoot.io/reverse?lon={lon}&lat={lat}";

interface LocationSearchMapProps {
  onSelect: (result: { name: string; lat: number; lng: number }) => void;
  initialName?: string;
  initialLat?: number;
  initialLng?: number;
}

const DEBOUNCE_DELAY = 300;

type PhotonResult = {
  main: string;
  city?: string;
  state?: string;
  lat: number;
  lng: number;
  full: string;
};

export const LocationSearchMap: React.FC<LocationSearchMapProps> = ({
  onSelect,
  initialName = "",
  initialLat,
  initialLng,
}) => {
  const [input, setInput] = useState(initialName);
  const [results, setResults] = useState<PhotonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasFocused, setHasFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [marker, setMarker] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(
    initialLat && initialLng
      ? { lat: initialLat, lng: initialLng, name: initialName || "" }
      : null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const justSelected = useRef(false);

  // Sync input value with initialName prop (for edit forms)
  useEffect(() => {
    setInput(initialName || "");
  }, [initialName]);

  // Debounced search using Photon
  useEffect(() => {
    if (!input) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetch(`${PHOTON_SEARCH_URL}${encodeURIComponent(input)}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          setResults(
            (data.features || []).map((f: any) => {
              const p = f.properties || {};
              const main =
                p.name ||
                p.street ||
                p.osm_value ||
                p.city ||
                p.country ||
                p.state ||
                "Unnamed Place";
              const city = p.city;
              const state = p.state;
              let full = main;
              if (city && !main.includes(city)) full += `, ${city}`;
              if (state && !main.includes(state)) full += `, ${state}`;
              return {
                main,
                city,
                state,
                lat: f.geometry.coordinates[1],
                lng: f.geometry.coordinates[0],
                full,
              };
            })
          );
          setLoading(false);
        })
        .catch((err) => {
          setError("Could not fetch places");
          setResults([]);
          setLoading(false);
        });
    }, DEBOUNCE_DELAY);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [input]);

  // Handle selection from dropdown or free-text
  const handleSelect = (result: PhotonResult) => {
    setInput(result.full);
    setShowDropdown(false);
    setHighlighted(-1);
    setMarker({ lat: result.lat, lng: result.lng, name: result.full });
    onSelect({ name: result.full, lat: result.lat, lng: result.lng });
    justSelected.current = true;
  };

  // Free-text fallback
  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 100); // allow click
    setHasFocused(false);
    if (input && (!marker || input !== marker.name)) {
      // Try to geocode the free text
      setLoading(true);
      fetch(`${PHOTON_SEARCH_URL}${encodeURIComponent(input)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.features && data.features.length > 0) {
            const f = data.features[0];
            const p = f.properties || {};
            const main =
              p.name ||
              p.street ||
              p.osm_value ||
              p.city ||
              p.country ||
              p.state ||
              input;
            const city = p.city;
            const state = p.state;
            let full = main;
            if (city && !main.includes(city)) full += `, ${city}`;
            if (state && !main.includes(state)) full += `, ${state}`;
            const result = {
              main,
              city,
              state,
              lat: f.geometry.coordinates[1],
              lng: f.geometry.coordinates[0],
              full,
            };
            setMarker({ lat: result.lat, lng: result.lng, name: result.full });
            onSelect({ name: result.full, lat: result.lat, lng: result.lng });
          } else {
            // No geocode found, just return name
            setMarker(null);
            onSelect({ name: input, lat: NaN, lng: NaN });
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setMarker(null);
          onSelect({ name: input, lat: NaN, lng: NaN });
        });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlighted >= 0 && highlighted < results.length) {
        handleSelect(results[highlighted]);
      } else if (input) {
        handleBlur();
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // Show dropdown on focus if there are results
  const handleFocus = () => {
    setHasFocused(true);
    if (results.length > 0) setShowDropdown(true);
  };

  // Show dropdown as results update
  useEffect(() => {
    if (justSelected.current) {
      justSelected.current = false;
      setShowDropdown(false);
      return;
    }
    if (hasFocused && results.length > 0) setShowDropdown(true);
    else setShowDropdown(false);
  }, [results, hasFocused]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 500,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search for a place..."
        className="bg-card rounded-lg w-full"
        aria-autocomplete="list"
        aria-controls="places-dropdown"
        aria-activedescendant={
          highlighted >= 0 ? `place-${highlighted}` : undefined
        }
      />
      {/* Loading spinner */}
      {loading && (
        <span
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 18,
              border: "2px solid #ccc",
              borderTop: "2px solid #888",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              background: "transparent",
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </span>
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            left: 8,
            top: 10,
            fontSize: 12,
            color: "#c00",
          }}
        >
          {error}
        </div>
      )}
      {showDropdown && results.length > 0 && (
        <ul
          ref={resultsRef}
          id="places-dropdown"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            background: "white",
            border: "1px solid #eee",
            borderRadius: 6,
            maxHeight: 180,
            overflowY: "auto",
            position: "absolute",
            zIndex: 9999,
            width: "100%",
            top: 40,
            left: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {results.map((r, i) => (
            <li
              id={`place-${i}`}
              key={r.full + i}
              onMouseDown={() => handleSelect(r)}
              style={{
                padding: 8,
                cursor: "pointer",
                background: highlighted === i ? "#f0f0f0" : "white",
                color: "#222",
                fontWeight: highlighted === i ? 600 : 400,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span style={{ fontSize: 15 }}>{r.main}</span>
              {(r.city || r.state) && (
                <span style={{ fontSize: 12, color: "#888" }}>
                  {r.city}
                  {r.city && r.state ? ", " : ""}
                  {r.state}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchMap;
