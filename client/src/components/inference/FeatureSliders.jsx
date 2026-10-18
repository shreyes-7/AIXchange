import React from "react";
import {
  Thermometer,
  Activity,
  Zap,
  Gauge,
  RotateCw,
  Radio,
  Volume2,
  BarChart3,
  Sliders,
  Compass,
  TrendingUp,
  Waves,
  Boxes,
  Flame,
  Cpu,
} from "lucide-react";

const ICON_MAP = {
  Thermometer,
  Activity,
  Zap,
  Gauge,
  RotateCw,
  Radio,
  Volume2,
  BarChart3,
  Sliders,
  Compass,
  TrendingUp,
  Waves,
  Boxes,
  Flame,
  Cpu,
};

export default function FeatureSliders({
  schema = [],
  features = [],
  onChange,
}) {
  const updateIndex = (idx, val) => {
    const updated = [...features];
    updated[idx] = parseFloat(val);
    onChange(updated);
  };

  // If no schema provided, graceful fallback
  const activeSchema =
    Array.isArray(schema) && schema.length > 0
      ? schema
      : [
          {
            name: "Bearing Operating Temperature",
            unit: "°C",
            min: 0,
            max: 120,
            step: 0.5,
            nominal: [20, 55],
            defaultValue: 24.5,
            icon: "Thermometer",
            color: "text-rose-400",
          },
          {
            name: "Radial Mechanical Vibration",
            unit: "g (accel)",
            min: 0.0,
            max: 1.0,
            step: 0.005,
            nominal: [0.01, 0.18],
            defaultValue: 0.082,
            icon: "Activity",
            color: "text-cyan-400",
          },
          {
            name: "Line Bus Operating Voltage",
            unit: "V",
            min: 150,
            max: 480,
            step: 1.0,
            nominal: [340, 420],
            defaultValue: 380.2,
            icon: "Zap",
            color: "text-amber-400",
          },
          {
            name: "Hydraulic Line Pressure",
            unit: "bar",
            min: 0.0,
            max: 5.0,
            step: 0.05,
            nominal: [1.0, 2.5],
            defaultValue: 1.42,
            icon: "Gauge",
            color: "text-purple-400",
          },
          {
            name: "Rotor Spindle Angular Speed",
            unit: "RPM",
            min: 600,
            max: 3200,
            step: 25,
            nominal: [1400, 2200],
            defaultValue: 1850,
            icon: "RotateCw",
            color: "text-emerald-400",
          },
        ];

  return (
    <div className="space-y-4">
      {activeSchema.map((field, idx) => {
        const val =
          features[idx] !== undefined && features[idx] !== null
            ? features[idx]
            : field.defaultValue ?? (field.min + field.max) / 2;

        const nominal = field.nominal || [field.min, field.max];
        const isOutOfNominal = val < nominal[0] || val > nominal[1];

        // Resolve icon
        const IconComponent =
          typeof field.icon === "string"
            ? ICON_MAP[field.icon] || Activity
            : Activity;
        const iconColor = field.color || "text-cyan-400";

        return (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <IconComponent className={`w-3.5 h-3.5 ${iconColor}`} />
                <span>{field.name || `Feature #${idx + 1}`}</span>
              </span>
              <div className="flex items-center gap-2">
                {isOutOfNominal && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/60 font-bold">
                    STRESS ZONE
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                  {val} {field.unit || ""}
                </span>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={field.min}
              max={field.max}
              step={field.step || 1}
              value={val}
              onChange={(e) => updateIndex(idx, e.target.value)}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>
                {field.min} {field.unit}
              </span>
              <span className="text-slate-400">
                Nominal: {nominal[0]} - {nominal[1]} {field.unit}
              </span>
              <span>
                {field.max} {field.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
