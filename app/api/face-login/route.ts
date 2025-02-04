import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "pg";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Function to fetch an image from a URL and convert it to base64
async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  } catch (error) {
    console.error("Error fetching image:", error);
    throw new Error("Failed to fetch image from Firebase");
  }
}

export async function POST(request: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    
    const { userId, image } = await request.json();
    const base64Data = image.split(",")[1];
    console.log(userId)

    // Fetch user's stored image URL from the database
    const query = "SELECT email FROM users WHERE id = $1";
    const result = await client.query(query, [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const firebaseImageUrl = result.rows[0].email;

    // Convert the Firebase image URL to base64
    const storedBase64Image = await fetchImageAsBase64(firebaseImageUrl);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prompt for Gemini to compare the images
    const prompt = `Compare these two images and determine if they belong to the same person. 
    Respond ONLY with 'YES' or 'NO'.`;

    const comparisonResult = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
      {
        inlineData: {
          data: storedBase64Image,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const matchResult = await comparisonResult.response.text();
    
    return NextResponse.json({ success: matchResult.trim() === "YES" });

  } catch (error) {
    console.error("Face recognition error:", error);
    return NextResponse.json(
      { error: "Failed to verify user" },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}
