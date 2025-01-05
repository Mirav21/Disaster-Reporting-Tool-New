"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  MapPin,
  Thermometer,
  Droplets,
  Wind,
  Cloud,
  Navigation,
  Search,
  ArrowUpRight,
} from "lucide-react";
import Map, { Marker } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Static fallback data
const staticWeatherData = {
  current: {
    temp: 20,
    humidity: 65,
    wind_speed: 5,
    clouds: 30,
    feels_like: 22,
    pressure: 1015,
    visibility: 10000,
    weather: [
      {
        main: "Clouds",
        description: "partly cloudy",
        icon: "03d",
      },
    ],
  },
  daily: Array.from({ length: 7 }, (_, i) => ({
    dt: Date.now() + i * 86400000,
    temp: { max: 22 + Math.random() * 5, min: 15 + Math.random() * 5 },
    humidity: 60 + Math.random() * 20,
    wind_speed: 4 + Math.random() * 3,
    clouds: Math.random() * 100,
    pop: Math.random(),
    pressure: 1013 + Math.random() * 10,
    weather: [
      {
        main: "Clear",
        description: "clear sky",
        icon: "01d",
      },
    ] as [{ main: string; description: string; icon: string }],
  })),
  hourly: Array.from({ length: 24 }, (_, i) => ({
    dt: Date.now() + i * 3600000,
    temp: 20 + Math.sin((i / 24) * Math.PI * 2) * 5,
    pop: Math.random(),
    weather: [
      {
        main: "Clear",
        description: "clear sky",
        icon: "01d",
      },
    ] as [{ main: string; description: string; icon: string }],
  })),
};

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    wind_speed: number;
    clouds: number;
    feels_like: number;
    pressure: number;
    visibility: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
  };
  daily: Array<{
    dt: number;
    temp: { max: number; min: number };
    humidity: number;
    wind_speed: number;
    clouds: number;
    pop: number;
    pressure: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
  }>;
  hourly: Array<{
    dt: number;
    temp: number;
    pop: number;
    weather: [
      {
        main: string;
        description: string;
        icon: string;
      }
    ];
  }>;
}

const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

const WeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] =
    useState<WeatherData>(staticWeatherData);
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.006 });
  const [locationName, setLocationName] = useState<string>("New York, USA");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewport, setViewport] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 10,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTimeframe] = useState<"hourly" | "daily">("daily");
  const [isUsingStaticData] = useState(true);

  const fetchWeatherData = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      if (!OPENWEATHER_API_KEY) {
        throw new Error("OpenWeather API key not configured");
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&units=metric&exclude=minutely,alerts&appid=${OPENWEATHER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Weather API response:", data); // Debug log

      if (!data.current) {
        throw new Error("Invalid weather data received");
      }

      setWeatherData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch weather data"
      );
      // Only set static data if it's an API key issue
      if (err instanceof Error && err.message.includes("API key")) {
        setWeatherData(staticWeatherData);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      if (!OPENWEATHER_API_KEY) {
        throw new Error("OpenWeather API key not configured");
      }

      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          searchQuery
        )}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );

      if (!geoResponse.ok) {
        throw new Error(`Geocoding API error: ${geoResponse.statusText}`);
      }

      const geoData = await geoResponse.json();
      console.log("Geocoding API response:", geoData); // Debug log

      if (!geoData || geoData.length === 0) {
        throw new Error("Location not found");
      }

      const { lat, lon, name, state, country } = geoData[0];
      setLocation({ lat, lng: lon });
      setLocationName(`${name}${state ? `, ${state}` : ""}, ${country}`);
      setViewport((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lon,
      }));

      await fetchWeatherData(lat, lon);
    } catch (err) {
      console.error("Error in search:", err);
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, fetchWeatherData]);

  useEffect(() => {
    // Check if we have the required API keys
    if (!OPENWEATHER_API_KEY) {
      setError("OpenWeather API key not configured");
      setWeatherData(staticWeatherData);
      setLoading(false);
      return;
    }

    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      setError("Mapbox API key not configured");
    }

    // Initial weather fetch
    fetchWeatherData(location.lat, location.lng);
  }, [fetchWeatherData, location.lat, location.lng]);

  const getLocation = useCallback(() => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          setViewport((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));

          try {
            // Get location name from OpenWeatherMap Reverse Geocoding API
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
              const { name, state, country } = data[0];
              setLocationName(
                `${name}${state ? `, ${state}` : ""}, ${country}`
              );
            } else {
              setLocationName("Current Location");
            }
            await fetchWeatherData(latitude, longitude);
            setError(null);
          } catch (error) {
            console.error("Error fetching location name:", error);
            setLocationName("Current Location");
          }
        },
        () => {
          setError(
            "Unable to retrieve your location. Please enable GPS or search manually."
          );
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, [fetchWeatherData]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  const chartData = React.useMemo(() => {
    if (!weatherData) return [];

    if (activeTimeframe === "hourly" && weatherData.hourly) {
      return weatherData.hourly.map((hour) => ({
        time: new Date(hour.dt * 1000).toLocaleTimeString("en-US", {
          hour: "numeric",
        }),
        temp: Math.round(hour.temp),
        rainChance: Math.round(hour.pop * 100),
      }));
    }

    // Check if daily data exists before mapping
    if (!weatherData.daily) return [];

    return weatherData.daily.map((day) => ({
      date: new Date(day.dt * 1000).toLocaleDateString("en-US", {
        weekday: "short",
      }),
      maxTemp: Math.round(day.temp.max),
      minTemp: Math.round(day.temp.min),
      humidity: day.humidity,
      windSpeed: Math.round(day.wind_speed),
      rainChance: Math.round(day.pop * 100),
    }));
  }, [weatherData, activeTimeframe]);

  const safeRound = (value: number | undefined) => {
    return typeof value === "number" ? Math.round(value) : "--";
  };

  const getCurrentData = () => {
    return {
      temp: safeRound(weatherData?.current?.temp),
      humidity: safeRound(weatherData?.current?.humidity),
      wind_speed: safeRound(weatherData?.current?.wind_speed),
      clouds: safeRound(weatherData?.current?.clouds),
      feels_like: safeRound(weatherData?.current?.feels_like),
      pressure: weatherData?.current?.pressure ?? "--",
      visibility: weatherData?.current?.visibility
        ? (weatherData.current.visibility / 1000).toFixed(1)
        : "--",
      weather: weatherData?.current?.weather?.[0] ?? {
        main: "Unknown",
        description: "Weather data unavailable",
        icon: "03d",
      },
    };
  };

  if (!weatherData) return null;

  const currentData = getCurrentData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-emerald-400 text-xl animate-pulse flex items-center gap-2">
          <Navigation className="animate-spin" />
          Loading weather data...
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="min-h-screen bg-black p-6 space-y-6">
      {/* Header with Location and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <MapPin className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">
              {locationName}
              {isUsingStaticData && (
                <span className="text-sm text-emerald-400 ml-2">
                  (Demo Data)
                </span>
              )}
            </h1>
            <p className="text-emerald-400">
              {isUsingStaticData ? "Demo Weather Data" : "Live Weather Updates"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Search location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="bg-gray-800 border-emerald-500/20 text-white"
          />
          <Button
            onClick={handleSearch}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            onClick={getLocation}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Weather Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 mb-1">Temperature</p>
                <h2 className="text-4xl font-bold text-white">
                  {currentData.temp}°C
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Feels like {currentData.feels_like}°C</span>
                  {weatherData?.current?.temp >
                    weatherData?.daily?.[0]?.temp?.min && (
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
              </div>
              <Thermometer className="h-12 w-12 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 mb-1">Humidity & Pressure</p>
                <h2 className="text-4xl font-bold text-white">
                  {currentData.humidity}%
                </h2>
                <p className="text-sm text-gray-400">
                  {currentData.pressure} hPa
                </p>
              </div>
              <Droplets className="h-12 w-12 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 mb-1">Wind & Visibility</p>
                <h2 className="text-4xl font-bold text-white">
                  {currentData.wind_speed} m/s
                </h2>
                <p className="text-sm text-gray-400">
                  Visibility: {currentData.visibility} km
                </p>
              </div>
              <Wind className="h-12 w-12 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20 hover:border-emerald-500/40 transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-400 mb-1">Conditions</p>
                <h2 className="text-4xl font-bold text-white">
                  {currentData.clouds}%
                </h2>
                <p className="text-sm text-gray-400">
                  {currentData.weather.description}
                </p>
              </div>
              <Cloud className="h-12 w-12 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Section */}
      <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20">
        <CardHeader>
          <h2 className="text-2xl font-bold text-white">Weather Map</h2>
        </CardHeader>
        <div className="w-full h-96">
          <Map
            initialViewState={viewport}
            onMove={(e) => setViewport(e.viewState)}
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            style={{ width: "100%", height: "100%" }}
          >
            <Marker latitude={location.lat} longitude={location.lng}>
              <div className="bg-emerald-400 p-2 rounded-full shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            </Marker>
          </Map>
        </div>
      </Card>

      {/* Weather Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hourly Temperature Chart */}
        <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20">
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Hourly Temperature</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Temperature Chart */}
        <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20">
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Daily Temperature</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="maxTemp" fill="#22c55e" />
                <Bar dataKey="minTemp" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Wind Speed Chart */}
        <Card className="bg-gray-800/50 backdrop-blur border-emerald-500/20">
          <CardHeader>
            <h2 className="text-xl font-bold text-white">Wind Speed</h2>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="windSpeed" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeatherDashboard;
