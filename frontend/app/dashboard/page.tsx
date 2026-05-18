"use client";
import Link from "next/link";
import { Code2, MessageSquare, FileText, Zap, Award, Compass, FlaskConical } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import Navbar from "@/components/ui/Navbar";

const modules = [
  { href: "/code",    icon: Code2,       label: "Code Visualizer",   desc: "Paste code → watch it run in 3D",      color: "from-blue-600 to-indigo-600" },
  { href: "/chat",    icon: MessageSquare,label: "AI Mentor Chat",   desc: "Ask anything, get adapted answers",     color: "from-purple-600 to-pink-600" },
  { href: "/exam",    icon: Award,       label: "Exam Engine",       desc: "Adaptive quizzes with AI feedback",     color: "from-amber-500 to-orange-500" },
  { href: "/career",  icon: Compass,     label: "Career Roadmap",    desc: "DSA planner + interview prep",          color: "from-green-500 to-teal-500" },
  { href: "/science", icon: FlaskConical, label: "Science 3D",       desc: "Physics, Chemistry, Biology animated",  color: "from-cyan-500 to-blue-500" },
  { href: "/code",    icon: Zap,         label: "Problem Solver",    desc: "Describe a problem → get solution",     color: "from-rose-500 to-red-600" },
];

export default function DashboardPage() {
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-dark-800">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-16">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">
            Welcome back, <span className="gradient-text">{user?.name ?? "Coder"}</span> 👋
          </h1>
          <p className="text-gray-400">Continue your learning journey. Pick a module to start.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Streak",       value: "0 days",   emoji: "🔥" },
            { label: "XP Earned",    value: "0 XP",     emoji: "⚡" },
            { label: "Sessions",     value: "0",         emoji: "📚" },
            { label: "Problems",     value: "0 solved",  emoji: "✅" },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="glass rounded-xl p-4 text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-bold text-lg">{value}</div>
              <div className="text-gray-400 text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Modules grid */}
        <h2 className="text-xl font-bold mb-4">Learning Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(({ href, icon: Icon, label, desc, color }) => (
            <Link
              key={label}
              href={href}
              className="glass rounded-2xl p-6 hover:scale-[1.02] transition-all group relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-1">{label}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
              <span className="text-brand-400 text-xs mt-3 inline-block group-hover:translate-x-1 transition-transform">
                Open →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
