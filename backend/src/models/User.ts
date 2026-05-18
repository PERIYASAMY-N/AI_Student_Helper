import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string;
  name: string;
  avatar: string;
  subscription: "free" | "pro" | "enterprise";
  oauthProvider?: string;
  oauthId?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  targetRole: string;
  lastActive: Date;
  settings: {
    theme: string;
    notifications: boolean;
    dailyGoalMinutes: number;
    preferredLanguages: string[];
  };
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, select: false },
  name:         { type: String, required: true, trim: true },
  avatar:       { type: String, default: "" },
  subscription: { type: String, enum: ["free","pro","enterprise"], default: "free" },
  oauthProvider:{ type: String },
  oauthId:      { type: String },
  difficulty:   { type: String, enum: ["beginner","intermediate","advanced"], default: "beginner" },
  targetRole:   { type: String, default: "Full Stack Developer" },
  lastActive:   { type: Date, default: Date.now },
  settings: {
    theme:              { type: String, default: "dark" },
    notifications:      { type: Boolean, default: true },
    dailyGoalMinutes:   { type: Number, default: 30 },
    preferredLanguages: { type: [String], default: ["JavaScript","Python"] },
  },
}, { timestamps: true });

userSchema.index({ email: 1 });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
