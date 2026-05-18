import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import dotenv from "dotenv";
import { connectDB } from "./config/database";
import authRoutes   from "./routes/auth.routes";
import codeRoutes   from "./routes/code.routes";
import chatRoutes   from "./routes/chat.routes";
import examRoutes   from "./routes/exam.routes";
import careerRoutes from "./routes/career.routes";
import scienceRoutes from "./routes/science.routes";
import docRoutes    from "./routes/document.routes";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Security & logging
app.use(helmet());
app.use(morgan("combined"));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Routes
app.use("/auth",     authRoutes);
app.use("/code",     codeRoutes);
app.use("/chat",     chatRoutes);
app.use("/exam",     examRoutes);
app.use("/career",   careerRoutes);
app.use("/science",  scienceRoutes);
app.use("/document", docRoutes);

// 404
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Error]", err.message);
  res.status(500).json({ error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
});

// Start
const PORT = parseInt(process.env.PORT || "5000");

async function start() {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

start().catch(console.error);

export default app;
