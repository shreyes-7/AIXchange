import React from "react";
import { Thermometer, Activity, Zap, Gauge, RotateCw } from "lucide-react";

export default function FeatureSliders({ features = [24.5, 0.082, 380.2, 1.42, 1850], onChange }) {
  const [temp, vib, volt, press, rpm] = features;

  const updateIndex = (idx, val) => {
    const updated = [...features];
    updated[idx] = parseFloat(val);
    onChange(updated);
  };

  const sliders = [
    {
      label: "Bearing Operating Temperature",
      unit: "°C",
      value: temp ?? 24.5,
      min: 0,
      max: 120,
      step: 0.5,
      nominal: [20, 55],
      icon: <Thermometer className="w-3.5 h-3.5 text-rose-400" />,
      idx: 0,
    },
    {
      label: "Radial Mechanical Vibration",
      unit: "g (accel)",
      value: vib ?? 0.082,
      min: 0.0,
      max: 1.0,
      step: 0.005,
      nominal: [0.01, 0.18],
      icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
      idx: 1,
    },
    {
      label: "Line Bus Operating Voltage",
      unit: "V",
      value: volt ?? 380.2,
      min: 150,
      max: 480,
      step: 1.0,
      nominal: [340, 420],
      icon: <Zap className="w-3.5 h-3.5 text-amber-400" />,
      idx: 2,
    },
    {
      label: "Hydraulic Line Pressure",
      unit: "bar",
      value: press ?? 1.42,
      min: 0.0,
      max: 5.0,
      step: 0.05,
      nominal: [1.0, 2.5],
      icon: <Gauge className="w-3.5 h-3.5 text-purple-400" />,
      idx: 3,
    },
    {
      label: "Rotor Spindle Angular Speed",
      unit: "RPM",
      value: rpm ?? 1850,
      min: 600,
      max: 3200,
      step: 25,
      nominal: [1400, 2200],
      icon: <RotateCw className="w-3.5 h-3.5 text-emerald-400" />,
      idx: 4,
    },
  ];

  return (
    <div className="space-y-4">
      {sliders.map((s) => {
        const isOutOfNominal = s.value < s.nominal[0] || s.value > s.nominal[1];
        return (
          <div
            key={s.idx}
            className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                {s.icon}
                <span>{s.label}</span>
              </span>
              <div className="flex items-center gap-2">
                {isOutOfNominal && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-800/60 font-bold">
                    STRESS ZONE
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                  {s.value} {s.unit}
                </span>
              </div>
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => updateIndex(s.idx, e.target.value)}
              className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>{s.min} {s.unit}</span>
              <span className="text-slate-400">Nominal: {s.nominal[0]} - {s.nominal[1]} {s.unit}</span>
              <span>{s.max} {s.unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
