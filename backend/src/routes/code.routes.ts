import { Router, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { cacheGet, cacheSet } from "../config/redis";
import crypto from "crypto";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function detectLanguage(code: string): string {
  if (/^\s*#include/.test(code)) return code.includes("class") || code.includes("cout") ? "cpp" : "c";
  if (/public\s+static\s+void\s+main/.test(code)) return "java";
  if (/\bdef\b.*:/.test(code) && !/\bfunction\b/.test(code)) return "python";
  if (/\b(const|let|var|function|=>|console\.log)\b/.test(code)) return "javascript";
  return "python";
}

// POST /code/analyze
router.post("/analyze", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { code, language } = req.body;
    if (!code?.trim()) return res.status(400).json({ error: "Code is required" });

    const lang = language || detectLanguage(code);
    const cacheKey = `code:${crypto.createHash("md5").update(`${lang}:${code}`).digest("hex")}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ success: true, language: lang, data: JSON.parse(cached), cached: true });

    const isPlaceholderKey = !process.env.ANTHROPIC_API_KEY || 
                             process.env.ANTHROPIC_API_KEY.includes("your-key-here") || 
                             process.env.ANTHROPIC_API_KEY.trim() === "";

    if (isPlaceholderKey) {
      // If user is running default Bubble Sort or similar
      if (code.includes("bubble_sort") || code.includes("bubble")) {
        const mockBubbleSortData = {
          overview: "Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.",
          steps: [
            {
              stepId: 1,
              line: 10,
              operation: "Initialize Array",
              variables: {
                arr: { type: "array", value: [64, 34, 25, 12, 22] }
              },
              callStack: ["main"],
              description: "Initialize the array with unsorted elements: [64, 34, 25, 12, 22]"
            },
            {
              stepId: 2,
              line: 2,
              operation: "Function Call",
              variables: {
                arr: { type: "array", value: [64, 34, 25, 12, 22] }
              },
              callStack: ["main", "bubble_sort"],
              description: "Call bubble_sort function with array: [64, 34, 25, 12, 22]"
            },
            {
              stepId: 3,
              line: 4,
              operation: "Outer Loop (i=0)",
              variables: {
                arr: { type: "array", value: [64, 34, 25, 12, 22] },
                i: { type: "number", value: 0 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Start outer loop. Loop counter i is initialized to 0."
            },
            {
              stepId: 4,
              line: 5,
              operation: "Inner Loop (j=0)",
              variables: {
                arr: { type: "array", value: [64, 34, 25, 12, 22] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 0 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Start inner loop. Compare arr[0] (64) and arr[1] (34). Since 64 > 34, they will swap."
            },
            {
              stepId: 5,
              line: 7,
              operation: "Swap Elements",
              variables: {
                arr: { type: "array", value: [34, 64, 25, 12, 22] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 0 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Swap arr[0] and arr[1]. The array becomes [34, 64, 25, 12, 22]."
            },
            {
              stepId: 6,
              line: 5,
              operation: "Inner Loop (j=1)",
              variables: {
                arr: { type: "array", value: [34, 64, 25, 12, 22] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 1 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Compare arr[1] (64) and arr[2] (25). Since 64 > 25, they will swap."
            },
            {
              stepId: 7,
              line: 7,
              operation: "Swap Elements",
              variables: {
                arr: { type: "array", value: [34, 25, 64, 12, 22] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 1 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Swap arr[1] and arr[2]. The array becomes [34, 25, 64, 12, 22]."
            },
            {
              stepId: 8,
              line: 5,
              operation: "Inner Loop (j=2)",
              variables: {
                arr: { type: "array", value: [34, 25, 64, 12, 22] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 2 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Compare arr[2] (64) and arr[3] (12). Since 64 > 12, they will swap."
            },
            {
              stepId: 9,
              line: 7,
              operation: "Swap Elements",
              variables: {
                arr: { type: "array", value: [34, 25, 12, 64, 22] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 2 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Swap arr[2] and arr[3]. The array becomes [34, 25, 12, 64, 22]."
            },
            {
              stepId: 10,
              line: 5,
              operation: "Inner Loop (j=3)",
              variables: {
                arr: { type: "array", value: [34, 25, 12, 64, 22] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 3 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Compare arr[3] (64) and arr[4] (22). Since 64 > 22, they will swap."
            },
            {
              stepId: 11,
              line: 7,
              operation: "Swap Elements & End i=0",
              variables: {
                arr: { type: "array", value: [34, 25, 12, 22, 64] },
                i: { type: "number", value: 0 },
                j: { type: "number", value: 3 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Swap arr[3] and arr[4]. The largest element (64) has now bubbled up to the end of the array."
            },
            {
              stepId: 12,
              line: 4,
              operation: "Outer Loop (i=1)",
              variables: {
                arr: { type: "array", value: [34, 25, 12, 22, 64] },
                i: { type: "number", value: 1 }
              },
              callStack: ["main", "bubble_sort"],
              description: "Start next outer loop iteration (i=1). Next largest element will bubble to second to last place."
            },
            {
              stepId: 13,
              line: 8,
              operation: "Sorted Result",
              variables: {
                arr: { type: "array", value: [12, 22, 25, 34, 64] }
              },
              callStack: ["main", "bubble_sort"],
              description: "After complete iterations, the array is fully sorted: [12, 22, 25, 34, 64]."
            }
          ],
          complexity: {
            time: "O(n²)",
            space: "O(1)",
            explanation: "Bubble Sort has a nested loop structure. In the worst-case, it makes n*(n-1)/2 comparisons, resulting in quadratic time complexity.",
            bigO: { best: "O(n)", average: "O(n²)", worst: "O(n²)" }
          },
          keyConceptsUsed: ["Arrays", "Nested Loops", "Swapping", "Sorting Algorithms"]
        };

        await cacheSet(cacheKey, JSON.stringify(mockBubbleSortData));
        return res.json({ success: true, language: lang, data: mockBubbleSortData });
      }

      // Fallback for any other custom code
      const mockCustomData = {
        overview: `Code Analysis of your ${lang} program (Offline/Demo Mode).`,
        steps: [
          {
            stepId: 1,
            line: 1,
            operation: "Initialize Program",
            variables: {
              x: { type: "number", value: 10 }
            },
            callStack: ["main"],
            description: "Initialize integer variable x with a value of 10."
          },
          {
            stepId: 2,
            line: 2,
            operation: "Array Allocation",
            variables: {
              x: { type: "number", value: 10 },
              data: { type: "array", value: [1, 2, 3, 4] }
            },
            callStack: ["main"],
            description: "Allocate memory for array data and fill it with [1, 2, 3, 4]."
          },
          {
            stepId: 3,
            line: 3,
            operation: "Loop Start",
            variables: {
              x: { type: "number", value: 12 },
              data: { type: "array", value: [1, 2, 3, 4] },
              counter: { type: "number", value: 1 }
            },
            callStack: ["main"],
            description: "Add 2 to x (x=12). Initialize loop counter variable with a value of 1."
          },
          {
            stepId: 4,
            line: 4,
            operation: "Program Finished",
            variables: {
              x: { type: "number", value: 12 },
              data: { type: "array", value: [2, 4, 6, 8] }
            },
            callStack: ["main"],
            description: "Double the values inside the array: [2, 4, 6, 8] and complete program execution."
          }
        ],
        complexity: {
          time: "O(n)",
          space: "O(1)",
          explanation: "Iterates through the data array once to perform updates, giving a linear runtime.",
          bigO: { best: "O(1)", average: "O(n)", worst: "O(n)" }
        },
        keyConceptsUsed: ["Variables", "Loops", "Arithmetic", "Sequential Execution"]
      };

      await cacheSet(cacheKey, JSON.stringify(mockCustomData));
      return res.json({ success: true, language: lang, data: mockCustomData });
    }

    const prompt = `You are a code execution engine and teacher. Analyze this ${lang} code.

Return ONLY a valid JSON object with this structure (no markdown, no extra text):
{
  "overview": "1-2 sentence plain English summary",
  "steps": [
    {
      "stepId": 1,
      "line": 1,
      "operation": "short code operation label",
      "variables": { "varName": { "type": "string/number/array/etc", "value": <actual value> } },
      "callStack": ["functionName"],
      "description": "plain English explanation for a student"
    }
  ],
  "complexity": {
    "time": "O(?)",
    "space": "O(?)",
    "explanation": "why these complexities",
    "bigO": { "best": "O(?)", "average": "O(?)", "worst": "O(?)" }
  },
  "keyConceptsUsed": ["concept1", "concept2"]
}

Code to analyze:
\`\`\`${lang}
${code.slice(0, 3000)}
\`\`\``;

    const response = await client.messages.create({
      model: process.env.AI_MODEL_DEFAULT || "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text.trim();
    const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const result = JSON.parse(jsonText);

    await cacheSet(cacheKey, JSON.stringify(result));
    res.json({ success: true, language: lang, data: result });
  } catch (err: any) {
    console.error("[Code/analyze]", err.message);
    res.status(500).json({ error: "Code analysis failed", details: process.env.NODE_ENV !== "production" ? err.message : undefined });
  }
});

// POST /code/solve
router.post("/solve", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { problem, language = "python", difficulty = "medium" } = req.body;
    if (!problem?.trim()) return res.status(400).json({ error: "Problem description required" });

    const isPlaceholderKey = !process.env.ANTHROPIC_API_KEY || 
                             process.env.ANTHROPIC_API_KEY.includes("your-key-here") || 
                             process.env.ANTHROPIC_API_KEY.trim() === "";

    if (isPlaceholderKey) {
      const mockSolveData = {
        algorithm: "Two Pointers / Sliding Window",
        approach: "Maintain two pointers to scan through the elements sequentially, updating state as we find valid intervals.",
        code: `def solve_problem(arr):\n    # Initialize pointers and state\n    left = 0\n    result = 0\n    \n    for right in range(len(arr)):\n        # Process current element\n        # Update left pointer based on conditions\n        pass\n        \n    return result`,
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        explanation: "This approach runs in linear time as each element is visited at most twice by the pointers.",
        edgeCases: ["Empty array", "Array with single element", "All identical elements"],
        visualSteps: [
          { step: 1, action: "Initialize left and right pointers at index 0", animation: "pointer-move" },
          { step: 2, action: "Iterate right pointer through the array", animation: "loop-iteration" }
        ]
      };
      return res.json({ success: true, data: mockSolveData });
    }

    const prompt = `You are an expert algorithm teacher. Solve this ${difficulty} coding problem in ${language}.

Problem: "${problem}"

Return ONLY valid JSON:
{
  "algorithm": "algorithm name and pattern",
  "approach": "step-by-step strategy",
  "code": "complete working solution with comments",
  "timeComplexity": "O(?)",
  "spaceComplexity": "O(?)",
  "explanation": "why this approach is optimal",
  "edgeCases": ["edge case 1", "edge case 2"],
  "visualSteps": [
    { "step": 1, "action": "what happens", "animation": "array-compare|swap|push|pop|pointer-move|loop-iteration" }
  ]
}`;

    const response = await client.messages.create({
      model: process.env.AI_MODEL_DEFAULT || "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text.trim();
    const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    res.json({ success: true, data: JSON.parse(jsonText) });
  } catch (err: any) {
    console.error("[Code/solve]", err.message);
    res.status(500).json({ error: "Problem solving failed" });
  }
});

export default router;
