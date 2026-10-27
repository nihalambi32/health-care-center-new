import { create } from 'zustand';

interface VitalsSceneState {
  heartRateBpm: number;
  systolicBp: number;
  diastolicBp: number;
  aiStreaming: boolean;
  setHeartRate: (bpm: number) => void;
  setBloodPressure: (systolic: number, diastolic: number) => void;
  setAiStreaming: (streaming: boolean) => void;
}

export const useVitalsSceneStore = create<VitalsSceneState>((set) => ({
  heartRateBpm: 72,
  systolicBp: 120,
  diastolicBp: 80,
  aiStreaming: false,
  setHeartRate: (bpm) => set({ heartRateBpm: Math.max(40, Math.min(220, bpm)) }),
  setBloodPressure: (systolic, diastolic) => set({ systolicBp: systolic, diastolicBp: diastolic }),
  setAiStreaming: (aiStreaming) => set({ aiStreaming }),
}));
