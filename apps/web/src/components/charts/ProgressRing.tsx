import React from 'react';

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  // Dynamic clinical color gradient based on adherence
  const getColor = () => {
    if (clampedPercentage >= 80) return '#10B981'; // Emerald (Normal/Good)
    if (clampedPercentage >= 50) return '#F59E0B'; // Amber (Caution)
    return '#F43F5E'; // Coral/Crimson (Urgent attention)
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-800"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xl font-extrabold font-mono text-slate-800 dark:text-slate-100">
          {Math.round(clampedPercentage)}%
        </span>
        {label && <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
};
