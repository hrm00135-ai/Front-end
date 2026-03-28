import { useState } from "react";

const Profile = () => {
  const [user, setUser] = useState({
    name: "Manan Kundra",
    email: "manan@example.com",
    role: "Employee",
    phone: "+91 9876543210",
  });

  const [image, setImage] = useState(null);

  // 🔹 Get initials
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // 🔹 Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  // 🔹 Remove image
  const removeImage = () => {
    setImage(null);
  };

  return (
    <div className="p-4 w-full">
      {/* 🔹 Header */}
      <h1 className="text-xl sm:text-2xl font-bold mb-6">
        My Profile
      </h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-3xl mx-auto">
        
        {/* 🔹 Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            {/* Image OR Initials */}
            {image ? (
              <img
                src={image}
                alt="profile"
                className="w-28 h-28 rounded-full object-cover border"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                {getInitials(user.name)}
              </div>
            )}

            {/* 🔥 Hover Overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition">
              
              {/* Upload */}
              <label className="cursor-pointer bg-white text-sm px-2 py-1 rounded">
                {image ? "Change" : "Upload"}
                <input
                  type="file"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {/* Remove */}
              {image && (
                <button
                  onClick={removeImage}
                  className="bg-red-500 text-white text-sm px-2 py-1 rounded"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <h2 className="mt-4 text-lg font-semibold">
            {user.name}
          </h2>
          <p className="text-sm text-gray-500">{user.role}</p>
        </div>

        {/* 🔹 Profile Details */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          
          <div>
            <label className="text-sm text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              value={user.name}
              onChange={(e) =>
                setUser({ ...user, name: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
              disabled
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Phone
            </label>
            <input
              type="text"
              value={user.phone}
              onChange={(e) =>
                setUser({ ...user, phone: e.target.value })
              }
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">
              Role
            </label>
            <input
              type="text"
              value={user.role}
              disabled
              className="w-full border rounded px-3 py-2 mt-1 bg-gray-100"
            />
          </div>
        </div>

        {/* 🔹 Save Button */}
        <div className="mt-6 text-right">
          <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;