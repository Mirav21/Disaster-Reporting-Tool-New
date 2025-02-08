// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// import { createClient } from "@vercel/postgres"
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// type ReportType = "Wildfire" | "Earthquake" | "Hurricane" | "Flood" | "Tornado" | "Tsunami" | "Landslide" | "Drought" | "Heavy Rain" | "Heavy Wind" | "Other";

// const prefixMap: Record<ReportType, string> = {
//   Wildfire: "WF",
//   Earthquake: "EQ",
//   Hurricane: "HR",
//   Flood: "FL",
//   Tornado: "TR",
//   Tsunami: "TS",
//   Landslide: "LS",
//   Drought: "DR",
//   "Heavy Rain": "HRN",
//   "Heavy Wind": "HWN",
//   Other: "OT",
// };

// function getTypePrefix(disasterType: ReportType) {
//   return prefixMap[disasterType] || "OT";
// }
// ;

// const client = createClient({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// async function generateReportNumber(disasterType: ReportType) {
//   try {
//     await client.connect();

//     const result = await client.sql`SELECT COUNT(*) FROM disaster_report WHERE disaster_type = ${disasterType}`;

//     const count = parseInt(result.rows[0]?.count || "0") + 1;

//     return `${getTypePrefix(disasterType)}_${count.toString().padStart(2, "0")}`;
//   } catch (error) {
//     console.error("Error in generateReportNumber:", error);
//     throw error;
//   } finally {
//     await client.end();
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const { image } = await request.json();
//     const base64Data = image.split(",")[1];
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

//     const prompt = `Determine if this image depicts a disaster scenario. Respond with ONLY 'YES' or 'NO'. Then, if it does, analyze this emergency situation image and respond in this exact format without any asterisks or bullet points
//     TYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide, Drought, Heavy Rain, Heavy Wind, Other)
//     DESCRIPTION: Write a clear, concise description
//     QUESTION: Do you want to confirm the disaster type as {print the type of disaster}?`;

//     const result = await model.generateContent([
//       prompt,
//       { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
//     ]);

//     const text = await result.response.text();
//     if (text.trim().startsWith("NO")) {
//       return NextResponse.json({ error: "Image does not depict a disaster scenario" }, { status: 400 });
//     }

//     const reportType = text.match(/TYPE:\s*(.+)/)?.[1]?.trim() || "";

//     const reportTitle = await generateReportNumber(reportType as ReportType);

//     return NextResponse.json({
//       title: reportTitle,
//       reportType,
//       description: text.match(/DESCRIPTION:\s*(.+)/)?.[1]?.trim() || "",
//       question: text.match(/QUESTION:\s*(.+)/)?.[1]?.trim() || "",
//     });
//   } catch (error) {
//     console.error("Image analysis error:", error);
//     return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient, VercelClient } from "@vercel/postgres"; // Updated import

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type ReportType =
  | "Wildfire"
  | "Earthquake"
  | "Hurricane"
  | "Flood"
  | "Tornado"
  | "Tsunami"
  | "Landslide"
  | "Drought"
  | "Heavy Rain"
  | "Heavy Wind"
  | "Wild Animal Intrusion"
  | "Other";

const prefixMap: Record<ReportType, string> = {
  Wildfire: "WF",
  Earthquake: "EQ",
  Hurricane: "HR",
  Flood: "FL",
  Tornado: "TR",
  Tsunami: "TS",
  Landslide: "LS",
  Drought: "DR",
  "Heavy Rain": "HRN",
  "Heavy Wind": "HWN",
  "Wild Animal Intrusion": "WAI", // New entry for wild animal incidents
  Other: "OT",
};

const client = createClient({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

let isConnected = false;

async function ensureConnection(client: VercelClient): Promise<void> {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("already connected")
      ) {
        isConnected = true;
      } else {
        throw error;
      }
    }
  }
}

function getTypePrefix(disasterType: string): string {
  return prefixMap[disasterType as ReportType] || "OT";
}

async function generateReportNumber(
  client: VercelClient,
  disasterType: string
): Promise<string> {
  try {
    await ensureConnection(client);

    const result = await client.sql`
            SELECT COUNT(*) FROM disaster_report WHERE disaster_type = ${disasterType}
        `;

    const count = parseInt(result.rows[0]?.count?.toString() || "0") + 1;

    return `${getTypePrefix(disasterType)}_${count
      .toString()
      .padStart(2, "0")}`;
  } catch (error) {
    console.error("Error in generateReportNumber:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    const base64Data = image.split(",")[1];
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const prompt = `Determine if this image depicts a disaster scenario, including floods, storms, and wild animal intrusions. Respond with ONLY 'YES' or 'NO'. Then, if it does, analyze this emergency situation image and dont take animated image and respond in this exact format without any asterisks or bullet points:
TYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide, Drought, Heavy Rain, Heavy Wind, Wild Animal Intrusion, Other)
DESCRIPTION: Write a clear, concise description, mentioning if there are any visible wild animals (e.g., crocodiles, snakes) in an urban area due to heavy rain or flooding.
QUESTION: Do you want to confirm the disaster type as {print the type of disaster}?`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
    ]);

    const text = await result.response.text();
    if (text.trim().startsWith("NO")) {
      return NextResponse.json(
        { error: "Image does not depict a disaster scenario" },
        { status: 400 }
      );
    }

    const reportType = text.match(/TYPE:\s*(.+)/)?.[1]?.trim() || "";

    const reportTitle = await generateReportNumber(client, reportType);

    return NextResponse.json({
      title: reportTitle,
      reportType,
      description: text.match(/DESCRIPTION:\s*(.+)/)?.[1]?.trim() || "",
      question: text.match(/QUESTION:\s*(.+)/)?.[1]?.trim() || "",
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
