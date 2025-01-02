// pages/api/geocode.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { location } = req.query;

  if (!process.env.MAPBOX_TOKEN) {
    return res.status(500).json({ error: "Mapbox token not configured" });
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        location as string
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
    );

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      res.status(200).json({ longitude, latitude });
    } else {
      res.status(404).json({ error: "Location not found" });
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    res.status(500).json({ error: "Geocoding failed" });
  }
}
