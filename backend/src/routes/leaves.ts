import express from "express";
import { body, validationResult } from "express-validator";
import Leave from "../models/Leave";
import User from "../models/User";
import RoleLeave from "../models/RoleLeave"; 
import { authenticate, authorize, AuthRequest } from "../middleware/auth";
import mongoose from "mongoose";

const router = express.Router();

/**
 * Helper: Calculate number of days between two dates (inclusive)
 */
function calculateLeaveDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * POST /api/leaves → Request leave
 */
router.post(
  "/",
  authenticate,
  [
    body("leaveType").isIn(["Normal", "Sick", "Emergency"]),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
    body("reason").isLength({ min: 3 }),
  ],
  async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { leaveType, startDate, endDate, reason } = req.body;
      const user = await User.findById(req.user!.id);
      if (!user) return res.status(400).json({ message: "User not found" });

      if (user.role === "Admin") {
        return res.status(403).json({ message: "Admins cannot request leave" });
      }

      // Validate date range
      if (new Date(endDate) < new Date(startDate)) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }

      // Calculate leave days
      const days = calculateLeaveDays(startDate, endDate);

      // Check balance
      const typeKey = leaveType as keyof typeof user.leaveBalance;
      if (user.leaveBalance[typeKey] < days) {
        return res.status(400).json({ message: `Not enough ${leaveType} leaves remaining.` });
      }

      // Determine approval stage
      let stage: "Manager" | "HR" | "Admin" = "Manager";
      if (leaveType === "Sick" || leaveType === "Emergency") stage = "HR";
      if (user.role === "Manager") stage = "HR";
      if (user.role === "HR") stage = "Admin";

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
      next(err);
    }
  }
);

/**
 * PATCH /api/leaves/:id → Approve/Reject leave
 */
router.patch("/:id", authenticate, authorize(["Admin", "HR", "Manager"]), async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid leave ID" });
    if (!["Approved", "Rejected"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const leave = await Leave.findById(id).populate("user");
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    if (leave.stage === "Completed") {
      return res.status(400).json({ message: "Leave process already completed" });
    }

    const leaveUser = leave.user as any;

    if (leaveUser._id.toString() === req.user!.id) {
      return res.status(403).json({ message: "Cannot approve your own leave" });
    }

    // Approval Flow
    if (req.user!.role === "Manager" && leave.stage === "Manager" && leave.leaveType === "Normal") {
      leave.approvals.push({ role: "Manager", approver: req.user!._id, status, date: new Date() });
      if (status === "Approved") {
        leave.stage = "HR";
        leave.status = "Pending";
      } else {
        leave.stage = "Completed";
        leave.status = "Rejected";
      }
    }

    else if (req.user!.role === "HR" && leave.stage === "HR") {
      leave.approvals.push({ role: "HR", approver: req.user!._id, status, date: new Date() });
      if (status === "Approved") {
        leave.stage = "Admin";
        leave.status = "Pending";
      } else {
        leave.stage = "Completed";
        leave.status = "Rejected";
      }
    }

    else if (req.user!.role === "Admin" && leave.stage === "Admin") {
      leave.approvals.push({ role: "Admin", approver: req.user!._id, status, date: new Date() });
      leave.stage = "Completed";
      leave.status = status;

      // Deduct leave balance only if Approved
      if (status === "Approved" && leaveUser) {
        const days = calculateLeaveDays(leave.startDate.toISOString(), leave.endDate.toISOString());
        const user = await User.findById(leaveUser._id);
        if (user) {
          const type = leave.leaveType as keyof typeof user.leaveBalance;
          if (user.leaveBalance[type] >= days) {
            user.leaveBalance[type] -= days;
            await user.save();
          } else {
            return res.status(400).json({ message: "User does not have enough leave balance" });
          }
        }

        // Deduct from RoleLeave as well
        const roleLeave = await RoleLeave.findOne({ role: leaveUser.role });
        if (roleLeave) {
          const type = leave.leaveType as keyof typeof roleLeave.leaveBalance;
          if (roleLeave.leaveBalance[type] >= days) {
            roleLeave.leaveBalance[type] -= days;
            await roleLeave.save();
          }
        }
      }
    } else {
      return res.status(403).json({ message: "Not allowed at this stage" });
    }

    await leave.save();
    res.json(leave);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/leaves/history → User's leave history
 */
router.get("/history", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const leaves = await Leave.find({ user: req.user!.id })
      .populate("approvals.approver", "name role")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    next(err);
  }
});

export default router;
