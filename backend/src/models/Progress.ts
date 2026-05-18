import mongoose, { Schema, Document } from "mongoose";

// ─── Progress ────────────────────────────────────────────────────────────────
export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  codingTimeMinutes: number;
  streakDays: number;
  xpEarned: number;
  totalXp: number;
  topicsStudied: string[];
  languagesUsed: string[];
  conceptsMastered: string[];
  activitiesCompleted: Array<{
    type: string;
    topic: string;
    duration: number;
    score?: number;
    timestamp: Date;
  }>;
}

const progressSchema = new Schema<IProgress>({
  userId:             { type: Schema.Types.ObjectId, ref: "User", required: true },
  date:               { type: Date, default: Date.now },
  codingTimeMinutes:  { type: Number, default: 0 },
  streakDays:         { type: Number, default: 0 },
  xpEarned:           { type: Number, default: 0 },
  totalXp:            { type: Number, default: 0 },
  topicsStudied:      [String],
  languagesUsed:      [String],
  conceptsMastered:   [String],
  activitiesCompleted: [{
    type:      { type: String },
    topic:     String,
    duration:  Number,
    score:     Number,
    timestamp: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

progressSchema.index({ userId: 1, date: -1 });
export const Progress = mongoose.model<IProgress>("Progress", progressSchema);

// ─── Session ──────────────────────────────────────────────────────────────────
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionType: string;
  language?: string;
  code?: string;
  topic: string;
  duration: number;
  completed: boolean;
  score?: number;
  metadata?: Record<string, unknown>;
}

const sessionSchema = new Schema<ISession>({
  userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  sessionType: { type: String, required: true },
  language:    String,
  code:        String,
  topic:       { type: String, required: true },
  duration:    { type: Number, default: 0 },
  completed:   { type: Boolean, default: false },
  score:       Number,
  metadata:    Schema.Types.Mixed,
}, { timestamps: true });

sessionSchema.index({ userId: 1, createdAt: -1 });
export const Session = mongoose.model<ISession>("Session", sessionSchema);

// ─── Career ───────────────────────────────────────────────────────────────────
export interface ICareer extends Document {
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  currentLevel: string;
  roadmap?: Record<string, unknown>;
  weeklyDSAProgress: Array<{ week: number; topic: string; problemsSolved: number; completed: boolean }>;
  interviewReadiness: number;
  lastAssessed: Date;
}

const careerSchema = new Schema<ICareer>({
  userId:             { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  targetRole:         { type: String, default: "" },
  currentLevel:       { type: String, default: "junior" },
  roadmap:            Schema.Types.Mixed,
  weeklyDSAProgress:  [{ week: Number, topic: String, problemsSolved: { type: Number, default: 0 }, completed: { type: Boolean, default: false } }],
  interviewReadiness: { type: Number, default: 0 },
  lastAssessed:       { type: Date, default: Date.now },
}, { timestamps: true });

export const Career = mongoose.model<ICareer>("Career", careerSchema);
