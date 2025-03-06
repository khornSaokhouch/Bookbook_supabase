"use client";

import React, { useState } from "react";

interface DeleteUserModalProps {
  userId: number;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  userId,
  onDelete,
  onClose,
}) => {
  const handleDelete = () => {
    onDelete(userId);
    onClose(); // Close modal after deleting
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center transition-opacity duration-300">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm transform transition-transform duration-300 scale-95 hover:scale-100">
        <h3 className="text-xl font-semibold text-center">Are you sure?</h3>
        <p className="mt-4 text-center">
          Do you want to delete this user? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;