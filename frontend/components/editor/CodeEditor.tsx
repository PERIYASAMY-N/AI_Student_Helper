"use client";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string | undefined) => void;
  currentLine?: number;
}

export default function CodeEditor({ value, language, onChange, currentLine }: CodeEditorProps) {
  const langMap: Record<string, string> = {
    python: "python",
    javascript: "javascript",
    java: "java",
    c: "c",
    cpp: "cpp",
  };

  return (
    <MonacoEditor
      height="100%"
      language={langMap[language] || "python"}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        lineNumbers: "on",
        renderLineHighlight: "line",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        glyphMargin: false,
        folding: true,
        automaticLayout: true,
        wordWrap: "on",
      }}
    />
  );
}
