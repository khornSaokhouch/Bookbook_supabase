// components/LogoutConfirmationModal.tsx
import React, { useCallback } from "react";

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
}) => {
  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Confirm Logout
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to logout?
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleCancel}
            className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationModal;