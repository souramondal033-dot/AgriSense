import React, { useRef, useEffect, useState } from "react";
import { RegistrationResult, LunarPreset } from "../types";
import { ZoomIn, ZoomOut, RefreshCw, Eye, Layers } from "lucide-react";

interface RegistrationVisualizerProps {
  preset: LunarPreset;
  result: RegistrationResult;
  showOutliers: boolean;
  showMatchLines: boolean;
}

export default function RegistrationVisualizer({
  preset,
  result,
  showOutliers,
  showMatchLines,
}: RegistrationVisualizerProps) {
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const refCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const matchCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hoveredMatchId, setHoveredMatchId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const drawLunarSurface = (
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    isSource: boolean
  ) => {
    ctx.clearRect(0, 0, W, H);

    // Draw dark lunar background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, W, H);

    // Render procedural lunar crater features
    const seedOffset = isSource ? 12.5 : 0;
    const sunAzimuth = isSource ? preset.sunAzimuthSource : preset.sunAzimuthRef;
    const sunElevation = isSource ? preset.sunElevationSource : preset.sunElevationRef;
    const shadowDist = Math.max(2, (90 - sunElevation) * 0.15);
    const radAzimuth = (sunAzimuth * Math.PI) / 180;
    const shadowX = Math.cos(radAzimuth) * shadowDist;
    const shadowY = Math.sin(radAzimuth) * shadowDist;

    // Draw grid mesh overlay
    ctx.strokeStyle = "rgba(51, 65, 85, 0.25)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Craters list
    const craters = [
      { x: 250 + seedOffset, y: 180, r: 65, depth: 0.9 },
      { x: 120, y: 100, r: 40, depth: 0.7 },
      { x: 380, y: 290, r: 48, depth: 0.8 },
      { x: 150, y: 310, r: 30, depth: 0.6 },
      { x: 410, y: 110, r: 35, depth: 0.65 },
      { x: 280, y: 320, r: 22, depth: 0.5 },
      { x: 70, y: 220, r: 28, depth: 0.55 },
    ];

    for (const c of craters) {
      const cx = isSource ? c.x * 0.95 + 10 : c.x;
      const cy = isSource ? c.y * 0.95 + 5 : c.y;

      // Crater Outer Rim
      const gradRim = ctx.createRadialGradient(cx, cy, c.r * 0.7, cx, cy, c.r * 1.1);
      gradRim.addColorStop(0, "rgba(180, 195, 210, 0.2)");
      gradRim.addColorStop(0.8, "rgba(220, 235, 255, 0.6)");
      gradRim.addColorStop(1, "rgba(30, 41, 59, 0.1)");
      ctx.fillStyle = gradRim;
      ctx.beginPath();
      ctx.arc(cx, cy, c.r * 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Shadow Floor (Illumination dependent)
      ctx.fillStyle = "rgba(2, 6, 12, 0.88)";
      ctx.beginPath();
      ctx.arc(cx + shadowX, cy + shadowY, c.r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Sunlit Inner Wall
      const gradWall = ctx.createRadialGradient(
        cx - shadowX * 0.5,
        cy - shadowY * 0.5,
        c.r * 0.2,
        cx,
        cy,
        c.r * 0.85
      );
      gradWall.addColorStop(0, "rgba(255, 255, 255, 0.7)");
      gradWall.addColorStop(0.5, "rgba(160, 180, 200, 0.3)");
      gradWall.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradWall;
      ctx.beginPath();
      ctx.arc(cx, cy, c.r * 0.85, 0, Math.PI * 2);
      ctx.fill();

      // Central Peak
      if (c.r > 35) {
        ctx.fillStyle = "rgba(240, 245, 255, 0.85)";
        ctx.beginPath();
        ctx.arc(cx - shadowX * 0.2, cy - shadowY * 0.2, c.r * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  // Render match visualization canvas
  useEffect(() => {
    const srcCanvas = sourceCanvasRef.current;
    const refCanvas = refCanvasRef.current;
    const matchCanvas = matchCanvasRef.current;

    if (!srcCanvas || !refCanvas || !matchCanvas) return;

    const sCtx = srcCanvas.getContext("2d");
    const rCtx = refCanvas.getContext("2d");
    const mCtx = matchCanvas.getContext("2d");

    if (!sCtx || !rCtx || !mCtx) return;

    const W = 500;
    const H = 400;

    drawLunarSurface(sCtx, W, H, true);
    drawLunarSurface(rCtx, W, H, false);

    // Draw Combined Match Overlay Canvas
    mCtx.clearRect(0, 0, W * 2 + 16, H);

    // Draw background panels
    mCtx.drawImage(srcCanvas, 0, 0);
    mCtx.drawImage(refCanvas, W + 16, 0);

    // Divider bar
    mCtx.fillStyle = "#1e293b";
    mCtx.fillRect(W, 0, 16, H);

    // Render keypoints and correspondence lines
    const activeMatches = showOutliers
      ? result.matches
      : result.inlierMatches;

    for (const m of activeMatches) {
      const isHovered = m.id === hoveredMatchId || m.id === selectedMatchId;
      const pt1 = { x: m.sourcePt.x, y: m.sourcePt.y };
      const pt2 = { x: m.refPt.x + W + 16, y: m.refPt.y };

      // Line style
      if (showMatchLines || isHovered) {
        mCtx.beginPath();
        mCtx.moveTo(pt1.x, pt1.y);
        mCtx.lineTo(pt2.x, pt2.y);

        if (isHovered) {
          mCtx.strokeStyle = "#38bdf8";
          mCtx.lineWidth = 2.5;
        } else if (m.isInlier) {
          mCtx.strokeStyle = "rgba(16, 185, 129, 0.45)";
          mCtx.lineWidth = 1;
        } else {
          mCtx.strokeStyle = "rgba(244, 63, 94, 0.4)";
          mCtx.lineWidth = 0.8;
        }
        mCtx.stroke();
      }

      // Draw Keypoint markers on Source (Moving Image)
      mCtx.beginPath();
      mCtx.arc(pt1.x, pt1.y, m.isInlier ? 3.5 : 3, 0, Math.PI * 2);
      mCtx.fillStyle = m.isInlier ? "#10b981" : "#f43f5e";
      mCtx.fill();
      mCtx.strokeStyle = "#ffffff";
      mCtx.lineWidth = 0.8;
      mCtx.stroke();

      // Draw Keypoint markers on Reference (Fixed Image)
      mCtx.beginPath();
      mCtx.arc(pt2.x, pt2.y, m.isInlier ? 3.5 : 3, 0, Math.PI * 2);
      mCtx.fillStyle = m.isInlier ? "#10b981" : "#f43f5e";
      mCtx.fill();
      mCtx.stroke();

      // Highlight sub-pixel error vector when hovered
      if (isHovered) {
        mCtx.beginPath();
        mCtx.arc(pt1.x, pt1.y, 8, 0, Math.PI * 2);
        mCtx.strokeStyle = "#38bdf8";
        mCtx.lineWidth = 1.5;
        mCtx.stroke();

        // Sub-pixel residual label
        mCtx.fillStyle = "#ffffff";
        mCtx.font = "bold 10px monospace";
        mCtx.fillText(`Err: ${m.residualError}px`, pt1.x + 12, pt1.y - 6);
      }
    }
  }, [preset, result, showOutliers, showMatchLines, hoveredMatchId, selectedMatchId]);

  // Handle Canvas mouse interaction for point inspection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = matchCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    const W = 500;
    let foundId: string | null = null;

    for (const m of result.matches) {
      // Check distance to source point
      const distSrc = Math.hypot(m.sourcePt.x - x, m.sourcePt.y - y);
      // Check distance to ref point
      const distRef = Math.hypot(m.refPt.x + W + 16 - x, m.refPt.y - y);

      if (distSrc < 10 || distRef < 10) {
        foundId = m.id;
        break;
      }
    }

    setHoveredMatchId(foundId);
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase bg-sky-950/50 px-2.5 py-0.5 rounded border border-sky-500/20">
              Interactive Feature Match Viewer
            </span>
            <span className="text-xs font-mono text-slate-500">
              {result.inlierMatches.length} / {result.matches.length} Inliers
            </span>
          </div>
          <h3 className="text-display text-lg font-bold font-display text-slate-100 mt-1">
            Chandrayaan-2 {preset.sensor} (Source) ↔ {preset.referenceSource.replace("_", " ")} (Reference)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            RMSE: {result.metrics.rmse} px
          </span>
        </div>
      </div>

      {/* Main Dual Match Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-black p-1 shadow-2xl">
        <canvas
          ref={sourceCanvasRef}
          width={500}
          height={400}
          className="hidden"
        />
        <canvas
          ref={refCanvasRef}
          width={500}
          height={400}
          className="hidden"
        />
        <canvas
          ref={matchCanvasRef}
          width={1016}
          height={400}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredMatchId(null)}
          className="w-full h-auto cursor-crosshair rounded-xl block aspect-[1016/400]"
        />

        {/* Floating Labels */}
        <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono text-slate-200 border border-slate-800 shadow flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          SOURCE (Moving): Chandrayaan-2 {preset.sensor} ({preset.resolutionSource} m/px)
        </div>

        <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-mono text-slate-200 border border-slate-800 shadow flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-400" />
          REFERENCE (Fixed): {preset.referenceSource.replace("_", " ")} ({preset.resolutionRef} m/px)
        </div>

        {/* Legend Overlay at Bottom */}
        <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl text-[11px] font-mono text-slate-300 border border-slate-800/80 shadow flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Inlier Match (Residual &lt; 3.0px)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Outlier Match (Filtered)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-sky-400" />
              Hover Line
            </span>
          </div>
          <span className="text-slate-500 text-[10px]">
            Hover over match points to inspect sub-pixel error distance.
          </span>
        </div>
      </div>
    </div>
  );
}
