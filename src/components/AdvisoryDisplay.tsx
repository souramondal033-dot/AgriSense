import { useState, useEffect } from "react";
import { AdvisoryResponse } from "../types";
import {
  Droplet,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Sprout,
  Compass,
  Zap,
  Thermometer,
  Calendar,
} from "lucide-react";

interface AdvisoryDisplayProps {
  advisory: AdvisoryResponse;
  loading: boolean;
  onBackToInput: () => void;
  crop: string;
  stageText: string;
  district: string;
  ndvi: number;
}

// Reusable typewriter animation component
function TypingText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-sans leading-relaxed text-slate-300">
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-sky-400 animate-pulse font-mono">
          ▋
        </span>
      )}
    </span>
  );
}

export default function AdvisoryDisplay({
  advisory,
  loading,
  onBackToInput,
  crop,
  stageText,
  district,
  ndvi,
}: AdvisoryDisplayProps) {
  // Styles based on stress levels
  const stressThemes = {
    Low: { name: "Low Stress / Optimal Health", text: "text-emerald-400", bg: "bg-emerald-950/25 border-emerald-500/20", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]", labelBg: "bg-emerald-500/10 text-emerald-400" },
    Moderate: { name: "Moderate Stress", text: "text-amber-400", bg: "bg-amber-950/25 border-amber-500/20", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]", labelBg: "bg-amber-500/10 text-amber-400" },
    High: { name: "High Stress / Action Imperative", text: "text-orange-500", bg: "bg-orange-950/25 border-orange-500/20", glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]", labelBg: "bg-orange-500/10 text-orange-400" },
    Critical: { name: "Critical Core Distress", text: "text-rose-500", bg: "bg-rose-950/20 border-rose-500/20", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]", labelBg: "bg-rose-500/10 text-rose-400" },
  };

  const actionColors = {
    "Immediate": "text-rose-400 border-rose-500/30 bg-rose-500/10",
    "Within 48 hours": "text-orange-400 border-orange-500/30 bg-orange-500/10",
    "Within 1 week": "text-amber-400 border-amber-500/30 bg-amber-500/10",
    "Not Required": "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  };

  const currentTheme = stressThemes[advisory.stressLevel] || stressThemes.Low;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Banner Alert / Confidence */}
      <div className={`p-6 rounded-3xl border ${currentTheme.bg} ${currentTheme.glow} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-500`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${currentTheme.labelBg} border border-current-10`}>
            {advisory.stressLevel === "Low" ? (
              <CheckCircle2 size={24} />
            ) : advisory.stressLevel === "Moderate" ? (
              <Compass size={24} />
            ) : advisory.stressLevel === "High" ? (
              <AlertTriangle size={24} strokeWidth={2.5} />
            ) : (
              <Flame size={24} className="animate-pulse" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 leading-none">
              Sentinel stress analysis
            </span>
            <h2 className={`text-display text-2xl font-bold font-display leading-tight mt-1 ${currentTheme.text}`}>
              {advisory.stressLevel} Stress
            </h2>
          </div>
        </div>

        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 w-full sm:w-auto self-stretch sm:self-auto">
          <div className="text-right flex-1 sm:flex-none">
            <span className="text-[9px] font-mono uppercase text-slate-500 block">AI Evaluation Confidence</span>
            <span className="font-mono text-xl font-black text-sky-400">{advisory.confidence}%</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-slate-700/50 flex items-center justify-center font-mono font-bold text-xs text-sky-400 bg-sky-950/20 border-t-sky-400 border-r-sky-400 animate-spin-slow">
            {advisory.confidence}
          </div>
        </div>
      </div>

      {/* Grid: Irrigation Metrics Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-display text-xs font-bold font-display tracking-widest text-sky-400 uppercase flex items-center gap-1.5 border-b border-slate-900 pb-3">
          <Droplet size={14} />
          Irrigation advisory & moisture directives
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Action Badge */}
          <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-900/50 flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Recommendation Level</span>
            <span className={`text-sm font-bold rounded-lg px-2.5 py-1 text-center block mt-1 border ${actionColors[advisory.irrigationAction] || actionColors["Not Required"]}`}>
              {advisory.irrigationAction}
            </span>
          </div>

          {/* Water Volume Required */}
          <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-900/50 flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase block">Estimate Water Volume</span>
            <span className="text-sm font-black text-sky-400 font-mono mt-1 pt-0.5">
              💡 {advisory.waterAmount}
            </span>
          </div>

          {/* Delivery Method */}
          <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-900/50 flex flex-col gap-1 text-center sm:text-left">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Optimal Delivery Method</span>
            <span className="text-sm font-bold text-violet-400 flex items-center justify-center sm:justify-start gap-1 mt-1 pt-0.5 font-mono uppercase">
              <Zap size={14} /> {advisory.irrigationMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Details Analysis Typing Text */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vegetation Health Details */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
            <Sprout size={14} />
            Vegetation Crop Vigor Analysis
          </span>
          <div className="mt-2 min-h-[4rem]">
            <TypingText text={advisory.vegetationHealth} />
          </div>
        </div>

        {/* Moisture Stress Details */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase flex items-center gap-1.5">
            <Thermometer size={14} />
            Moisture & Hydration stress
          </span>
          <div className="mt-2 min-h-[4rem]">
            <TypingText text={advisory.moistureStatus} />
          </div>
        </div>
      </div>

      {/* Interactive System Alerts List */}
      {advisory.alerts && advisory.alerts.length > 0 && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
          <span className="text-[10px] font-mono font-bold tracking-widest text-amber-500 uppercase flex items-center gap-1.5">
            <AlertTriangle size={14} />
            Active Bio-Environmental Alerts
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
            {advisory.alerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 bg-slate-900/40 rounded-2xl border border-slate-800/60 hover:bg-slate-900/80 transition-all group"
              >
                <div className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/15 flex items-center justify-center text-xs font-mono font-bold group-hover:scale-105 transition-transform shrink-0">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-300 leading-normal font-sans pt-0.5">
                  {alert}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nitrogen Fertilizer Warning Segment */}
      {advisory.fertilizerFlag && advisory.fertilizerNote && (
        <div className="bg-amber-950/10 border border-amber-500/20 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-xl text-amber-400 shrink-0 shadow-sm animate-pulse">
            🧪
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 block mb-1">
              Nitrogen / Urea Fertilizer alert
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-mono">
              {advisory.fertilizerNote}
            </p>
          </div>
        </div>
      )}

      {/* 7-day weather trend forecast */}
      <div className="bg-gradient-to-r from-emerald-950/15 to-slate-950/90 border border-emerald-500/20 rounded-3xl p-6 shadow-xl flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
          <Calendar size={14} />
          7-Day Meteorological Guidance
        </span>
        <div className="mt-1 min-h-[3rem]">
          <TypingText text={advisory.weeklyForecast} />
        </div>
      </div>

      {/* Metadata Bottom Label */}
      <div className="bg-slate-950/40 rounded-2xl border border-slate-900 p-4 font-mono text-[10px] text-slate-500 flex flex-wrap justify-between items-center gap-2">
        <span>🛰️ Indices: NDVI: {ndvi.toFixed(3)} • Crop: {crop} ({stageText})</span>
        <span>District: {district}</span>
      </div>

      <button
        onClick={onBackToInput}
        className="w-full mt-2 py-4 rounded-2xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-100 font-sans text-sm font-semibold transition-all hover:bg-slate-900 cursor-pointer text-center hover:border-slate-700 shadow"
      >
        ← Adjust Mapping Calibration Index
      </button>
    </div>
  );
}
