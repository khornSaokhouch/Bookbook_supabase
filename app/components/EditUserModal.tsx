import { useState } from "react";

type User = {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
};

type EditUserModalProps = {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
};

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onClose, onSave }) => {
  const [updatedUser, setUpdatedUser] = useState<User>({ ...user });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    // Trim whitespace to prevent invalid inputs
    const trimmedUser = {
      ...updatedUser,
      user_name: updatedUser.user_name.trim(),
      email: updatedUser.email.trim(),
    };

    if (!trimmedUser.user_name || !trimmedUser.email) {
      console.error("User name and email cannot be empty.");
      alert("User name and email are required.");
      return;
    }

    // Validate role before saving
    const validRoles = ["User", "Admin"];
    const role = validRoles.includes(trimmedUser.role) ? trimmedUser.role : "User"; // Default to 'user'

    console.log("Submitting updated user:", trimmedUser);

    // Update the user with the valid role
    onSave({ ...trimmedUser, role });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>

        {/* Name Field */}
        <label className="block mb-2 font-medium">Name</label>
        <input
          type="text"
          name="user_name"
          value={updatedUser.user_name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* Email Field */}
        <label className="block mb-2 mt-4 font-medium">Email</label>
        <input
          type="email"
          name="email"
          value={updatedUser.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        {/* Role Dropdown */}
        <label className="block mb-2 mt-4 font-medium">Role</label>
        <select
          name="role"
          value={updatedUser.role}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
