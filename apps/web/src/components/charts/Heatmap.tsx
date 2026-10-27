import React from 'react';

interface HeatmapDay {
  date: string;
  count: number; // 0 = none, 1-4 = activity level
}

interface HeatmapProps {
  days?: HeatmapDay[];
  weeksCount?: number;
}

export const Heatmap: React.FC<HeatmapProps> = ({ days = [], weeksCount = 12 }) => {
  // Generate synthetic days if empty
  const totalDays = weeksCount * 7;
  const renderedDays = React.useMemo(() => {
    if (days.length >= totalDays) return days.slice(-totalDays);

    const result: HeatmapDay[] = [];
    const now = new Date();
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]!;
      const existing = days.find((item) => item.date === dateStr);
      result.push({
        date: dateStr,
        count: existing ? existing.count : Math.floor(Math.random() * 4),
      });
    }
    return result;
  }, [days, totalDays]);

  const getColor = (count: number) => {
    switch (count) {
      case 1:
        return 'bg-primary-900/40 border-primary-800/50';
      case 2:
        return 'bg-primary-700/60 border-primary-600/60';
      case 3:
        return 'bg-primary-500 border-primary-400';
      case 4:
        return 'bg-vital-emerald border-emerald-400';
      default:
        return 'bg-slate-200/50 dark:bg-slate-800/40 border-transparent';
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="grid grid-rows-7 grid-flow-col gap-1.5 w-max">
        {renderedDays.map((day, idx) => (
          <div
            key={idx}
            title={`${day.date}: ${day.count} health events`}
            className={`w-3.5 h-3.5 rounded-sm border ${getColor(day.count)} transition-all hover:scale-125 hover:z-10`}
          />
        ))}
      </div>
      <div className="flex items-center justify-end space-x-2 text-[10px] text-slate-400 mt-3 font-mono">
        <span>Less</span>
        <span className="w-2.5 h-2.5 rounded-sm bg-slate-800/40"></span>
        <span className="w-2.5 h-2.5 rounded-sm bg-primary-900/40"></span>
        <span className="w-2.5 h-2.5 rounded-sm bg-primary-700/60"></span>
        <span className="w-2.5 h-2.5 rounded-sm bg-primary-500"></span>
        <span className="w-2.5 h-2.5 rounded-sm bg-vital-emerald"></span>
        <span>More</span>
      </div>
    </div>
  );
};
