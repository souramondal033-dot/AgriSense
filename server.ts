import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini API Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route for Gemini Crop Advisory
  app.post("/api/gemini/advisory", async (req, res) => {
    try {
      const { crop, stageText, district, waterNeeds, ndvi, ndwi, ndre, ndviStatus, ndwiStatus, ndreStatus } = req.body;

      if (!crop || !stageText || !district) {
        return res.status(400).json({ error: "Missing required parameters." });
      }

      const prompt = `You are an expert agricultural scientist and remote sensing specialist for Eastern India (particularly West Bengal and nearby regions).

A farmer needs an irrigation and crop advisory based on satellite spectral data.

CROP DETAILS:
- Crop: ${crop}
- Growth Stage: ${stageText}
- District: ${district}, Eastern India
- Crop Water Needs: ${waterNeeds}

SATELLITE SPECTRAL INDICES (from Sentinel-2 / MODIS data):
- NDVI (Vegetation Health): ${ndvi} → Status: ${ndviStatus}
- NDWI (Water Content): ${ndwi} → Status: ${ndwiStatus}
- NDRE (Chlorophyll/Red Edge): ${ndre} → Status: ${ndreStatus}

NDVI Scale: <0.2 = bare/stressed, 0.2–0.4 = moderate, >0.4 = healthy
NDWI Scale: <-0.1 = dry stress, -0.1–0.1 = moderate, >0.1 = adequate moisture
NDRE Scale: <0.1 = chlorophyll deficiency, 0.1–0.3 = moderate, >0.3 = healthy

Respond in the exact JSON format specified below. Return ONLY pure JSON. Do NOT include markdown blocks, do NOT write any extra leading/trailing text. Ensure the response can be directly parsed via JSON.parse().

Specify valid recommendations custom tailored to this crop/stage combo. For example, Rice tillering needs water levels maintained but not flooded completely, etc.

{
  "stressLevel": "Low" | "Moderate" | "High" | "Critical",
  "moistureStatus": "one sentence on water stress condition",
  "vegetationHealth": "one sentence on crop health from NDVI+NDRE",
  "irrigationAction": "Immediate" | "Within 48 hours" | "Within 1 week" | "Not Required",
  "waterAmount": "specific amount in mm or liters per hectare",
  "irrigationMethod": "Flood" | "Drip" | "Sprinkler" | "Furrow",
  "fertilizerFlag": true | false,
  "fertilizerNote": "specific fertilizer advice if needed, else null",
  "alerts": ["list", "of", "specific", "actionable", "alerts", "insect warnings related to this growth stage and district"],
  "weeklyForecast": "2-sentence advisory for the next 7 days",
  "confidence": 85
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "";
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      return res.json(parsed);
    } catch (error: any) {
      console.error("Gemini Advisory Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI advisory. Check application credentials and try again." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
