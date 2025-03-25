"use client";

import React from "react";
import { motion } from "framer-motion";
import { XCircle, AlertTriangle } from "lucide-react"; // Import icons

interface DeleteUserModalProps {
  userId: string; // Changed type to string
  onDelete: (id: string) => void; // Changed type to string
  onClose: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  userId,
  onDelete,
  onClose,
}) => {
  const handleDelete = () => {
    onDelete(userId);
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
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">
            Confirm Delete
          </h3>
        </div>

        {/* Message */}
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this user? This action cannot be
          undone.
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring focus:ring-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DeleteUserModal;