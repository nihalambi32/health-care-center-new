import React from 'react';

interface DataPoint {
  date: string;
  systolic?: number;
  diastolic?: number;
  value?: number;
}

interface TrendChartProps {
  data: DataPoint[];
  title?: string;
  type?: 'bp' | 'single';
  unit?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  type = 'bp',
  unit = 'mmHg',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400 font-mono">
        NO TELEMETRY RECORDED
      </div>
    );
  }

  const width = 500;
  const height = 180;
  const padding = 35;

  const dates = data.map((d) => d.date);

  if (type === 'bp') {
    const allVals = data.flatMap((d) => [d.systolic || 120, d.diastolic || 80]);
    const minVal = Math.max(40, Math.min(...allVals) - 10);
    const maxVal = Math.min(220, Math.max(...allVals) + 10);

    const getX = (index: number) =>
      padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
    const getY = (val: number) =>
      height - padding - ((val - minVal) / (maxVal - minVal)) * (height - padding * 2);

    const systolicPoints = data
      .map((d, i) => `${getX(i)},${getY(d.systolic || 120)}`)
      .join(' ');
    const diastolicPoints = data
      .map((d, i) => `${getX(i)},${getY(d.diastolic || 80)}`)
      .join(' ');

    return (
      <div className="w-full">
        {title && (
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-500">
            <span>{title}</span>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-vital-coral"></span> Systolic
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500"></span> Diastolic
              </span>
            </div>
          </div>
        )}
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
            {/* Clinical Target Range Band: 80 - 120 mmHg */}
            <rect
              x={padding}
              y={getY(120)}
              width={width - padding * 2}
              height={getY(80) - getY(120)}
              fill="rgba(16, 185, 129, 0.08)"
              rx="4"
            />
            <line
              x1={padding}
              y1={getY(120)}
              x2={width - padding}
              y2={getY(120)}
              stroke="rgba(16, 185, 129, 0.3)"
              strokeDasharray="4 4"
            />
            <line
              x1={padding}
              y1={getY(80)}
              x2={width - padding}
              y2={getY(80)}
              stroke="rgba(16, 185, 129, 0.3)"
              strokeDasharray="4 4"
            />

            {/* Systolic Line */}
            <polyline
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={systolicPoints}
            />

            {/* Diastolic Line */}
            <polyline
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={diastolicPoints}
            />

            {/* Data point dots */}
            {data.map((d, i) => (
              <g key={i}>
                <circle cx={getX(i)} cy={getY(d.systolic || 120)} r="4" fill="#F43F5E" />
                <circle cx={getX(i)} cy={getY(d.diastolic || 80)} r="4" fill="#0EA5E9" />
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }

  // Single metric trend
  const vals = data.map((d) => d.value || 0);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals) || 1;
  const getX = (index: number) =>
    padding + (index / Math.max(1, data.length - 1)) * (width - padding * 2);
  const getY = (val: number) =>
    height - padding - ((val - minVal) / Math.max(1, maxVal - minVal)) * (height - padding * 2);
  const points = data.map((d, i) => `${getX(i)},${getY(d.value || 0)}`).join(' ');

  return (
    <div className="w-full">
      {title && <div className="text-xs font-semibold text-slate-500 mb-3">{title} ({unit})</div>}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        <polyline
          fill="none"
          stroke="#0EA5E9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((d, i) => (
          <circle key={i} cx={getX(i)} cy={getY(d.value || 0)} r="4" fill="#0EA5E9" />
        ))}
      </svg>
    </div>
  );
};
