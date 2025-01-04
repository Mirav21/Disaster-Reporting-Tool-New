import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  onCoordinatesChange?: (lat: number | null, lng: number | null) => void;
}

interface Suggestion {
  place_name: string;
  center: [number, number];
}

interface GeocodingFeature {
  place_type: string[];
  id: string;
  place_name?: string;
  center?: [number, number];
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
}

const createMarkerElement = () => {
  const el = document.createElement("div");

  el.style.width = "32px";
  el.style.height = "42px";

  el.innerHTML = `
    <svg width="32" height="42" viewBox="0 0 384 512" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z" 
            fill="#ff4444"/>
    </svg>
  `;

  el.style.cursor = "pointer";
  el.style.position = "relative";
  el.className = "custom-marker";
  return el;
};

export function LocationInput({
  value,
  onChange,
  onCoordinatesChange,
}: LocationInputProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const watchId = useRef<number | null>(null);

  const getLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const {
            latitude,
            longitude,
            accuracy: locationAccuracy,
          } = position.coords;

          if (!accuracy || locationAccuracy < accuracy) {
            setAccuracy(locationAccuracy);
            updateLocation([longitude, latitude]);

            if (locationAccuracy < 20) {
              navigator.geolocation.clearWatch(watchId.current!);
              watchId.current = null;
            }
          }
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              throw new Error(
                "Please allow location access in your browser settings"
              );
            case error.POSITION_UNAVAILABLE:
              throw new Error("Location information is unavailable");
            case error.TIMEOUT:
              throw new Error("Location request timed out");
            default:
              throw new Error("An unknown error occurred");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Location error:", error);
      setLocationError(
        error instanceof Error ? error.message : "Unable to get your location"
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const updateLocation = async (newCoordinates: [number, number]) => {
    setCoordinates(newCoordinates);
    onCoordinatesChange?.(newCoordinates[1], newCoordinates[0]);
    onChange(
      `${newCoordinates[1].toFixed(6)}, ${newCoordinates[0].toFixed(6)}`
    );
    fetchAddress(newCoordinates[1], newCoordinates[0]);

    if (mapRef.current) {
      mapRef.current.flyTo({
        center: newCoordinates,
        zoom: 14,
      });
    }

    if (markerRef.current) {
      markerRef.current.setLngLat(newCoordinates);
    }
  };

  const fetchAddress = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&types=address,place`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const addressFeature =
          data.features.find((f: GeocodingFeature) =>
            f.place_type.includes("address")
          ) || data.features[0];
        setAddress(addressFeature.place_name);
      } else {
        setAddress("Unable to fetch address");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddress("Unable to fetch address");
    }
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${mapboxgl.accessToken}&types=address`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  useEffect(() => {
    if (coordinates && mapContainerRef.current) {
      const [lng, lat] = coordinates;

      if (!mapRef.current) {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/streets-v11",
          center: [lng, lat],
          zoom: 14,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (!markerRef.current) {
            const marker = new mapboxgl.Marker({
              element: createMarkerElement(),
              draggable: true,
              anchor: "bottom",
            })
              .setLngLat([lng, lat])
              .addTo(map);

            markerRef.current = marker;

            marker.on("dragend", () => {
              const lngLat = marker.getLngLat();
              updateLocation([lngLat.lng, lngLat.lat]);
            });
          }
        });

        map.on("click", (e) => {
          const newCoords: [number, number] = [e.lngLat.lng, e.lngLat.lat];
          updateLocation(newCoords);
        });
      } else {
        if (markerRef.current) {
          markerRef.current.setLngLat([lng, lat]);
        }
      }

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markerRef.current = null;
        }
      };
    }
  }, [coordinates]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-400">
        Location
      </label>
      <div className="relative" ref={inputRef}>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            fetchSuggestions(e.target.value);
            setShowSuggestions(true);
            setCoordinates(null);
            setAddress(null);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Enter location or use map"
          className="w-full rounded-xl bg-zinc-900/50 border border-zinc-800 pl-4 pr-12 py-3.5
                     text-white transition-colors duration-200
                     focus:outline-none focus:ring-2 focus:ring-sky-500/40"
        />
        <button
          type="button"
          onClick={getLocation}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5
                   rounded-lg bg-sky-500/10 text-sky-400 
                   hover:bg-sky-500/20 transition-colors duration-200
                   disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isGettingLocation}
          title="Get current location"
        >
          {isGettingLocation ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
        {accuracy && (
          <div className="absolute -bottom-6 right-0 text-xs text-zinc-400">
            Accuracy: ±{Math.round(accuracy)}m
          </div>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-zinc-800 border border-zinc-700 rounded-b-xl mt-1 max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-zinc-700 cursor-pointer text-white"
                onClick={() => {
                  onChange(suggestion.place_name);
                  setShowSuggestions(false);
                  updateLocation(suggestion.center);
                }}
              >
                {suggestion.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {locationError && (
        <p className="text-sm text-red-400 flex items-center gap-2">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          {locationError}
        </p>
      )}
      {coordinates && (
        <>
          <div className="relative w-full h-64 rounded-xl overflow-hidden">
            <div ref={mapContainerRef} className="w-full h-full" />
            <div className="absolute bottom-2 left-2 bg-zinc-900/90 text-white text-xs px-2 py-1 rounded">
              Click map or drag pin to set location
            </div>
          </div>
          <p className="text-sm text-white mt-2">
            Address: {address || "Loading..."}
          </p>
        </>
      )}
    </div>
  );
}
