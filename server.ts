import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API route for Flight Tracking with search grounding
app.post("/api/track-flight", async (req, res) => {
  try {
    const { flightNumber, date } = req.body;
    if (!flightNumber) {
      return res.status(400).json({ error: "Missing flight number" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const prompt = `Provide real-time status for flight ${flightNumber}${date ? ` on ${date}` : ""}. 
Use the Google Search tool to find the most accurate current status including departure/arrival times, gate info, and any delays.
Return the result in a clean JSON format:
{
  "status": "On Time | Delayed | Cancelled | In Air",
  "origin": { "code": "SFO", "name": "San Francisco", "time": "10:30 AM" },
  "destination": { "code": "LHR", "name": "London Heathrow", "time": "11:55 AM" },
  "aircraft": "Boeing 787-9",
  "delay": "15 mins",
  "summary": "Short description of flight progress"
}
Only return the raw JSON.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} } as any],
      }
    });

    const responseText = result.text;
    // Simple JSON extraction in case of markdown formatting
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    res.json(data);
  } catch (error: any) {
    console.error("Flight tracking error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API Route for Places and Activities Suggestions using Google Search Grounding
app.post("/api/places-suggestions", async (req, res) => {
  try {
    const { destination, budgetTier, travelStyles, month } = req.body;

    if (!destination) {
      return res.status(400).json({ error: "Missing required field: destination" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured."
      });
    }

    const tierLabel = budgetTier || "moderate";
    const stylesStr = travelStyles && travelStyles.length > 0 ? travelStyles.join(", ") : "general sightseeing";
    const monthStr = month || "upcoming trip";

    const prompt = `Search for real-time places, activities, and dining spots in ${destination} tailored for a ${tierLabel} budget.
The traveler is interested in these styles: ${stylesStr}. The travel month is ${monthStr}.
Using the Google Search tool, find authentic, real-time local gems, highly rated places, popular local restaurants, and interesting neighborhoods.
Return the suggestions strictly as a JSON object:
{
  "places": [
    {
      "name": "Name",
      "category": "Category",
      "description": "Description",
      "estimatedCost": "Cost",
      "recommendedTime": "Time",
      "addressOrArea": "Area"
    }
  ],
  "budgetTip": "Tip"
}
Only return raw JSON.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} } as any],
      }
    });

    const responseText = result.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    res.json(data);
  } catch (error: any) {
    console.error("Places suggestions error:", error);
    res.status(500).json({ error: error.message });
  }
});

// API Route for Historical Weather Alerts using Google Search Grounding
app.post("/api/weather-alerts", async (req, res) => {
  try {
    const { destination, month } = req.body;

    if (!destination || month === undefined) {
      return res.status(400).json({ error: "Missing destination or month" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const monthName = monthNames[month];

    const prompt = `Research historical extreme weather events and natural climate risks for ${destination} during the month of ${monthName}.
Look for recurring patterns like hurricane seasons, monsoon peaks, extreme heatwave windows, severe wildfire risks, or unusual cold snaps that travelers should be aware of.
Focus on AUTHENTIC historical data for this specific month.
Return the result as a JSON object:
{
  "alerts": [
    {
      "type": "Extreme Heat | Monsoon | Hurricane Season | Wildfire Risk | Blizzard | Fog",
      "severity": "Low | Moderate | High | Critical",
      "description": "Short explanation of the risk and historical context",
      "advice": "Actionable safety or packing tip"
    }
  ],
  "summary": "One sentence overview of the climate safety profile for this month."
}
Only return raw JSON. If no major historical risks exist for this month, return an empty alerts array but include a summary.`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} } as any],
      }
    });

    const responseText = result.text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    res.json(data);
  } catch (error: any) {
    console.error("Weather alerts error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
