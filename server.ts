import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Route for Flight Search using Google Search Grounding
app.post("/api/flights", async (req, res) => {
  try {
    const { origin, destination, departureDate, returnDate } = req.body;

    if (!origin || !destination || !departureDate) {
      return res.status(400).json({ error: "Missing required fields: origin, destination, departureDate" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets." 
      });
    }

    const prompt = `Search for real-time available flight options from ${origin} to ${destination} departing on ${departureDate}${returnDate ? ` and returning on ${returnDate}` : ''}. 
Using the Google Search tool, find genuine upcoming flight connections.
Return the details strictly as a JSON object of this structure:
{
  "flights": [
    {
      "airline": "Airline name (e.g. Delta Air Lines)",
      "flightNumber": "Flight number (e.g. DL123, or 'Multiple')",
      "route": "Origin to Destination (e.g. JFK-NRT)",
      "departureTime": "Approximate departure time",
      "arrivalTime": "Approximate arrival time",
      "price": "Estimated price in USD (e.g. $850)",
      "duration": "Total travel duration (e.g. 14h 20m)",
      "type": "Direct, 1 Stop, or 2+ Stops",
      "notes": "Layovers, aircraft type, or other useful context"
    }
  ],
  "summary": "A 1-2 sentence overview of the current flight market/pricing for this route and dates."
}

Do not include any markdown backticks or any wrapper in your response. Just return raw, valid JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    let data;
    try {
      data = JSON.parse(responseText.trim());
    } catch (parseError) {
      console.error("Failed to parse Gemini flight response as JSON", responseText);
      // Fallback
      data = {
        flights: [],
        summary: "Could not parse flight details from the search results.",
        rawText: responseText
      };
    }

    // Extract search grounding metadata sources/citations
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const citations = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || "Search Result",
      uri: chunk.web?.uri || ""
    })).filter((c: any) => c.uri);

    res.json({
      ...data,
      citations
    });

  } catch (error: any) {
    console.error("Flight search error:", error);
    res.status(500).json({ error: error.message || "An error occurred during flight search." });
  }
});

// Setup Vite middleware for dev or static server for production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static production build from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

setupVite();
