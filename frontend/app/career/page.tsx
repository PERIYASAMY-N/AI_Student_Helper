"use client";
import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import toast from "react-hot-toast";
import { Compass, Loader2, ChevronRight } from "lucide-react";

export default function CareerPage() {
  const [form, setForm] = useState({
    targetRole: "Full Stack Developer",
    currentSkills: "HTML, CSS, JavaScript",
    hours: "10",
  });
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);

  const generateRoadmap = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/career/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          targetRole: form.targetRole,
          currentSkills: form.currentSkills.split(",").map((s) => s.trim()),
          availableHoursPerWeek: parseInt(form.hours),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRoadmap(data.roadmap);
      toast.success("Your personalized roadmap is ready!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Compass className="text-green-400" size={28} />
          <h1 className="text-2xl font-bold">Career Roadmap Generator</h1>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Target Role</label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              >
                {["Full Stack Developer","Frontend Developer","Backend Developer","Data Scientist","Mobile Developer","DevOps Engineer","Machine Learning Engineer"].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Hours per Week</label>
              <select
                value={form.hours}
                onChange={(e) => setForm({ ...form, hours: e.target.value })}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              >
                {["5","10","15","20","30","40"].map(h => <option key={h} value={h}>{h} hrs/week</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Current Skills (comma-separated)</label>
              <input
                value={form.currentSkills}
                onChange={(e) => setForm({ ...form, currentSkills: e.target.value })}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                placeholder="HTML, CSS, Python..."
              />
            </div>
          </div>

          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-dark-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Compass size={16} />}
            {loading ? "Generating Roadmap..." : "Generate My Roadmap"}
          </button>
        </div>

        {/* Roadmap */}
        {roadmap && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-1">{roadmap.targetRole} Roadmap</h2>
              <p className="text-gray-400 text-sm">Estimated completion: <span className="text-green-400 font-medium">{roadmap.estimatedWeeks} weeks</span></p>
            </div>

            {/* Phases */}
            {roadmap.phases?.map((phase: any) => (
              <div key={phase.phaseNumber} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-900 rounded-full flex items-center justify-center text-green-400 font-bold text-sm">{phase.phaseNumber}</div>
                  <div>
                    <h3 className="font-semibold">{phase.title}</h3>
                    <span className="text-gray-400 text-xs">{phase.duration}</span>
                  </div>
                </div>
                <div className="ml-11 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Skills to Learn</p>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills?.map((s: string) => (
                        <span key={s} className="bg-dark-700 text-gray-300 text-xs px-2 py-1 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                  {phase.projects?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Projects</p>
                      <ul className="space-y-1">
                        {phase.projects.map((p: string) => (
                          <li key={p} className="flex items-start gap-2 text-sm text-gray-300">
                            <ChevronRight size={14} className="text-green-400 mt-0.5 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* DSA Plan */}
            {roadmap.dsaPlan?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="font-semibold mb-4">DSA Weekly Plan</h3>
                <div className="space-y-3">
                  {roadmap.dsaPlan.slice(0, 8).map((week: any) => (
                    <div key={week.week} className="flex items-start gap-3 bg-dark-700 rounded-xl p-3">
                      <span className="text-xs bg-dark-600 text-gray-400 rounded px-2 py-1 shrink-0">Wk {week.week}</span>
                      <div>
                        <p className="text-sm font-medium">{week.topic}</p>
                        {week.concepts?.map((c: string) => (
                          <span key={c} className="inline-block text-xs text-gray-500 mr-2">{c}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
