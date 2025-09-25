import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../services/api";
import LeaveForm from "../components/LeaveForm";
import LeaveList from "../components/LeaveList";

interface LeaveCounts {
  Normal: number;
  Sick: number;
  Emergency: number;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [otherLeaves, setOtherLeaves] = useState<any[]>([]);
  const [leaveCounts, setLeaveCounts] = useState<LeaveCounts>({ Normal: 0, Sick: 0, Emergency: 0 });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const leavesRes = await api.get("/leaves");
      const allLeaves = leavesRes.data;

      // Separate own leaves and other leaves for HR/Manager
      if (user.role === "HR" || user.role === "Manager") {
        setMyLeaves(allLeaves.filter((l: any) => l.user._id === user.id));
        setOtherLeaves(allLeaves.filter((l: any) => l.user._id !== user.id));
      } else {
        setLeaves(allLeaves);
      }

      if (user.role !== "Admin") {
        const meRes = await api.get("/users/me");
        setLeaveCounts(meRes.data.leaveBalance || { Normal: 0, Sick: 0, Emergency: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLeaveApplied = async () => {
    await fetchDashboardData();
    setShowModal(false);
  };

  const canApplyLeave = Object.values(leaveCounts).some((v) => v > 0);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">
          Welcome, <span className="text-purple-600">{user?.name}</span>
        </h1>
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      {/* Leave Counts (non-admin) */}
      {user && user.role !== "Admin" && (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {(["Normal", "Sick", "Emergency"] as const).map((type) => (
            <div
              key={type}
              className="flex-1 p-4 bg-white rounded-lg shadow hover:shadow-lg text-center transform transition duration-200"
            >
              <div className="text-gray-600">{type} Leave</div>
              <div className="text-2xl font-semibold text-purple-700 mt-1">{leaveCounts[type]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Leave Button */}
      {user && user.role !== "Admin" && (
        <div className="mb-6">
          <button
            disabled={!canApplyLeave || loading}
            onClick={() => setShowModal(true)}
            className={`px-4 py-2 rounded text-white shadow transition ${
              canApplyLeave && !loading
                ? "bg-indigo-500 hover:bg-indigo-600"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Loading..." : "Apply Leave"}
          </button>
        </div>
      )}

      {/* Leaves Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(user?.role === "HR" || user?.role === "Manager") && (
          <>
            {/* Own Leaves */}
            <div>
              <h2 className="text-xl font-semibold mb-2">My Leaves</h2>
              <div className="rounded-lg shadow p-4">
                <LeaveList
                  leaves={myLeaves}
                  userRole={user?.role}
                  refresh={fetchDashboardData}
                  isOwnLeaves
                />
              </div>
            </div>

            {/* Other Employees' Leaves */}
            <div>
              <h2 className="text-xl font-semibold mb-2">Other Employees' Leaves</h2>
              <div className="rounded-lg shadow p-4">
                <LeaveList
                  leaves={otherLeaves}
                  userRole={user?.role}
                  refresh={fetchDashboardData}
                  isOwnLeaves={false}
                />
              </div>
            </div>
          </>
        )}

        {/* For other users (Employee/Intern/Admin) */}
        {!(user?.role === "HR" || user?.role === "Manager") && (
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <LeaveList leaves={leaves} userRole={user?.role} refresh={fetchDashboardData} />
            </div>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-6 w-11/12 md:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Apply Leave</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl font-bold">&times;</button>
            </div>
            <LeaveForm onSuccess={handleLeaveApplied} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
