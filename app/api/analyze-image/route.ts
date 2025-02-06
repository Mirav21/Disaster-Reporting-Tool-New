// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { Client } from "pg";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// // Helper function to get type prefix
// function getTypePrefix(disasterType: string): string {
//   const prefixMap: { [key: string]: string } = {
//     'Wildfire': 'WF',
//     'Earthquake': 'EQ',
//     'Hurricane': 'HR',
//     'Flood': 'FL',
//     'Tornado': 'TR',
//     'Tsunami': 'TS',
//     'Landslide': 'LS'
//   };
//   return prefixMap[disasterType] || 'OT'; // OT for Other
// }

// // Helper function to generate report number
// async function generateReportNumber(client: Client, disasterType: string): Promise<string> {
//   const typePrefix = getTypePrefix(disasterType);
  
//   try {
//     // Get the count of existing reports for this type
//     const query = `
//       SELECT COUNT(*) 
//       FROM disaster_report
//       WHERE disaster_type = $1
//     `;
//     const result = await client.query(query, [disasterType]);
//     const count = parseInt(result.rows[0].count) + 1;
    
//     // Format with leading zeros (e.g., WF_01, WF_02)
//     return ${typePrefix}_${count.toString().padStart(2, '0')};
//   } catch (error) {
//     console.error("Error generating report number:", error);
//     throw error;
//   }
// }

// export async function POST(request: Request) {
//   const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//   });

//   try {
//     await client.connect();
    
//     const { image } = await request.json();
//     const base64Data = image.split(",")[1];

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     // Validation prompt
//     const validationPrompt = `Determine if this image depicts a disaster scenario. Respond with ONLY 'YES' or 'NO'. 
//     Consider disaster scenarios like earthquakes, hurricanes, floods, wildfires, tornadoes, tsunamis, or landslides.`;

//     const validationResult = await model.generateContent([
//       validationPrompt,
//       {
//         inlineData: {
//           data: base64Data,
//           mimeType: "image/jpeg",
//         },
//       },
//     ]);

//     const validationText = await validationResult.response.text().trim();

//     if (validationText !== "YES") {
//       return NextResponse.json(
//         { error: "Image does not depict a disaster scenario" },
//         { status: 400 }
//       );
//     }

//    // const prompt = Analyze this emergency situation image and respond in this exact format without any asterisks or bullet points: TITLE: Write a clear, brief title TYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide & other) DESCRIPTION: Write a clear, concise description;

//    const prompt = Analyze this emergency situation image and respond in this exact format without any asterisks or bullet points TYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide & other) DESCRIPTION: Write a clear, concise description QUESTION: Do you want to confirm the disaster type as {print the type of disaster}?;

//     const result = await model.generateContent([
//       prompt,
//       {
//         inlineData: {
//           data: base64Data,
//           mimeType: "image/jpeg",
//         },
//       },
//     ]);

//     const text = await result.response.text();

//     // Parse the response
//     const typeMatch = text.match(/TYPE:\s*(.+)/);
//     const descMatch = text.match(/DESCRIPTION:\s*(.+)/);
//     const quesMatch = text.match(/QUESTION:\s*(.+)/);

//     const reportType = typeMatch?.[1]?.trim() || "";
    
//     // Generate the report number based on existing reports
//     const reportTitle = await generateReportNumber(client, reportType);

//     return NextResponse.json({
//       title: reportTitle,
//       reportType: reportType,
//       description: descMatch?.[1]?.trim() || "",
//       question: quesMatch?.[1]?.trim() || "",
//     });

//   } catch (error) {
//     console.error("Image analysis error:", error);
//     return NextResponse.json(
//       { error: "Failed to analyze image" },
//       { status: 500 }
//     );
//   } finally {
//     await client.end();
//   }
// }


import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
// import { db } from "@vercel/postgres";

import { createClient } from "@vercel/postgres"
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

type ReportType = "Wildfire" | "Earthquake" | "Hurricane" | "Flood" | "Tornado" | "Tsunami" | "Landslide";

const prefixMap: Record<ReportType, string> = {
  Wildfire: "WF",
  Earthquake: "EQ",
  Hurricane: "HR",
  Flood: "FL",
  Tornado: "TR",
  Tsunami: "TS",
  Landslide: "LS",
};

function getTypePrefix(disasterType: ReportType) {
  return prefixMap[disasterType] || "OT";
}
;

const client = createClient({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function generateReportNumber(disasterType: ReportType) {
  console.log("Connecting to DB...");
  try {
    await client.connect();
    console.log("Connected to DB!");

    console.log(`Fetching count for ${disasterType}`);
    const result = await client.sql`SELECT COUNT(*) FROM disaster_report WHERE disaster_type = ${disasterType}`;

    const count = parseInt(result.rows[0]?.count || "0") + 1;
    console.log(`Generated count: ${count}`);

    return `${getTypePrefix(disasterType)}_${count.toString().padStart(2, "0")}`;
  } catch (error) {
    console.error("Error in generateReportNumber:", error);
    throw error;
  } finally {
    await client.end();
    console.log("DB connection closed.");
  }
}


export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    const base64Data = image.split(",")[1];
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

    const prompt = `Determine if this image depicts a disaster scenario. Respond with ONLY 'YES' or 'NO'. Then, if it does, analyze this emergency situation image and respond in this exact format without any asterisks or bullet points\nTYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide & other)\nDESCRIPTION: Write a clear, concise description\nQUESTION: Do you want to confirm the disaster type as {print the type of disaster}?`;
    
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
    ]);
    console.log("Image analysis result:", result);

    const text = await result.response.text();
    if (text.trim().startsWith("NO")) {
      return NextResponse.json({ error: "Image does not depict a disaster scenario" }, { status: 400 });
    }

    const reportType = text.match(/TYPE:\s*(.+)/)?.[1]?.trim() || "";
    const allowedTypes: ReportType[] = ["Wildfire", "Earthquake", "Hurricane", "Flood", "Tornado", "Tsunami", "Landslide"];
    
    if (!allowedTypes.includes(reportType as ReportType)) {
      throw new Error(`Invalid disaster type: ${reportType}`);
    }

    const reportTitle = await generateReportNumber(reportType as ReportType);

    return NextResponse.json({
      title: reportTitle,
      reportType,
      description: text.match(/DESCRIPTION:\s*(.+)/)?.[1]?.trim() || "",
      question: text.match(/QUESTION:\s*(.+)/)?.[1]?.trim() || "",
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}

