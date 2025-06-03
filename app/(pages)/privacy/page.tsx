"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

const PrivacyPolicy = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, staggerChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 50 } },
  };

  return (
    <motion.div
      className="mx-auto p-6 md:p-8 lg:p-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl xl:max-w-6xl mx-auto overflow-hidden md:flex"
        variants={itemVariants}
      >
        {/* Text Content */}
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <ShieldCheck className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Privacy Policy</h2>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          <p>Your privacy is important to us. It is CookBook&apos;s policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.</p>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it fairly and lawfully, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
            <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use, or modification.</p>
            <p>We don’t share any personally identifying information publicly or with third parties, except when required to by law.</p>
          </div>
        </div>

        {/* Image */}
        <div className="hidden md:block md:w-1/2 relative">
          <Image
            src="/privacy.png" // Replace with your image path
            alt="Privacy Policy Illustration"
            fill
            style={{ objectFit: "cover" }}
            priority // Added priority for faster initial load
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40"></div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrivacyPolicy;