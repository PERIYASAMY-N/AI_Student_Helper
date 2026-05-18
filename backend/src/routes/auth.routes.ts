import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

const signToken = (user: { _id: unknown; email: string; subscription: string }) =>
  jwt.sign(
    { id: user._id, email: user.email, subscription: user.subscription },
    process.env.JWT_SECRET || "fallback-secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, difficulty, targetRole } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await User.create({ name, email, password, difficulty, targetRole });
    const token = signToken(user);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, difficulty: user.difficulty, targetRole: user.targetRole, subscription: user.subscription },
    });
  } catch (err) {
    console.error("[Auth/register]", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    user.lastActive = new Date();
    await user.save();

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email, difficulty: user.difficulty, targetRole: user.targetRole, subscription: user.subscription },
    });
  } catch (err) {
    console.error("[Auth/login]", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /auth/me
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PUT /auth/profile
router.put("/profile", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password change via this route
    const user = await User.findByIdAndUpdate(req.user?.id, updates, { new: true }).select("-password");
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ error: "Profile update failed" });
  }
});

export default router;
