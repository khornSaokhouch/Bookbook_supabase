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
      className="mx-auto p-6 md:p-8 xl:p-10" // Increased padding on larger screens
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-gray-50 dark:bg-gray-900 m-auto rounded-lg shadow-xl overflow-hidden xl:max-w-5xl" // Larger max-w on larger screens
        variants={itemVariants}
      >
        <motion.div
          className="bg-blue-600 dark:bg-blue-800 py-16 rounded-t-lg"
          variants={itemVariants}
        >
          <h2 className="text-3xl xl:text-4xl font-bold text-center text-white">Disclaimer</h2> {/* Larger text on larger screens */}
        </motion.div>
        <motion.div
          className="max-w-3xl mx-auto p-6 md:p-8"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Disclaimer</h3>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mt-4">
            The recipes, ingredients, and cooking tips provided on this website are intended for informational and educational purposes only. While we make every effort to ensure the accuracy, completeness, and reliability of the information presented, we cannot guarantee that your results will match those described. Cooking involves various factors, including individual skill levels, equipment, and ingredient availability, which may affect the outcome of each recipe.
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mt-4">
            Additionally, please be aware of any food allergies, sensitivities, or dietary restrictions you or your guests may have before preparing any dishes. We recommend consulting with a healthcare professional or nutritionist for personalized dietary advice.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Disclaimer;