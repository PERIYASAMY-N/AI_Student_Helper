import { Router, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { cacheGet, cacheSet } from "../config/redis";
import crypto from "crypto";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /science/animate
router.post("/animate", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { concept, subject = "chemistry" } = req.body;
    if (!concept?.trim()) return res.status(400).json({ error: "Concept required" });

    const cacheKey = `science:${crypto.createHash("md5").update(`${subject}:${concept}`).digest("hex")}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ success: true, animation: JSON.parse(cached), cached: true });

    const isPlaceholderKey = !process.env.ANTHROPIC_API_KEY || 
                             process.env.ANTHROPIC_API_KEY.includes("your-key-here") || 
                             process.env.ANTHROPIC_API_KEY.trim() === "";

    if (isPlaceholderKey) {
      const mockScienceAnimation = {
        concept: concept,
        subject: subject,
        description: `Visualization of the ${concept} physical concept.`,
        duration: 10,
        narrationScript: [
          "Step 1: The system reaches a state of rest, showing the primary objects at their baseline positions.",
          "Step 2: External force is applied to the key elements, demonstrating dynamic interactions.",
          "Step 3: Energy transitions occur and equilibrium is re-established in the visual environment."
        ],
        keyObjects: [
          {
            id: "obj1",
            name: "Central Nucleus / Pivot Element",
            type: "sphere",
            color: "#ff4444",
            description: "Represents the core center of force or structure."
          },
          {
            id: "obj2",
            name: "Orbiting Electron / Boundary Plane",
            type: "cylinder",
            color: "#00cc77",
            description: "Shows elements revolving or aligning along the boundary field."
          }
        ],
        interactions: [
          {
            time: 0,
            action: "System Initialization",
            objects: ["obj1"],
            explanation: "The central core is established with maximum potential energy."
          },
          {
            time: 5,
            action: "Rotational Force Application",
            objects: ["obj2"],
            explanation: "Orbiting elements begin tracing their paths to demonstrate continuous momentum."
          }
        ],
        realWorldConnection: "This same underlying physical mechanism governs how solar panels capture light and how chemical batteries maintain cell potential.",
        funFact: "Did you know that understanding these atomic interactions was crucial in the development of modern smartphone touchscreens?"
      };
      await cacheSet(cacheKey, JSON.stringify(mockScienceAnimation), 7200);
      return res.json({ success: true, animation: mockScienceAnimation });
    }

    const prompt = `You are a scientific visualization expert. Create a description for animating "${concept}" in ${subject} using Three.js.

Return ONLY valid JSON:
{
  "concept": "${concept}",
  "subject": "${subject}",
  "description": "what this animation shows",
  "duration": 10,
  "narrationScript": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "keyObjects": [
    {
      "id": "obj1",
      "name": "object name",
      "type": "sphere/cylinder/arrow/plane",
      "color": "#ff4444",
      "description": "what this represents"
    }
  ],
  "interactions": [
    {
      "time": 0,
      "action": "what happens",
      "objects": ["obj1"],
      "explanation": "why this happens"
    }
  ],
  "realWorldConnection": "how this connects to everyday life",
  "funFact": "an interesting fact about this concept"
}`;

    const response = await client.messages.create({
      model: process.env.AI_MODEL_DEFAULT || "claude-sonnet-4-5-20250929",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text.trim();
    const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const animation = JSON.parse(jsonText);

    await cacheSet(cacheKey, JSON.stringify(animation), 7200);
    res.json({ success: true, animation });
  } catch (err: any) {
    console.error("[Science/animate]", err.message);
    res.status(500).json({ error: "Animation generation failed" });
  }
});

export default router;
