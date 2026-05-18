"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Book } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  codeExample?: string | null;
  timestamp: Date;
}

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;
type Difficulty = typeof DIFFICULTIES[number];

const STARTERS = [
  "What is a linked list and when should I use it?",
  "Explain recursion with a real-world analogy",
  "What's the difference between O(n) and O(n²)?",
  "How does a hash table work?",
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "0",
    role: "assistant",
    content: "Hi! I'm your AI coding mentor 🤖. Ask me anything about programming — algorithms, data structures, debugging, or career advice. I'll adapt to your skill level!",
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: msg, history: messages.slice(-12), difficulty }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.message || "Sorry, I couldn't understand that.",
        codeExample: data.codeExample,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! I had a connection issue. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden" style={{ minHeight: "70vh" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-600 bg-dark-700">
        <div className="flex items-center gap-2">
          <Book className="text-brand-400" size={18} />
          <span className="font-semibold text-sm">AI Coding Mentor</span>
          <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full">Online</span>
        </div>
        <div className="flex gap-1">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${
                difficulty === d ? "bg-brand-600 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-7 h-7 bg-brand-700 rounded-full flex items-center justify-center mr-2 shrink-0 mt-1 text-xs">🤖</div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === "user" ? "bg-brand-700 text-white rounded-br-sm" : "bg-dark-700 text-gray-100 rounded-bl-sm"
            }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.codeExample && (
                <pre className="mt-3 p-3 bg-dark-900 rounded-xl text-xs text-green-400 overflow-x-auto font-mono border border-dark-500">
                  <code>{m.codeExample}</code>
                </pre>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 bg-brand-700 rounded-full flex items-center justify-center mr-2 text-xs shrink-0">🤖</div>
            <div className="bg-dark-700 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
              {[0,1,2].map(i => (
                <span key={i} className="w-2 h-2 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Starters */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {STARTERS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-400 hover:text-gray-200 px-3 py-1.5 rounded-full border border-dark-500 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-dark-600">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about any coding concept..."
            className="flex-1 bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl px-4 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
