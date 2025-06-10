"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, User as UserIcon } from "lucide-react";

type User = {
  user_id: string;
  user_name: string;
  email: string;
  role: string;
  created_at: string;
};

type EditUserModalProps = {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => Promise<void>; // Ensure it is Async Function
};

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [updatedUser, setUpdatedUser] = useState<User>({ ...user });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Function to handle input change for fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUpdatedUser((prevUser) => ({
      ...prevUser,
      [name]: value.trim(), // Trimming input directly here
    }));
  };

  const handleSubmit = () => {
    const trimmedUser = {
      ...updatedUser,
      user_name: updatedUser.user_name.trim(),
      email: updatedUser.email.trim(),
      role: updatedUser.role,
      created_at: updatedUser.created_at, //added created_at value
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

    // Clear the error message if everything is valid
    setErrorMessage(null);

    // Pass the updated user data to the parent onSave function
    onSave(trimmedUser);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          <UserIcon className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-2xl font-semibold text-gray-800">Edit User</h2>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="user_name"
            >
              Name
            </label>
            <input
              type="text"
              name="user_name"
              value={updatedUser.user_name}
              readOnly
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-100 cursor-not-allowed leading-tight focus:outline-none"
              id="user_name"
              placeholder="Enter user name"
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              readOnly
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 bg-gray-100 cursor-not-allowed leading-tight focus:outline-none"
              id="email"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="role"
            >
              Role
            </label>
            <select
              name="role"
              value={updatedUser.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="role"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-8 space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditUserModal;
