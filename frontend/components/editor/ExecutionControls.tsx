"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react";

interface ExecutionControlsProps {
  totalSteps: number;
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function ExecutionControls({ totalSteps, currentStep, onStepChange }: ExecutionControlsProps) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        onStepChange(Math.min(currentStep + 1, totalSteps - 1));
      }, speed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, currentStep, totalSteps, speed, onStepChange]);

  useEffect(() => {
    if (currentStep >= totalSteps - 1) setPlaying(false);
  }, [currentStep, totalSteps]);

  return (
    <div className="flex items-center gap-3 w-full">
      <button onClick={() => { onStepChange(0); setPlaying(false); }} className="text-gray-400 hover:text-white" title="Reset">
        <RotateCcw size={16} />
      </button>
      <button onClick={() => onStepChange(Math.max(0, currentStep - 1))} className="text-gray-400 hover:text-white" title="Step back">
        <SkipBack size={18} />
      </button>
      <button
        onClick={() => setPlaying(!playing)}
        className="w-9 h-9 rounded-full bg-brand-600 hover:bg-brand-500 flex items-center justify-center flex-shrink-0"
        title={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))} className="text-gray-400 hover:text-white" title="Step forward">
        <SkipForward size={18} />
      </button>

      <input
        type="range"
        min={0}
        max={Math.max(0, totalSteps - 1)}
        value={currentStep}
        onChange={(e) => { onStepChange(Number(e.target.value)); setPlaying(false); }}
        className="flex-1 accent-brand-500"
      />

      <span className="text-xs text-gray-400 whitespace-nowrap">
        {currentStep + 1} / {totalSteps}
      </span>

      <select
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="bg-dark-700 text-gray-300 text-xs rounded px-2 py-1 border border-dark-500"
        title="Playback speed"
      >
        <option value={2000}>0.5×</option>
        <option value={1000}>1×</option>
        <option value={500}>2×</option>
        <option value={250}>4×</option>
      </select>
    </div>
  );
}
