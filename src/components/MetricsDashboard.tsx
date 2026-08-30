import React from "react";
import { EvaluationMetrics, RegistrationResult } from "../types";
import {
  CheckCircle2,
  AlertTriangle,
  Grid,
  Activity,
  Layers,
  Clock,
  Zap,
  Target,
} from "lucide-react";

interface MetricsDashboardProps {
  metrics: EvaluationMetrics;
  result: RegistrationResult;
}

export default function MetricsDashboard({ metrics, result }: MetricsDashboardProps) {
  const isSubPixelAccurate = metrics.rmse < 1.0;

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">

      {/* Top Evaluation Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-500/20">
            ISRO Quality Evaluation Metrics
          </span>
          <h3 className="text-display text-xl font-bold font-display text-slate-100 mt-1">
            Sub-Pixel Alignment &amp; Match Metrics
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock size={14} className="text-sky-400" />
            Compute: {result.processingTimeMs} ms
          </span>
        </div>
      </div>

      {/* Grid of Key Evaluation Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

        {/* Metric 1: RMSE */}
        <div className={`p-4 rounded-2xl border flex flex-col gap-1 transition-all ${
          isSubPixelAccurate
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : "bg-amber-950/20 border-amber-500/30 text-amber-300"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              RMSE Error
            </span>
            <Target size={14} className={isSubPixelAccurate ? "text-emerald-400" : "text-amber-400"} />
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-1">
            {metrics.rmse} <span className="text-xs font-normal text-slate-400">px</span>
          </span>
          <span className="text-[10px] font-mono opacity-80 mt-1">
            {isSubPixelAccurate ? "✅ Sub-Pixel Level" : "⚠️ >1.0 px shift"}
          </span>
        </div>

        {/* Metric 2: Inlier Count */}
        <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 text-slate-200 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Inlier Matches
            </span>
            <CheckCircle2 size={14} className="text-emerald-400" />
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-1 text-emerald-400">
            {metrics.inlierCount} <span className="text-xs font-normal text-slate-400">/ {metrics.totalCount}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            RANSAC Consensus
          </span>
        </div>

        {/* Metric 3: Inlier Ratio */}
        <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 text-slate-200 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Inlier Ratio
            </span>
            <Activity size={14} className="text-sky-400" />
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-1 text-sky-400">
            {(metrics.inlierRatio * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            Match Reliability
          </span>
        </div>

        {/* Metric 4: Mutual Information */}
        <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 text-slate-200 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Mutual Info (MI)
            </span>
            <Zap size={14} className="text-violet-400" />
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-1 text-violet-400">
            {metrics.mutualInformation}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            Multi-modal Score
          </span>
        </div>

        {/* Metric 5: SSIM */}
        <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 text-slate-200 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              SSIM Metric
            </span>
            <Layers size={14} className="text-amber-400" />
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-1 text-amber-400">
            {metrics.ssim}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            Structural Similarity
          </span>
        </div>

        {/* Metric 6: Uniform Distribution */}
        <div className="p-4 rounded-2xl border bg-slate-900/40 border-slate-800/80 text-slate-200 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
              Uniformity
            </span>
            <Grid size={14} className="text-teal-400" />
          </div>
          <span className="text-2xl font-black font-mono tracking-tight mt-1 text-teal-400">
            {(metrics.distributionUniformity * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-1">
            Grid Coverage
          </span>
        </div>

      </div>

      {/* Homography Matrix & Transformation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-900">

        {/* Matrix Display */}
        <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/60 font-mono text-xs flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Estimated Homography Matrix H (3x3)
          </span>
          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono text-slate-300">
            {result.transformMatrix.map((row, i) =>
              row.map((val, j) => (
                <div key={`${i}-${j}`} className="p-1.5 bg-slate-900/60 rounded border border-slate-800/60 text-[11px] font-bold text-sky-400">
                  {val.toFixed(5)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Geometric Transform Decomposition */}
        <div className="bg-slate-900/30 p-4 rounded-2xl border border-slate-800/60 flex flex-col justify-between gap-3">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Geometric Transformation Parameters
          </span>

          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Scale Ratio</span>
              <span className="text-sm font-bold text-slate-200">{result.scaleEstimated.toFixed(2)}x</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Rotation</span>
              <span className="text-sm font-bold text-slate-200">{result.rotationDegEstimated.toFixed(1)}°</span>
            </div>
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase block">Pixel Shift</span>
              <span className="text-sm font-bold text-slate-200">({result.translationX}, {result.translationY})</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 text-right">
            Max sub-pixel residual error in inliers: <span className="text-emerald-400 font-bold">{metrics.maxSubPixelResidual} px</span>
          </div>
        </div>

      </div>

    </div>
  );
}
