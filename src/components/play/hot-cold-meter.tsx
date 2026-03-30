"use client";

interface HotColdMeterProps {
  zone: string;
  color: string;
  label: string;
  emoji: string;
  distance: string;
}

const ZONE_POSITIONS: Record<string, number> = {
  icy: 10,
  cold: 30,
  warm: 50,
  hot: 70,
  burning: 90,
};

export default function HotColdMeter({ zone, color, label, emoji, distance }: HotColdMeterProps) {
  const position = ZONE_POSITIONS[zone] || 50;

  return (
    <div
      className="flex flex-col items-center gap-2 rounded-xl bg-white/90 backdrop-blur p-4 shadow-lg"
      role="meter"
      aria-valuenow={position}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Hot cold meter: ${label}, ${distance}`}
    >
      <div className="text-2xl" aria-hidden="true">{emoji}</div>

      {/* Meter bar */}
      <div className="relative w-8 h-48 rounded-full overflow-hidden bg-gradient-to-t from-blue-500 via-green-400 via-orange-400 to-red-500" aria-hidden="true">
        {/* Indicator */}
        <div
          className="absolute left-0 right-0 h-3 rounded-full bg-white shadow-md border-2 transition-all duration-700 ease-out"
          style={{
            bottom: `${position}%`,
            borderColor: color,
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold" style={{ color }}>{label}</p>
        <p className="text-xs text-gray-500">{distance}</p>
      </div>
    </div>
  );
}
