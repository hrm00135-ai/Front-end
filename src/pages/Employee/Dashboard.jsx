import Layout from "../../components/Layout";
import EmployeeProfileCard from "../../components/EmployeeProfileCard";

const EmployeeDashboard = () => {

  // Temporary static data (later we connect from EmployeeList)
  const employee = {
    name: "Manan",
    designation: "Frontend Developer",
    photo: "",

    monthlySalary: 30000,
    weeklySalary: 7000,
    dailySalary: 1000,

    lastPayment: 5000,

    documents: [
      "https://example.com/aadhar.pdf",
      "https://example.com/id-proof.pdf"
    ]
  };

  return (
    <Layout>

      <h1 className="text-2xl font-bold mb-6">
        Employee Dashboard
      </h1>

      {/* Profile Card */}
      <EmployeeProfileCard employee={employee} />

    </Layout>
  );
};

export default EmployeeDashboard;