import express from "express";
import { body, ValidationError, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { Request } from "express-validator/lib/base";

const router = express.Router();

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post(
  "/login",
  [body("email").isEmail().withMessage("Email invalid"), body("password").isLength({ min: 6 })],
  async (req: Request, res: express.Response, next: express.NextFunction) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "secret", {
        expiresIn: "8h"
      });

      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
