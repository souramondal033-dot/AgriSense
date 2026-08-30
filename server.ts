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

  // API Route for Gemini Lunar Image Registration Analysis
  app.post("/api/gemini/registration-analysis", async (req, res) => {
    try {
      const {
        presetTitle,
        sensor,
        referenceSource,
        resolutionSource,
        resolutionRef,
        sunElevationSource,
        sunElevationRef,
        sunAzimuthSource,
        sunAzimuthRef,
        metrics
      } = req.body;

      if (!sensor || !referenceSource || !metrics) {
        return res.status(400).json({ error: "Missing required registration parameters." });
      }

      const prompt = `You are an expert planetary scientist and remote sensing image registration engineer working at ISRO (Indian Space Research Organisation) for the Chandrayaan-2 mission.

Analyze the image registration performance between Chandrayaan-2 acquired optical imagery and lunar reference basemaps.

INPUT PARAMETERS:
- Preset Target: ${presetTitle}
- Source (Moving) Sensor: Chandrayaan-2 ${sensor} (${resolutionSource} m/px)
- Reference (Fixed) Source: ${referenceSource} (${resolutionRef} m/px)
- Sun Elevation Angle (Source ↔ Ref): ${sunElevationSource}° ↔ ${sunElevationRef}°
- Sun Azimuth Angle (Source ↔ Ref): ${sunAzimuthSource}° ↔ ${sunAzimuthRef}°

COMPUTED ALIGNMENT METRICS:
- RMSE (Root Mean Square Error): ${metrics.rmse} pixels (Sub-pixel benchmark: < 1.0 px)
- Inlier Match Count: ${metrics.inlierCount} / ${metrics.totalCount} matches
- Inlier Ratio: ${(metrics.inlierRatio * 100).toFixed(1)}%
- Mutual Information (MI): ${metrics.mutualInformation}
- SSIM (Structural Similarity): ${metrics.ssim}
- Spatial Uniformity Score: ${(metrics.distributionUniformity * 100).toFixed(1)}%
- Max Sub-Pixel Residual: ${metrics.maxSubPixelResidual} px

Respond in the exact JSON format specified below. Return ONLY pure JSON. Do NOT write markdown codeblocks or extra leading/trailing text.

{
  "qualityScore": 92,
  "illuminationImpact": "Assess how Sun elevation/azimuth angle difference affects shadow direction and crater rim feature correlation.",
  "viewpointDistortionAssessment": "Assess geometric viewpoint and scale ratio distortions between Chandrayaan-2 and reference frame.",
  "scaleRatioNotes": "Commentary on scale ratio adaptation and spatial resolution matching.",
  "recommendation": "Technical recommendation to achieve or maintain sub-pixel accuracy and uniform point distribution.",
  "confidence": 95
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
      console.error("Gemini Registration Analysis Error:", error);
      res.status(500).json({
        error: error.message || "Failed to generate AI registration evaluation. Check credentials."
      });
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
