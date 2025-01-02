import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  
  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  console.log('API Key:', lat, lon, apiKey);
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is missing or invalid' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Weather API error');
    }
    
    const data = await response.json();
    console.log('Weather API data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
