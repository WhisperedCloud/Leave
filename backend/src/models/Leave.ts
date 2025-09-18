import mongoose, { Document } from "mongoose";

export interface ILeave extends Document {
  user: mongoose.Types.ObjectId;
  role: "Admin" | "HR" | "Manager" | "Employee" | "Intern";
  leaveType: "Normal" | "Sick" | "Emergency";
  startDate: Date;
  endDate: Date;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  stage: "Manager" | "HR" | "Admin" | "Completed";
  documents?: string[];
  approvals: {
    role: string;
    approver: mongoose.Types.ObjectId;
    status: "Approved" | "Rejected";
    date: Date;
  }[];
  notifications: string[];
}

const leaveSchema = new mongoose.Schema<ILeave>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["Admin", "HR", "Manager", "Employee", "Intern"], required: true },

    leaveType: { type: String, enum: ["Normal", "Sick", "Emergency"], required: true },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },

    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },

    stage: {
      type: String,
      enum: ["Manager", "HR", "Admin", "Completed"],
      default: "Manager",
    },

    documents: [String],

    approvals: [
      {
        role: String,
        approver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ["Approved", "Rejected"] },
        date: Date,
      },
    ],

    notifications: [String],
  },
  { timestamps: true }
);

const Leave = mongoose.model<ILeave>("Leave", leaveSchema);
export default Leave;
