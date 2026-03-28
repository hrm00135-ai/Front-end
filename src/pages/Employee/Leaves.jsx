import { useState } from "react";

const Leaves = () => {
  const [leaves] = useState([]);

  return (
    <div className="p-4 w-full">
      {/* 🔹 Header */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        Leaves
      </h1>

      {/* 🔹 Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-sm text-gray-500">
            Total Leaves
          </h2>
          <p className="text-lg font-semibold mt-1">12</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-sm text-gray-500">
            Used Leaves
          </h2>
          <p className="text-lg font-semibold mt-1">5</p>
        </div>

        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="text-sm text-gray-500">
            Remaining
          </h2>
          <p className="text-lg font-semibold mt-1">7</p>
        </div>
      </div>

      {/* 🔹 Apply Leave Form */}
      <div className="bg-white border rounded-xl p-4 shadow-sm mb-6">
        <h2 className="font-semibold mb-4">
          Apply for Leave
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-gray-600">
              From Date
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              To Date
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm text-gray-600">
              Reason
            </label>
            <textarea
              rows="3"
              className="w-full border rounded px-3 py-2 mt-1"
              placeholder="Enter reason..."
            />
          </div>
        </div>

        <div className="mt-4 text-right">
          <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
            Submit Request
          </button>
        </div>
      </div>

      {/* 🔹 Leave History */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">
            Leave History
          </h2>
        </div>

        {leaves.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No leave records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="p-3">From</th>
                  <th className="p-3">To</th>
                  <th className="p-3">Days</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((leave, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{leave.from}</td>
                    <td className="p-3">{leave.to}</td>
                    <td className="p-3">{leave.days}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          leave.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {leave.status}
                      </span>
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

export default Leaves;