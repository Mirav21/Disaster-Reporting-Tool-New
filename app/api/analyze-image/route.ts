import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "pg";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to get type prefix
function getTypePrefix(disasterType: string): string {
  const prefixMap: { [key: string]: string } = {
    'Wildfire': 'WF',
    'Earthquake': 'EQ',
    'Hurricane': 'HR',
    'Flood': 'FL',
    'Tornado': 'TR',
    'Tsunami': 'TS',
    'Landslide': 'LS'
  };
  return prefixMap[disasterType] || 'OT'; // OT for Other
}

// Helper function to generate report number
async function generateReportNumber(client: Client, disasterType: string): Promise<string> {
  const typePrefix = getTypePrefix(disasterType);
  
  try {
    // Get the count of existing reports for this type
    const query = `
      SELECT COUNT(*) 
      FROM disaster_report
      WHERE disaster_type = $1
    `;
    const result = await client.query(query, [disasterType]);
    const count = parseInt(result.rows[0].count) + 1;
    
    // Format with leading zeros (e.g., WF_01, WF_02)
    return `${typePrefix}_${count.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error("Error generating report number:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    const { image } = await request.json();
    const base64Data = image.split(",")[1];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Validation prompt
    const validationPrompt = `Determine if this image depicts a disaster scenario. Respond with ONLY 'YES' or 'NO'. 
    Consider disaster scenarios like earthquakes, hurricanes, floods, wildfires, tornadoes, tsunamis, or landslides.`;

    const validationResult = await model.generateContent([
      validationPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const validationText = await validationResult.response.text().trim();

    if (validationText !== "YES") {
      return NextResponse.json(
        { error: "Image does not depict a disaster scenario" },
        { status: 400 }
      );
    }

   // const prompt = Analyze this emergency situation image and respond in this exact format without any asterisks or bullet points: TITLE: Write a clear, brief title TYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide & other) DESCRIPTION: Write a clear, concise description;

   const prompt = `Analyze this emergency situation image and respond in this exact format without any asterisks or bullet points TYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide & other) DESCRIPTION: Write a clear, concise description QUESTION: Do you want to confirm the disaster type as {print the type of disaster}?`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const text = await result.response.text();

    // Parse the response
    const typeMatch = text.match(/TYPE:\s*(.+)/);
    const descMatch = text.match(/DESCRIPTION:\s*(.+)/);
    const quesMatch = text.match(/QUESTION:\s*(.+)/);

    const reportType = typeMatch?.[1]?.trim() || "";
    
    // Generate the report number based on existing reports
    const reportTitle = await generateReportNumber(client, reportType);

    return NextResponse.json({
      title: reportTitle,
      reportType: reportType,
      description: descMatch?.[1]?.trim() || "",
      question: quesMatch?.[1]?.trim() || "",
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}