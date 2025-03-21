// DeleteEventModal.tsx
"use client";
import React from "react";

interface DeleteEventModalProps {
  onDelete: () => void;
  onCancel: () => void;
  deleting: boolean;
}

const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  onDelete,
  onCancel,
  deleting,
}) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4">
        <h2 className="text-2xl font-semibold mb-4">
          Are you sure you want to delete this event?
        </h2>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteEventModal;