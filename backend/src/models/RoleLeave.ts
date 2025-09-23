import mongoose, { Document, Schema } from "mongoose";

export interface IRoleLeave extends Document {
  role: "Admin" | "HR" | "Manager" | "Employee" | "Intern";
  leaveBalance: {
    Normal: number;
    Sick: number;
    Emergency: number;
  };
}

const roleLeaveSchema = new Schema<IRoleLeave>({
  role: { type: String, enum: ["Admin","HR","Manager","Employee","Intern"], required: true, unique: true },
  leaveBalance: {
    Normal: { type: Number, default: 0 },
    Sick: { type: Number, default: 0 },
    Emergency: { type: Number, default: 0 },
  },
});

const RoleLeave = mongoose.model<IRoleLeave>("RoleLeave", roleLeaveSchema);
export default RoleLeave;
