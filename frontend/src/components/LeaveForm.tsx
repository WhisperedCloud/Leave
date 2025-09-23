import React, { useState } from "react";
import api from "../services/api";

interface LeaveFormProps {
  onSuccess: () => void;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ onSuccess }) => {
  const [leaveType, setLeaveType] = useState<"Normal" | "Sick" | "Emergency">("Normal");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!startDate || !endDate || !reason) {
      setError("⚠️ Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      // Convert to ISO before sending to backend
      await api.post("/leaves", {
        leaveType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        reason,
      });

      setSuccess("✅ Leave applied successfully!");
      setLeaveType("Normal");
      setStartDate("");
      setEndDate("");
      setReason("");
      onSuccess();
    } catch (err: any) {
      console.error("Leave apply error:", err.response?.data || err.message);

      if (err.response?.data?.errors) {
        const messages = err.response.data.errors.map((e: any) => e.msg).join(", ");
        setError(`❌ ${messages}`);
      } else if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else {
        setError("❌ Failed to apply leave. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 font-medium">{error}</div>}
      {success && <div className="text-green-600 font-medium">{success}</div>}

      <div>
        <label className="block text-gray-700">Leave Type</label>
        <select
          value={leaveType}
          onChange={(e) => setLeaveType(e.target.value as any)}
          className="w-full border px-2 py-1 rounded"
          disabled={loading}
        >
          <option value="Normal">Normal</option>
          <option value="Sick">Sick</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>

      <div>
        <label className="block text-gray-700">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-gray-700">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-gray-700">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          rows={3}
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`${
          loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600"
        } text-white px-4 py-2 rounded transition`}
      >
        {loading ? "Submitting..." : "Apply Leave"}
      </button>
    </form>
  );
};

export default LeaveForm;
