import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    const base64Data = image.split(",")[1];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Add a validation prompt to check if the image is disaster-related
    const validationPrompt = `Determine if this image depicts a disaster scenario. Respond with ONLY 'YES' or 'NO'. 
    Consider disaster scenarios like earthquakes, hurricanes, floqods, wildfires, tornadoes, tsunamis, or landslides.`;

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

    // If the image is not a disaster scenario, return an error
    if (validationText !== "YES") {
      return NextResponse.json(
        { error: "Image does not depict a disaster scenario" },
        { status: 400 }
      );
    }

    // Proceed with disaster analysis if validation passes
    const prompt = `Analyze this emergency situation image and respond in this exact format without any asterisks or bullet points: TITLE: Write a clear, brief title TYPE: Choose one (Earthquake, Hurricane, Flood, Wildfire, Tornado, Tsunami, Landslide & other) DESCRIPTION: Write a clear, concise description`;

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

    // Parse the response more precisely
    const titleMatch = text.match(/TITLE:\s*(.+)/);
    const typeMatch = text.match(/TYPE:\s*(.+)/);
    const descMatch = text.match(/DESCRIPTION:\s*(.+)/);

    return NextResponse.json({
      title: titleMatch?.[1]?.trim() || "",
      reportType: typeMatch?.[1]?.trim() || "",
      description: descMatch?.[1]?.trim() || "",
    });
  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}