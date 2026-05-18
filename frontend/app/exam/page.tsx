"use client";
import { useState } from "react";
import Navbar from "@/components/ui/Navbar";
import toast from "react-hot-toast";
import { Award, Loader2, CheckCircle, XCircle } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  topic: string;
}

export default function ExamPage() {
  const [topic, setTopic] = useState("Arrays and Sorting");
  const [difficulty, setDifficulty] = useState("3");
  const [count, setCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<any>(null);
  const [showHint, setShowHint] = useState<Record<string, number>>({});

  const generateQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setScore(null);
    try {
      const res = await fetch("/api/exam/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ topic, difficulty: parseInt(difficulty), count: parseInt(count) }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setQuestions(data.questions);
      toast.success(`${data.questions.length} questions generated!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.error("Please answer all questions first");
      return;
    }
    try {
      const res = await fetch("/api/exam/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ questions, answers }),
      });
      const data = await res.json();
      setScore(data.result);
      setSubmitted(true);
      toast.success("Quiz submitted!");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-dark-800">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Award className="text-amber-400" size={28} />
          <h1 className="text-2xl font-bold">Exam Engine</h1>
        </div>

        {/* Generator */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4">Generate Quiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                placeholder="e.g. Binary Trees"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Difficulty (1-5)</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              >
                {[1,2,3,4,5].map(d => <option key={d} value={d}>{d} – {["Very Easy","Easy","Medium","Hard","Expert"][d-1]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Questions</label>
              <select
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
              >
                {[3,5,10,15].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={generateQuiz}
            disabled={loading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-dark-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </div>

        {/* Score */}
        {submitted && score && (
          <div className="glass rounded-2xl p-6 mb-6 border border-amber-500/30">
            <h2 className="font-bold text-xl mb-3">Results</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold text-amber-400">{Math.round(score.percentage)}%</div>
              <div>
                <div className="text-gray-300">{score.score} / {questions.length} correct</div>
                {score.weakTopics.length > 0 && (
                  <div className="text-red-400 text-sm mt-1">Weak areas: {score.weakTopics.join(", ")}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Questions */}
        {questions.map((q, i) => {
          const answered = answers[q.id];
          const isCorrect = submitted && answered?.toLowerCase() === q.correctAnswer.toLowerCase();
          const isWrong  = submitted && answered && !isCorrect;

          return (
            <div key={q.id} className={`glass rounded-2xl p-6 mb-4 border ${
              submitted ? (isCorrect ? "border-green-500/40" : isWrong ? "border-red-500/40" : "border-dark-500") : "border-dark-500"
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <span className="bg-dark-700 text-gray-400 text-xs rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                <p className="text-sm text-gray-100 leading-relaxed">{q.question}</p>
                {submitted && (isCorrect ? <CheckCircle className="text-green-400 shrink-0" size={20} /> : isWrong ? <XCircle className="text-red-400 shrink-0" size={20} /> : null)}
              </div>

              {q.options ? (
                <div className="space-y-2 ml-9">
                  {q.options.map(opt => (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                        answers[q.id] === opt
                          ? submitted
                            ? isCorrect ? "bg-green-900/40 border border-green-500" : "bg-red-900/40 border border-red-500"
                            : "bg-brand-900 border border-brand-600"
                          : submitted && opt.toLowerCase() === q.correctAnswer.toLowerCase()
                            ? "bg-green-900/40 border border-green-500"
                            : "bg-dark-700 border border-dark-500 hover:border-dark-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => !submitted && setAnswers({ ...answers, [q.id]: opt })}
                        className="accent-brand-500"
                        disabled={submitted}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="ml-9">
                  <input
                    value={answers[q.id] || ""}
                    onChange={(e) => !submitted && setAnswers({ ...answers, [q.id]: e.target.value })}
                    disabled={submitted}
                    className="w-full bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="Your answer..."
                  />
                </div>
              )}

              {/* Hint */}
              {!submitted && (
                <button
                  onClick={() => setShowHint({ ...showHint, [q.id]: (showHint[q.id] || 0) + 1 })}
                  className="ml-9 mt-3 text-xs text-gray-500 hover:text-brand-400 transition-colors"
                >
                  💡 Hint {showHint[q.id] ? `(${showHint[q.id]})` : ""}
                </button>
              )}
              {showHint[q.id] && !submitted && (
                <p className="ml-9 mt-2 text-xs text-amber-400 bg-amber-900/20 rounded-lg p-2">
                  {q.hints[Math.min(showHint[q.id] - 1, q.hints.length - 1)]}
                </p>
              )}

              {/* Explanation after submit */}
              {submitted && (
                <div className="ml-9 mt-3 p-3 bg-dark-700 rounded-lg">
                  <p className="text-xs text-gray-400 leading-relaxed"><span className="text-white font-medium">Explanation:</span> {q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {questions.length > 0 && !submitted && (
          <button
            onClick={submitQuiz}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            Submit Quiz
          </button>
        )}
      </main>
    </div>
  );
}
