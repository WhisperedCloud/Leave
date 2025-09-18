import React, { useEffect, useState } from "react";
import api from "../services/api";

const LeaveHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/leaves/history");
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="mt-4 bg-white rounded shadow p-4">
      <h4 className="font-semibold mb-2">My Leave History</h4>
      <ul>
        {history.map(h => (
          <li key={h._id} className="mb-2">
            {new Date(h.startDate).toLocaleDateString()} - {new Date(h.endDate).toLocaleDateString()} : {h.status}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaveHistory;
