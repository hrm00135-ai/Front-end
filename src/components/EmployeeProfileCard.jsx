const EmployeeProfileCard = ({ employee }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow flex gap-6 items-center">

      {/* Profile Image */}
      <img
        src={employee.photo || "https://via.placeholder.com/100"}
        alt="profile"
        className="w-24 h-24 rounded-full object-cover border"
      />

      {/* Info */}
      <div className="flex-1">

        <h2 className="text-xl font-bold">{employee.name}</h2>
        <p className="text-gray-500">{employee.designation}</p>

        {/* Salary Section */}
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="bg-gray-100 p-2 rounded">
            <p className="text-gray-500">Monthly</p>
            <p className="font-semibold">₹{employee.monthlySalary}</p>
          </div>

          <div className="bg-gray-100 p-2 rounded">
            <p className="text-gray-500">Weekly</p>
            <p className="font-semibold">₹{employee.weeklySalary}</p>
          </div>

          <div className="bg-gray-100 p-2 rounded">
            <p className="text-gray-500">Daily</p>
            <p className="font-semibold">₹{employee.dailySalary}</p>
          </div>
        </div>

        {/* Last Payment */}
        <div className="mt-4">
          <p className="text-gray-500 text-sm">Last Payment</p>
          <p className="font-semibold text-green-600">
            ₹{employee.lastPayment}
          </p>
        </div>

        {/* Documents */}
        <div className="mt-4 flex gap-3">
          {employee.documents?.map((doc, index) => (
            <a
              key={index}
              href={doc}
              target="_blank"
              className="text-blue-600 text-sm underline"
            >
              View Document {index + 1}
            </a>
          ))}
        </div>

      </div>
    </div>
  );
};

export default EmployeeProfileCard;