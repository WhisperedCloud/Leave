import express from "express";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import User from "../models/User";

const router = express.Router();

// GET /api/users/me - fetch logged-in user profile + leave balance
router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.user!.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    // return leaveBalance in consistent keys
    const leaveBalance = {
      Normal: user.leaveBalance.Normal ?? 0,
      Sick: user.leaveBalance.Sick ?? 0,
      Emergency: user.leaveBalance.Emergency ?? 0,
    };

    res.json({ ...user.toObject(), leaveBalance });
  } catch (err) {
    next(err);
  }
});

export default router;
