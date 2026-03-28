import { useState } from "react";

const Attendance = () => {
  const [attendance] = useState([]);
  const [todayStatus] = useState("Present"); // UI placeholder
  const [score] = useState(92); // %

  return (
    <div className="p-4 w-full">
      {/* 🔹 Header */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        Attendance
      </h1>

      {/* 🔹 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        
        {/* Today Status */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-sm text-gray-500">Today</h2>
          <p className="text-lg font-semibold mt-1">
            {todayStatus}
          </p>
        </div>

        {/* Attendance Score */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-sm text-gray-500">
            Attendance Score
          </h2>
          <p className="text-lg font-semibold mt-1">
            {score}%
          </p>
        </div>

        {/* Leaves */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-sm text-gray-500">Leaves</h2>
          <p className="text-lg font-semibold mt-1">
            3 Taken
          </p>
        </div>
      </div>

      {/* 🔹 Attendance Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            Attendance History
          </h2>
        </div>

        {attendance.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No attendance records available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Check In</th>
                  <th className="p-3">Check Out</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item, index) => (
                  <tr
                    key={index}
                    className="border-t"
                  >
                    <td className="p-3">{item.date}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          item.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.checkIn || "-"}
                    </td>
                    <td className="p-3">
                      {item.checkOut || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;