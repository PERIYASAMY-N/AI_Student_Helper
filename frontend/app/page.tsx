"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, Brain, Zap, BookOpen, Trophy, Rocket } from "lucide-react";

const features = [
  { icon: Code2,    title: "Code Visualization",    desc: "Watch your code execute step-by-step in an interactive 3D scene." },
  { icon: Brain,    title: "AI Mentor",              desc: "Get explanations adapted to your skill level with real-world analogies." },
  { icon: Zap,      title: "Problem Solver",         desc: "Describe any coding problem in plain English, get optimized solutions." },
  { icon: BookOpen, title: "Science 3D",             desc: "Physics, Chemistry, Biology concepts animated beautifully." },
  { icon: Trophy,   title: "Adaptive Exams",         desc: "Smart quizzes that detect your weak spots and focus there." },
  { icon: Rocket,   title: "Career Roadmaps",        desc: "Personalized DSA plans and interview prep tailored for your target role." },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-dark-800 text-white overflow-hidden">
      {/* Navbar */}
      <nav className="glass fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4">
        <span className="font-bold text-xl gradient-text">AI Coding Mentor</span>
        <div className="flex gap-4">
          <Link href="/auth/login"    className="text-gray-400 hover:text-white transition-colors text-sm">Login</Link>
          <Link href="/auth/register" className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-4 pt-20">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-600 opacity-10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500 opacity-10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600 opacity-5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-brand-900 text-brand-400 text-xs font-medium px-3 py-1 rounded-full mb-6 border border-brand-700">
            <Zap size={12} />
            Powered by Claude AI + Three.js 3D
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Learn Coding
            <span className="gradient-text block">Visually in 3D</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Watch your code come alive in interactive 3D scenes. Get AI explanations adapted to your level. Master algorithms through visual storytelling.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register"
              className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 text-lg"
            >
              Start Learning Free →
            </Link>
            <Link href="/code"
              className="glass hover:bg-dark-600 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg"
            >
              Try Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-24">
        <h2 className="text-3xl font-bold text-center mb-4">Everything you need to excel</h2>
        <p className="text-gray-400 text-center mb-14">Six powerful modules working together to accelerate your programming journey</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 hover:neon-border transition-all group cursor-default"
            >
              <div className="w-12 h-12 bg-brand-900 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-700 transition-colors">
                <f.icon className="text-brand-400" size={22} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 text-center py-24 px-4">
        <h2 className="text-4xl font-bold mb-4">Ready to learn smarter?</h2>
        <p className="text-gray-400 mb-8">Join thousands of developers who learn faster with 3D AI visualization.</p>
        <Link href="/auth/register"
          className="bg-brand-600 hover:bg-brand-500 text-white font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 inline-block"
        >
          Get Started – It's Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 AI Coding Mentor. Built with Claude AI + Three.js.</p>
      </footer>
    </main>
  );
}
