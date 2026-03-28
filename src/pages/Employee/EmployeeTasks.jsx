import { useEffect, useState } from "react";
import { apiCall } from "../../utils/api";

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await apiCall("/tasks/my-tasks");
      const data = await res.json();

      console.log("TASK API RESPONSE:", data);

      if (data.status === "success") {
        setTasks(data.data || []);
      } else {
        setTasks([]); // fallback
      }
    } catch (err) {
      console.error(err);
      setTasks([]); // prevent crash
      setError("");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiCall(`/tasks/${id}/update`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchTasks();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // 🎨 Status badge styles
  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "on_hold":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-4 w-full">
      {/* 🔹 Header */}
      <h1 className="text-xl sm:text-2xl font-bold mb-4">My Tasks</h1>

      {/* 🔄 Loading */}
      {loading && (
        <p className="text-gray-500 text-center">Loading tasks...</p>
      )}

      {/* ❌ Error */}
      {!loading && error && (
        <p className="text-red-500 text-center">{error}</p>
      )}

      {/* 📭 Empty State */}
      {!loading && tasks.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <p className="text-lg">No tasks assigned</p>
          <p className="text-sm">You’re all caught up 🎉</p>
        </div>
      )}

      {/* ✅ Task Grid */}
      {!loading && tasks.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl shadow-sm border p-4 flex flex-col justify-between hover:shadow-md transition"
            >
              {/* 🔹 Top */}
              <div>
                <h3 className="font-semibold text-lg">
                  {task.title}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  {task.description || "No description"}
                </p>

                {/* 🔹 Info */}
                <div className="mt-3 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Priority:</span>{" "}
                    {task.priority}
                  </p>

                  <p>
                    <span className="font-medium">Due:</span>{" "}
                    {task.due_date || "No deadline"}
                  </p>
                </div>

                {/* 🔹 Status Badge */}
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getStatusStyle(
                    task.status
                  )}`}
                >
                  {task.status}
                </span>
              </div>

              {/* 🔹 Action */}
              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task.id, e.target.value)
                }
                className="border px-2 py-1 mt-4 rounded w-full text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;