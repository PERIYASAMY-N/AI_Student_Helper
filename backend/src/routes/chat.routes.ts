import { Router, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/User";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const DIFFICULTY_PROMPTS: Record<string, string> = {
  beginner:     "Use very simple words and everyday analogies. Avoid jargon. Break everything into tiny steps.",
  intermediate: "Assume basic programming knowledge. Use technical terms but briefly explain them.",
  advanced:     "Use professional terminology freely. Focus on optimization, design patterns, and trade-offs.",
};

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message, history = [], difficulty = "beginner" } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message required" });

    // Get user's actual difficulty setting
    const user = await User.findById(req.user?.id).select("difficulty name");
    const userDifficulty = difficulty || user?.difficulty || "beginner";

    const isPlaceholderKey = !process.env.ANTHROPIC_API_KEY || 
                             process.env.ANTHROPIC_API_KEY.includes("your-key-here") || 
                             process.env.ANTHROPIC_API_KEY.trim() === "";

    if (isPlaceholderKey) {
      const mockChatResponses: Record<string, any> = {
        default: {
          response: `Hi there! I am your AI coding mentor. Since you are currently running the project in **Offline Demo Mode** (no Anthropic API Key configured in your \`.env\`), I am providing a pre-recorded mock conversation to show you how I work.\n\nTo unlock fully adaptive, live conversations on any topic, please obtain an API key from console.anthropic.com and add it as \`ANTHROPIC_API_KEY\` in your [backend/.env](file:///d:/ai-coding-mentor/backend/.env) file!\n\nHere is an analogy: Think of variables in programming like **labeled cardboard boxes**. You can put a value inside the box (like a number or a string), and whenever you need it, you just call the box by its label.`,
          codeExample: `box_label = "Hello World"\nprint(box_label)`,
          followUp: "Does the box analogy make sense to you, or would you like to explore lists and arrays next?"
        }
      };

      const reply = mockChatResponses.default;
      return res.json({ success: true, ...reply });
    }

    const systemPrompt = `You are an expert, friendly AI coding mentor named "Mentor". You make programming accessible and exciting.

TEACHING STYLE: ${DIFFICULTY_PROMPTS[userDifficulty] || DIFFICULTY_PROMPTS.beginner}

RULES:
1. Always greet students warmly and encourage them
2. Use real-world analogies for abstract concepts (e.g., "A variable is like a labeled box")
3. Include short, runnable code examples when helpful
4. End with a question to check understanding or offer to go deeper
5. If student seems confused, try a completely different explanation approach

RESPONSE FORMAT: Return a JSON object:
{
  "response": "your explanation (can include \\n for new lines)",
  "codeExample": "optional code string (use \\n for newlines, null if not applicable)",
  "followUp": "optional follow-up question"
}

Return ONLY valid JSON.`;

    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await client.messages.create({
      model: process.env.AI_MODEL_DEFAULT || "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      system: systemPrompt,
      messages,
    });

    const text = (response.content[0] as { text: string }).text.trim();
    let parsed;
    try {
      const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = { response: text, codeExample: null };
    }

    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error("[Chat]", err.message);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
