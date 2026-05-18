"use client";
import { useState, useCallback } from "react";
import Navbar from "@/components/ui/Navbar";
import CodeEditor from "@/components/editor/CodeEditor";
import ThreeScene from "@/components/visualizer/ThreeScene";
import ExecutionControls from "@/components/editor/ExecutionControls";
import { useExecutionStore } from "@/store/executionStore";
import toast from "react-hot-toast";
import { Play, Loader2, ChevronRight } from "lucide-react";

export default function CodePage() {
  const { steps, currentStep, setSteps, setCurrentStep, setLanguage, language } = useExecutionStore();
  const [code, setCode] = useState(
    `# Bubble Sort Example\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr\n\nresult = bubble_sort([64, 34, 25, 12, 22])\nprint(result)`
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "complexity">("steps");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/code/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSteps(data.data.steps || []);
      setAnalysisResult(data.data);
      setCurrentStep(0);
      toast.success("Code analyzed! Use controls to step through execution.");
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, [setCurrentStep]);

  return (
    <div className="min-h-screen bg-dark-800 flex flex-col">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 pt-16">
        {/* Left – Editor */}
        <div className="flex flex-col border-r border-dark-600">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-600 bg-dark-700">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-dark-800 text-white text-sm rounded-lg px-3 py-1.5 border border-dark-500 focus:outline-none focus:border-brand-500"
            >
              {["python", "javascript", "java", "c", "cpp"].map(l => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>

            <button
              onClick={analyzeCode}
              disabled={loading}
              className="ml-auto flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {loading ? "Analyzing..." : "Analyze & Visualize"}
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[300px]">
            <CodeEditor
              value={code}
              language={language}
              onChange={(val) => setCode(val || "")}
              currentLine={steps[currentStep]?.line}
            />
          </div>

          {/* Analysis Panel */}
          {analysisResult && (
            <div className="border-t border-dark-600 bg-dark-700 max-h-56 overflow-y-auto">
              <div className="flex gap-0 border-b border-dark-600">
                {(["steps", "complexity"] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-xs font-medium capitalize border-b-2 transition-colors ${
                      activeTab === tab ? "border-brand-500 text-brand-400" : "border-transparent text-gray-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === "steps" && steps.length > 0 && (
                  <div className="space-y-2">
                    {steps.map((s: any, i: number) => (
                      <div
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          i === currentStep ? "bg-brand-900 border border-brand-700" : "hover:bg-dark-600"
                        }`}
                      >
                        <ChevronRight size={12} className="text-brand-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500">Line {s.line}: </span>
                          <span className="text-gray-200">{s.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "complexity" && analysisResult?.complexity && (
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="bg-dark-800 rounded-lg p-3 flex-1">
                        <div className="text-xs text-gray-400 mb-1">Time Complexity</div>
                        <div className="text-brand-400 font-mono font-bold">{analysisResult.complexity.time}</div>
                      </div>
                      <div className="bg-dark-800 rounded-lg p-3 flex-1">
                        <div className="text-xs text-gray-400 mb-1">Space Complexity</div>
                        <div className="text-cyan-400 font-mono font-bold">{analysisResult.complexity.space}</div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{analysisResult.complexity.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right – 3D Visualization */}
        <div className="flex flex-col bg-dark-900">
          <div className="flex items-center px-4 py-3 border-b border-dark-600 bg-dark-700">
            <span className="text-sm font-medium text-gray-300">3D Execution Visualizer</span>
            <span className="ml-auto text-xs text-gray-500">Drag to rotate • Scroll to zoom</span>
          </div>

          <div className="flex-1 relative" style={{ minHeight: "400px" }}>
            <ThreeScene
              executionSteps={steps}
              currentStep={currentStep}
              isPlaying={false}
              onStepComplete={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}
            />

            {steps.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 pointer-events-none">
                <div className="text-6xl mb-4 animate-float">🎯</div>
                <h3 className="text-xl font-bold mb-2">Ready to Visualize</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Paste your code on the left and click "Analyze & Visualize" to see it come alive in 3D.
                </p>
              </div>
            )}
          </div>

          {/* Controls */}
          {steps.length > 0 && (
            <div className="border-t border-dark-600 p-3">
              <ExecutionControls
                totalSteps={steps.length}
                currentStep={currentStep}
                onStepChange={handleStepChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
