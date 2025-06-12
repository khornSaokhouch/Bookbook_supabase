"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  eventTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({
  isOpen,
  eventTitle,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center items-center p-4 backdrop-blur-sm"
          variants={modalVariants}
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Event
                  </h3>
                </div>
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Are you sure you want to delete this event?
                </p>
                <p className="font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  "{eventTitle}"
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete Event
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
