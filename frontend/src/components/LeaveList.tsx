import React from "react";
import api from "../services/api";
import { useAuth } from "../Context/AuthContext";

const LeaveList: React.FC<{ leaves: any[]; onAction?: () => void }> = ({ leaves, onAction }) => {
  const { user } = useAuth();

  const act = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await api.patch("/leaves/" + id, { status });
      onAction && onAction();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">Leave Requests</h3>
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className="text-left">User</th>
            <th className="text-left">Role</th>
            <th>From</th>
            <th>To</th>
            <th className="text-left">Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l._id} className="border-t">
              <td>{l.user?.name || "—"}</td>
              <td>{l.role}</td>
              <td>{new Date(l.startDate).toLocaleDateString()}</td>
              <td>{new Date(l.endDate).toLocaleDateString()}</td>
              <td>{l.reason}</td>
              <td>{l.status}</td>
              <td>
                {(user?.role === "Admin" || user?.role === "HR" || user?.role === "Manager") && l.status === "Pending" ? (
                  <>
                    <button onClick={() => act(l._id, "Approved")} className="mr-2 px-2 py-1 bg-green-200 rounded">Approve</button>
                    <button onClick={() => act(l._1d || l._id, "Rejected")} className="px-2 py-1 bg-red-200 rounded">Reject</button>
                  </>
                ) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveList;
