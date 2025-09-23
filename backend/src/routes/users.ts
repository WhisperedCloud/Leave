import express from "express";
import User from "../models/User";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";

const router = express.Router();

// Current logged-in user
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user!.id).select("name email role leaveBalance");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin/HR: get all users with leave balances
router.get("/", authenticate, authorize(["Admin","HR"]), async (req: AuthRequest, res) => {
  try {
    const users = await User.find({}, "name email role leaveBalance");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;
