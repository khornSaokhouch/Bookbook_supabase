"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {AlertTriangle, User as UserIcon } from "lucide-react";

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
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleSubmit = async () => {
    setLoading(true);
    try {
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
      await onSave(trimmedUser);
      onClose(); // Close the modal after saving.
    } catch (error: unknown) {
      let errorMessage = "Failed to save changes. Please try again."; // Default message
    
      if (error instanceof Error) {
        errorMessage += ` ${error.message}`;  // Append error message if it exists
      } else {
        errorMessage += " An unknown error occurred.";
        console.error("An unexpected error occurred:", error); // Log the full error
      }
    
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
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
        className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center mb-4">
          <UserIcon className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Edit User
          </h2>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-100 dark:bg-red-700 text-red-700 dark:text-red-100 p-3 rounded-xl flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <span className="text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="user_name"
            >
              Name
            </label>
            <input
              type="text"
              name="user_name"
              value={updatedUser.user_name}
              readOnly
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-500 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 bg-gray-100 cursor-not-allowed leading-tight focus:outline-none focus:shadow-outline"
              id="user_name"
              placeholder="Enter user name"
            />
          </div>

          <div>
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={updatedUser.email}
              readOnly
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-500 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 bg-gray-100 cursor-not-allowed leading-tight focus:outline-none"
              id="email"
              placeholder="Enter email"
            />
          </div>

          <div>
            <label
              className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2"
              htmlFor="role"
            >
              Role
            </label>
            <select
              name="role"
              value={updatedUser.role}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 dark:border-gray-600 leading-tight focus:outline-none focus:shadow-outline"
              id="role"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-5 rounded-xl focus:outline-none focus:shadow-outline transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditUserModal;