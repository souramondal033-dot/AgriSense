interface SpectralGaugeProps {
  label: string;
  value: number;
  status: "good" | "warn" | "bad";
  full: string;
  min: number;
  max: number;
  onChange?: (val: number) => void;
}

export default function SpectralGauge({
  label,
  value,
  status,
  full,
  min,
  max,
  onChange,
}: SpectralGaugeProps) {
  const pct = ((value - min) / (max - min)) * 100;

  const colors = {
    good: "text-emerald-400 bg-emerald-400",
    warn: "text-amber-400 bg-amber-400",
    bad: "text-rose-400 bg-rose-400",
  };

  const borderColors = {
    good: "border-emerald-500/20 bg-emerald-950/20",
    warn: "border-amber-500/20 bg-amber-950/20",
    bad: "border-rose-500/20 bg-rose-950/20",
  };

  const statusLabels = {
    good: "Optimal Health",
    warn: "Moderate Stress",
    bad: "Water / Nutrients Deficit",
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${borderColors[status]} flex flex-col gap-3 shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <span className="font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
            {label}
          </span>
          <h4 className="text-sm font-semibold text-slate-200 mt-0.5 leading-tight">{full}</h4>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-bold tracking-tight">
            <span className={`${status === "good" ? "text-emerald-400" : status === "warn" ? "text-amber-400" : "text-rose-400"}`}>
              {value >= 0 ? "+" : ""}{value.toFixed(3)}
            </span>
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${colors[status].split(" ")[0]} opacity-80`}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="relative">
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${colors[status].split(" ")[1]}`}
            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          />
        </div>
        {/* Pointer indicators for min / max */}
        <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500 font-mono">
          <span>Min: {min}</span>
          <span>Max: {max}</span>
        </div>
      </div>

      {/* Manual calibration input range slider inside the gauge for quick tweaking */}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={0.01}
          value={value}
          onChange={(e) => onChange && onChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
        />
        <span className="text-[10px] font-mono text-sky-400 bg-sky-950/40 px-1.5 py-0.5 rounded border border-sky-500/20">
          Calibrate
        </span>
      </div>
    </div>
  );
}
