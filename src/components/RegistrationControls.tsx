import React from "react";
import { LunarPreset, TransformationModel } from "../types";
import { LUNAR_PRESETS } from "../utils/registrationEngine";
import { Settings, Sliders, Sun, Shield, Cpu, RefreshCw } from "lucide-react";

interface RegistrationControlsProps {
  selectedPreset: LunarPreset;
  onSelectPreset: (preset: LunarPreset) => void;
  transformModel: TransformationModel;
  onChangeTransformModel: (model: TransformationModel) => void;
  outlierPercentage: number;
  onChangeOutlierPercentage: (val: number) => void;
  subPixelRefinement: boolean;
  onToggleSubPixelRefinement: (val: boolean) => void;
  showOutliers: boolean;
  onToggleShowOutliers: (val: boolean) => void;
  showMatchLines: boolean;
  onToggleShowMatchLines: (val: boolean) => void;
  onRunRegistration: () => void;
  isProcessing: boolean;
}

export default function RegistrationControls({
  selectedPreset,
  onSelectPreset,
  transformModel,
  onChangeTransformModel,
  outlierPercentage,
  onChangeOutlierPercentage,
  subPixelRefinement,
  onToggleSubPixelRefinement,
  showOutliers,
  onToggleShowOutliers,
  showMatchLines,
  onToggleShowMatchLines,
  onRunRegistration,
  isProcessing,
}: RegistrationControlsProps) {
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">

      {/* Preset Dataset Selection */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Cpu className="text-sky-400" size={18} />
          <h3 className="text-display text-sm font-bold font-display tracking-wider text-slate-200 uppercase">
            Chandrayaan-2 Optical Dataset Presets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {LUNAR_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-2 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-sky-950/30 border-sky-400/80 shadow-[0_0_15px_rgba(56,189,248,0.15)] text-slate-100"
                    : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-500/20">
                      {preset.sensor} vs {preset.referenceSource.replace("_", " ")}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Scale: {preset.scaleRatio}x
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 leading-snug mt-1">
                    {preset.location}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Res: {preset.resolutionSource}m ↔ {preset.resolutionRef}m</span>
                  <span>ΔSun Az: {Math.abs(preset.sunAzimuthSource - preset.sunAzimuthRef)}°</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Algorithm Control Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-900">

        {/* Transformation Model */}
        <div className="flex flex-col gap-2 p-3.5 bg-slate-900/30 rounded-2xl border border-slate-800/60">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-tight">
            Geometric Model
          </label>
          <select
            value={transformModel}
            onChange={(e) => onChangeTransformModel(e.target.value as TransformationModel)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 outline-none focus:border-sky-500/50 cursor-pointer font-sans"
          >
            <option value="Homography">Homography (3x3 Matrix)</option>
            <option value="Affine">Affine (Scale + Rotation + Shear)</option>
            <option value="Rigid">Rigid Body (Euclidean 2D)</option>
            <option value="Projective">Projective Perspective</option>
          </select>
        </div>

        {/* Outlier Threshold Control */}
        <div className="flex flex-col gap-2 p-3.5 bg-slate-900/30 rounded-2xl border border-slate-800/60">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-tight">
              RANSAC Outlier Noise
            </label>
            <span className="text-xs font-mono font-bold text-sky-400">
              {outlierPercentage}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={outlierPercentage}
            onChange={(e) => onChangeOutlierPercentage(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none mt-2"
          />
        </div>

        {/* Sub-Pixel Precision Toggle */}
        <div className="flex flex-col gap-2 p-3.5 bg-slate-900/30 rounded-2xl border border-slate-800/60 justify-center">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-tight mb-1">
            Sub-Pixel Optimization
          </label>
          <button
            onClick={() => onToggleSubPixelRefinement(!subPixelRefinement)}
            className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono cursor-pointer transition-all flex items-center justify-between ${
              subPixelRefinement
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-400"
                : "bg-slate-950/50 border-slate-800 text-slate-400"
            }`}
          >
            <span>Gaussian Sub-Pixel</span>
            <span>{subPixelRefinement ? "ENABLED" : "DISABLED"}</span>
          </button>
        </div>

        {/* Visibility Toggles */}
        <div className="flex flex-col gap-2 p-3.5 bg-slate-900/30 rounded-2xl border border-slate-800/60 justify-center">
          <label className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-tight mb-1">
            Display Overlay Filters
          </label>
          <div className="flex gap-1.5">
            <button
              onClick={() => onToggleShowOutliers(!showOutliers)}
              className={`flex-1 py-2 px-1.5 rounded-xl border text-[10px] font-mono font-bold cursor-pointer transition-all ${
                showOutliers
                  ? "bg-rose-950/40 border-rose-500/30 text-rose-400"
                  : "bg-slate-950/50 border-slate-800 text-slate-500"
              }`}
            >
              Outliers
            </button>
            <button
              onClick={() => onToggleShowMatchLines(!showMatchLines)}
              className={`flex-1 py-2 px-1.5 rounded-xl border text-[10px] font-mono font-bold cursor-pointer transition-all ${
                showMatchLines
                  ? "bg-sky-950/40 border-sky-500/30 text-sky-400"
                  : "bg-slate-950/50 border-slate-800 text-slate-500"
              }`}
            >
              Match Lines
            </button>
          </div>
        </div>

      </div>

      {/* Trigger Execute Engine Button */}
      <button
        onClick={onRunRegistration}
        disabled={isProcessing}
        className="w-full py-4 bg-gradient-to-tr from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-2xl cursor-pointer shadow-[0_4px_20px_rgba(56,189,248,0.25)] hover:shadow-[0_4px_25px_rgba(56,189,248,0.35)] transition-all text-xs font-bold tracking-wider uppercase font-sans flex items-center justify-center gap-2 border border-sky-400/20"
      >
        {isProcessing ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Executing Multi-Modal Sub-Pixel Alignment Engine...
          </>
        ) : (
          <>
            <Cpu size={16} />
            Compute Image Registration & Matching Points
          </>
        )}
      </button>

    </div>
  );
}
