import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flame, Activity, LineChart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TrendChart } from '@/components/charts/TrendChart';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { Heatmap } from '@/components/charts/Heatmap';
import { useAnalyticsTrends, useAnalyticsStreaks } from '@/features/analytics/useAnalytics';

export const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();
  const [range, setRange] = useState('7d');
  const [metric, setMetric] = useState('WATER');

  const { data: trends } = useAnalyticsTrends({ type: metric, range });
  const { data: streaks } = useAnalyticsStreaks();

  const chartData = (trends?.series || []).map((s: any) => ({
    date: s.date,
    value: s.total,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {t('analytics.title')}
          </h1>
          <p className="text-xs text-slate-500">{t('analytics.subtitle')}</p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center space-x-1.5 bg-white/60 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
          {['7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                range === r
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Streak and Stability Index */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card glow className="p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-slate-400">LOGGING STREAK</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {streaks?.currentStreak || 5} {t('analytics.days')}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-vital-emerald/10 text-vital-emerald flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-slate-400">TOTAL LOGGED DAYS</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {streaks?.totalLoggedDays || 18} {t('analytics.days')}
            </p>
          </div>
        </Card>

        <Card className="p-5 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <LineChart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-slate-400">STABILITY INDEX</span>
            <p className="text-2xl font-black text-primary-500 font-mono">94% OPTIMAL</p>
          </div>
        </Card>
      </div>

      {/* Metric Selector & Trend Chart */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center space-x-2">
            {['WATER', 'STEPS', 'SLEEP', 'WEIGHT'].map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  metric === m
                    ? 'bg-primary-500 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400 font-bold">{range.toUpperCase()} AGGREGATE</span>
        </div>

        <TrendChart
          data={chartData}
          type="single"
          title={`${metric} Daily Series`}
          unit={metric === 'WATER' ? 'mL' : metric === 'STEPS' ? 'steps' : metric === 'SLEEP' ? 'hrs' : 'kg'}
        />
      </Card>

      {/* 90-Day Adherence Heatmap */}
      <Card className="p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
          {t('analytics.adherenceHeatmap')}
        </h3>
        <p className="text-xs text-slate-500">
          Daily distribution of health logs, vital recordings, and prescription adherence over time.
        </p>
        <Heatmap weeksCount={14} />
      </Card>
    </div>
  );
};
