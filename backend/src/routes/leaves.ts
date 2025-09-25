import express from "express";
import { body, validationResult } from "express-validator";
import Leave, { ILeave } from "../models/Leave";
import User from "../models/User";
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

const router = express.Router();

// Helper to calculate leave days
function calculateLeaveDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ===================== APPLY LEAVE =====================
router.post(
  "/",
  authenticate,
  [
    body("leaveType").isIn(["Normal", "Sick", "Emergency"]),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("reason").isLength({ min: 3 }),
  ],
  async (req: AuthRequest, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { leaveType, startDate, endDate, reason } = req.body;
      const user = await User.findById(req.user!.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (new Date(endDate) < new Date(startDate))
        return res.status(400).json({ message: "End date cannot be before start date" });

      // Normal leave must be applied at least 7 days in advance
      if (leaveType === "Normal") {
        const today = new Date();
        const start = new Date(startDate);
        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
          return res
            .status(400)
            .json({ message: "Normal leave must be applied at least 7 days in advance." });
        }
      }

      const days = calculateLeaveDays(startDate, endDate);
      const typeKey = leaveType as keyof typeof user.leaveBalance;
      if (!user.leaveBalance[typeKey] || user.leaveBalance[typeKey] < days)
        return res.status(400).json({ message: `Not enough ${leaveType} leave remaining.` });

      // Deduct leave immediately
      user.leaveBalance[typeKey] -= days;
      await user.save();

      // Determine initial stage
      let stage: "Manager" | "HR" | "Completed" = "Manager";
      if (leaveType === "Emergency" || leaveType === "Sick") stage = "HR";
      if (user.role === "HR") stage = "HR";
      if (user.role === "Manager") stage = "HR";

      const leave = new Leave({
        user: user._id,
        role: user.role,
        leaveType,
        startDate,
        endDate,
        reason,
        stage,
        status: "Pending",
        approvals: [],
      });

      await leave.save();
      res.status(201).json(leave);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error while applying leave" });
    }
  }
);

// ===================== APPROVE / REJECT =====================
router.patch("/:id", authenticate, authorize(["Admin", "HR", "Manager"]), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status))
    return res.status(400).json({ message: "Invalid status" });

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ message: "Invalid ID" });

  try {
    const leave = await Leave.findById(id).populate("user");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    const leaveUser = leave.user as any;

    if (req.user!.role === "Manager" && leave.stage !== "Manager")
      return res.status(403).json({ message: "Manager cannot approve this leave" });

    if (req.user!.role === "HR") {
      if (leave.stage !== "HR" || leaveUser.role === "HR")
        return res.status(403).json({ message: "HR cannot approve this leave" });
    }

    if (req.user!.role === "Admin") {
      if (leaveUser.role !== "HR")
        return res.status(403).json({ message: "Admin can approve only HR leaves" });
      if (leave.stage === "Completed")
        return res.status(403).json({ message: "Leave already completed" });
    }

    leave.approvals.push({
      role: req.user!.role,
      approver: new mongoose.Types.ObjectId(req.user!.id),
      status,
      date: new Date(),
    });

    if (status === "Approved") {
      if (leave.stage === "Manager") leave.stage = "HR";
      else leave.stage = "Completed";

      if (leave.stage === "Completed") leave.status = "Approved";
    } else {
      leave.stage = "Completed";
      leave.status = "Rejected";

      const days = calculateLeaveDays(leave.startDate.toISOString(), leave.endDate.toISOString());
      leaveUser.leaveBalance[leave.leaveType] += days;
      await leaveUser.save();
    }

    await leave.save();
    res.json(leave);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while updating leave" });
  }
});

// ===================== DASHBOARD LEAVES =====================
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
    let leaves;

    switch (req.user!.role) {
      case "Admin":
        leaves = await Leave.find({}).populate("user", "name role email");
        break;

      case "HR":
        leaves = await Leave.find({
          $or: [
            { user: req.user!.id },           // HR’s own leaves
            { role: { $ne: "HR" } },          // All other employees’ leaves
          ],
        }).populate("user", "name role email");
        break;

      case "Manager":
        leaves = await Leave.find({
          $or: [
            { user: req.user!.id },
            { stage: "Manager" },
          ],
        }).populate("user", "name role email");
        break;

      default:
        leaves = await Leave.find({ user: req.user!.id });
        break;
    }

    res.json(leaves.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching leaves" });
  }
});

// ===================== ADMIN LEAVE HISTORY =====================
router.get("/history", authenticate, authorize(["Admin"]), async (req, res) => {
  try {
    const leaves = await Leave.find({}).populate("user", "name role email").sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while fetching history" });
  }
});

export default router;
