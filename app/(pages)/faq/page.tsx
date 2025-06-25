"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions = [
    {
      question: "How do I search for a recipe?",
      answer:
        "You can search for recipes by ingredient, cuisine, or meal type using the search bar at the top of the website. Just type in your keyword and explore the results!",
    },
    {
      question: "Can I save my favorite recipes?",
      answer:
        "Yes! You can create an account and save your favorite recipes by clicking the button on each recipe page. These will be stored in your profile for easy access.",
    },
    {
      question: "Are the recipes on this website free to use?",
      answer:
        "Yes, all the recipes on our website are free to use! Feel free to browse, print, and try them out without any cost.",
    },
    {
      question: "How do I submit my own recipe to the website?",
      answer:
        "You can submit your own recipes by visiting the Submit a Recipe page. Fill out the form with your recipe details and instructions, and we'll review it before posting it.",
    },
    {
      question: "Are the recipes suitable for special dietary needs (e.g., gluten-free, vegan)?",
      answer:
        "Many of our recipes cater to special dietary needs. Each recipe includes a section highlighting dietary information, such as gluten-free, vegan, or nut-free options.",
    },
    {
      question: "Can I leave a review and Comment for a recipe?",
      answer:
        "Yes! After trying a recipe, you can leave a review by scrolling to the bottom of the recipe page. We appreciate your feedback and love hearing about your cooking experiences!",
    },
  ];

  const toggleAnswer = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.7, staggerChildren: 0.2 } },
  };

  const itemVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <motion.div
      className="container mx-auto p-6 md:p-8 lg:p-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <motion.div
          className="px-6 py-8 bg-blue-50 dark:bg-blue-900 text-center"
          variants={itemVariants}
        >
          <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Find answers to common questions about our website and services.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
          {questions.map((item, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              layout
              variants={itemVariants}
            >
              <motion.div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                onClick={() => toggleAnswer(index)}
                style={{ cursor: "pointer" }}
              >
                <span className="text-lg text-gray-700 dark:text-gray-300">
                  {item.question}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {openIndex === index ? (
                    <ChevronUp className="h-6 w-6" />
                  ) : (
                    <ChevronDown className="h-6 w-6" />
                  )}
                </span>
              </motion.div>
              <motion.div
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                variants={itemVariants}
                initial="closed"
                animate={openIndex === index ? "open" : "closed"}
              >
                {item.answer}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FAQ;