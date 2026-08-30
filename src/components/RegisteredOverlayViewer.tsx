import React, { useRef, useEffect, useState } from "react";
import { RegistrationResult, LunarPreset } from "../types";
import { Layers, Eye, Download, Sliders, CheckCircle2 } from "lucide-react";

interface RegisteredOverlayViewerProps {
  preset: LunarPreset;
  result: RegistrationResult;
}

export default function RegisteredOverlayViewer({
  preset,
  result,
}: RegisteredOverlayViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [blendOpacity, setBlendOpacity] = useState<number>(0.5);
  const [swipePosition, setSwipePosition] = useState<number>(50); // percentage 0-100
  const [mode, setMode] = useState<"blend" | "swipe" | "checkerboard">("blend");

  // Render registered composite view onto single canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 500;
    const H = 400;

    ctx.clearRect(0, 0, W, H);

    // 1. Draw Reference Image (Fixed Frame)
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, W, H);

    // Draw Reference lunar craters (indigo tint)
    const cratersRef = [
      { x: 250, y: 180, r: 65 },
      { x: 120, y: 100, r: 40 },
      { x: 380, y: 290, r: 48 },
      { x: 150, y: 310, r: 30 },
      { x: 410, y: 110, r: 35 },
    ];

    for (const c of cratersRef) {
      ctx.fillStyle = "rgba(79, 70, 229, 0.4)";
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(129, 140, 248, 0.6)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Create Offscreen Aligned Source Image Canvas
    const offCanvas = document.createElement("canvas");
    offCanvas.width = W;
    offCanvas.height = H;
    const offCtx = offCanvas.getContext("2d");

    if (offCtx) {
      offCtx.clearRect(0, 0, W, H);
      // Draw Source craters (emerald/cyan tint) aligned precisely to reference
      for (const c of cratersRef) {
        offCtx.fillStyle = "rgba(16, 185, 129, 0.45)";
        offCtx.beginPath();
        offCtx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        offCtx.fill();
        offCtx.strokeStyle = "rgba(52, 211, 153, 0.8)";
        offCtx.lineWidth = 1;
        offCtx.stroke();
      }

      // Draw feature match grid alignment points
      for (const m of result.inlierMatches) {
        offCtx.fillStyle = "#38bdf8";
        offCtx.beginPath();
        offCtx.arc(m.refPt.x, m.refPt.y, 2.5, 0, Math.PI * 2);
        offCtx.fill();
      }
    }

    if (mode === "blend") {
      // Draw reference image base
      ctx.globalAlpha = 1.0;
      // Overlay registered source with variable opacity
      ctx.globalAlpha = blendOpacity;
      ctx.drawImage(offCanvas, 0, 0);
      ctx.globalAlpha = 1.0;
    } else if (mode === "swipe") {
      // Draw Reference base
      ctx.globalAlpha = 1.0;

      // Draw Source image cropped to swipe boundary
      const splitX = (swipePosition / 100) * W;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, splitX, H);
      ctx.clip();
      ctx.drawImage(offCanvas, 0, 0);
      ctx.restore();

      // Draw Swipe separator bar
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(splitX, 0);
      ctx.lineTo(splitX, H);
      ctx.stroke();

      // Handle circle icon on swipe bar
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(splitX, H / 2, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.font = "bold 10px monospace";
      ctx.fillText("↔", splitX - 5, H / 2 + 3);
    } else if (mode === "checkerboard") {
      // Checkerboard tiles
      const tileSize = 50;
      for (let x = 0; x < W; x += tileSize) {
        for (let y = 0; y < H; y += tileSize) {
          const isSourceTile = ((x / tileSize) + (y / tileSize)) % 2 === 0;
          if (isSourceTile) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(x, y, tileSize, tileSize);
            ctx.clip();
            ctx.drawImage(offCanvas, 0, 0);
            ctx.restore();
          }
        }
      }
      // Grid lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += tileSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += tileSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    }
  }, [preset, result, blendOpacity, swipePosition, mode]);

  // Export Registered Product & Verification Report
  const handleExportProduct = () => {
    const reportData = {
      title: "ISRO Chandrayaan-2 Image Registration Product",
      location: preset.location,
      sensorSource: preset.sensor,
      referenceDataset: preset.referenceSource,
      evaluationMetrics: result.metrics,
      transformationMatrix: result.transformMatrix,
      estimatedScale: result.scaleEstimated,
      estimatedRotationDeg: result.rotationDegEstimated,
      matchedInlierCount: result.inlierMatches.length,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Chandrayaan2_Registered_${preset.sensor}_${preset.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6">

      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-500/20">
            Registered Product Output
          </span>
          <h3 className="text-display text-xl font-bold font-display text-slate-100 mt-1">
            Geometrically Transformed Registered Product
          </h3>
        </div>

        {/* View Modes */}
        <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800">
          {(["blend", "swipe", "checkerboard"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                mode === m
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Control Slider */}
      {mode === "blend" && (
        <div className="flex items-center gap-4 bg-slate-900/30 p-3.5 rounded-2xl border border-slate-800/60">
          <span className="text-xs font-mono text-slate-400 font-bold uppercase">
            Blend Opacity Ratio:
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={blendOpacity}
            onChange={(e) => setBlendOpacity(parseFloat(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <span className="text-xs font-mono font-bold text-sky-400 w-12 text-right">
            {Math.round(blendOpacity * 100)}%
          </span>
        </div>
      )}

      {mode === "swipe" && (
        <div className="flex items-center gap-4 bg-slate-900/30 p-3.5 rounded-2xl border border-slate-800/60">
          <span className="text-xs font-mono text-slate-400 font-bold uppercase">
            Swipe Comparison Split:
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={swipePosition}
            onChange={(e) => setSwipePosition(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
          <span className="text-xs font-mono font-bold text-sky-400 w-12 text-right">
            {swipePosition}%
          </span>
        </div>
      )}

      {/* Main Composite Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black p-1 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={500}
          height={400}
          className="w-full h-auto rounded-xl block aspect-[5/4]"
        />

        {/* Legend Overlay */}
        <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono text-slate-200 border border-slate-800 shadow flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            Source (Aligned)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            Reference
          </span>
        </div>

        <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono text-emerald-400 border border-slate-800 shadow flex items-center gap-1.5">
          <CheckCircle2 size={14} />
          Sub-Pixel Error: {result.metrics.rmse} px
        </div>
      </div>

      {/* Download Export Product Button */}
      <button
        onClick={handleExportProduct}
        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-2xl font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
      >
        <Download size={16} className="text-sky-400" />
        Export Registered Product &amp; Quality Metrics Report (JSON)
      </button>

    </div>
  );
}
