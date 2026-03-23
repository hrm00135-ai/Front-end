import Layout from "../../components/Layout";
import EmployeeProfileCard from "../../components/EmployeeProfileCard";

const Dashboard = () => {

  // Stats (keep this)
  const stats = {
    totalEmployees: 5,
    totalTasks: 12,
    newTasks: 4,
    inProgress: 5,
    completed: 3,
  };

  // Users (Admin + Employees)
  const users = [
    {
      id: 1,
      name: "Admin (You)",
      role: "admin",
      designation: "Manager",
      photo: "",
      monthlySalary: 50000,
      weeklySalary: 12000,
      dailySalary: 2000,
      lastPayment: 10000,
      documents: ["https://example.com/aadhar.pdf"]
    },
    {
      id: 2,
      name: "Rahul",
      role: "employee",
      designation: "Frontend Developer",
      photo: "",
      monthlySalary: 30000,
      weeklySalary: 7000,
      dailySalary: 1000,
      lastPayment: 5000,
      documents: ["https://example.com/aadhar.pdf"]
    }
  ];

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* 🔥 Admin Profile */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Admin Profile</h2>

        <EmployeeProfileCard
          employee={users.find(u => u.role === "admin")}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Employees</p>
          <h2 className="text-2xl font-bold">{stats.totalEmployees}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Total Tasks</p>
          <h2 className="text-2xl font-bold">{stats.totalTasks}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">In Progress</p>
          <h2 className="text-2xl font-bold">{stats.inProgress}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-gray-500 text-sm">Completed</p>
          <h2 className="text-2xl font-bold">{stats.completed}</h2>
        </div>

      </div>

      {/* Task Overview */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Task Overview</h2>

        <div className="flex gap-6 text-sm">
          <div className="bg-gray-100 px-4 py-2 rounded">
            New: {stats.newTasks}
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded">
            In Progress: {stats.inProgress}
          </div>
          <div className="bg-gray-100 px-4 py-2 rounded">
            Completed: {stats.completed}
          </div>
        </div>
      </div>

      {/* 🔥 Employee Profiles */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Employees</h2>

        <div className="space-y-6">
          {users
            .filter(user => user.role === "employee")
            .map(user => (
              <EmployeeProfileCard key={user.id} employee={user} />
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Task "Login Bug" assigned</li>
          <li>• Employee "Rahul" added</li>
          <li>• Task "Dashboard UI" completed</li>
        </ul>
      </div>

    </Layout>
  );
};

export default Dashboard;