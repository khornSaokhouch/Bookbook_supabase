"use client";

import React from "react";
import { motion } from "framer-motion";
import {HelpCircle, AlertTriangle } from "lucide-react"; // Import icons

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "confirmation" | "warning"; // Optional type for different icons
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "confirmation", // Default to confirmation type
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  let icon;
  let buttonColor = "blue";

  switch (type) {
    case "warning":
      icon = <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />;
      buttonColor = "orange";
      break;
    default:
      icon = <HelpCircle className="w-12 h-12 text-blue-500 mb-4" />;
      break;
  }

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg p-8 w-126 shadow-2xl"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-6">
          {icon}
          <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>

        {/* Message */}
        <p className="text-gray-700 dark:text-gray-300 text-center mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`bg-${buttonColor}-500 text-white py-3 px-6 rounded-md hover:bg-${buttonColor}-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-${buttonColor}-400`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;