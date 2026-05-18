"use client";
import Navbar from "@/components/ui/Navbar";
import ChatInterface from "@/components/chat/ChatInterface";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-dark-800 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16 max-w-4xl mx-auto w-full px-4 py-6">
        <div className="h-full" style={{ minHeight: "calc(100vh - 120px)" }}>
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
