// components/ConfirmationModal.tsx
"use client";

import { motion } from "framer-motion";

interface ConfirmationModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onCancel,
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
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 transition-colors"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;