import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import LeaveForm from "../components/Leaveform";
import LeaveList from "../components/LeaveList";
import LeaveHistory from "../components/LeaveHistory";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [leaveCounts, setLeaveCounts] = useState({
    Normal: 0,
    Sick: 0,
    Emergency: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch all leaves
        const res = await api.get("/leaves");
        setLeaves(res.data);

        // Fetch current user info
        const me = await api.get("/users/me");
        console.log("User data:", me.data); // debug leaveBalance

        // Extract leave balance safely
        const lb = me.data.leaveBalance || {};
        setLeaveCounts({
          Normal: lb.Normal ?? lb.normal ?? 0,
          Sick: lb.Sick ?? lb.sick ?? 0,
          Emergency: lb.Emergency ?? lb.emergency ?? 0,
        });
      } catch (err) {
        console.error("Failed to load leave counts:", err);
        // fallback if anything fails
        setLeaveCounts({ Normal: 0, Sick: 0, Emergency: 0 });
      }
      setLoading(false);
    };

    load();
  }, [refresh, user?.role]);

  const handleLeaveApplied = () => {
    setRefresh((r) => r + 1);
  };

  const leaveTypes: ("Normal" | "Sick" | "Emergency")[] = [
    "Normal",
    "Sick",
    "Emergency",
  ];

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 animate-fade-in">
      <header className="flex justify-between items-center mb-6 relative animate-slide-down">
        <h1 className="text-3xl font-extrabold text-indigo-700 transition-all duration-500 hover:scale-105 hover:text-purple-700">
          Welcome,{" "}
          <span className="text-purple-600 hover:text-indigo-600 transition-colors duration-500">
            {user?.name}
          </span>{" "}
          ({user?.role})
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowProfile((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 shadow-md transform transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Profile
            <svg
              className={`w-4 h-4 transform transition-transform duration-300 ${
                showProfile ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-50 origin-top animate-scale-in">
              <button
                onClick={() => setRefresh((r) => r + 1)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => alert("Go to Profile Page")}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                My Profile
              </button>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Leave counts */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {leaveTypes.map((type, i) => (
          <div
            key={type}
            className="flex-1 p-6 rounded-lg shadow-md bg-white text-center font-semibold border border-gray-300 transform transition-all duration-500 hover:scale-105 hover:shadow-xl animate-fade-up"
            style={{ animationDelay: `${i * 200}ms` }}
          >
            <div className="text-lg">{type} Leave</div>
            <div className="text-2xl mt-2">{leaveCounts[type]}</div>
          </div>
        ))}
      </div>

      {/* main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6 animate-slide-left">
          <button
            onClick={() => setShowModal(true)}
            className="w-full px-4 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600 transform transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Apply Leave
          </button>
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 animate-fade-in">
            <LeaveHistory />
          </div>
        </div>

        <div className="md:col-span-2 animate-slide-right">
          <div className="p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <LeaveList
                leaves={leaves}
                onAction={() => setRefresh((r) => r + 1)}
              />
            )}
          </div>
        </div>
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-11/12 md:w-1/2 p-6 transform transition-all duration-500 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-700">Apply Leave</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold transition-transform transform hover:scale-125"
              >
                &times;
              </button>
            </div>
            <LeaveForm
              onSuccess={() => {
                handleLeaveApplied();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
