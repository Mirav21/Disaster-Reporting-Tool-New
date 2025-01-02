import { WeatherData } from "@/types/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const WEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const WEATHER_API_BASE = "https://api.openweathermap.org/data/2.5";

interface WeatherListItem {
  dt: number;
  main: {
    temp_min: number;
    temp_max: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

export const fetchWeatherData = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    if (!WEATHER_API_KEY) {
      throw new Error("API key is missing");
    }

    const currentResponse = await fetch(
      `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!currentResponse.ok) {
      throw new Error(
        `Weather API Error: ${currentResponse.status} ${currentResponse.statusText}`
      );
    }

    const currentData = await currentResponse.json();

    const forecastResponse = await fetch(
      `${WEATHER_API_BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`
    );

    if (!forecastResponse.ok) {
      throw new Error(
        `Forecast API Error: ${forecastResponse.status} ${forecastResponse.statusText}`
      );
    }

    const forecastData = await forecastResponse.json();

    return {
      current: {
        temp: currentData.main.temp,
        humidity: currentData.main.humidity,
        wind_speed: currentData.wind.speed,
        weather: currentData.weather,
      },
      daily: forecastData.list
        .filter((item: WeatherListItem, index: number) => index % 8 === 0)
        .map((item: WeatherListItem) => ({
          dt: item.dt,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max,
          },
          weather: item.weather,
        })),
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Weather API Error:", error.message);
    } else {
      console.error("Weather API Error:", error);
    }
    throw error;
  }
};