import React from 'react';

export default function Gauge({ value, color = '#ef4d23', showLabels = false, min, max }) {
  const totalTicks = 40;
  const activeTicks = Math.round((value / 100) * totalTicks);

  const ticks = [];
  for (let i = 0; i < totalTicks; i++) {
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const x1 = 100 + 70 * Math.cos(angle);
    const y1 = 100 + 70 * Math.sin(angle);
    const x2 = 100 + 80 * Math.cos(angle);
    const y2 = 100 + 80 * Math.sin(angle);

    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={i < activeTicks ? color : '#d4d4d8'}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    );
  }

  return (
    <div className="w-full">
      <svg viewBox="0 0 200 120" className="w-full max-w-[260px] mx-auto">
        {ticks}
        <text
          x="100"
          y="105"
          textAnchor="middle"
          fontSize="22"
          fontWeight="600"
          fill="currentColor"
        >
          {value}%
        </text>
      </svg>
      {showLabels && (
        <div className="flex justify-between text-[11px] text-neutral-500 px-4 -mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
