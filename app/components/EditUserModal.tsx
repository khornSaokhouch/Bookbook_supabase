import React, { useState } from "react";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value.trim(), // Prevents leading/trailing spaces
    }));
  };

  const handleSubmit = () => {
    const trimmedUser = {
      ...updatedUser,
      user_name: updatedUser.user_name.trim(),
      email: updatedUser.email.trim(),
    };

    if (!trimmedUser.user_name || !trimmedUser.email) {
      setErrorMessage("User name and email cannot be empty.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedUser.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const validRoles = ["User", "Admin"];
    if (!validRoles.includes(trimmedUser.role)) {
      setErrorMessage("Invalid role selected.");
      return;
    }

    setErrorMessage(null);
    onSave(trimmedUser);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>

        {errorMessage && (
          <div className="text-red-600 mb-4 p-2 bg-red-100 rounded-md">{errorMessage}</div>
        )}

        <label className="block mb-2 font-medium" htmlFor="user_name">
          Name
        </label>
        <input
          type="text"
          name="user_name"
          value={updatedUser.user_name}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
          id="user_name"
          aria-label="User name"
        />

        <label className="block mb-2 font-medium" htmlFor="email">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={updatedUser.email}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
          id="email"
          aria-label="User email"
        />

        <label className="block mb-2 font-medium" htmlFor="role">
          Role
        </label>
        <select
          name="role"
          value={updatedUser.role}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
          id="role"
          aria-label="User role"
        >
          <option value="User">User</option>
          <option value="Admin">Admin</option>
        </select>

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
