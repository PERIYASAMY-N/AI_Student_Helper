// store/executionStore.ts
import { create } from "zustand";

interface ExecutionStep {
  stepId: number;
  line: number;
  operation: string;
  variables: Record<string, any>;
  callStack: string[];
  description: string;
}

interface ExecutionStore {
  steps: ExecutionStep[];
  currentStep: number;
  language: string;
  code: string;
  isPlaying: boolean;
  setSteps: (steps: ExecutionStep[]) => void;
  setCurrentStep: (step: number) => void;
  setLanguage: (lang: string) => void;
  setCode: (code: string) => void;
  setIsPlaying: (v: boolean) => void;
  reset: () => void;
}

export const useExecutionStore = create<ExecutionStore>((set) => ({
  steps: [],
  currentStep: 0,
  language: "python",
  code: "",
  isPlaying: false,
  setSteps: (steps) => set({ steps, currentStep: 0 }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setLanguage: (language) => set({ language }),
  setCode: (code) => set({ code }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  reset: () => set({ steps: [], currentStep: 0, isPlaying: false }),
}));
