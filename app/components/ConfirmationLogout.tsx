// components/ConfirmationModal.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (e: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose} // Close on backdrop click
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg p-8 w-96 shadow-2xl"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside the modal
      >
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800 dark:text-gray-300">
          {title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-center mb-8">
          {message}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 px-6 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;