import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";

interface Approval {
  role: string;
  status: "Approved" | "Rejected";
  date: string;
}

interface Leave {
  _id: string;
  leaveType: "Normal" | "Sick" | "Emergency";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  stage: "Manager" | "HR" | "Admin" | "Completed";
  approvals: Approval[];
  user: { name: string; role: string };
}

const LeaveHistory: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get("/leaves"); // get all leaves relevant to role
        setHistory(res.data);
      } catch (err) {
        console.error(err);
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div>
      <h3 className="font-semibold mb-2 text-lg">Leave Requests & Status</h3>
      {loading ? (
        <p>Loading...</p>
      ) : history.length ? (
        <ul className="space-y-2 text-sm">
          {history.map((l) => (
            <li key={l._id} className="border rounded p-2">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{l.user?.name} ({l.user?.role}) - {l.leaveType} Leave: {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</span>
                <span className={`px-2 py-0.5 rounded text-white text-xs ${l.status === "Approved" ? "bg-green-500" : l.status === "Rejected" ? "bg-red-500" : "bg-yellow-500"}`}>{l.status}</span>
              </div>
              <div className="text-xs text-gray-600 mb-1">Stage: {l.stage}</div>
              {l.approvals.length > 0 && (
                <div className="text-xs text-gray-700">
                  <strong>Approvals:</strong>
                  <ul className="ml-2 list-disc">
                    {l.approvals.map((a, idx) => (
                      <li key={idx}>{a.role} - {a.status} ({new Date(a.date).toLocaleDateString()})</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-1 text-gray-800 text-xs">Reason: {l.reason}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No leave requests yet.</p>
      )}
    </div>
  );
};

export default LeaveHistory;
