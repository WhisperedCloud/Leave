import mongoose, { Document, Schema } from "mongoose";
import RoleLeave from "./RoleLeave";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Admin" | "HR" | "Manager" | "Employee" | "Intern";
  leaveBalance: {
    Normal: number;
    Sick: number;
    Emergency: number;
  };
}

const userSchema = new Schema<IUser>({
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ["Admin","HR","Manager","Employee","Intern"], required: true },
  leaveBalance: {
    Normal: { type: Number, default: 0 },
    Sick: { type: Number, default: 0 },
    Emergency: { type: Number, default: 0 },
  },
});

// Middleware: initialize leaveBalance from RoleLeave on new user
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const roleLeave = await RoleLeave.findOne({ role: this.role });
    if (roleLeave) {
      this.leaveBalance = { ...roleLeave.leaveBalance };
    }
  }
  next();
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
