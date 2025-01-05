import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Helper function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid query provided" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Detect the language of the query
    const languageDetectionPrompt = `Identify the language of the following text. Respond with only 'English', 'Hindi', or 'Gujarati'.
Text: "${query}"`;
    const languageResult = await model.generateContent([languageDetectionPrompt]);
    const detectedLanguage = languageResult.response.text().trim();

    if (!["English", "Hindi", "Gujarati"].includes(detectedLanguage)) {
      return NextResponse.json({
        response:
          "I could not determine the language of your query. Please try rephrasing in English, Hindi, or Gujarati.",
      });
    }

    // Add delay after language detection
    await delay(1000);

    // Handle common greetings
    const greetings = {
      English: "Hello! How can I assist you today? If you have a query related to disasters, feel free to ask.",
      Hindi: "नमस्ते! मैं आपकी कैसे सहायता कर सकता हूं? यदि आपके पास आपदाओं से संबंधित कोई प्रश्न है, तो पूछें।",
      Gujarati: "નમસ્તે! હું તમારું કેવી રીતે મદદ કરી શકું? જો તમને આફતો સંબંધિત કોઈ પ્રશ્ન હોય તો જરૂર પૂછો.",
    };

    const normalizedQuery = query.trim().toLowerCase();
    const commonGreetings = ["hello", "hi", "hey", "greetings", "नमस्ते", "હાય"];
    if (commonGreetings.includes(normalizedQuery)) {
      return NextResponse.json({
        response: greetings[detectedLanguage as keyof typeof greetings],
      });
    }
    
    // Add delay before validation check
    await delay(1000);
    
    const validationPrompt = `Determine if the following query is related to disaster scenarios. Respond with ONLY 'YES' or 'NO'. 
Example scenarios include:
- Natural disasters like earthquakes, hurricanes, floods, wildfires, tornadoes, tsunamis, landslides
- Disaster response efforts, relief measures, and recovery actions.
Query: "${query}"`;
    const validationResult = await model.generateContent([validationPrompt]);
    const validationText = validationResult.response.text().trim();

    if (validationText !== "YES") {
      const nonDisasterResponses = {
        English: "I'm here to assist with disaster-related queries. For general queries, you might want to try a different service. How can I help?",
        Hindi: "मैं आपदाओं से संबंधित प्रश्नों में सहायता करने के लिए यहां हूं। सामान्य प्रश्नों के लिए, आप किसी अन्य सेवा का उपयोग कर सकते हैं। मैं आपकी क्या मदद कर सकता हूं?",
        Gujarati: "હું આફતો સંબંધિત પ્રશ્નોમાં મદદ કરવા અહીં છું. સામાન્ય પ્રશ્નો માટે, તમે કોઈ બીજી સેવા અજમાવી શકો છો. હું તમારી કેવી રીતે મદદ કરી શકું?",
      };
      return NextResponse.json({ response: nonDisasterResponses[detectedLanguage as keyof typeof nonDisasterResponses] });
    }
    
    // Add delay before final response
    await delay(1000);
    
    const prompt = `You are an expert disaster management chatbot. Respond to the following query related to disaster scenarios in ${detectedLanguage}. Provide concise, helpful, and actionable information. Structure your response in clear, numbered points. Use the language ${detectedLanguage}.
    Query: "${query}"`;    
    const result = await model.generateContent([prompt]);
    const responseText = result.response.text().trim();

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your query. Please try again later." },
      { status: 500 }
    );
  }
}