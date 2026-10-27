import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChatWindow } from '@/components/assistant/ChatWindow';
import { SceneCanvas } from '@/components/three/SceneCanvas';
import { HeroOrb } from '@/components/three/HeroOrb';
import { useVitalsSceneStore } from '@/store/vitalsSceneStore';

export const AssistantPage: React.FC = () => {
  const { t } = useTranslation();
  const aiStreaming = useVitalsSceneStore((state) => state.aiStreaming);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
          {t('assistant.title')}
        </h1>
        <p className="text-xs text-slate-500">{t('assistant.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* 3D Orb Interactive Feedback Column */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-panel rounded-2xl p-6 min-h-[350px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-400">
              BIO-NEURAL COMPANION ORB
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                aiStreaming
                  ? 'bg-vital-emerald/10 text-vital-emerald animate-pulse'
                  : 'bg-primary-500/10 text-primary-400'
              }`}
            >
              {aiStreaming ? 'STREAMING ACTIVE' : 'AWAITING QUERY'}
            </span>
          </div>

          <div className="h-[260px] w-full relative">
            <SceneCanvas className="w-full h-full">
              <HeroOrb isStreaming={aiStreaming} />
            </SceneCanvas>
          </div>

          <p className="text-center text-xs text-slate-400 italic font-medium">
            Shader shifts bioluminescent frequencies while synthesizing wellness education.
          </p>
        </div>

        {/* Chat Window Column */}
        <div className="lg:col-span-7">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};
