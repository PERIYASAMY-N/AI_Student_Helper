import { Router, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import multer from "multer";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "text/plain", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOC, DOCX, and TXT files are allowed"));
  },
});

async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "text/plain") return buffer.toString("utf-8");
  if (mimetype === "application/pdf") {
    try {
      const pdfParse = await import("pdf-parse");
      const data = await pdfParse.default(buffer);
      return data.text;
    } catch { return "Could not extract PDF text."; }
  }
  if (mimetype.includes("word") || mimetype.includes("docx")) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch { return "Could not extract document text."; }
  }
  return buffer.toString("utf-8");
}

// POST /document/upload
router.post("/upload", authMiddleware, upload.single("file"), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const text = await extractText(req.file.buffer, req.file.mimetype);
    const truncated = text.slice(0, 8000); // Token limit safety

    const prompt = `Analyze this educational document and extract structured learning content.

Document text:
${truncated}

Return ONLY valid JSON:
{
  "title": "document title",
  "summary": "3-4 sentence overview",
  "keyConcepts": [
    { "term": "concept name", "definition": "what it means", "example": "example", "importance": "high/medium/low" }
  ],
  "codeSnippets": ["code example 1 if found"],
  "learningObjectives": ["after reading this, you will understand X"],
  "flashcards": [
    { "question": "question text", "answer": "answer text", "difficulty": 1 }
  ],
  "topicsForFurtherStudy": ["related topic 1"]
}`;

    const response = await client.messages.create({
      model: process.env.AI_MODEL_DEFAULT || "claude-sonnet-4-5-20250929",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText = (response.content[0] as { text: string }).text.trim();
    const jsonText = responseText.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
    const result = JSON.parse(jsonText);

    res.json({
      success: true,
      data: result,
      meta: {
        filename: req.file.originalname,
        size: req.file.size,
        pages: Math.ceil(text.length / 2000),
        extractedChars: text.length,
      },
    });
  } catch (err: any) {
    console.error("[Document/upload]", err.message);
    res.status(500).json({ error: err.message || "Document processing failed" });
  }
});

export default router;
