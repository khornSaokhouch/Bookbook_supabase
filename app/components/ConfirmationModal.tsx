import React from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl transform transition-all duration-300 ease-in-out">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
          Are you sure you want to update your profile?
        </h2>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
