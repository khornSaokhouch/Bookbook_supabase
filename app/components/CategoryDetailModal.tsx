"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { XCircle, Tag } from "lucide-react"; // Import icon

interface CategoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    category_id: string;
    category_name: string;
    image: string;
  } | null;
}

const CategoryDetailModal: React.FC<CategoryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (!isOpen || !category) {
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
        className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full"
        variants={modalVariants}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Category Details
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center">
          <Image
            src={category.image || "/default-image.jpg"}
            alt={category.category_name}
            width={128}
            height={128}
            className="mx-auto rounded-full object-cover w-32 h-32 shadow-md mb-4"
          />
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong className="font-semibold">Name:</strong>{" "}
            {category.category_name}
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            <strong className="font-semibold">ID:</strong> {category.category_id}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded focus:outline-none focus:shadow-outline transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CategoryDetailModal;