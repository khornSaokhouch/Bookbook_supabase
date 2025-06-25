"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

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
    className="mx-auto p-6 md:p-8 lg:p-12"
    variants={containerVariants}
    initial="hidden"
    animate="visible"
  >
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl xl:max-w-6xl mx-auto overflow-hidden lg:flex lg:flex-row-reverse"
      variants={itemVariants}
    >
      {/* Image Section (Reordered for visual flow on larger screens) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-blue-50 dark:bg-blue-950">
        {/* Changed md:block to lg:block for responsiveness, added placeholder bg */}
        <Image
          src="/privacy.png" // Replace with your image path
          alt="A lock icon over abstract shapes, symbolizing digital privacy and security."
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
          priority // Added priority for faster initial load
          className="rounded-r-2xl"
        />
        {/* Added rounded-r-2xl for consistency */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
        {/* Darker, more prominent overlay */}
        <div className="absolute top-8 left-8 p-4 bg-white/20 backdrop-blur-md rounded-lg shadow-md text-white text-sm font-semibold flex items-center">
          {/* Added a subtle floating badge */}
          <ShieldCheck className="w-5 h-5 mr-2 text-blue-200" />
          Your Trust, Our Priority
        </div>
      </div>
  
      {/* Text Content */}
      <div className="p-6 md:p-8 lg:p-10 lg:w-1/2">
        {/* Increased padding for more spacious content */}
        {/* Header */}
        <div className="flex items-center mb-6">
          <ShieldCheck className="w-9 h-9 text-blue-600 dark:text-blue-400 mr-4 flex-shrink-0" />
          {/* Larger icon, stronger color, more margin */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white leading-tight">
            Privacy Policy
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
          At **CookBook**, your privacy is paramount. We are committed to being
          transparent about how we handle your information across our website and
          any other platforms we operate.
        </p>
  
        {/* Main Content with Prose */}
        <div className="prose prose-base dark:prose-invert max-w-none">
          {/* Adjusted to prose-base for slightly larger default text */}
          <p>
            We only collect personal information when it is **absolutely necessary**
            to provide you with a requested service. We do this fairly and lawfully,
            always with your full **knowledge and consent**. We will also clearly
            explain why we are collecting it and exactly how it will be used.
          </p>
          <p>
            We retain collected information only for as long as needed to deliver
            your requested service. Any data we store is protected using commercially
            acceptable means to prevent loss, theft, unauthorized access,
            disclosure, copying, use, or modification. Your security is our priority.
          </p>
          <p>
            Rest assured, we **do not share** any personally identifying information
            publicly or with third parties, except in rare circumstances where
            required by law.
          </p>
          <p>
            By continuing to use CookBook, you agree to our practices around privacy
            and personal information as outlined in this policy. If you have any
            questions about how we handle user data and personal information, feel
            free to <Link href="/contact" className="text-blue-600 hover:underline dark:text-blue-400">contact us</Link>.
          </p>
        </div>
      </div>
    </motion.div>
  </motion.div>
  );
};

export default PrivacyPolicy;