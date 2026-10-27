import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, ShieldCheck, HeartPulse, ArrowRight } from 'lucide-react';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import { HeroOrb } from '@/components/three/HeroOrb';
import { FloatingHeart } from '@/components/three/FloatingHeart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 overflow-hidden relative selection:bg-primary-500 selection:text-white">
      {/* Background bioluminescent gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-vital-emerald/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 dark:text-primary-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-vital-emerald animate-pulse" />
            <span>BIOMEDICAL 3D TELEMETRY ENGINE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] bg-gradient-to-r from-slate-900 via-primary-600 to-vital-emerald dark:from-white dark:via-slate-200 dark:to-primary-400 bg-clip-text text-transparent">
            {t('landing.heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
            {t('landing.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {t('landing.ctaStart')}
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                {t('landing.ctaSignIn')}
              </Button>
            </Link>
          </div>
        </div>

        {/* 3D Visual Hero */}
        <div className="lg:col-span-5 h-[380px] sm:h-[480px] w-full relative">
          <SceneCanvas className="w-full h-full">
            <FloatingHeart />
          </SceneCanvas>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-1.5 rounded-full text-[11px] font-mono text-slate-400 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-vital-coral animate-ping" />
            <span>SYNCHRONIZED PULSE: 72 BPM</span>
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black">{t('landing.featuresTitle')}</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">{t('landing.featuresSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card glow className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('landing.card3D')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('landing.card3DDesc')}
            </p>
          </Card>

          <Card glow className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-vital-emerald/10 text-vital-emerald flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('landing.cardSafety')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('landing.cardSafetyDesc')}
            </p>
          </Card>

          <Card glow className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('landing.cardAdherence')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('landing.cardAdherenceDesc')}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};
