import express from "express";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Role-level leave counts
const roleLeaveDefaults: Record<string, { Normal: number; Sick: number; Emergency: number }> = {
  Admin: { Normal: 0, Sick: 0, Emergency: 0 },
  HR: { Normal: 10, Sick: 8, Emergency: 5 },
  Manager: { Normal: 12, Sick: 6, Emergency: 4 },
  Employee: { Normal: 12, Sick: 6, Emergency: 3 },
  Intern: { Normal: 6, Sick: 3, Emergency: 2 },
};

// GET /dashboard/roleLeave/:role
router.get("/roleLeave/:role", authenticate, (req, res) => {
  const role = req.params.role;
  const leave = roleLeaveDefaults[role];

  if (!leave) {
    return res.status(404).json({ message: "Role not found" });
  }

  res.json(leave);
});

export default router;
