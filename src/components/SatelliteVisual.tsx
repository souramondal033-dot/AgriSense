import React, { useEffect, useRef, useState } from "react";

interface SatelliteVisualProps {
  ndvi: number;
  ndwi: number;
  district: string;
  onCoordinateSelect?: (coords: { ndvi: number; ndwi: number; x: number; y: number }) => void;
}

export default function SatelliteVisual({ ndvi, ndwi, district, onCoordinateSelect }: SatelliteVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<"composite" | "ndvi" | "ndwi">("composite");
  const [probeCoords, setProbeCoords] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Render underlying false color composite
    for (let x = 0; x < W; x += 2) {
      for (let y = 0; y < H; y += 2) {
        const nx = x / W;
        const ny = y / H;
        
        // Complex fractal-like organic noise for West Bengal farms:
        const noiseVal = Math.sin(nx * 10 + ny * 6) * 0.15 + 
                         Math.cos(nx * 5 - ny * 9) * 0.12 + 
                         Math.sin(nx * 20 + ny * 20) * 0.05;

        // Base local values
        const localNDVI = Math.max(-1, Math.min(1, ndvi + noiseVal));
        const localNDWI = Math.max(-1, Math.min(1, ndwi + noiseVal * 0.5));

        let r = 0, g = 0, b = 0;

        if (viewMode === "composite") {
          // False color composite (Healthy vegetation = bright red/infrared, water = deep blue, soil = beige)
          if (localNDVI > 0.4) {
            // Strong healthy vegetation appears in vibrant shades of infrared red
            r = Math.round(140 + localNDVI * 110);
            g = Math.round(30 + (1 - localNDVI) * 50);
            b = Math.round(40 + noiseVal * 30);
          } else if (localNDVI > 0.15) {
            // Moderate crops/grass
            r = Math.round(180 + localNDVI * 40);
            g = Math.round(120 + noiseVal * 60);
            b = Math.round(100);
          } else if (localNDWI > 0.05) {
            // Water bodies / irrigated fields
            r = Math.round(10);
            g = Math.round(45 + localNDWI * 30);
            b = Math.round(130 + localNDWI * 125);
          } else {
            // Dry fallow soil / barren land
            r = Math.round(155 - noiseVal * 50);
            g = Math.round(130 - noiseVal * 40);
            b = Math.round(100);
          }
        } else if (viewMode === "ndvi") {
          // NDVI heat map: Low is red/yellow, High is vibrant deep green
          if (localNDVI < 0.2) {
            r = 239; g = 68; b = 68; // Red
          } else if (localNDVI < 0.4) {
            r = 245; g = 158; b = 11; // Orange / Yellow
          } else {
            r = Math.round(34 - (localNDVI - 0.4) * 20);
            g = Math.round(130 + (localNDVI - 0.4) * 150);
            b = Math.round(40); // Rich healthy green
          }
        } else {
          // NDWI water index map: Dry is light brown/gray, Wet is bright neon aqua blue
          if (localNDWI < -0.05) {
            r = 139; g = 115; b = 85; // Dry soil brown
          } else if (localNDWI < 0.1) {
            r = 148; g = 163; b = 184; // Neutral grey
          } else {
            r = Math.round(14);
            g = Math.round(116 + localNDWI * 100);
            b = Math.round(204 + localNDWI * 50); // Neon aqua blue
          }
        }

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // Grid overlays (to look high-tech and accurate)
    ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Custom overlays: Draw any placed active probe
    if (probeCoords) {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      // Target crosshairs
      ctx.arc(probeCoords.x, probeCoords.y, 8, 0, Math.PI * 2);
      ctx.moveTo(probeCoords.x - 12, probeCoords.y);
      ctx.lineTo(probeCoords.x + 12, probeCoords.y);
      ctx.moveTo(probeCoords.x, probeCoords.y - 12);
      ctx.lineTo(probeCoords.x, probeCoords.y + 12);
      ctx.stroke();

      // Label
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.fillText("PROBE AT ACTIVE PLOT", probeCoords.x + 15, probeCoords.y - 4);
    }
  }, [ndvi, ndwi, viewMode, probeCoords]);

  // Handle active scan lines
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;

    const renderScan = () => {
      const scanY = (Date.now() / 25) % H;
      // Draw a subtle translucent scanline trace over the canvas
      ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
      ctx.fillRect(0, scanY - 6, W, 12);

      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(W, scanY);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(renderScan);
    };

    animationFrameId = requestAnimationFrame(renderScan);
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewMode, ndvi, ndwi, probeCoords]);

  // Handle clicking the canvas to place a probe and calculate coordinate index values
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Scale standard dimensions
    const normX = x / rect.width;
    const normY = y / rect.height;

    const canvasX = Math.round(normX * canvas.width);
    const canvasY = Math.round(normY * canvas.height);

    setProbeCoords({ x: canvasX, y: canvasY });

    // Derive organic local values based on click location
    const noiseVal = Math.sin((canvasX / canvas.width) * 10 + (canvasY / canvas.height) * 6) * 0.15 + 
                     Math.cos((canvasX / canvas.width) * 5 - (canvasY / canvas.height) * 9) * 0.12;

    const localNDVI = Math.max(-1, Math.min(1, ndvi + noiseVal));
    const localNDWI = Math.max(-1, Math.min(1, ndwi + noiseVal * 0.5));

    if (onCoordinateSelect) {
      onCoordinateSelect({
        ndvi: localNDVI,
        ndwi: localNDWI,
        x: canvasX,
        y: canvasY
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-display text-xs font-bold tracking-wider text-sky-400 uppercase flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          Live Satellite Mapping Grid
        </span>
        <div className="flex gap-1">
          {(["composite", "ndvi", "ndwi"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`rounded px-2.5 py-1 text-[10px] uppercase font-mono font-bold tracking-tight transition-all cursor-pointer ${
                viewMode === mode
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_10px_rgba(56,189,248,0.15)]"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800/60"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1 shadow-inner">
        <canvas
          ref={canvasRef}
          width={400}
          height={240}
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair rounded border border-slate-900 block aspect-[5/3] bg-black"
        />

        {/* High-tech overlay label */}
        <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded text-[9px] font-mono text-slate-400 border border-slate-800/80 shadow">
          {viewMode === "composite" ? "SWIR-NIR-RED • False Color NCC" : viewMode === "ndvi" ? "NDVI • Vegetation Health index" : "NDWI • Moisture Index map"}
        </div>

        {/* Dynamic target helper */}
        <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded text-[9px] font-mono text-sky-400 border border-slate-800/80 shadow">
          Live Tracking: {district}
        </div>
      </div>
      <p className="text-[11px] text-slate-400 leading-normal font-sans text-center">
        💡 <span className="font-semibold text-sky-400">Click anywhere on the satellite view</span> to analyze localized soil plots and crop variations.
      </p>
    </div>
  );
}
