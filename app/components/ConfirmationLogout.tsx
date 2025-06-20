"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, XCircle } from "lucide-react"; // Import icons

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
    visible: { opacity: 1, transition: { duration: 0.2 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
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
      onClick={onClose}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-hidden"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <AlertTriangle className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {title}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;