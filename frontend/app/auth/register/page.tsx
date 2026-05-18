"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Code2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useUserStore();
  const [form, setForm] = useState({ name: "", email: "", password: "", difficulty: "beginner", targetRole: "Full Stack Developer" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      login(data.user, data.token);
      toast.success("Account created! Welcome aboard 🎉");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-800 flex items-center justify-center px-4 py-8">
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-fade-in">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Code2 size={22} />
          </div>
          <span className="font-bold text-xl gradient-text">AI Coding Mentor</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Create your account</h1>
        <p className="text-gray-400 text-center text-sm mb-8">Start your 3D learning journey today</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Jane Doe" },
            { label: "Email", key: "email", type: "email", placeholder: "jane@example.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Min 8 characters" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="text-sm text-gray-400 mb-1 block">{label}</label>
              <input
                type={type}
                required
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Skill Level</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            >
              <option value="beginner">Beginner – Just starting out</option>
              <option value="intermediate">Intermediate – Know the basics</option>
              <option value="advanced">Advanced – Looking to master</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Target Role</label>
            <select
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
              className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500"
            >
              {["Full Stack Developer", "Frontend Developer", "Backend Developer", "Data Scientist", "Mobile Developer", "DevOps Engineer", "Machine Learning Engineer"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
