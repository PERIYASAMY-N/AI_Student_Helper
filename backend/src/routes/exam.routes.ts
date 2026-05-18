import { Router, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { cacheGet, cacheSet } from "../config/redis";
import crypto from "crypto";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /exam/generate
router.post("/generate", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { topic = "Arrays", difficulty = 3, count = 5 } = req.body;
    const cacheKey = `exam:${crypto.createHash("md5").update(`${topic}:${difficulty}:${count}`).digest("hex")}`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      const questions = JSON.parse(cached);
      return res.json({ success: true, questions, cached: true });
    }

    const isPlaceholderKey = !process.env.ANTHROPIC_API_KEY || 
                             process.env.ANTHROPIC_API_KEY.includes("your-key-here") || 
                             process.env.ANTHROPIC_API_KEY.trim() === "";

    if (isPlaceholderKey) {
      const mockQuestions = [
        {
          id: "q1",
          question: `What is the time complexity of accessing an element in an array (${topic}) by its index?`,
          type: "mcq",
          difficulty: difficulty,
          topic: topic,
          options: ["A. O(1)", "B. O(log n)", "C. O(n)", "D. O(n log n)"],
          correctAnswer: "A. O(1)",
          explanation: "Accessing an array element by index is an O(1) operation because memory addresses are calculated in constant time.",
          hints: ["An array uses contiguous memory.", "Calculation formula is: base_address + index * element_size."],
          tags: ["time-complexity", "arrays-basics"]
        },
        {
          id: "q2",
          question: `Which of the following describes a standard array (${topic}) in memory?`,
          type: "mcq",
          difficulty: difficulty,
          topic: topic,
          options: [
            "A. Non-contiguous block of memory", 
            "B. Contiguous block of memory", 
            "C. Nodes linked with pointers", 
            "D. Dynamic key-value pairs"
          ],
          correctAnswer: "B. Contiguous block of memory",
          explanation: "Arrays are stored in contiguous memory locations, enabling fast index-based lookups.",
          hints: ["Elements are placed one after another.", "This is why indexing is so fast."],
          tags: ["memory-layout", "arrays-structure"]
        },
        {
          id: "q3",
          question: `What is the worst-case time complexity of inserting an element into a dynamic array (${topic})?`,
          type: "mcq",
          difficulty: difficulty,
          topic: topic,
          options: ["A. O(1)", "B. O(log n)", "C. O(n)", "D. O(n²)"],
          correctAnswer: "C. O(n)",
          explanation: "Inserting an element at the beginning or middle of an array requires shifting the subsequent elements, which takes O(n) time.",
          hints: ["Think about what happens to other elements when you insert at index 0.", "We need to make room for the new element."],
          tags: ["insertion", "time-complexity"]
        },
        {
          id: "q4",
          question: `Which operation on a sorted array (${topic}) takes O(log n) time using Binary Search?`,
          type: "mcq",
          difficulty: difficulty,
          topic: topic,
          options: ["A. Insertion", "B. Deletion", "C. Appending", "D. Searching"],
          correctAnswer: "D. Searching",
          explanation: "Searching in a sorted array takes O(log n) time using binary search, which repeatedly halves the search interval.",
          hints: ["Halving the search space.", "Requires the array to be sorted."],
          tags: ["search", "binary-search"]
        },
        {
          id: "q5",
          question: `What happens if you attempt to access an array (${topic}) index that is out of bounds in a low-level language like C?`,
          type: "mcq",
          difficulty: difficulty,
          topic: topic,
          options: [
            "A. Throw IndexOutOfBoundsException", 
            "B. Automatically resizes array", 
            "C. Undefined behavior / Segmentation fault", 
            "D. Returns null"
          ],
          correctAnswer: "C. Undefined behavior / Segmentation fault",
          explanation: "Low-level languages like C do not have built-in bounds checking, resulting in undefined behavior or a segmentation fault when accessing out-of-bounds indices.",
          hints: ["C is a low-level language that does not check boundaries.", "It directly accesses memory offsets."],
          tags: ["low-level", "safety"]
        }
      ];

      await cacheSet(cacheKey, JSON.stringify(mockQuestions), 1800);
      return res.json({ success: true, questions: mockQuestions });
    }

    const prompt = `Generate ${count} programming quiz questions about "${topic}" at difficulty ${difficulty}/5.

Return ONLY a valid JSON array of question objects. Each object must have:
{
  "id": "unique string id",
  "question": "the question text",
  "type": "mcq",
  "difficulty": ${difficulty},
  "topic": "${topic}",
  "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
  "correctAnswer": "A. option1",
  "explanation": "why this is correct, step by step",
  "hints": ["vague hint", "more specific hint", "nearly the answer"],
  "tags": ["concept1", "concept2"]
}

Make questions progressively harder. Include both conceptual and practical questions.
Return ONLY the JSON array, no markdown, no extra text.`;

    const response = await client.messages.create({
      model: process.env.AI_MODEL_DEFAULT || "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text.trim();
    const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const questions = JSON.parse(jsonText);

    await cacheSet(cacheKey, JSON.stringify(questions), 1800);
    res.json({ success: true, questions });
  } catch (err: any) {
    console.error("[Exam/generate]", err.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// POST /exam/submit
router.post("/submit", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { questions, answers } = req.body;
    if (!questions?.length) return res.status(400).json({ error: "Questions required" });

    let correct = 0;
    const topicStats: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q: any) => {
      const tag = q.tags?.[0] || q.topic || "general";
      if (!topicStats[tag]) topicStats[tag] = { correct: 0, total: 0 };
      topicStats[tag].total++;

      const userAnswer = (answers[q.id] || "").toLowerCase().trim();
      const correctAnswer = (q.correctAnswer || "").toLowerCase().trim();

      if (userAnswer === correctAnswer || userAnswer === correctAnswer[0]) {
        correct++;
        topicStats[tag].correct++;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);
    const weakTopics = Object.entries(topicStats)
      .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
      .map(([t]) => t);
    const strengths = Object.entries(topicStats)
      .filter(([, s]) => s.total > 0 && s.correct / s.total >= 0.8)
      .map(([t]) => t);

    res.json({
      success: true,
      result: { score: correct, total: questions.length, percentage, weakTopics, strengths, breakdown: topicStats },
    });
  } catch (err: any) {
    console.error("[Exam/submit]", err.message);
    res.status(500).json({ error: "Submission failed" });
  }
});

export default router;
