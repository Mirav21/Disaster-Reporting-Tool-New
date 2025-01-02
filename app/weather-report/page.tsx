// pages/weather.tsx
import { NextPage } from 'next';
import Head from 'next/head';
import WeatherDashboard from '@/components/WeatherDashboard';

const WeatherPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Weather Forecast | Disaster Reporting Tool</title>
        <meta name="description" content="Weather forecast and disaster reporting dashboard" />
      </Head>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl text-green-500 text-center font-bold mb-8">Weather Forecast</h1>
        <WeatherDashboard />
      </main>
    </>
  );
};

export default WeatherPage;