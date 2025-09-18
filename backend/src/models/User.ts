import mongoose, { Document } from "mongoose";

// leave balance type
interface LeaveBalance {
  Normal: number;
  Sick: number;
  Emergency: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "HR" | "Manager" | "Employee" | "Intern";
  manager?: mongoose.Types.ObjectId;
  leaveBalance: LeaveBalance;
}

const leaveDefaults: Record<IUser["role"], LeaveBalance> = {
  Admin: { Normal: 0, Sick: 0, Emergency: 0 },
  HR: { Normal: 10, Sick: 8, Emergency: 5 },
  Manager: { Normal: 12, Sick: 6, Emergency: 4 },
  Employee: { Normal: 12, Sick: 6, Emergency: 3 },
  Intern: { Normal: 6, Sick: 3, Emergency: 2 },
};

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Admin", "HR", "Manager", "Employee", "Intern"],
      required: true,
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    leaveBalance: {
      Normal: { type: Number, default: 0 },
      Sick: { type: Number, default: 0 },
      Emergency: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// assign defaults when creating a new user
userSchema.pre("save", function (next) {
  if (this.isNew) {
    const defaults = leaveDefaults[this.role] || { Normal: 0, Sick: 0, Emergency: 0 };
    this.leaveBalance = { ...defaults };
  }
  next();
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
