import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendDataPoint } from "../types";
import { Plus, Play, RotateCcw, HelpCircle } from "lucide-react";

interface TrendsChartProps {
  data: TrendDataPoint[];
  onAddSimulatedPoint: () => void;
  onRecordCurrentPoint: () => void;
  onReset: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export default function TrendsChart({
  data,
  onAddSimulatedPoint,
  onRecordCurrentPoint,
  onReset,
  isSimulating,
  onToggleSimulation,
}: TrendsChartProps) {
  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-6 relative overflow-hidden">
      {/* Background ambient mesh */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/20 shadow-sm">
            📈 Real-Time Data Trends
          </span>
          <h3 className="text-display text-xl font-bold font-display text-slate-100 mt-2 tracking-tight">
            Spectral Bio-Analytics Stream
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tracking index evolution metrics (NDVI, NDWI, NDRE) over sequential satellite Passes.
          </p>
        </div>

        {/* Real-time simulations controls */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={onRecordCurrentPoint}
            title="Saves current slider settings as a historical data point"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-all border border-sky-500/30 font-sans shadow"
          >
            <Plus size={14} />
            Log Plot Reading
          </button>

          <button
            onClick={onToggleSimulation}
            className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all border ${
              isSimulating
                ? "bg-rose-950/60 text-rose-400 border-rose-500/30"
                : "bg-emerald-950/60 text-emerald-400 border-emerald-500/30"
            }`}
          >
            <Play size={14} className={isSimulating ? "animate-pulse" : ""} />
            {isSimulating ? "Stop Live Stream" : "Live Stream Simulation"}
          </button>

          <button
            onClick={onReset}
            title="Reset history logs"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 rounded-xl cursor-pointer transition-all"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-64 w-full bg-slate-950 rounded-2xl p-2 border border-slate-900 relative">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950 rounded-2xl">
            <HelpCircle size={36} className="text-slate-600 mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-300">No telemetry logs captured yet</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Click &quot;Log Plot Reading&quot; or start &quot;Live Stream Simulation&quot; to populate your real-time satellite trend dashboard.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="ndviGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
              <XAxis
                dataKey="time"
                stroke="#475569"
                fontSize={10}
                fontFamily="monospace"
                dy={10}
              />
              <YAxis
                stroke="#475569"
                fontSize={10}
                fontFamily="monospace"
                domain={[-1, 1]}
                tickCount={5}
                dx={-5}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(2, 11, 24, 0.95)",
                  borderColor: "#1e293b",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#e2e8f0",
                  fontFamily: "monospace",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
                }}
                labelStyle={{ fontWeight: "700", color: "#38bdf8" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontSize: "11px",
                  fontFamily: "monospace",
                  color: "#94a3b8",
                }}
              />
              <Line
                name="NDVI (Crop Vigor)"
                type="monotone"
                dataKey="ndvi"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, stroke: "#10b981", strokeWidth: 1, fill: "#020617" }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="NDWI (Water Hydration)"
                type="monotone"
                dataKey="ndwi"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={{ r: 3, stroke: "#38bdf8", strokeWidth: 1, fill: "#020617" }}
                activeDot={{ r: 5 }}
              />
              <Line
                name="NDRE (Nitrogen levels)"
                type="monotone"
                dataKey="ndre"
                stroke="#a855f7"
                strokeWidth={2}
                dot={{ r: 3, stroke: "#a855f7", strokeWidth: 1, fill: "#020617" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Info Stats Row */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-2 border-t border-slate-900 pt-4 font-mono">
          <div className="px-3 py-1 bg-slate-900/40 rounded-xl border border-slate-800/40">
            <span className="text-[9px] text-slate-500 uppercase block">Sample Size</span>
            <span className="text-sm font-bold text-slate-300">{data.length} Scans</span>
          </div>
          <div className="px-3 py-1 bg-slate-900/40 rounded-xl border border-slate-800/40">
            <span className="text-[9px] text-slate-500 uppercase block">Max NDVI Peak</span>
            <span className="text-sm font-bold text-emerald-400">
              +{Math.max(...data.map((d) => d.ndvi)).toFixed(2)}
            </span>
          </div>
          <div className="px-3 py-1 bg-slate-900/40 rounded-xl border border-slate-800/40">
            <span className="text-[9px] text-slate-500 uppercase block">Min NDWI Dip</span>
            <span className="text-sm font-bold text-sky-400">
              {Math.min(...data.map((d) => d.ndwi)).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
