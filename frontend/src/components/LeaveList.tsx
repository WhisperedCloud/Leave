import React from "react";
import api from "../services/api";
import { useAuth } from "../Context/AuthContext";

interface LeaveListProps {
  leaves: any[];
  userRole?: string;
  refresh: () => void;
  isOwnLeaves?: boolean; // new prop to distinguish section
}

const LeaveList: React.FC<LeaveListProps> = ({ leaves, userRole, refresh, isOwnLeaves }) => {
  const { user } = useAuth();

  const handleApproveReject = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await api.patch(`/leaves/${id}`, { status });
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  if (!leaves || leaves.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No leave requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {leaves.map((leave) => {
        const isOwnLeave = leave.user._id === user?._id;
        const canAct =
          (userRole === "Manager" && leave.stage === "Manager") ||
          (userRole === "HR" && leave.stage === "HR" && leave.user.role !== "HR") ||
          (userRole === "Admin" && leave.stage === "HR" && leave.user.role === "HR");

        return (
          <div
            key={leave._id}
            className={`border rounded-lg p-4 shadow hover:shadow-lg transition flex flex-col md:flex-row justify-between items-start md:items-center ${
              isOwnLeaves
                ? "bg-indigo-50" // slightly different for own leaves
                : "bg-white"     // other employees' leaves
            }`}
          >
            {/* Leave Info */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
              <div>
                <div className="font-semibold text-purple-700">{leave.user.name}</div>
                {userRole === "Admin" && (
                  <div className="text-sm text-gray-500">Role: {leave.user.role}</div>
                )}
              </div>
              <div>
                <div className="text-sm text-gray-600">{leave.leaveType} Leave</div>
                <div className="text-sm text-gray-500">
                  {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                </div>
              </div>
              <div className="text-sm text-gray-700">{leave.reason}</div>
            </div>

            {/* Status & Actions */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 md:mt-0">
              <div
                className={`font-medium ${
                  leave.status === "Approved" ? "text-green-600" :
                  leave.status === "Rejected" ? "text-red-600" : "text-yellow-600"
                }`}
              >
                {leave.status}
              </div>

              {!isOwnLeave && canAct && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveReject(leave._id, "Approved")}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproveReject(leave._id, "Rejected")}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeaveList;
