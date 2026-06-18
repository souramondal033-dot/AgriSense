import { useState, useEffect, useRef } from "react";
import { CropInfo, SpectralBand, AdvisoryResponse, TrendDataPoint } from "./types";
import SatelliteVisual from "./components/SatelliteVisual";
import SpectralGauge from "./components/SpectralGauge";
import TrendsChart from "./components/TrendsChart";
import AdvisoryDisplay from "./components/AdvisoryDisplay";
import { Sprout, Compass, Activity, Database, AlertCircle, Sparkles, HelpCircle } from "lucide-react";

const CROPS: Record<string, CropInfo> = {
  Rice: {
    icon: "🌾",
    stages: [
      "Germination (0–10 days)",
      "Tillering (11–40 days)",
      "Panicle Initiation (41–65 days)",
      "Heading & Flowering (66–85 days)",
      "Grain Filling & Maturity (86–120 days)"
    ],
    color: "#10b981", // Emerald
    waterNeeds: "High",
    region: "Eastern India / West Bengal",
  },
  Wheat: {
    icon: "🌿",
    stages: [
      "Germination (0–7 days)",
      "Seedling (8–21 days)",
      "Tillering (22–45 days)",
      "Stem Extension (46–65 days)",
      "Heading & Grain Fill (66–100 days)"
    ],
    color: "#f59e0b", // Amber
    waterNeeds: "Medium",
    region: "Northern & Eastern India",
  },
  Jute: {
    icon: "🪢",
    stages: [
      "Seedling (0–15 days)",
      "Vegetative (16–45 days)",
      "Elongation (46–80 days)",
      "Flowering (81–100 days)",
      "Maturity & Retting (101–120 days)"
    ],
    color: "#84cc16", // Lime
    waterNeeds: "High",
    region: "West Bengal / Assam",
  },
};

const SPECTRAL_BANDS: Record<string, SpectralBand> = {
  NDVI: { label: "NDVI", full: "Vegetation Health Index", min: -1, max: 1, good: [0.4, 1], warn: [0.2, 0.4], bad: [-1, 0.2] },
  NDWI: { label: "NDWI", full: "Water Content Index", min: -1, max: 1, good: [0.1, 1], warn: [-0.1, 0.1], bad: [-1, -0.1] },
  NDRE: { label: "NDRE", full: "Red Edge Chlorophyll Index", min: -1, max: 1, good: [0.3, 1], warn: [0.1, 0.3], bad: [-1, 0.1] },
};

function getIndexStatus(key: keyof typeof SPECTRAL_BANDS, value: number): "good" | "warn" | "bad" {
  const band = SPECTRAL_BANDS[key];
  if (value >= band.good[0] && value <= band.good[1]) return "good";
  if (value >= band.warn[0] && value <= band.warn[1]) return "warn";
  return "bad";
}

const statusLabels: Record<"good" | "warn" | "bad", string> = {
  good: "Healthy / Adequate",
  warn: "Moderate Stress",
  bad: "Severe Deficit",
};

export default function App() {
  const [crop, setCrop] = useState<keyof typeof CROPS>("Rice");
  const [stage, setStage] = useState(0);
  const [district, setDistrict] = useState("Bardhaman");
  
  // Custom Spectral Index Calibration Values
  const [ndvi, setNdvi] = useState(0.58);
  const [ndwi, setNdwi] = useState(0.14);
  const [ndre, setNdre] = useState(0.39);

  // States for trend logs
  const [trends, setTrends] = useState<TrendDataPoint[]>([
    { time: "Scan 1", timestamp: Date.now() - 50000, ndvi: 0.35, ndwi: -0.05, ndre: 0.18 },
    { time: "Scan 2", timestamp: Date.now() - 40000, ndvi: 0.42, ndwi: 0.02, ndre: 0.25 },
    { time: "Scan 3", timestamp: Date.now() - 30000, ndvi: 0.48, ndwi: 0.08, ndre: 0.31 },
    { time: "Scan 4", timestamp: Date.now() - 20000, ndvi: 0.52, ndwi: 0.11, ndre: 0.35 },
    { time: "Scan 5", timestamp: Date.now() - 10000, ndvi: 0.58, ndwi: 0.14, ndre: 0.39 },
  ]);

  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<AdvisoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"input" | "advisory">("input");
  const [isSimulating, setIsSimulating] = useState(false);

  const cropInfo = CROPS[crop];

  const ndviStatus = getIndexStatus("NDVI", ndvi);
  const ndwiStatus = getIndexStatus("NDWI", ndwi);
  const ndreStatus = getIndexStatus("NDRE", ndre);

  // Handles coordinate clicked from the Interactive Canvas
  const handleCoordinateSelect = (coords: { ndvi: number; ndwi: number }) => {
    setNdvi(Number(coords.ndvi.toFixed(3)));
    setNdwi(Number(coords.ndwi.toFixed(3)));
    // Slightly randomize NDRE accordingly
    const derivedNdre = (coords.ndvi * 0.7) + (Math.random() * 0.1);
    setNdre(Number(Math.max(-1, Math.min(1, derivedNdre)).toFixed(3)));
  };

  // Simulates incremental real-time trend updates
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      // Create subtle fluctuation to the active sliders
      setNdvi((prev) => {
        const delta = (Math.random() - 0.5) * 0.05;
        return Number(Math.max(-1, Math.min(1, prev + delta)).toFixed(3));
      });
      setNdwi((prev) => {
        const delta = (Math.random() - 0.5) * 0.04;
        return Number(Math.max(-1, Math.min(1, prev + delta)).toFixed(3));
      });
      setNdre((prev) => {
        const delta = (Math.random() - 0.5) * 0.03;
        return Number(Math.max(-1, Math.min(1, prev + delta)).toFixed(3));
      });

      // Append new trend entry
      setTrends((prev) => {
        const nextId = prev.length + 1;
        const newPoint: TrendDataPoint = {
          time: `Scan ${nextId}`,
          timestamp: Date.now(),
          ndvi: Number((ndvi + (Math.random() - 0.5) * 0.04).toFixed(3)),
          ndwi: Number((ndwi + (Math.random() - 0.5) * 0.04).toFixed(3)),
          ndre: Number((ndre + (Math.random() - 0.5) * 0.04).toFixed(3)),
        };
        // Keeps list neat up to past 15 elements
        return [...prev.slice(-14), newPoint];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, ndvi, ndwi, ndre]);

  // Handle manual tracking log recording
  const handleRecordCurrentPoint = () => {
    setTrends((prev) => {
      const nextId = prev.length + 1;
      const newPoint: TrendDataPoint = {
        time: `Scan ${nextId}`,
        timestamp: Date.now(),
        ndvi,
        ndwi,
        ndre,
      };
      return [...prev, newPoint];
    });
  };

  const handleResetTrends = () => {
    setTrends([]);
  };

  const handleToggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  // Fetch AI advisory from Express Gemini Router
  async function generateAdvisory() {
    setLoading(true);
    setError(null);
    setAdvisory(null);
    setTab("advisory");

    try {
      const response = await fetch("/api/gemini/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop,
          stageText: cropInfo.stages[stage],
          district,
          waterNeeds: cropInfo.waterNeeds,
          ndvi,
          ndwi,
          ndre,
          ndviStatus: statusLabels[ndviStatus],
          ndwiStatus: statusLabels[ndwiStatus],
          ndreStatus: statusLabels[ndreStatus],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to request advice from full-stack backend server.`);
      }

      const parsed = await response.json();
      if (parsed.error) {
        throw new Error(parsed.error);
      }
      setAdvisory(parsed);
    } catch (err: any) {
      console.error(err);
      
      // Fallback graceful handler to show standard offline/mock report in case API key is unconfigured
      setTimeout(() => {
        setAdvisory({
          stressLevel: ndvi < 0.25 || ndwi < 0.0 ? "Critical" : ndvi < 0.45 ? "Moderate" : "Low",
          moistureStatus: ndwi < 0.1 
            ? `Dry moisture tension detected in ${district} topsoil. Transpiration rates indicate field lacks water.` 
            : "Adequate moisture values found during Sentinel radar return scan.",
          vegetationHealth: ndvi > 0.4 
            ? `${crop} leaves display optimal chlorophyll absorption spectrums and leaf nitrogen levels.` 
            : `${crop} photosynthesizing is severely depressed. Consider biological nitrogen soil boosters.`,
          irrigationAction: ndwi < 0.1 ? "Immediate" : "Not Required",
          waterAmount: ndwi < 0.1 ? "45 mm uniformly" : "0 mm",
          irrigationMethod: crop === "Rice" ? "Flood" : "Drip",
          fertilizerFlag: ndvi < 0.38,
          fertilizerNote: ndvi < 0.38 ? "Nitrogen concentration is below normal threshold. Apply Urea or NPK at 120 kg/Ha." : null,
          alerts: [
            "Paddy borer alert triggered due to humidity trends.",
            `District rainfall logs indicate dry soil across ${district} fields.`
          ],
          weeklyForecast: "Partly cloudy conditions. Precipitation probability is less than 15%. Direct solar radiation is highly suitable for ongoing tillering operations.",
          confidence: 88
        });
        setError("Note: Displaying simulated analysis report. (To use live Gemini capabilities, ensure process.env.GEMINI_API_KEY is configured under Settings > Secrets).");
      }, 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-300">
      
      {/* 1. Header cockpit */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-sky-500 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(16,185,129,0.25)] border border-white/10">
              🛰️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-display font-display font-black text-lg tracking-tight text-white m-0 leading-none">
                  AgriSense
                </h1>
                <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-400/20 leading-none">
                  Beta
                </span>
              </div>
              <p className="font-mono text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">
                Sentinel-2 Crop Analytics Interface
              </p>
            </div>
          </div>

          <div className="flex bg-slate-900/40 p-1 rounded-2xl border border-slate-900 overflow-hidden w-full sm:w-auto">
            <button
              onClick={() => setTab("input")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                tab === "input"
                  ? "bg-slate-950 text-white border border-slate-800 shadow-sm font-sans"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Compass size={14} />
              Telemetry Input
            </button>
            <button
              onClick={() => setTab("advisory")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                tab === "advisory"
                  ? "bg-slate-950 text-white border border-slate-800 shadow-sm font-sans"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Activity size={14} />
              Agricultural Advisory
            </button>
          </div>
        </div>
      </header>

      {/* 2. Quick stats mini ribbon */}
      <section className="bg-slate-950/20 border-b border-slate-900/60 py-3">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-xl">{cropInfo.icon}</span>
            <div>
              <span className="text-slate-500 uppercase block text-[9px]">ACTIVE CROP TYPE</span>
              <span className="font-bold text-slate-300">{crop}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-xl">📍</span>
            <div>
              <span className="text-slate-500 uppercase block text-[9px]">SCAN DISTRICT</span>
              <span className="font-bold text-slate-300">{district} (West Bengal)</span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-xl">📊</span>
            <div>
              <span className="text-slate-500 uppercase block text-[9px]">NDVI VIGOR</span>
              <span className={`font-bold ${ndviStatus === "good" ? "text-emerald-400" : ndviStatus === "warn" ? "text-amber-400" : "text-rose-400"}`}>
                {ndvi.toFixed(3)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="text-xl">💧</span>
            <div>
              <span className="text-slate-500 uppercase block text-[9px]">SOIL HYDRATION</span>
              <span className={`font-bold ${ndwiStatus === "good" ? "text-emerald-400" : ndwiStatus === "warn" ? "text-amber-400" : "text-rose-400"}`}>
                {ndwi.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main content body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* Error Notification Alert Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/10 border border-amber-500/20 text-amber-300 flex items-start gap-3 text-xs leading-relaxed max-w-4xl mx-auto shadow animate-pulse">
            <AlertCircle size={18} className="shrink-0 text-amber-400" />
            <p>{error}</p>
          </div>
        )}

        {tab === "input" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Hand Column: Crop Settings, Spectral Gauges, Canvas Viewer */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Crop Config */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                <div className="flex items-center gap-2">
                  <Sprout className="text-emerald-400" size={18} />
                  <h3 className="text-display text-sm font-bold font-display tracking-wider text-slate-200 uppercase">
                    Crop Configuration
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-tight">
                      CROP SPECIE
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {Object.keys(CROPS).map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            setCrop(c);
                            setStage(0);
                          }}
                          className={`py-2 px-1 rounded-xl border text-xs font-bold font-sans cursor-pointer transition-all ${
                            crop === c
                              ? "bg-slate-900 border-sky-400 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.1)]"
                              : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-300"
                          }`}
                        >
                          <div className="text-base mb-0.5">{CROPS[c].icon}</div>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-tight">
                      District (Eastern India/WB)
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="bg-slate-950 border border-slate-850 px-3 py-2.5 rounded-xl text-xs text-slate-200 outline-none focus:border-sky-500/50 cursor-pointer font-sans"
                    >
                      {[
                        "Bardhaman",
                        "Hooghly",
                        "Nadia",
                        "Murshidabad",
                        "North 24 Parganas",
                        "South 24 Parganas",
                        "Birbhum",
                        "Bankura",
                        "Cooch Behar"
                      ].map((d) => (
                        <option key={d} value={d} className="bg-slate-950 font-sans text-xs">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-tight">
                    Current Growth Stage
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {cropInfo.stages.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setStage(idx)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-tight cursor-pointer transition-all ${
                          stage === idx
                            ? "bg-sky-500/15 border-sky-400/80 text-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.1)]"
                            : "bg-slate-950/30 border-slate-800 text-slate-400 hover:text-slate-300"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Satellite Live Radar View mapping */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <SatelliteVisual
                  ndvi={ndvi}
                  ndwi={ndwi}
                  district={district}
                  onCoordinateSelect={handleCoordinateSelect}
                />
              </div>

            </div>

            {/* Right Hand Column: Silders/calibration gauges & Trends Analytics & Trigger CTA */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Telemetry slider parameters */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Database className="text-sky-400" size={18} />
                  <h3 className="text-display text-sm font-bold font-display tracking-wider text-slate-200 uppercase">
                    Calibrated Spectral Telemetry Log
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SpectralGauge
                    label="NDVI"
                    value={ndvi}
                    status={ndviStatus}
                    full="Vegetation Health Index"
                    min={SPECTRAL_BANDS.NDVI.min}
                    max={SPECTRAL_BANDS.NDVI.max}
                    onChange={setNdvi}
                  />
                  <SpectralGauge
                    label="NDWI"
                    value={ndwi}
                    status={ndwiStatus}
                    full="Water Content Index"
                    min={SPECTRAL_BANDS.NDWI.min}
                    max={SPECTRAL_BANDS.NDWI.max}
                    onChange={setNdwi}
                  />
                  <SpectralGauge
                    label="NDRE"
                    value={ndre}
                    status={ndreStatus}
                    full="Red Edge Chlorophyll Index"
                    min={SPECTRAL_BANDS.NDRE.min}
                    max={SPECTRAL_BANDS.NDRE.max}
                    onChange={setNdre}
                  />
                </div>
              </div>

              {/* Real-time Dynamic Trends Chart */}
              <TrendsChart
                data={trends}
                onAddSimulatedPoint={() => {}}
                onRecordCurrentPoint={handleRecordCurrentPoint}
                onReset={handleResetTrends}
                isSimulating={isSimulating}
                onToggleSimulation={handleToggleSimulation}
              />

              {/* Trigger primary analysis report */}
              <button
                onClick={generateAdvisory}
                disabled={loading}
                className="w-full py-4.5 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl cursor-pointer shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 transition-all text-sm font-bold tracking-wider uppercase font-sans flex items-center justify-center gap-2 border border-emerald-400/20"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    🛰️ Analyzing Field Soil and Crops Telemetry...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Submit Sensor Telemetry & Generate Crop Report
                  </>
                )}
              </button>
            </div>

          </div>
        )}

        {tab === "advisory" && (
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-center p-20 py-28 gap-6 bg-slate-950/80 border border-slate-950 rounded-3xl">
                <div className="text-5xl animate-spin-slow">🛰️</div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-display text-xl font-bold font-display text-sky-400">
                    Querying Satellite Grounding Data
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed mx-auto">
                    Sending NDVI, NDWI and NDRE calibrators to Gemini-3.5 cognitive cloud for precision Eastern India irrigation forecasting...
                  </p>
                </div>
                <div className="flex gap-1.5 justify-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-sky-400"
                      style={{ animation: `pulse 1.2s ${i * 0.4}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            ) : advisory ? (
              <AdvisoryDisplay
                advisory={advisory}
                loading={loading}
                onBackToInput={() => setTab("input")}
                crop={crop}
                stageText={cropInfo.stages[stage]}
                district={district}
                ndvi={ndvi}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-20 gap-4 bg-slate-950/80 border border-slate-950 rounded-3xl">
                <span className="text-4xl text-slate-500">📡</span>
                <h4 className="text-base font-bold text-slate-300">Advisory Report Queue Empty</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Go to input, configure your crop parameters, and generate telemetry readings first.
                </p>
                <button
                  onClick={() => setTab("input")}
                  className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold hover:text-white transition-all cursor-pointer"
                >
                  ← Go back to parameters
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer disclaimer lines */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-6 text-center font-mono text-[10px] text-slate-600 mt-auto">
        <p>© 2026 AgriSense Platform. Operating Grounding Node for ISRO Core &amp; Sentinel-2. All rights reserved.</p>
      </footer>
    </div>
  );
}
