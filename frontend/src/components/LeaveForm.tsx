import React, { useState } from "react";
import api from "../services/api";

const LeaveForm: React.FC<{ onSuccess?: (type: "Normal" | "Sick" | "Emergency") => void }> = ({ onSuccess }) => {
  const [leaveType, setLeaveType] = useState<"Normal" | "Sick" | "Emergency">("Normal");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await api.post("/leaves", { leaveType, startDate, endDate, reason });
      setMsg("Leave submitted");
      setLeaveType("Normal");
      setStartDate("");
      setEndDate("");
      setReason("");
      onSuccess && onSuccess(leaveType);
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="p-4 bg-white rounded-xl shadow-md mb-4 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
    >
      <h3 className="font-semibold mb-2 text-lg transition-opacity duration-500 opacity-0 animate-fade-in">
        Request Leave
      </h3>

      {msg && (
        <div
          className={`p-2 mb-2 rounded transition-all duration-300 ${
            msg.includes("submitted") ? "bg-green-50 text-green-800 animate-pulse" : "bg-red-50 text-red-800"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Leave Type Dropdown */}
      <label className="block mb-2">
        <span>Type of Leave</span>
        <select
          value={leaveType}
          onChange={e => setLeaveType(e.target.value as "Normal" | "Sick" | "Emergency")}
          className="mt-1 block w-full border rounded px-2 py-1 transition-transform duration-200 focus:scale-105 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
        >
          <option value="Normal">Normal</option>
          <option value="Sick">Sick</option>
          <option value="Emergency">Emergency</option>
        </select>
      </label>

      <label className="block mb-2">
        <span>Start</span>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1 transition-transform duration-200 focus:scale-105 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
          min={today}
          required
        />
      </label>

      <label className="block mb-2">
        <span>End</span>
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1 transition-transform duration-200 focus:scale-105 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
          min={today}
          required
        />
      </label>

      <label className="block mb-4">
        <span>Reason</span>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1 transition-transform duration-200 focus:scale-105 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
          required
        />
      </label>

      <button
        className="py-2 px-3 rounded bg-indigo-600 text-white transform transition-transform duration-200 hover:scale-105 hover:bg-indigo-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Sending..." : "Submit"}
      </button>
    </form>
  );
};

export default LeaveForm;
