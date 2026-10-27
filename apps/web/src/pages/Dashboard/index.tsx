import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Pill, Calendar, Heart, ShieldCheck, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import { FloatingHeart } from '@/components/three/FloatingHeart';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { TrendChart } from '@/components/charts/TrendChart';
import { useAnalyticsSummary } from '@/features/analytics/useAnalytics';
import { useMedicines } from '@/features/medicines/useMedicines';
import { useAppointments } from '@/features/reminders/useReminders';
import { useVitalsSceneStore } from '@/store/vitalsSceneStore';
import { formatDate, formatTime } from '@/utils';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const heartRateBpm = useVitalsSceneStore((state) => state.heartRateBpm);
  const systolicBp = useVitalsSceneStore((state) => state.systolicBp);
  const diastolicBp = useVitalsSceneStore((state) => state.diastolicBp);

  const { data: summary } = useAnalyticsSummary();
  const { data: medicines = [] } = useMedicines();
  const { data: appointments = [] } = useAppointments();

  const adherenceRate = summary?.goalsProgress?.length
    ? Math.round(
        summary.goalsProgress.reduce((sum: number, g: any) => sum + g.percentage, 0) /
          summary.goalsProgress.length
      )
    : 85;

  // Sample systolic / diastolic points for dashboard telemetry
  const bpData = [
    { date: 'Mon', systolic: 122, diastolic: 82 },
    { date: 'Tue', systolic: 118, diastolic: 78 },
    { date: 'Wed', systolic: 125, diastolic: 84 },
    { date: 'Thu', systolic: 120, diastolic: 80 },
    { date: 'Fri', systolic: systolicBp, diastolic: diastolicBp },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          {t('dashboard.title')}
        </h1>
        <p className="text-xs text-slate-500">{t('dashboard.subtitle')}</p>
      </div>

      {/* Top Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Heart Telemetry Panel */}
        <Card glow className="lg:col-span-7 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-vital-coral animate-ping" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                {t('dashboard.pulseTelemetry')}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-500/10 text-primary-400">
              LIVE GLSL SHADER
            </span>
          </div>

          <div className="h-[220px] w-full relative">
            <SceneCanvas className="w-full h-full">
              <FloatingHeart />
            </SceneCanvas>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center font-mono">
            <div>
              <span className="text-[11px] text-slate-400">HEART RATE</span>
              <p className="text-xl font-black text-vital-coral">{heartRateBpm} BPM</p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">BLOOD PRESSURE</span>
              <p className="text-xl font-black text-primary-500">
                {systolicBp}/{diastolicBp}
              </p>
            </div>
            <div>
              <span className="text-[11px] text-slate-400">STATUS</span>
              <p className="text-xl font-black text-vital-emerald flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4" /> NORMAL
              </p>
            </div>
          </div>
        </Card>

        {/* Adherence & Goals Ring */}
        <Card className="lg:col-span-5 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
            {t('dashboard.adherenceRate')}
          </h3>
          <ProgressRing percentage={adherenceRate} size={150} strokeWidth={12} label="Adherence" />
          <p className="text-xs text-slate-500 max-w-xs">
            Based on your recorded doses and hydration goals for today.
          </p>
        </Card>
      </div>

      {/* Middle Section: Trend Chart & Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vital Trend */}
        <Card className="lg:col-span-7 p-6">
          <TrendChart data={bpData} title="5-Day Blood Pressure Telemetry (Systolic / Diastolic)" />
        </Card>

        {/* Today's Prescriptions */}
        <Card className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary-500" />
              {t('dashboard.todayMedicines')}
            </h3>
            <span className="text-xs font-mono text-slate-400">{medicines.length} Active</span>
          </div>

          {medicines.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              {t('dashboard.noMedicines')}
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
              {medicines.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{m.name}</h4>
                    <span className="text-slate-400 font-mono">
                      {m.dose} • {m.schedule?.times?.join(', ')}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-vital-emerald/10 text-vital-emerald font-semibold text-[10px]">
                    Scheduled
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-vital-emerald" />
            {t('dashboard.upcomingAppointments')}
          </h3>
        </div>

        {appointments.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            {t('dashboard.noAppointments')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-xs space-y-1"
              >
                <h4 className="font-bold text-slate-900 dark:text-slate-100">{app.title}</h4>
                <p className="text-slate-500">{app.doctor || 'Primary Care Physician'}</p>
                <p className="text-primary-500 font-mono font-medium pt-1">
                  {formatDate(app.scheduledAt)} at {formatTime(app.scheduledAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
