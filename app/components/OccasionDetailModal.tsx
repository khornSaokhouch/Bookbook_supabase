"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { XCircle } from "lucide-react";

interface OccasionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasion: {
    occasion_id: string;
    name: string;
    occasion_image: string;
  } | null;
}

const OccasionDetailModal: React.FC<OccasionDetailModalProps> = ({
  isOpen,
  onClose,
  occasion,
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (!isOpen || !occasion) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-center items-center bg-opacity-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Occasion Details
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <Image
            src={occasion.occasion_image || "/default-image.jpg"}
            alt={occasion.name}
            width={120}
            height={120}
            className="mx-auto mb-4 rounded-full object-cover shadow-md"
          />
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Name:</strong> {occasion.name}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            <strong>ID:</strong> {occasion.occasion_id}
          </p>
          {/* Add more occasion details here as needed */}
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-8">
          <button
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded focus:outline-none focus:shadow-outline transition-colors"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OccasionDetailModal;