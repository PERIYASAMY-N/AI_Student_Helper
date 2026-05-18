"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Code2, MessageSquare, Award, Compass, FlaskConical, LayoutDashboard, LogOut } from "lucide-react";
import { useUserStore } from "@/store/userStore";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/code",      icon: Code2,           label: "Code" },
  { href: "/chat",      icon: MessageSquare,    label: "Chat" },
  { href: "/exam",      icon: Award,            label: "Exam" },
  { href: "/career",    icon: Compass,          label: "Career" },
  { href: "/science",   icon: FlaskConical,     label: "Science" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <nav className="glass fixed top-0 inset-x-0 z-50 flex items-center px-4 py-3 border-b border-dark-600">
      <Link href="/" className="flex items-center gap-2 mr-6">
        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
          <Code2 size={16} />
        </div>
        <span className="font-bold text-sm gradient-text hidden sm:block">AI Mentor</span>
      </Link>

      <div className="flex items-center gap-1 flex-1">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              pathname === href
                ? "bg-brand-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-dark-700"
            }`}
          >
            <Icon size={14} />
            <span className="hidden md:block">{label}</span>
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {user && (
          <>
            <span className="text-xs text-gray-400 hidden sm:block">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
