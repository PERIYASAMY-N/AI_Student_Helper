import { Router, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /career/roadmap
router.post("/roadmap", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { targetRole, currentSkills = [], availableHoursPerWeek = 10 } = req.body;
    if (!targetRole) return res.status(400).json({ error: "Target role required" });

    const isPlaceholderKey = !process.env.ANTHROPIC_API_KEY || 
                             process.env.ANTHROPIC_API_KEY.includes("your-key-here") || 
                             process.env.ANTHROPIC_API_KEY.trim() === "";

    if (isPlaceholderKey) {
      const mockRoadmap = {
        targetRole: targetRole,
        currentLevel: "junior",
        estimatedWeeks: 12,
        phases: [
          {
            phaseNumber: 1,
            title: "Frontend Foundations",
            duration: "4 weeks",
            skills: ["HTML5 & CSS3", "Modern JavaScript", "Version Control (Git)"],
            projects: ["Personal Portfolio Website", "Responsive Product Landing Page"],
            assessmentCriteria: ["Can build a responsive webpage from scratch", "Can perform basic DOM manipulations using JavaScript"]
          },
          {
            phaseNumber: 2,
            title: "React & Next.js Ecosystem",
            duration: "4 weeks",
            skills: ["React Core Concepts", "Next.js 14 Framework", "State Management (Zustand)"],
            projects: ["Interactive Tasks Dashboard", "E-commerce Interface"],
            assessmentCriteria: ["Can manage global state securely", "Can set up dynamic server-side routing in Next.js"]
          },
          {
            phaseNumber: 3,
            title: "Backend Integration & API Design",
            duration: "4 weeks",
            skills: ["Express.js basics", "REST API Development", "Database connections"],
            projects: ["RESTful Blogging Platform API", "Real-time Chat with Socket.io"],
            assessmentCriteria: ["Can model MongoDB database schemas", "Can write Express middleware for session verification"]
          }
        ],
        dsaPlan: [
          {
            week: 1,
            topic: "Arrays & Strings",
            concepts: ["two pointers", "sliding window"],
            problems: [
              { name: "Two Sum", platform: "LeetCode", difficulty: "Easy", number: 1 },
              { name: "Valid Palindrome", platform: "LeetCode", difficulty: "Easy", number: 125 }
            ]
          },
          {
            week: 2,
            topic: "LinkedLists & Stacks",
            concepts: ["slow/fast pointers", "LIFO arrays"],
            problems: [
              { name: "Reverse Linked List", platform: "LeetCode", difficulty: "Easy", number: 206 },
              { name: "Valid Parentheses", platform: "LeetCode", difficulty: "Easy", number: 20 }
            ]
          }
        ],
        interviewPlan: [
          { week: 1, focus: "STAR Method & Storytelling", activities: ["Prepare 3 stories about collaboration and handling technical difficulties"] },
          { week: 2, focus: "Algorithm Walkthroughs", activities: ["Practice out-loud thinking during technical problem solving"] }
        ],
        resources: [
          { type: "course", name: "MDN Web Docs", url: "https://developer.mozilla.org", free: true },
          { type: "website", name: "LeetCode", url: "https://leetcode.com", free: true }
        ],
        milestones: [
          { week: 4, achievement: "Finished Personal Portfolio website", celebration: "Publish it to GitHub Pages" },
          { week: 8, achievement: "Completed Next.js frontend application", celebration: "Deploy on Vercel" }
        ]
      };
      return res.json({ success: true, roadmap: mockRoadmap });
    }

    const prompt = `You are a senior tech recruiter and career coach at a top tech company.

Create a realistic, actionable career roadmap for someone aiming to become a ${targetRole}.

Current skills: ${Array.isArray(currentSkills) ? currentSkills.join(", ") : currentSkills}
Available study time: ${availableHoursPerWeek} hours/week

Return ONLY a valid JSON object:
{
  "targetRole": "${targetRole}",
  "currentLevel": "junior/mid/senior",
  "estimatedWeeks": number,
  "phases": [
    {
      "phaseNumber": 1,
      "title": "Phase title",
      "duration": "X weeks",
      "skills": ["skill1", "skill2"],
      "projects": ["project1", "project2"],
      "assessmentCriteria": ["you can do X", "you understand Y"]
    }
  ],
  "dsaPlan": [
    {
      "week": 1,
      "topic": "Arrays & Strings",
      "concepts": ["two pointers", "sliding window"],
      "problems": [
        { "name": "Two Sum", "platform": "LeetCode", "difficulty": "Easy", "number": 1 }
      ]
    }
  ],
  "interviewPlan": [
    { "week": 1, "focus": "Behavioral questions", "activities": ["STAR method practice"] }
  ],
  "resources": [
    { "type": "book/course/website", "name": "Resource name", "url": "url or null", "free": true }
  ],
  "milestones": [
    { "week": 4, "achievement": "Built your first project", "celebration": "Share on LinkedIn" }
  ]
}`;

    const response = await client.messages.create({
      model: process.env.AI_MODEL_POWERFUL || "claude-opus-4-5-20251101",
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text.trim();
    const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const roadmap = JSON.parse(jsonText);

    res.json({ success: true, roadmap });
  } catch (err: any) {
    console.error("[Career/roadmap]", err.message);
    res.status(500).json({ error: "Roadmap generation failed" });
  }
});

// POST /career/assess
router.post("/assess", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { skills, experience, targetRole } = req.body;

    const isPlaceholderKey = !process.env.ANTHROPIC_API_KEY || 
                             process.env.ANTHROPIC_API_KEY.includes("your-key-here") || 
                             process.env.ANTHROPIC_API_KEY.trim() === "";

    if (isPlaceholderKey) {
      const mockAssessment = {
        readinessScore: 68,
        level: "junior",
        strengths: ["Strong CSS and HTML design foundations", "Familiarity with JS loops and conditional flow"],
        skillGaps: [
          { skill: "Data Structures & Algorithms", priority: "high", timeToLearn: "4 weeks" },
          { skill: "Database Schema Design & Queries", priority: "medium", timeToLearn: "2 weeks" }
        ],
        immediateActions: [
          "Study Time Complexity (Big O Notation) this week",
          "Set up a local MongoDB instance and practice schema definitions"
        ]
      };
      return res.json({ success: true, assessment: mockAssessment });
    }

    const prompt = `Assess this developer's readiness for ${targetRole || "software engineering"}.
Skills: ${skills?.join(", ") || "not provided"}
Experience: ${experience || "not provided"}

Return JSON: {
  "readinessScore": 0-100,
  "level": "junior/mid/senior",
  "strengths": ["strength1"],
  "skillGaps": [{"skill": "name", "priority": "high/medium/low", "timeToLearn": "X weeks"}],
  "immediateActions": ["do this week: action1"]
}`;

    const response = await client.messages.create({
      model: process.env.AI_MODEL_DEFAULT || "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (response.content[0] as { text: string }).text.trim();
    const jsonText = text.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    res.json({ success: true, assessment: JSON.parse(jsonText) });
  } catch (err: any) {
    console.error("[Career/assess]", err.message);
    res.status(500).json({ error: "Assessment failed" });
  }
});

export default router;
