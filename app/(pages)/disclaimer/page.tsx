"use client";

import React from "react";
import { motion } from "framer-motion";

const Disclaimer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 50 } },
  };

  return (
    <motion.div
    className="mx-auto p-6 md:p-8 xl:p-12 "
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <motion.div
      className="bg-white dark:bg-gray-800 m-auto rounded-xl shadow-2xl overflow-hidden xl:max-w-4xl"
      variants={itemVariants}
    >
      {/* Header Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-12 px-6 rounded-t-xl flex flex-col items-center justify-center text-white"
        variants={itemVariants}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-16 h-16 mb-4 text-white opacity-80"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.38 3.375 2.07 3.375h14.006c1.69 0 2.936-1.875 2.069-3.375L12.707 5.625c-.546-.956-1.953-.956-2.5 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
        {/* Increased py and added px for slightly more spacious header */}
        <h2 className="text-3xl md:text-4xl xl:text-5xl font-extrabold text-center tracking-tight">
          {/* Larger, bolder, and tighter tracking for impact */}
          Important Notice
        </h2>
        <p className="text-blue-100 dark:text-blue-200 text-lg mt-2 opacity-90">
          Please read carefully
        </p>
      </motion.div>
  
      {/* Content Section */}
      <motion.div
        className="max-w-3xl mx-auto p-6 md:p-8 lg:p-10 text-justify"
        variants={itemVariants}
      >
        {/* Removed redundant <h3>, content already clear */}
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed mb-4">
          {/* Slightly smaller base text, mb-4 for paragraph spacing */}
          The recipes, ingredients, and cooking tips provided on this website are
          intended for **informational and educational purposes only**. While we
          make every effort to ensure the accuracy, completeness, and reliability
          of the information presented, we cannot guarantee that your results will
          match those described. Cooking involves various factors, including
          individual skill levels, equipment, and ingredient availability, which
          may affect the outcome of each recipe.
        </p>
        <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
          Additionally, please be aware of any **food allergies, sensitivities, or
          dietary restrictions** you or your guests may have before preparing any
          dishes. We recommend consulting with a healthcare professional or
          nutritionist for personalized dietary advice.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 italic">
          Your use of this website constitutes your agreement to this disclaimer.
        </p>
      </motion.div>
    </motion.div>
  </motion.div>
  );
};

export default Disclaimer;